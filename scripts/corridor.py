"""Definitie van de corridor Trier - Rome: secties, varianten en de paden waaruit ze bestaan.

Elke variant is een reeks 'legs':
  trail   = volg de OSM-routerelatie(s) tussen twee punten (officiële lijn van het pad)
  brouter = verbindingsstuk, berekend met BRouter (wandelprofiel) langs opgegeven punten
"""

P = {
    "trier": (49.7597, 6.6440),
    "idar": (49.7040, 7.3270),
    "baumholder": (49.6170, 7.3350),
    "kusel": (49.5370, 7.4040),
    "kaiserslautern": (49.4362, 7.7689),
    "schweigen": (49.0538, 7.9560),
    "wissembourg": (49.0322, 7.9505),
    "donon": (48.5276, 7.1678),
    "schirmeck": (48.4790, 7.2190),
    "perl": (49.4732, 6.3696),
    "schengen": (49.4716, 6.3682),
    "fesches": (47.5234, 6.8977),
    "belfort": (47.6385, 6.8640),
    "lacure": (46.4563, 6.0640),
    "stcergue": (46.4460, 6.1570),
    "nyon": (46.3805, 6.2400),
    "lausanne": (46.5226, 6.6355),
    "villeneuve": (46.3975, 6.9270),
    "bouveret": (46.3850, 6.8560),
    "stgingolph": (46.3942, 6.8047),
    "leshouches": (45.8897, 6.7977),
    "courmayeur": (45.7915, 6.9690),
    "morgex": (45.7580, 7.0370),
    "arvier": (45.7030, 7.1650),
    "orsieres": (46.0295, 7.1445),
    "issert": (46.0105, 7.1260),
    "gsb": (45.8695, 7.1648),
    "aosta": (45.7372, 7.3206),
    "ivrea": (45.4670, 7.8750),
    "fidenza": (44.8660, 10.0610),
    "lucca": (43.8420, 10.5030),
    "acquapendente": (42.7440, 11.8650),
    "roma": (41.9022, 12.4567),
}

SHS = [2167175, 83023]
MOSEL = [3632589]
GR5_LOR = [2029679]
GR5_VOS = [16699053]
GR5_BELFORT = [16699053, 6760067]
GR5_JURA = [20617654]
GR53 = [2603124]
PWP = [1650025]
VIAJACOBI = [11063227, 11062070]
VF_CH = [124582]
VF_IT = [2458709, 1471008, 2452848, 1471005, 334891, 12554842, 6201614]
GR5_ALP = [14060187, 20623407]
TMB = [124456]

# pins: plaatsen waar een etappe moet eindigen (naam, punt)
SECTIONS = [
    {"id": "s1", "name": "Trier naar de Vogezen", "from": "Trier", "to": "Schirmeck"},
    {"id": "s2", "name": "Vogezen", "from": "Schirmeck", "to": "Belfort"},
    {"id": "s3", "name": "Jura", "from": "Belfort", "to": "Nyon"},
    {"id": "s4", "name": "Meer van Genève en Alpen", "from": "Nyon", "to": "Aosta"},
    {"id": "s5", "name": "Aostadal", "from": "Aosta", "to": "Ivrea"},
    {"id": "s6", "name": "Po-vlakte", "from": "Ivrea", "to": "Fidenza"},
    {"id": "s7", "name": "Apennijnen en Lunigiana", "from": "Fidenza", "to": "Lucca"},
    {"id": "s8", "name": "Toscane", "from": "Lucca", "to": "Acquapendente"},
    {"id": "s9", "name": "Lazio", "from": "Acquapendente", "to": "Rome"},
]

