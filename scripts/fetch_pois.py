#!/usr/bin/env python3
"""Stap 2: haal overnachtingsadressen en stations langs alle routelijnen op uit OpenStreetMap (Overpass).

Werkt per kaartvak met cache, zodat een herstart verder gaat waar hij was.
Uitvoer: <cache>/pois.json
"""
import glob, json, math, os, sys, time, urllib.parse, urllib.request

sys.path.insert(0, os.path.dirname(__file__))
import wmt

CACHE = wmt.CACHE
SERVERS = ["https://maps.mail.ru/osm/tools/overpass/api/interpreter"]
DLAT, DLON = 0.25, 0.35
MARGIN_KM = 3.0
STAY = "hotel|guest_house|hostel|motel|alpine_hut|wilderness_hut|camp_site|chalet|apartment"

def cells():
    out = set()
    for f in sorted(glob.glob(os.path.join(CACHE, "line_*.json"))):
        d = json.load(open(f))
        for la, lo in d["pts"][::5]:
            mla = MARGIN_KM / 111.0
            mlo = MARGIN_KM / (111.0 * math.cos(math.radians(la)))
            for a in (la - mla, la + mla):
                for b in (lo - mlo, lo + mlo):
                    out.add((math.floor(a / DLAT), math.floor(b / DLON)))
    return sorted(out)

def query(cell):
    s, w = cell[0] * DLAT, cell[1] * DLON
    bbox = f"{s:.4f},{w:.4f},{s + DLAT:.4f},{w + DLON:.4f}"
    q = (f'[out:json][timeout:120];(nwr({bbox})[tourism~"^({STAY})$"];'
         f'node({bbox})[railway~"^(station|halt)$"];);out center tags;')
    return q

def fetch(cell):
    p = os.path.join(CACHE, "poi", f"cell_{cell[0]}_{cell[1]}.json")
    os.makedirs(os.path.dirname(p), exist_ok=True)
    if os.path.exists(p):
        return json.load(open(p)), True
    q = query(cell)
    wait = 6
    for attempt in range(40):
        url = SERVERS[attempt % len(SERVERS)] + "?data=" + urllib.parse.quote(q)
        try:
            req = urllib.request.Request(url, headers=wmt.UA)
            with urllib.request.urlopen(req, timeout=180) as r:
                raw = r.read()
            d = json.loads(raw)
            if "elements" in d and not d.get("remark"):
                with open(p, "wb") as f:
                    f.write(raw)
                return d, False
        except Exception:
            pass
        time.sleep(wait)
        wait = min(45, wait + 4)
    raise RuntimeError(f"vak {cell} mislukt")

def main():
    cs = cells()
    print(f"{len(cs)} kaartvakken", flush=True)
    pois = {}
    for i, c in enumerate(cs):
        d, cached = fetch(c)
        for e in d["elements"]:
            t = e.get("tags", {})
            lat = e.get("lat") or (e.get("center") or {}).get("lat")
            lon = e.get("lon") or (e.get("center") or {}).get("lon")
            if lat is None:
                continue
            kind = t.get("tourism") or ("station" if t.get("railway") else None)
            if not kind:
                continue
            pois[f"{e['type'][0]}{e['id']}"] = {
                "k": kind, "n": t.get("name") or t.get("name:en") or "", "lat": round(lat, 5), "lon": round(lon, 5),
                "web": t.get("website") or t.get("contact:website") or t.get("url") or "",
                "tel": t.get("phone") or t.get("contact:phone") or "",
                "mail": t.get("email") or t.get("contact:email") or "",
                "stars": t.get("stars") or "", "beds": t.get("beds") or t.get("capacity") or "",
                "ele": t.get("ele") or "", "op": t.get("operator") or "",
                "res": t.get("reservation") or "", "oh": t.get("opening_hours") or "",
            }
        if not cached:
            print(f"  {i + 1}/{len(cs)} vak {c}: {len(d['elements'])} objecten, totaal {len(pois)}", flush=True)
            time.sleep(5)
    with open(os.path.join(CACHE, "pois.json"), "w") as f:
        json.dump(pois, f, ensure_ascii=False)
    print(f"klaar: {len(pois)} objecten", flush=True)

if __name__ == "__main__":
    main()
