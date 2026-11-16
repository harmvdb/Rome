#!/usr/bin/env python3
"""Stap 1: bouw per variant één doorlopende lijn (lat, lon, hoogte, pad) uit de corridor-definitie.

Uitvoer: <cache>/line_<variant>.json
"""
import gzip, heapq, json, math, os, sys, time, urllib.request
import numpy as np

sys.path.insert(0, os.path.dirname(__file__))
import wmt
from corridor import P, VARIANTS

CACHE = wmt.CACHE

# ---------- graaf over de wegen van een pad ----------

def key(pt):
    return (round(pt[0], 6), round(pt[1], 6))

class TrailGraph:
    def __init__(self, rel_ids):
        self.adj = {}
        ends = []
        for rid in rel_ids:
            d = wmt.relation(rid)
            for piece in wmt.pieces(d.get("route", {})):
                pts = [key(p) for p in piece["pts"]]
                for a, b in zip(pts, pts[1:]):
                    if a == b:
                        continue
                    w = wmt.hav(a, b)
                    self.adj.setdefault(a, {})[b] = w
                    self.adj.setdefault(b, {})[a] = w
                ends += [pts[0], pts[-1]]
        self.nodes = list(self.adj.keys())
        self.grid = {}
        for n in self.nodes:
            self.grid.setdefault((int(n[0] * 200), int(n[1] * 200)), []).append(n)
        # kleine gaten tussen losse wegstukken overbruggen
        bridged = 0
        for e in set(ends):
            if len(self.adj[e]) > 1:
                continue
            best = None
            for n in self.near(e, 1):
                if n == e or n in self.adj[e]:
                    continue
                d = wmt.hav(e, n)
                if d < 60 and (best is None or d < best[0]):
                    best = (d, n)
            if best:
                self.adj[e][best[1]] = best[0]
                self.adj[best[1]][e] = best[0]
                bridged += 1
        self.bridged = bridged
        self.bridge_components()

    def bridge_components(self, limit=400.0):
        """Verbind losse delen van het pad als ze minder dan limit meter uit elkaar liggen (ontbrekende stukjes in OSM)."""
        comp = {}
        cid = 0
        for n in self.nodes:
            if n in comp:
                continue
            for m in self.component(n):
                comp[m] = cid
            cid += 1
        if cid < 2:
            return
        best = {}
        for n in self.nodes:
            for m in self.near(n, 1):
                if comp[m] == comp[n]:
                    continue
                d = wmt.hav(n, m)
                k = (min(comp[n], comp[m]), max(comp[n], comp[m]))
                if d < limit and (k not in best or d < best[k][0]):
                    best[k] = (d, n, m)
        for d, n, m in best.values():
            self.adj[n][m] = d
            self.adj[m][n] = d
            self.bridged += 1

    def near(self, pt, rings):
        gx, gy = int(pt[0] * 200), int(pt[1] * 200)
        for dx in range(-rings, rings + 1):
            for dy in range(-rings, rings + 1):
                yield from self.grid.get((gx + dx, gy + dy), [])

    def snap(self, pt):
        for rings in (1, 3, 8, 20, 60):
            best = None
            for n in self.near(pt, rings):
                d = wmt.hav(pt, n)
                if best is None or d < best[0]:
                    best = (d, n)
            if best:
                return best
        raise RuntimeError(f"geen routepunt in de buurt van {pt}")

    def component(self, start):
        seen = {start}
        stack = [start]
        while stack:
            n = stack.pop()
            for m in self.adj[n]:
                if m not in seen:
                    seen.add(m)
                    stack.append(m)
        return seen

    def route(self, a, b):
        dist = {a: 0.0}
        prev = {}
        pq = [(0.0, a)]
        while pq:
            d, n = heapq.heappop(pq)
            if n == b:
                break
            if d > dist.get(n, 1e18):
                continue
            for m, w in self.adj[n].items():
                nd = d + w
                if nd < dist.get(m, 1e18):
                    dist[m] = nd
                    prev[m] = n
                    heapq.heappush(pq, (nd, m))
        if b not in dist:
            return None
        path = [b]
        while path[-1] != a:
            path.append(prev[path[-1]])
        path.reverse()
        return path

# ---------- BRouter ----------

def brouter(points, profile="hiking-mountain"):
    lonlats = "|".join(f"{p[1]:.5f},{p[0]:.5f}" for p in points)
    name = "br_" + profile + "_" + "_".join(f"{p[0]:.4f},{p[1]:.4f}" for p in points) + ".json"
    url = f"https://brouter.de/brouter?lonlats={lonlats}&profile={profile}&alternativeidx=0&format=geojson"
    d = wmt.fetch_json(url, name, pause=1.5)
    return [(c[1], c[0]) for c in d["features"][0]["geometry"]["coordinates"]]

# ---------- hoogte (SRTM 1 boogseconde, open data via AWS Terrain Tiles) ----------

_tiles = {}

