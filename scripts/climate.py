#!/usr/bin/env python3
"""Maandgemiddelden van het weer per sectie (2016-2025) uit het Open-Meteo-archief (ERA5).

Uitvoer: data/climate.json
"""
import json, os, sys, time
sys.path.insert(0, os.path.dirname(__file__))
import wmt

POINTS = {
    "s1": ("Idar-Oberstein", 49.70, 7.30, 400), "s2": ("Col de la Schlucht", 48.06, 7.02, 1139),
    "s3": ("Mouthe", 46.71, 6.19, 940), "s4": ("Col du Grand-Saint-Bernard", 45.869, 7.171, 2470),
    "s4lake": ("Lausanne", 46.52, 6.63, 450), "s5": ("Aosta", 45.737, 7.32, 580), "s6": ("Pavia", 45.185, 9.16, 77),
    "s7": ("Pontremoli", 44.375, 9.88, 240), "s8": ("Siena", 43.32, 11.33, 320), "s9": ("Viterbo", 42.42, 12.10, 330),
}
out = {}
for key, (name, lat, lon, ele) in POINTS.items():
    url = (f"https://archive-api.open-meteo.com/v1/archive?latitude={lat}&longitude={lon}&elevation={ele}"
           "&start_date=2016-01-01&end_date=2025-12-31&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,snowfall_sum&timezone=UTC")
    d = wmt.fetch_json(url, f"clim_{key}.json", pause=2)["daily"]
    m = {i: {"tx": [], "tn": [], "p": [], "s": [], "days": set()} for i in range(1, 13)}
    for t, tx, tn, p, s in zip(d["time"], d["temperature_2m_max"], d["temperature_2m_min"], d["precipitation_sum"], d["snowfall_sum"]):
        if tx is None:
            continue
        mo = int(t[5:7]); b = m[mo]
        b["tx"].append(tx); b["tn"].append(tn); b["p"].append(p or 0); b["s"].append(s or 0); b["days"].add(t[:7])
    out[key] = {"name": name, "ele": ele,
                "tmax": [round(sum(m[i]["tx"]) / len(m[i]["tx"]), 1) for i in range(1, 13)],
                "tmin": [round(sum(m[i]["tn"]) / len(m[i]["tn"]), 1) for i in range(1, 13)],
                "rain": [round(sum(m[i]["p"]) / len(m[i]["days"])) for i in range(1, 13)],
                "wet": [round(sum(1 for v in m[i]["p"] if v >= 1) / len(m[i]["days"])) for i in range(1, 13)],
                "snow": [round(sum(m[i]["s"]) / len(m[i]["days"])) for i in range(1, 13)]}
    print(key, name, out[key]["tmax"], out[key]["rain"])
json.dump(out, open(os.path.join(os.path.dirname(__file__), "..", "data", "climate.json"), "w"), ensure_ascii=False, separators=(",", ":"))
