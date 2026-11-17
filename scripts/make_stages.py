#!/usr/bin/env python3
"""Stap 3: deel elke variant op in etappes van 6 tot 9 uur (inclusief pauzes) en schrijf de app-data.

Etappes eindigen op plekken met een bed: hotel, pension, hostel of berghut langs de route.
Uitvoer: data/route.json, data/geo/<variant>.json, data/stay/<variant>.json
"""
import json, math, os, sys, time, urllib.parse
import numpy as np

sys.path.insert(0, os.path.dirname(__file__))
import wmt
from corridor import P, SECTIONS, VARIANTS, ANCHORS
from names import PIN_NAMES, RENAME, EXTRA_STOPS, AVOID
from build_lines import elevation

CACHE = wmt.CACHE
OUT = os.path.join(os.path.dirname(__file__), "..", "data")

# standaard tempo (in de app instelbaar)
V_FLAT, V_UP, V_DOWN = 4.0, 300.0, 500.0   # km/u, m/u stijgen, m/u dalen
PAUSE_PER_HOUR, PAUSE_FIXED = 10 / 60, 0.5  # 10 min per loopuur plus 30 min lunch
T_MIN, T_MAX, T_IDEAL = 6.0, 9.0, 7.4

BED = {"hotel": 1.0, "guest_house": 1.0, "hostel": 1.0, "motel": 0.8, "alpine_hut": 1.0}
REACH = {"alpine_hut": 700, "wilderness_hut": 500}
REACH_DEFAULT = 1400

def walk_hours(km, up, down):
    th = km / V_FLAT
    tv = up / V_UP + down / V_DOWN
    return max(th, tv) + min(th, tv) / 2

def total_hours(km, up, down):
    w = walk_hours(km, up, down)
    return w * (1 + PAUSE_PER_HOUR) + PAUSE_FIXED

# ---------- lijn-hulpmiddelen ----------

class Line:
    def __init__(self, d):
        self.pts = np.array(d["pts"])
        self.cum = np.array(d["cum"])
        self.ele_raw = np.array(d["ele"])
        self.trail_idx = d["trail_idx"]
        self.trails = d["trails"]
        self.L = float(self.cum[-1])
        # uniform raster van 20 m, gladgestreken hoogte, stijgen en dalen met drempel van 3 m
        self.s = np.arange(0, self.L + 20, 20.0)
        e = np.interp(self.s, self.cum, self.ele_raw)
        k = 2
        es = np.convolve(np.pad(e, (k, k), mode="edge"), np.ones(2 * k + 1) / (2 * k + 1), mode="valid")
        self.es = es
        up = np.zeros(len(es)); dn = np.zeros(len(es))
        ref = es[0]
        for i in range(1, len(es)):
            dv = es[i] - ref
            if dv > 3:
                up[i] = dv; ref = es[i]
            elif dv < -3:
                dn[i] = -dv; ref = es[i]
        self.cup = np.cumsum(up); self.cdn = np.cumsum(dn)
        # zoekraster voor projectie van punten op de lijn
        self.grid = {}
        for i, (la, lo) in enumerate(self.pts):
            self.grid.setdefault((int(la * 100), int(lo * 100)), []).append(i)

    def gi(self, s):
        return int(min(len(self.s) - 1, max(0, round(s / 20.0))))

    def stats(self, s0, s1):
        i, j = self.gi(s0), self.gi(s1)
        km = (s1 - s0) / 1000
        up = float(self.cup[j] - self.cup[i]); dn = float(self.cdn[j] - self.cdn[i])
        seg = self.es[i:j + 1]
        return km, up, dn, float(seg.min()), float(seg.max())

    def project(self, lat, lon, reach):
        """Dichtstbijzijnde lijnpunt binnen reach meter: (afstand_m, s)."""
        rings = int(reach / 700) + 1
        gx, gy = int(lat * 100), int(lon * 100)
        best = None
        coslat = math.cos(math.radians(lat))
        for dx in range(-rings, rings + 1):
            for dy in range(-rings, rings + 1):
                for i in self.grid.get((gx + dx, gy + dy), ()):
                    la, lo = self.pts[i]
                    d = math.hypot((la - lat) * 111195, (lo - lon) * 111195 * coslat)
                    if best is None or d < best[0]:
                        best = (d, float(self.cum[i]), i)
        if best and best[0] <= reach:
            return best
        return None

    def point_at(self, s):
        i = int(np.searchsorted(self.cum, s))
        i = min(max(i, 0), len(self.cum) - 1)
        return i

