# Trier naar Rome

Planner voor een voettocht van Trier naar Rome over langeafstandspaden: de Saar-Hunsrück-Steig, de Pfälzer Waldpfad, de GR 53 en GR 5 door Vogezen en Jura, een Alpenoversteek naar keuze en de Via Francigena.

## Wat de app doet

- **Route**: negen secties met beschrijving, varianten, seizoensadvies per maand, klimaatgrafiek en ervaringen van andere wandelaars.
- **Etappes**: 31 etappes van Trier tot de splitsing bij de Titisee (563 km), ingedeeld op 6 tot 9 uur per dag inclusief pauzes. Elke etappe eindigt bij een overnachtingsadres.
- **Reizen**: stel een reis van 5 tot 10 etappes samen. Per nacht kies je een adres, open je de boekingssite met je datums en houd je status en prijs bij.
- **Openbaar vervoer**: reisadvies van huis naar het startpunt en terug, plus links naar de reisplanners.
- **Garmin**: per etappe een GPX die je via het deelmenu naar Garmin Connect stuurt of downloadt.
- **Wanneer**: seizoenskalender per sectie en een voorstel voor een meerjarenplan.
- **Dagduur en tempo**: stel in hoeveel uur je per dag onderweg wilt zijn. De app deelt de route zelf in etappes in. Het tempo leid je af uit echte wandelingen via een Garmin-CSV, GPX-bestanden of de tijd die je bij een gelopen etappe invult.

Alle keuzes en plannen staan in de browser (localStorage). Onder Instellingen maak je een reservekopie.

## Draaien

De app is een statische site zonder buildstap.

```bash
python3 -m http.server 8000
```

Open daarna `http://localhost:8000`. Elke statische host werkt: Vercel, Netlify, GitHub Pages.

## Opbouw

| Map | Inhoud |
| --- | --- |
| `index.html`, `assets/` | De app: schermen, opmaak, logica |
| `assets/js/content.js` | Beschrijvingen, seizoensadvies, bronnen |
| `data/route.json` | Secties en varianten |
| `data/plan/` | Per variant: routelijn, hoogteprofiel, mogelijke stopplaatsen, overnachtingen, winkels en waterpunten |
| `data/climate.json` | Maandgemiddelden per sectie |
| `scripts/` | Pijplijn die de data opbouwt |
| `vendor/leaflet/` | Kaartbibliotheek |

## Data opnieuw opbouwen

De pijplijn gebruikt Python 3 met `numpy` en `osmium`, plus `osmium-tool`.

1. `scripts/corridor.py` beschrijft de secties, varianten en paden. `scripts/names.py` bevat handmatige correcties.
2. `scripts/build_lines.py` haalt de routerelaties op bij Waymarked Trails, bouwt per variant één lijn en voegt SRTM-hoogte toe. Verbindingsstukken komen van BRouter.
3. `scripts/extract_pois.py` haalt overnachtingen, stations, plaatsen, winkels en waterpunten uit regionale OpenStreetMap-extracten (download.openstreetmap.fr) in `<cache>/pbf/`.
4. `scripts/make_stages.py` deelt elke variant op in etappes en schrijft `data/`.
5. `scripts/climate.py` haalt de klimaatgemiddelden op bij Open-Meteo.

Zet `ROME_CACHE` op een map voor tussenbestanden.

## Bronnen en licenties

- Routes, overnachtingen en kaarten: © OpenStreetMap-bijdragers (ODbL), via Waymarked Trails, BRouter en OpenTopoMap.
- Hoogte: SRTM via AWS Terrain Tiles.
- Klimaat: Open-Meteo (ERA5).
- Reisadvies: Transitous.

## Beperkingen

- De routelijn volgt de paden zoals ze in OpenStreetMap staan. Paden worden verlegd: volg onderweg de markering.
- Stijgmeters komen uit een hoogtemodel en wijken tot ongeveer 10 procent af van gidsen.
- Niet elk overnachtingsadres staat in OpenStreetMap, en openingstijden ontbreken vaak.
- Beoordelingen van adressen opent de app bij Google Maps en Tripadvisor. Ze staan niet in de app zelf.
