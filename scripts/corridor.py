"""Definitie van de corridor Trier - Rome: secties, varianten en de paden waaruit ze bestaan.

Elke variant is een reeks 'legs':
  trail   = volg de OSM-routerelatie(s) tussen twee punten (officiële lijn van het pad)
  brouter = verbindingsstuk, berekend met BRouter (wandelprofiel) langs opgegeven punten
"""

P = {
    "trier": (49.7597, 6.6440),
    "lichtenberg": (49.5560, 7.3630),
    "johanniskreuz": (49.3370, 7.8260),
    "hauenstein": (49.1915, 7.8545),
    "lauterbourg": (48.9750, 8.1780),
    "iffezheim": (48.8330, 8.1070),
    "badenbaden": (48.7628, 8.2408),
    "geroldsau": (48.7220, 8.2380),
    "badenerhoehe": (48.6617, 8.2644),
    "hausach": (48.2830, 8.1780),
    "titisee": (47.9033, 8.1550),
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
FHK = [2585355]
WESTWEG = [62900]

SECTIONS = [
    {"id": "s1", "name": "Hunsrück", "from": "Trier", "to": "Idar-Oberstein"},
    {"id": "s2", "name": "Westpfalz en Pfälzerwald", "from": "Idar-Oberstein", "to": "Hauenstein"},
    {"id": "s3", "name": "Dahner Felsenland", "from": "Hauenstein", "to": "Wissembourg"},
    {"id": "s4", "name": "Rijnvlakte", "from": "Wissembourg", "to": "Baden-Baden"},
    {"id": "s5", "name": "Zwarte Woud", "from": "Baden-Baden", "to": "Titisee"},
]

VARIANTS = [
    {"id": "s1a", "section": "s1", "name": "Saar-Hunsrück-Steig", "recommended": True,
     "legs": [{"type": "trail", "rels": SHS, "from": "trier", "to": "idar", "trail": "Saar-Hunsrück-Steig"}], "pins": []},
    {"id": "s2a", "section": "s2", "name": "Over Burg Lichtenberg en de Potzberg", "recommended": True,
     "legs": [
         {"type": "brouter", "pts": ["idar", "baumholder", "lichtenberg"], "trail": "Verbinding Baumholder"},
         {"type": "trail", "rels": FHK, "from": "lichtenberg", "to": "johanniskreuz", "trail": "Franken-Hessen-Kurpfalz-Weg"},
         {"type": "trail", "rels": PWP, "from": "johanniskreuz", "to": "hauenstein", "trail": "Pfälzer Waldpfad"},
     ],
     "pins": []},
    {"id": "s2b", "section": "s2", "name": "Via Kaiserslautern", "recommended": False,
     "legs": [
         {"type": "brouter", "pts": ["idar", "baumholder", "kusel", "kaiserslautern"], "trail": "Verbinding Westpfalz"},
         {"type": "trail", "rels": PWP, "from": "kaiserslautern", "to": "hauenstein", "trail": "Pfälzer Waldpfad"},
     ],
     "pins": ["kusel", "kaiserslautern"]},
    {"id": "s3a", "section": "s3", "name": "Drie volle dagen", "recommended": True,
     "legs": [
         {"type": "trail", "rels": PWP, "from": "hauenstein", "to": "schweigen", "trail": "Pfälzer Waldpfad"},
         {"type": "brouter", "pts": ["schweigen", "wissembourg"], "trail": "Pfälzer Waldpfad"},
     ], "pins": []},
    {"id": "s3b", "section": "s3", "name": "Vijf korte dagen", "recommended": False, "hours": (3.2, 5.6, 4.4),
     "legs": [
         {"type": "trail", "rels": PWP, "from": "hauenstein", "to": "schweigen", "trail": "Pfälzer Waldpfad"},
         {"type": "brouter", "pts": ["schweigen", "wissembourg"], "trail": "Pfälzer Waldpfad"},
     ], "pins": []},
    {"id": "s4a", "section": "s4", "name": "Langs de Lauter en over de Rijn", "recommended": True,
     "legs": [{"type": "brouter", "pts": ["wissembourg", "lauterbourg", "iffezheim", "badenbaden"], "trail": "Verbinding Rijnvlakte"}], "pins": []},
    {"id": "s5a", "section": "s5", "name": "Westweg", "recommended": True,
     "legs": [
         {"type": "brouter", "pts": ["badenbaden", "geroldsau", "badenerhoehe"], "trail": "Aanloop Badener Höhe"},
         {"type": "trail", "rels": WESTWEG, "from": "badenerhoehe", "to": "titisee", "trail": "Westweg"},
     ], "pins": ["hausach"]},
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
    "Hausach", "Titisee", "Landstuhl", "Kell am See", "Hermeskeil", "Morbach", "Idar-Oberstein", "Johanniskreuz", "Rodalben", "Hauenstein", "Dahn",
    "Niederbronn-les-Bains", "La Petite-Pierre", "Saverne", "Dabo", "Wangenbourg-Engenthal",
    "Le Hohwald", "Barr", "Andlau", "Châtenois", "Ribeauvillé", "Le Bonhomme", "Thann", "Giromagny",
    "Saint-Hippolyte", "Goumois", "Villers-le-Lac", "Mouthe", "Les Rousses", "Saint-Cergue",
    "Les Contamines-Montjoie", "Les Chapieux", "Samoëns", "La Chapelle-d'Abondance", "La Fouly",
    "Mettlach", "Metz", "Gorze", "Pont-à-Mousson", "Liverdun", "Vic-sur-Seille", "Abreschviller",
}