# ---------- geometrie-uitvoer ----------

def rdp(points, eps_m):
    """Douglas-Peucker op (lat, lon), iteratief. Geeft indices terug."""
    n = len(points)
    if n < 3:
        return list(range(n))
    keep = np.zeros(n, dtype=bool); keep[0] = keep[-1] = True
    lat0 = math.radians(points[0][0]); kx = 111195 * math.cos(lat0); ky = 111195
    xy = np.column_stack(((points[:, 1]) * kx, (points[:, 0]) * ky))
    stack = [(0, n - 1)]
    while stack:
        a, b = stack.pop()
        if b - a < 2:
            continue
        p, q = xy[a], xy[b]
        seg = q - p
        ln = math.hypot(seg[0], seg[1])
        mid = xy[a + 1:b]
        if ln == 0:
            dist = np.hypot(mid[:, 0] - p[0], mid[:, 1] - p[1])
        else:
            t = np.clip(((mid[:, 0] - p[0]) * seg[0] + (mid[:, 1] - p[1]) * seg[1]) / (ln * ln), 0, 1)
            dist = np.hypot(mid[:, 0] - (p[0] + t * seg[0]), mid[:, 1] - (p[1] + t * seg[1]))
        k = int(dist.argmax())
        if dist[k] > eps_m:
            idx = a + 1 + k
            keep[idx] = True
            stack.append((a, idx)); stack.append((idx, b))
    return list(np.nonzero(keep)[0])

def enc_num(v):
    v = ~(v << 1) if v < 0 else (v << 1)
    out = ""
    while v >= 0x20:
        out += chr((0x20 | (v & 0x1f)) + 63)
        v >>= 5
    return out + chr(v + 63)

def encode(points):
    out = []; pla = plo = 0
    for la, lo in points:
        a, b = int(round(la * 1e5)), int(round(lo * 1e5))
        out.append(enc_num(a - pla)); out.append(enc_num(b - plo))
        pla, plo = a, b
    return "".join(out)

# ---------- plaatsnamen ----------

PLACES = []
PLACE_W = {"city": (4.0, 4000), "town": (3.0, 3000), "village": (2.0, 2500), "suburb": (1.0, 1500), "hamlet": (1.0, 1300),
           "pass": (1.1, 600), "locality": (0.3, 600), "isolated_dwelling": (0.3, 400)}

def place_of(lat, lon):
    """Plaats waar dit punt bij hoort: (naam, type). Steden en dorpen wegen zwaarder dan gehuchten."""
    best = None
    for p in PLACES:
        if abs(p["lat"] - lat) > 0.07 or abs(p["lon"] - lon) > 0.1:
            continue
        w, lim = PLACE_W[p["pt"]]
        d = wmt.hav((lat, lon), (p["lat"], p["lon"]))
        if d > lim:
            continue
        score = (d + 250) / w
        if best is None or score < best[0]:
            best = (score, p["n"], p["pt"])
    return (best[1], best[2]) if best else (None, None)

def nearest_village(lat, lon, lim=5000):
    best = None
    for p in PLACES:
        if p["pt"] not in ("city", "town", "village") or abs(p["lat"] - lat) > 0.06 or abs(p["lon"] - lon) > 0.09:
            continue
        d = wmt.hav((lat, lon), (p["lat"], p["lon"]))
        if d <= lim and (best is None or d < best[0]):
            best = (d, p["n"])
    return best[1] if best else None

# ---------- kandidaat-stopplaatsen ----------

SOFT = {"chalet", "apartment"}

