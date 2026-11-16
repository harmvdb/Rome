#!/usr/bin/env python3
"""Maandgemiddelden van het weer per sectie (2016-2025) uit het Open-Meteo-archief (ERA5).

Uitvoer: data/climate.json
"""
import json, os, sys, time
sys.path.insert(0, os.path.dirname(__file__))
import wmt

POINTS = {
    "s1": ("Idar-Oberstein", 49.70, 7.30, 400), "s2": ("Johanniskreuz", 49.34, 7.83, 470),
    "s3": ("Dahn", 49.15, 7.78, 210), "s4": ("Rastatt", 48.86, 8.20, 120), "s5": ("Hornisgrinde", 48.61, 8.20, 1100),
}
out = {}
for key, (name, lat, lon, ele) in POINTS.items():
    url = (f"https://archive-api.open-meteo.com/v1/archive?latitude={lat}&longitude={lon}&elevation={ele}"
           "&start_date=2016-01-01&end_date=2025-12-31&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,snowfall_sum&timezone=UTC")
    try:
        d = wmt.fetch_json(url, f"clim2_{key}.json", pause=20, retries=2)["daily"]
    except Exception as e:  # dienst beperkt het aantal verzoeken: sla dit punt over en draai later opnieuw
        print(key, "overgeslagen:", str(e)[-60:])
        continue
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