VARIANTS = [
    {"id": "s1a", "section": "s1", "name": "Hunsrück, Pfälzerwald en Noord-Vogezen", "recommended": True,
     "legs": [
         {"type": "trail", "rels": SHS, "from": "trier", "to": "idar", "trail": "Saar-Hunsrück-Steig"},
         {"type": "brouter", "pts": ["idar", "baumholder", "kusel", "kaiserslautern"], "trail": "Verbinding Westpfalz"},
         {"type": "trail", "rels": PWP, "from": "kaiserslautern", "to": "schweigen", "trail": "Pfälzer Waldpfad"},
         {"type": "brouter", "pts": ["schweigen", "wissembourg"], "trail": "Pfälzer Waldpfad"},
         {"type": "trail", "rels": GR53, "from": "wissembourg", "to": "donon", "trail": "GR 53"},
         {"type": "trail", "rels": GR5_VOS, "from": "donon", "to": "schirmeck", "trail": "GR 5"},
     ],
     "pins": ["idar", "kusel", "kaiserslautern", "wissembourg"], "pin_names": ["Saverne"]},
    {"id": "s1b", "section": "s1", "name": "Saarschleife en Lotharingen", "recommended": False,
     "legs": [
         {"type": "trail", "rels": SHS, "from": "trier", "to": "perl", "trail": "Saar-Hunsrück-Steig"},
         {"type": "brouter", "pts": ["perl", "schengen"], "trail": "Saar-Hunsrück-Steig"},
         {"type": "trail", "rels": GR5_LOR, "from": "schengen", "to": "donon", "trail": "GR 5"},
         {"type": "trail", "rels": GR5_VOS, "from": "donon", "to": "schirmeck", "trail": "GR 5"},
     ],
     "pins": ["perl"], "reach2": 3000},
    {"id": "s2a", "section": "s2", "name": "GR 5 over de Vogezenkam", "recommended": True,
     "legs": [{"type": "trail", "rels": GR5_BELFORT, "from": "schirmeck", "to": "belfort", "trail": "GR 5"}],
     "pins": []},
    {"id": "s3a", "section": "s3", "name": "GR 5 door de Jura", "recommended": True,
     "legs": [
         {"type": "trail", "rels": GR5_BELFORT, "from": "belfort", "to": "fesches", "trail": "GR 5"},
         {"type": "trail", "rels": GR5_JURA, "from": "fesches", "to": "lacure", "trail": "GR 5"},
         {"type": "brouter", "pts": ["lacure", "stcergue", "nyon"], "trail": "Chemin des Crêtes du Jura"},
     ],
     "pins": []},
    {"id": "s4a", "section": "s4", "name": "Via Francigena over de Grote Sint-Bernhard", "recommended": False,
     "legs": [
         {"type": "trail", "rels": VIAJACOBI, "from": "nyon", "to": "lausanne", "trail": "ViaJacobi"},
         {"type": "trail", "rels": VF_CH, "from": "lausanne", "to": "gsb", "trail": "Via Francigena"},
         {"type": "trail", "rels": VF_IT, "from": "gsb", "to": "aosta", "trail": "Via Francigena"},
     ],
     "pins": ["lausanne", "gsb"], "pin_names": ["Martigny"]},
    {"id": "s4b", "section": "s4", "name": "GR 5 en Tour du Mont Blanc", "recommended": False,
     "legs": [
         {"type": "trail", "rels": VIAJACOBI, "from": "nyon", "to": "lausanne", "trail": "ViaJacobi"},
         {"type": "trail", "rels": VF_CH, "from": "lausanne", "to": "villeneuve", "trail": "Via Francigena"},
         {"type": "brouter", "pts": ["villeneuve", "bouveret", "stgingolph"], "trail": "Verbinding Rhônedelta"},
         {"type": "trail", "rels": GR5_ALP, "from": "stgingolph", "to": "leshouches", "trail": "GR 5"},
         {"type": "trail", "rels": TMB, "from": "leshouches", "to": "courmayeur", "trail": "Tour du Mont Blanc"},
         {"type": "brouter", "pts": ["courmayeur", "morgex", "arvier", "aosta"], "trail": "Verbinding Aostadal"},
     ],
     "pins": ["lausanne", "leshouches", "courmayeur"], "pin_names": ["Les Contamines-Montjoie"]},
    {"id": "s4c", "section": "s4", "name": "Via Francigena en Val Ferret", "recommended": True,
     "legs": [
         {"type": "trail", "rels": VIAJACOBI, "from": "nyon", "to": "lausanne", "trail": "ViaJacobi"},
         {"type": "trail", "rels": VF_CH, "from": "lausanne", "to": "orsieres", "trail": "Via Francigena"},
         {"type": "brouter", "pts": ["orsieres", "issert"], "trail": "Verbinding Val Ferret"},
         {"type": "trail", "rels": TMB, "from": "issert", "to": "courmayeur", "trail": "Tour du Mont Blanc"},
         {"type": "brouter", "pts": ["courmayeur", "morgex", "arvier", "aosta"], "trail": "Verbinding Aostadal"},
     ],
     "pins": ["lausanne", "orsieres", "courmayeur"], "pin_names": ["Martigny"]},
    {"id": "s5a", "section": "s5", "name": "Via Francigena door het Aostadal", "recommended": True,
     "legs": [{"type": "trail", "rels": VF_IT, "from": "aosta", "to": "ivrea", "trail": "Via Francigena"}], "pins": []},
    {"id": "s6a", "section": "s6", "name": "Via Francigena door de Po-vlakte", "recommended": True,
     "legs": [{"type": "trail", "rels": VF_IT, "from": "ivrea", "to": "fidenza", "trail": "Via Francigena"}],
     "pins": [], "pin_names": ["Vercelli", "Pavia", "Piacenza"]},
    {"id": "s7a", "section": "s7", "name": "Via Francigena over de Cisapas", "recommended": True,
     "legs": [{"type": "trail", "rels": VF_IT, "from": "fidenza", "to": "lucca", "trail": "Via Francigena"}],
     "pins": [], "pin_names": ["Pontremoli"]},
    {"id": "s8a", "section": "s8", "name": "Via Francigena door Toscane", "recommended": True,
     "legs": [{"type": "trail", "rels": VF_IT, "from": "lucca", "to": "acquapendente", "trail": "Via Francigena"}],
     "pins": [], "pin_names": ["San Gimignano", "Siena"]},
    {"id": "s9a", "section": "s9", "name": "Via Francigena naar Rome", "recommended": True,
     "legs": [{"type": "trail", "rels": VF_IT, "from": "acquapendente", "to": "roma", "trail": "Via Francigena"}],
     "pins": [], "pin_names": ["Viterbo"]},
]

