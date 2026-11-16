"""Handmatige correcties op de automatische etappe-indeling."""

# naam van verplichte stopplaatsen (pins uit corridor.py)
PIN_NAMES = {
    "idar": "Idar-Oberstein", "kusel": "Kusel", "lichtenberg": "Burg Lichtenberg", "hausach": "Hausach", "kaiserslautern": "Kaiserslautern", "wissembourg": "Wissembourg", "perl": "Perl",
    "lausanne": "Lausanne", "gsb": "Col du Grand-Saint-Bernard", "stgingolph": "Saint-Gingolph",
    "leshouches": "Les Houches", "courmayeur": "Courmayeur", "orsieres": "Orsières",
}

# hernoemen van automatisch gevonden plaatsnamen: "oud" of (variant, "oud") -> "nieuw"
RENAME = {
    "Altic": "Métabief", "Altic (bij Métabief)": "Métabief",
    "La Tuilerie": "La Cluse-et-Mijoux", "La Tuilerie (bij La Cluse-et-Mijoux)": "La Cluse-et-Mijoux",
    "Alteville": "Tarquimpol (Château d'Alteville)", "Alteville (bij Tarquimpol)": "Tarquimpol (Château d'Alteville)",
    "Costamezzana (bij Pieve Cusignano)": "Costamezzana",
    "La salita (bij Fornovo di Taro)": "Fornovo di Taro",
    "Casa Cantoniera (bij Gravagna San Rocco)": "Passo della Cisa",
    "Perticata (bij Fontia)": "Fontia (bij Carrara)",
    "Renella": "Montignoso (Renella)",
    "Nocchi": "Camaiore (Nocchi)",
    "Arnuova Desot": "Arnouva (Val Ferret)",
    "Isola Farnese": "La Storta (Isola Farnese)",
    "Podere Colsereno (bij Bibbiano)": "Colsereno (bij Buonconvento)",
    "Wolfsthal (bij Wangenbourg-Engenthal)": "Wangenbourg-Engenthal",
    "Col du Donon (bij Grandfontaine)": "Col du Donon",
    "le Champ du Feu (bij Belmont)": "Champ du Feu",
    "Schupferen (bij Le Valtin)": "Schupferen (bij Col de la Schlucht)",
    "La Pile Dessus (bij Prémanon)": "La Cure (La Givrine)",
    "La Ville du Nant (bij La Chapelle-d'Abondance)": "La Chapelle-d'Abondance",
    "Salvagny (bij Sixt-Fer-à-Cheval)": "Sixt-Fer-à-Cheval",
    "Molkenrain (bij Goldbach-Altenbach)": "Molkenrain",
    "Col du Hundsruck (bij Bourbach-le-Haut)": "Col du Hundsruck",
    "Gresson Moyen (bij Sewen)": "Gresson (bij Sewen)",
    "Lepuix": "Lepuix (bij Giromagny)",
    "Chalet-Refuge du Ski Club Edelweiss Saint-Amarin": "Mordfeld (bij Le Markstein)",
    "USM Mordfeld": "Mordfeld (bij Le Markstein)",
    "Rome": "Rome (Sint-Pieter)",
    "Seehotel Gelterswoog (bij Dansenberg)": "Gelterswoog (bij Kaiserslautern)",
    "Schwarzbach (bij Mölschbach)": "Johanniskreuz",
    "Hark (bij Oberharmersbach)": "Harkhof (bij Oberharmersbach)",
    "Brendhäusle (bij Gütenbach)": "Brend (bij Gütenbach)",
    "Schöne Aussicht (bij Niederwasser)": "Schöne Aussicht (bij Hornberg)",
    ("s3b", 2): "Dahn",
    ("s8a", "Montaione"): "Gambassi Terme",
}

# extra verplichte stopplaatsen per variant: ("Naam", (lat, lon))
EXTRA_STOPS = {}

# posities (meters vanaf start variant) waar geen etappe mag eindigen
AVOID = {}
