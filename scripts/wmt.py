"""Waymarked Trails helper: haalt routerelaties op (met cache) en maakt er een lineaire lijn van."""
import json, math, os, sys, time, urllib.request

CACHE = os.environ.get("ROME_CACHE", os.path.join(os.path.dirname(__file__), "..", ".cache"))
UA = {"User-Agent": "trail-planner-build/0.1"}
R = 6378137.0

def merc2ll(x, y):
    return (math.degrees(2 * math.atan(math.exp(y / R)) - math.pi / 2), math.degrees(x / R))

def hav(a, b):
    la1, lo1, la2, lo2 = map(math.radians, (a[0], a[1], b[0], b[1]))
    h = math.sin((la2 - la1) / 2) ** 2 + math.cos(la1) * math.cos(la2) * math.sin((lo2 - lo1) / 2) ** 2
    return 2 * 6371008.8 * math.asin(math.sqrt(h))

def fetch_json(url, cache_name, pause=0.7, retries=4):
    os.makedirs(CACHE, exist_ok=True)
    p = os.path.join(CACHE, cache_name)
    if os.path.exists(p):
        with open(p) as f:
            return json.load(f)
    last = None
    for i in range(retries):
        try:
            req = urllib.request.Request(url, headers=UA)
            with urllib.request.urlopen(req, timeout=180) as r:
                raw = r.read()
            d = json.loads(raw)
            with open(p, "wb") as f:
                f.write(raw)
            time.sleep(pause)
            return d
        except Exception as e:  # noqa
            last = e
            time.sleep(2 + 3 * i)
    raise RuntimeError(f"ophalen mislukt: {url}: {last}")

def relation(rid):
    return fetch_json(f"https://hiking.waymarkedtrails.org/api/v1/details/relation/{rid}", f"rel_{rid}.json")

def _geom(node):
    g = node.get("geometry")
    if not g:
        return []
    if g["type"] == "LineString":
        return [[merc2ll(x, y) for x, y in g["coordinates"]]]
    if g["type"] == "MultiLineString":
        return [[merc2ll(x, y) for x, y in part] for part in g["coordinates"]]
    return []

def pieces(node, out=None, depth=0):
    """Loop de routeboom af en verzamel de wegstukken in looprichting."""
    if out is None:
        out = []
    t = node.get("route_type")
    if t == "base" or (t is None and "geometry" in node):
        role = node.get("role") or ""
        for line in _geom(node):
            if len(line) > 1:
                out.append({"pts": line, "role": role, "id": node.get("id")})
    elif t == "split":
        for c in node.get("forward", []):
            pieces(c, out, depth + 1)
    elif t == "linear":
        for c in node.get("ways", []):
            pieces(c, out, depth + 1)
    else:
        for c in node.get("main", []):
            pieces(c, out, depth + 1)
    return out

def summary(rid):
    d = relation(rid)
    r = d.get("route", {})
    ps = pieces(r)
    n = len(ps)
    info = {"id": rid, "name": d.get("name"), "ref": d.get("ref"), "len_km": round(r.get("length", 0) / 1000, 1),
            "official_km": round((d.get("official_length") or 0) / 1000, 1), "pieces": n,
            "main": [(m.get("route_type"), round(m.get("length", 0) / 1000, 1), m.get("id"), m.get("name")) for m in r.get("main", [])][:60],
            "appendices": len(r.get("appendices", []))}
    if n:
        info["start"] = tuple(round(v, 4) for v in ps[0]["pts"][0])
        info["end"] = tuple(round(v, 4) for v in ps[-1]["pts"][-1])
        gaps = []
        for a, b in zip(ps, ps[1:]):
            g = hav(a["pts"][-1], b["pts"][0])
            if g > 30:
                gaps.append(round(g))
        info["gaps>30m"] = len(gaps)
        info["biggest_gaps_m"] = sorted(gaps, reverse=True)[:8]
    return info

if __name__ == "__main__":
    for a in sys.argv[1:]:
        s = summary(int(a))
        main = s.pop("main")
        print(json.dumps(s, ensure_ascii=False))
        if len(main) > 1:
            for m in main:
                print("   ", m)