def cluster(xs, tier):
    xs = sorted(xs, key=lambda x: x["s"])
    groups, cur = [], []
    for x in xs:
        if cur and x["s"] - cur[0]["s"] > 1500:
            groups.append(cur); cur = []
        cur.append(x)
    if cur:
        groups.append(cur)
    out = []
    for grp in groups:
        ss = sorted(g["s"] for g in grp)
        s = ss[len(ss) // 2]
        q = sum(2.0 if g["k"] == "alpine_hut" else BED.get(g["k"], 0.5) for g in grp)
        la = sum(g["lat"] for g in grp) / len(grp); lo = sum(g["lon"] for g in grp) / len(grp)
        huts = all(g["k"] == "alpine_hut" for g in grp)
        nm, pt = place_of(la, lo)
        if huts:
            nm = grp[0]["n"]
        else:
            if not nm:
                nm = max(grp, key=lambda g: len(g.get("web", ""))).get("n")
            if pt not in ("city", "town", "village") and nm not in ANCHORS:
                ctx = nearest_village(la, lo)
                if ctx and ctx != nm and ctx not in nm:
                    nm = f"{nm} (bij {ctx})"
        out.append({"s": s, "q": q, "lat": la, "lon": lo, "name": nm, "ptype": pt, "forced": False, "n": len(grp),
                    "tier": tier, "off": max(g["d"] for g in grp) if tier == 2 else 0})
    return out

def candidates(line, pois, vid, reach2=2200):
    items = []
    for pid, p in pois.items():
        k = p["k"]
        if k in ("station", "place", "pass"):
            continue
        reach = 350 if k in ("shop", "water") else (reach2 if k in BED and k != "alpine_hut" else REACH.get(k, REACH_DEFAULT))
        pr = line.project(p["lat"], p["lon"], reach)
        if pr:
            if pr[0] > 500 and k not in ("shop", "water"):
                # adres moet op ongeveer dezelfde hoogte liggen als de route, anders is het geen praktische stop
                dz = abs(elevation(p["lat"], p["lon"]) - float(np.interp(pr[1], line.s, line.es)))
                if dz > 150 + 0.15 * pr[0]:
                    continue
            items.append({"id": pid, "s": pr[1], "d": pr[0], **p})
    named = [x for x in items if x.get("n")]
    t1 = cluster([x for x in named if x["k"] in BED and x["d"] <= REACH.get(x["k"], REACH_DEFAULT)], 1)
    t2 = cluster([x for x in named if x["k"] in BED and x["d"] > REACH_DEFAULT], 2)
    t3 = cluster([x for x in named if x["k"] in SOFT and x["d"] <= 1000], 3)
    out = list(t1)
    for extra in (t2, t3):
        for c in extra:
            if all(abs(c["s"] - o["s"]) > 3000 for o in out):
                out.append(c)
    out = [c for c in out if not any(abs(c["s"] - a) < 1200 for a in AVOID.get(vid, []))]
    return out, items

def stop_cost(b):
    if b["forced"]:
        return 0.0
    q = b["q"]
    c = 0.9 if q < 1.5 else 0.3 if q < 2.5 else -0.2 if q < 6 else -0.4
    c += {2: 0.6 + 0.0006 * b.get("off", 0), 3: 1.8}.get(b.get("tier", 1), 0.0)
    c += {"city": -0.9, "town": -0.9, "village": -0.3}.get(b.get("ptype"), 0.0)
    if b.get("name") in ANCHORS:
        c -= 1.2
    return c

def edge_cost(line, a, b):
    km, up, dn, _, _ = line.stats(a["s"], b["s"])
    T = total_hours(km, up, dn)
    c = ((T - T_IDEAL) / (1.4 * T_IDEAL / 7.4)) ** 2
    if T < T_MIN:
        c += 1.0 + 3 * (T_MIN - T) ** 2
    if T > T_MAX:
        c += 1.5 + 5 * (T - T_MAX) ** 2
    if T > 11.5:
        c += 200 + 80 * (T - 11.5)
    return c + stop_cost(b)

def split(line, nodes):
    nodes = sorted(nodes, key=lambda n: n["s"])
    n = len(nodes)
    best = [1e18] * n; prev = [-1] * n
    best[0] = 0
    for j in range(1, n):
        i = j - 1
        while i >= 0:
            if nodes[j]["s"] - nodes[i]["s"] > 60000 and best[j] < 1e17:
                break
            if best[i] < 1e17:
                c = best[i] + edge_cost(line, nodes[i], nodes[j])
                if c < best[j]:
                    best[j] = c; prev[j] = i
            if nodes[i]["forced"]:
                break
            i -= 1
    path = [n - 1]
    while path[-1] != 0:
        path.append(prev[path[-1]])
    path.reverse()
    return [nodes[i] for i in path]

# ---------- planningsdata voor de app ----------

def export_plan(v, sec, line, nodes, items, stations):
    """Schrijf alles wat de app nodig heeft om zelf etappes in te delen: lijn, hoogte, stopplaatsen en adressen."""
    nodes = sorted(nodes, key=lambda n: n["s"])
    keep = rdp(line.pts, 6.0)
    pts = line.pts[keep]
    ls = [int(round(float(line.cum[k]))) for k in keep]
    n100 = int(line.L // 100) + 1
    idx = [min(len(line.s) - 1, i * 5) for i in range(n100)] + [len(line.s) - 1]
    beds = [x for x in items if x["k"] not in ("shop", "water") and x["n"]]
    pid = {x["id"]: i for i, x in enumerate(beds)}
    stops = []
    seen = {}
    for n in nodes:
        name = n.get("name") or f"km {n['s'] / 1000:.0f}"
        name = RENAME.get((v["id"], name), RENAME.get(name, name))
        if name in seen and abs(n["s"] - seen[name]) < 15000 and not n["forced"]:
            # twee stopplaatsen met dezelfde naam: noem de tweede naar de dichtstbijzijnde andere plaats
            alt = sorted((wmt.hav((n["lat"], n["lon"]), (p["lat"], p["lon"])), p["n"]) for p in PLACES
                         if p["pt"] in ("city", "town", "village") and p["n"] != name.split(" (")[0]
                         and abs(p["lat"] - n["lat"]) < 0.05 and abs(p["lon"] - n["lon"]) < 0.07)
            if alt and alt[0][0] < 4000:
                name = alt[0][1]
        seen.setdefault(name, n["s"])
        i1 = line.point_at(n["s"])
        end = (float(line.pts[i1][0]), float(line.pts[i1][1]))
        near = []
        for x in beds:
            de = wmt.hav(end, (x["lat"], x["lon"]))
            if de <= max(2200, n.get("off", 0) + 600) or (abs(x["s"] - n["s"]) <= 1500 and x["d"] < 1400):
                near.append((int(de), pid[x["id"]]))
        near.sort()
        rail = None
        for p in stations:
            if abs(p["lat"] - end[0]) > 0.04 or abs(p["lon"] - end[1]) > 0.06:
                continue
            de = wmt.hav(end, (p["lat"], p["lon"]))
            if de < 3000 and (rail is None or de < rail["m"]):
                rail = {"n": p["n"], "m": int(de)}
        st = {"s": int(round(n["s"])), "n": name, "q": round(float(n.get("q", 9)), 1), "t": n.get("tier", 1),
              "off": int(n.get("off", 0)), "pt": n.get("ptype") or "", "a": name in ANCHORS, "f": bool(n["forced"]),
              "ll": [round(end[0], 5), round(end[1], 5)], "p": [[m, i] for m, i in near[:40]]}
        if rail:
            st["rail"] = rail
        stops.append(st)
    segs = []
    for k in keep:
        t = line.trail_idx[k]
        if not segs or segs[-1][1] != t:
            segs.append([int(round(float(line.cum[k]))), t])
    out = {
        "id": v["id"], "len": int(round(line.L)), "step": 100,
        "up": [int(round(float(line.cup[i]))) for i in idx], "down": [int(round(float(line.cdn[i]))) for i in idx],
        "ele": [int(round(float(line.es[i]))) for i in idx],
        "line": encode(pts), "ls": ls, "trails": line.trails, "segs": segs, "stops": stops,
        "pois": [{k2: v2 for k2, v2 in {"id": x["id"], "k": x["k"], "n": x["n"], "lat": x["lat"], "lon": x["lon"], "s": int(x["s"]),
                  "d": int(x["d"]), "web": x.get("web", ""), "tel": x.get("tel", ""), "mail": x.get("mail", ""), "stars": x.get("stars", ""),
                  "beds": x.get("beds", ""), "ele": x.get("ele", ""), "op": x.get("op", "")}.items() if v2 not in ("", None)} for x in beds],
        "supply": sorted(({k2: v2 for k2, v2 in {"k": x["k"], "s": int(x["s"]), "lat": x["lat"], "lon": x["lon"], "n": x.get("n", ""),
                   "st": x.get("st", "")}.items() if v2 != ""} for x in items if x["k"] in ("shop", "water") and x["d"] < 350 and (x["k"] == "water" or x.get("n"))),
                   key=lambda x: x["s"]),
    }
    os.makedirs(os.path.join(OUT, "plan"), exist_ok=True)
    json.dump(out, open(os.path.join(OUT, "plan", f"{v['id']}.json"), "w"), ensure_ascii=False, separators=(",", ":"))

# ---------- hoofdprogramma ----------

def main():
    pois = json.load(open(os.path.join(CACHE, "pois.json")))
    for p in pois.values():
        if p["k"] == "place" and p["n"] and p.get("pt") in PLACE_W:
            PLACES.append(p)
        elif p["k"] == "pass" and p["n"]:
            PLACES.append({**p, "pt": "pass"})
    stations = [p for p in pois.values() if p["k"] == "station" and p["n"]]
    os.makedirs(os.path.join(OUT, "plan"), exist_ok=True)
    only = set(sys.argv[1:])
    route = {"generated": time.strftime("%Y-%m-%d"), "pace": {"flat": V_FLAT, "up": V_UP, "down": V_DOWN,
             "pausePerHour": PAUSE_PER_HOUR, "pauseFixed": PAUSE_FIXED}, "sections": []}
    report = []
    odd = []
    for sec in SECTIONS:
        S = {**sec, "variants": []}
        for v in VARIANTS:
            if v["section"] != sec["id"]:
                continue
            if only and v["id"] not in only:
                continue
            line = Line(json.load(open(os.path.join(CACHE, f"line_{v['id']}.json"))))
            global T_MIN, T_MAX, T_IDEAL
            T_MIN, T_MAX, T_IDEAL = v.get("hours", (6.0, 9.0, 7.4))
            cands, items = candidates(line, pois, v["id"], v.get("reach2", 2200))
            nodes = [{"s": 0.0, "q": 9, "forced": True, "name": sec["from"], "lat": line.pts[0][0], "lon": line.pts[0][1]},
                     {"s": line.L, "q": 9, "forced": True, "name": sec["to"], "lat": line.pts[-1][0], "lon": line.pts[-1][1]}]
            forced = list(v.get("pins", [])) + EXTRA_STOPS.get(v["id"], [])
            for pin in forced:
                pt = P[pin] if isinstance(pin, str) else pin[1]
                nm = PIN_NAMES.get(pin, pin) if isinstance(pin, str) else pin[0]
                pr = line.project(pt[0], pt[1], 4000)
                if not pr:
                    print(f"!! {v['id']}: pin {pin} ligt niet bij de lijn"); continue
                nodes.append({"s": pr[1], "q": 9, "forced": True, "name": nm, "lat": pt[0], "lon": pt[1]})
            for nm in v.get("pin_names", []):
                match = [c for c in cands if c["name"] == nm and c["tier"] == 1]
                if not match:
                    print(f"!! {v['id']}: geen stopplaats met naam {nm}"); continue
                best = max(match, key=lambda c: c["q"])
                nodes.append({**best, "forced": True, "q": 9})
            fs = [n["s"] for n in nodes]
            for c in cands:
                if all(abs(c["s"] - f) > 2500 for f in fs):
                    nodes.append(c)
            export_plan(v, sec, line, nodes, items, stations)
            stops = split(line, nodes)
            stages, geo, stay = [], {}, {}
            for i, (a, b) in enumerate(zip(stops, stops[1:])):
                for n in (a, b):
                    if not n.get("name"):
                        n["name"] = f"km {n['s'] / 1000:.0f}"
                    n["name"] = RENAME.get((v["id"], n["name"]), RENAME.get(n["name"], n["name"]))
                if (v["id"], i + 1) in RENAME:
                    b["name"] = RENAME[(v["id"], i + 1)]
                km, up, dn, emin, emax = line.stats(a["s"], b["s"])
                i0, i1 = line.point_at(a["s"]), line.point_at(b["s"])
                seg = line.pts[i0:i1 + 1]
                keep = rdp(seg, 6.0)
                segk = seg[keep]
                # hoogte per bewaard punt uit het gladde profiel
                elek = [int(round(float(np.interp(line.cum[i0 + k], line.s, line.es)))) for k in keep]
                step = 100.0
                ps = np.arange(a["s"], b["s"], step)
                prof = [int(round(float(v2))) for v2 in np.interp(ps, line.s, line.es)]
                tr = {}
                for k in range(i0, i1 + 1, 10):
                    t = line.trails[line.trail_idx[k]]
                    tr[t] = tr.get(t, 0) + 1
                trail = sorted(tr, key=tr.get, reverse=True)
                sid = f"{v['id']}-{i + 1:02d}"
                end = (float(line.pts[i1][0]), float(line.pts[i1][1]))
                # overnachtingen bij het eindpunt
                near = []
                for x in items:
                    de = wmt.hav(end, (x["lat"], x["lon"]))
                    on_last = b["s"] - 1500 <= x["s"] <= b["s"] + 1500
                    if x["k"] in ("shop", "water"):
                        continue
                    if de <= max(2200, b.get("off", 0) + 600) or (on_last and x["d"] < 1400):
                        near.append((de, x))
                near.sort(key=lambda t: (0 if t[1]["k"] in BED else 1, t[0]))
                lst = []
                for de, x in near:
                    if not x["n"]:
                        continue
                    lst.append({k2: v2 for k2, v2 in {"id": x["id"], "k": x["k"], "n": x["n"], "lat": x["lat"], "lon": x["lon"],
                                "m": int(de), "web": x["web"], "tel": x["tel"], "mail": x["mail"], "stars": x["stars"],
                                "beds": x["beds"], "ele": x["ele"], "op": x["op"], "res": x["res"]}.items() if v2 not in ("", None)})
                    if len(lst) >= 40:
                        break
                lst.sort(key=lambda x: x["m"])
                # adressen onderweg (om een etappe in te korten of te verlengen)
                along = []
                for x in items:
                    if a["s"] + 2500 < x["s"] < b["s"] - 2500 and x["k"] in BED and x["n"] and x["d"] < 900:
                        along.append({k2: v2 for k2, v2 in {"id": x["id"], "k": x["k"], "n": x["n"], "lat": x["lat"], "lon": x["lon"],
                                      "km": round((x["s"] - a["s"]) / 1000, 1), "web": x["web"], "tel": x["tel"]}.items() if v2 not in ("", None)})
                along.sort(key=lambda x: x["km"])
                if len(along) > 30:
                    along = along[:: math.ceil(len(along) / 30)]
                # bevoorrading onderweg: winkels en drinkwater vlak langs de route
                supply = []
                for x in items:
                    if x["k"] in ("shop", "water") and a["s"] <= x["s"] <= b["s"] and x["d"] < 350:
                        e = {"k": x["k"], "lat": x["lat"], "lon": x["lon"], "km": round((x["s"] - a["s"]) / 1000, 1)}
                        if x["k"] == "shop":
                            if not x["n"]:
                                continue
                            e["n"] = x["n"]; e["st"] = x.get("st", "")
                        supply.append(e)
                supply.sort(key=lambda x: x["km"])
                shops = [x for x in supply if x["k"] == "shop"]
                waters = [x for x in supply if x["k"] == "water"]
                if len(shops) > 12:
                    shops = shops[:: math.ceil(len(shops) / 12)]
                if len(waters) > 15:
                    waters = waters[:: math.ceil(len(waters) / 15)]
                # dichtstbijzijnde station
                rail = None
                for p in stations:
                    if abs(p["lat"] - end[0]) > 0.04 or abs(p["lon"] - end[1]) > 0.06:
                        continue
                    de = wmt.hav(end, (p["lat"], p["lon"]))
                    if de < 3000 and (rail is None or de < rail["m"]):
                        rail = {"n": p["n"], "m": int(de), "lat": p["lat"], "lon": p["lon"]}
                st = {"id": sid, "n": i + 1, "from": a["name"], "to": b["name"],
                      "a": [round(float(line.pts[i0][0]), 5), round(float(line.pts[i0][1]), 5)], "b": [round(end[0], 5), round(end[1], 5)],
                      "km": round(km, 1), "up": int(round(up)), "down": int(round(dn)),
                      "min": int(round(emin)), "max": int(round(emax)), "trail": trail,
                      "beds": sum(1 for x in lst if x["k"] in BED), "camp": sum(1 for x in lst if x["k"] == "camp_site"),
                      "shops": len(shops), "water": len(waters), "tier": b.get("tier", 1), "off": int(b.get("off", 0)),
                      "hut": bool(lst) and all(x["k"] in ("alpine_hut", "wilderness_hut") for x in lst if x["k"] in BED) and any(x["k"] == "alpine_hut" for x in lst)}
                if rail:
                    st["rail"] = rail
                stages.append(st)
                geo[sid] = {"line": encode(segk), "ele": elek, "prof": prof, "step": step}
                stay[sid] = {"end": lst, "along": along, "shops": shops, "water": waters}
                T = total_hours(km, up, dn)
                if b.get("ptype") not in ("city", "town", "village") and not b["forced"]:
                    odd.append(f"{sid} {b['name']} [{b.get('ptype')}] T{b.get('tier')}: " + "; ".join(f"{x['n']} ({x['k']},{x['m']}m)" for x in lst[:3]))
                report.append(f"{sid:8s} {a['name'][:24]:24s} > {b['name'][:24]:24s} {km:5.1f} km +{up:5.0f} -{dn:5.0f}  {T:4.1f} u  bedden {st['beds']:2d}"
                              + ("  HUT" if st["hut"] else "") + (f"  T{st['tier']}" if st["tier"] > 1 else "") + ("  !" if T < T_MIN - 0.4 or T > T_MAX + 0.4 else "")
                              + (f"  trein {rail['n']}" if rail else ""))
            ov = line.pts[rdp(line.pts, 60.0)]
            V = {"id": v["id"], "name": v["name"], "recommended": v["recommended"], "km": round(line.L / 1000, 1),
                 "up": int(line.cup[-1]), "down": int(line.cdn[-1]), "max": int(line.es.max()), "trails": line.trails,
                 "overview": encode(ov), "refStages": len(stages)}
            if v.get("hours"):
                V["hours"] = list(v["hours"])
            if v.get("pace"):
                V["pace"] = v["pace"]
            S["variants"].append(V)
            report.append(f"-- {v['id']} {v['name']}: {len(stages)} etappes, {line.L / 1000:.0f} km, +{line.cup[-1]:.0f} m")
        route["sections"].append(S)
    if not only:
        json.dump(route, open(os.path.join(OUT, "route.json"), "w"), ensure_ascii=False, separators=(",", ":"))
    print("\n".join(report))
    print("== twijfelnamen")
    print("\n".join(odd))

if __name__ == "__main__":
    main()
