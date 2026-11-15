#!/usr/bin/env python3
"""Stap 2: haal overnachtingsadressen, stations en plaatsnamen langs de routelijnen uit OSM-extracten.

Invoer: <cache>/pbf/*.osm.pbf (regionale extracten), <cache>/line_*.json
Uitvoer: <cache>/pois.json
"""
import glob, json, math, os, subprocess, sys
import osmium

sys.path.insert(0, os.path.dirname(__file__))
import wmt

CACHE = wmt.CACHE
STAY = "hotel,guest_house,hostel,motel,alpine_hut,wilderness_hut,camp_site,chalet,apartment"
MARGIN = 5000.0

def route_grid():
    grid = set()
    for f in sorted(glob.glob(os.path.join(CACHE, "line_*.json"))):
        for la, lo in json.load(open(f))["pts"][::3]:
            grid.add((int(la * 50), int(lo * 50)))
    return grid

def near(grid, lat, lon):
    r = 3
    gx, gy = int(lat * 50), int(lon * 50)
    return any((gx + dx, gy + dy) in grid for dx in range(-r, r + 1) for dy in range(-r, r + 1))

def main():
    grid = route_grid()
    pois = {}
    for pbf in sorted(glob.glob(os.path.join(CACHE, "pbf", "*-latest.osm.pbf"))):
        flt = pbf.replace("-latest.osm.pbf", ".filtered.pbf")
        if not os.path.exists(flt):
            subprocess.run(["osmium", "tags-filter", pbf, f"nw/tourism={STAY}", "n/railway=station,halt",
                            "n/place=city,town,village,hamlet,locality,isolated_dwelling,suburb", "n/natural=saddle",
                            "n/mountain_pass=yes", "nw/shop=supermarket,convenience,bakery,general",
                            "n/amenity=drinking_water", "-o", flt, "--overwrite"], check=True)
        n0 = len(pois)
        for o in osmium.FileProcessor(flt).with_locations():
            t = o.tags
            if o.is_node():
                if not o.location.valid():
                    continue
                lat, lon = o.location.lat, o.location.lon
                pid = f"n{o.id}"
            elif o.is_way():
                locs = [n.location for n in o.nodes if n.location.valid()]
                if not locs:
                    continue
                lat = sum(l.lat for l in locs) / len(locs); lon = sum(l.lon for l in locs) / len(locs)
                pid = f"w{o.id}"
            else:
                continue
            kind = t.get("tourism")
            if kind not in STAY.split(","):
                kind = None
            if not kind and t.get("railway") in ("station", "halt") and o.is_node():
                if t.get("station") in ("subway", "light_rail", "funicular") or t.get("tram") == "yes":
                    continue
                kind = "station"
            if not kind and t.get("place") and o.is_node():
                kind = "place"
            if not kind and o.is_node() and (t.get("natural") == "saddle" or t.get("mountain_pass") == "yes") and t.get("name"):
                kind = "pass"
            if not kind and t.get("shop") in ("supermarket", "convenience", "bakery", "general"):
                kind = "shop"
            if not kind and o.is_node() and t.get("amenity") == "drinking_water":
                kind = "water"
            if not kind or not near(grid, lat, lon):
                continue
            p = {"k": kind, "n": t.get("name") or "", "lat": round(lat, 5), "lon": round(lon, 5)}
            if kind == "place":
                p["pt"] = t.get("place"); p["pop"] = t.get("population") or ""
            elif kind == "shop":
                p["st"] = t.get("shop")
            elif kind == "pass":
                p["ele"] = t.get("ele") or ""
            elif kind not in ("station", "water"):
                p.update({"web": t.get("website") or t.get("contact:website") or t.get("url") or "",
                          "tel": t.get("phone") or t.get("contact:phone") or "",
                          "mail": t.get("email") or t.get("contact:email") or "",
                          "stars": t.get("stars") or "", "beds": t.get("beds") or t.get("capacity") or "",
                          "ele": t.get("ele") or "", "op": t.get("operator") or "", "res": t.get("reservation") or "",
                          "oh": t.get("opening_hours") or "", "tents": t.get("tents") or "",
                          "wiki": t.get("wikidata") or ""})
            pois[pid] = p
        print(f"{os.path.basename(pbf)}: +{len(pois) - n0}", flush=True)
    json.dump(pois, open(os.path.join(CACHE, "pois.json"), "w"), ensure_ascii=False)
    import collections
    print(len(pois), collections.Counter(p["k"] for p in pois.values()))

if __name__ == "__main__":
    main()
