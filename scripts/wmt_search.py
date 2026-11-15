#!/usr/bin/env python3
"""Zoek wandelroutes in Waymarked Trails. Gebruik: wmt_search.py "naam" ["naam2" ...]"""
import json, sys, time, urllib.parse, urllib.request

def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": "trail-planner-build/0.1"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.load(r)

for q in sys.argv[1:]:
    print(f"== {q}")
    try:
        d = get("https://hiking.waymarkedtrails.org/api/v1/list/search?limit=20&query=" + urllib.parse.quote(q))
    except Exception as e:
        print("  fout:", e); continue
    for r in d.get("results", []):
        print(f"  {r['type']} {r['id']:>9} | {r.get('group','')} | ref={r.get('ref','')} | {r.get('name','')} | {' > '.join(r.get('itinerary') or [])} | linear={r.get('linear','')}")
    time.sleep(0.6)