def tile(lat, lon):
    la, lo = math.floor(lat), math.floor(lon)
    k = (la, lo)
    if k in _tiles:
        return _tiles[k]
    name = f"{'N' if la >= 0 else 'S'}{abs(la):02d}{'E' if lo >= 0 else 'W'}{abs(lo):03d}"
    path = os.path.join(CACHE, "hgt", name + ".hgt.gz")
    os.makedirs(os.path.dirname(path), exist_ok=True)
    if not os.path.exists(path):
        url = f"https://s3.amazonaws.com/elevation-tiles-prod/skadi/{name[:3]}/{name}.hgt.gz"
        for i in range(4):
            try:
                req = urllib.request.Request(url, headers=wmt.UA)
                with urllib.request.urlopen(req, timeout=300) as r:
                    raw = r.read()
                with open(path, "wb") as f:
                    f.write(raw)
                break
            except Exception as e:  # noqa
                if i == 3:
                    raise
                time.sleep(3 + 3 * i)
    with gzip.open(path, "rb") as f:
        arr = np.frombuffer(f.read(), dtype=">i2").reshape(3601, 3601).astype(np.float32)
    arr[arr < -1000] = np.nan
    _tiles[k] = arr
    return arr

def elevation(lat, lon):
    arr = tile(lat, lon)
    fy = (math.floor(lat) + 1 - lat) * 3600
    fx = (lon - math.floor(lon)) * 3600
    y0, x0 = min(int(fy), 3599), min(int(fx), 3599)
    dy, dx = fy - y0, fx - x0
    v = (arr[y0, x0] * (1 - dx) * (1 - dy) + arr[y0, x0 + 1] * dx * (1 - dy)
         + arr[y0 + 1, x0] * (1 - dx) * dy + arr[y0 + 1, x0 + 1] * dx * dy)
    if math.isnan(v):
        v = np.nanmean(arr[max(0, y0 - 3):y0 + 4, max(0, x0 - 3):x0 + 4])
    return float(v)

# ---------- samenstellen ----------

_graphs = {}

def graph(rels):
    k = tuple(rels)
    if k not in _graphs:
        _graphs[k] = TrailGraph(rels)
    return _graphs[k]

def densify(pts, step=40.0):
    """Voeg tussenpunten toe zodat het hoogteprofiel overal genoeg steunpunten heeft."""
    out = [pts[0]]
    for a, b in zip(pts, pts[1:]):
        d = wmt.hav(a, b)
        if d > step:
            n = int(d // step)
            for i in range(1, n + 1):
                t = i / (n + 1)
                out.append((a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t))
        out.append(b)
    return out

def build_variant(v):
    pts, trail_idx, trails, notes = [], [], [], []
    for leg in v["legs"]:
        if leg["type"] == "trail":
            g = graph(leg["rels"])
            da, a = g.snap(P[leg["from"]])
            db, b = g.snap(P[leg["to"]])
            path = g.route(a, b)
            if path is None:
                comp = g.component(a)
                raise RuntimeError(f"{v['id']}: geen doorlopend pad {leg['from']} -> {leg['to']} "
                                   f"(deel bij start: {len(comp)} van {len(g.nodes)} punten)")
            seg = [tuple(p) for p in path]
            notes.append(f"{leg['trail']}: {leg['from']}->{leg['to']} snap {da:.0f}/{db:.0f} m")
            if da > 150:
                seg = brouter([P[leg["from"]], seg[0]]) + seg
            if db > 150:
                seg = seg + brouter([seg[-1], P[leg["to"]]])
        else:
            seg = brouter([P[n] for n in leg["pts"]], leg.get("profile", "hiking-mountain"))
        if leg["trail"] not in trails:
            trails.append(leg["trail"])
        ti = trails.index(leg["trail"])
        if pts and wmt.hav(pts[-1], seg[0]) > 250:
            link = brouter([pts[-1], seg[0]])
            notes.append(f"  overbrugd met BRouter: {wmt.hav(pts[-1], seg[0]):.0f} m voor {leg['trail']}")
            pts += link[1:]
            trail_idx += [ti] * (len(link) - 1)
        start = 1 if pts and wmt.hav(pts[-1], seg[0]) < 1 else 0
        pts += seg[start:]
        trail_idx += [ti] * (len(seg) - start)
    # verdichten met behoud van pad-index
    dense, dti = [pts[0]], [trail_idx[0]]
    for i in range(1, len(pts)):
        part = densify([pts[i - 1], pts[i]])
        dense += part[1:]
        dti += [trail_idx[i]] * (len(part) - 1)
    ele = [elevation(la, lo) for la, lo in dense]
    cum = [0.0]
    for a, b in zip(dense, dense[1:]):
        cum.append(cum[-1] + wmt.hav(a, b))
    return {"id": v["id"], "pts": [[round(a, 6), round(b, 6)] for a, b in dense], "ele": [round(e, 1) for e in ele],
            "cum": [round(c, 1) for c in cum], "trail_idx": dti, "trails": trails, "notes": notes}

if __name__ == "__main__":
    only = set(sys.argv[1:])
    for v in VARIANTS:
        if only and v["id"] not in only:
            continue
        t0 = time.time()
        try:
            res = build_variant(v)
        except Exception as e:  # noqa
            print(f"!! {v['id']}: {e}")
            continue
        with open(os.path.join(CACHE, f"line_{v['id']}.json"), "w") as f:
            json.dump(res, f)
        print(f"{v['id']:5s} {res['cum'][-1] / 1000:7.1f} km  {len(res['pts']):6d} ptn  {time.time() - t0:5.1f}s  | " + " | ".join(res["notes"]))