# officiële etappeplaatsen: krijgen de voorkeur als eindpunt van een dag
ANCHORS = {
    "Lausanne", "Vevey", "Montreux", "Villeneuve", "Aigle", "Saint-Maurice", "Martigny", "Orsières", "Bourg-Saint-Pierre",
    "Étroubles", "Aosta", "Châtillon", "Saint-Vincent", "Verrès", "Pont-Saint-Martin", "Ivrea", "Viverone", "Santhià",
    "Vercelli", "Robbio", "Mortara", "Garlasco", "Pavia", "Santa Cristina e Bissone", "Orio Litta", "Piacenza",
    "Fiorenzuola d'Arda", "Fidenza", "Medesano", "Fornovo di Taro", "Cassio", "Berceto", "Pontremoli", "Aulla", "Sarzana",
    "Massa", "Pietrasanta", "Camaiore", "Lucca", "Altopascio", "San Miniato", "Gambassi Terme", "San Gimignano",
    "Colle di Val d'Elsa", "Monteriggioni", "Siena", "Ponte d'Arbia", "Buonconvento", "San Quirico d'Orcia",
    "Bagno Vignoni", "Radicofani", "Acquapendente", "Bolsena", "Montefiascone", "Viterbo", "Vetralla", "Sutri",
    "Campagnano di Roma", "La Storta",
    "Kell am See", "Hermeskeil", "Morbach", "Idar-Oberstein", "Johanniskreuz", "Rodalben", "Hauenstein", "Dahn",
    "Niederbronn-les-Bains", "La Petite-Pierre", "Saverne", "Dabo", "Wangenbourg-Engenthal",
    "Le Hohwald", "Barr", "Andlau", "Châtenois", "Ribeauvillé", "Le Bonhomme", "Thann", "Giromagny",
    "Saint-Hippolyte", "Goumois", "Villers-le-Lac", "Mouthe", "Les Rousses", "Saint-Cergue",
    "Les Contamines-Montjoie", "Les Chapieux", "Samoëns", "La Chapelle-d'Abondance", "La Fouly",
    "Mettlach", "Metz", "Gorze", "Pont-à-Mousson", "Liverdun", "Vic-sur-Seille", "Abreschviller",
}
