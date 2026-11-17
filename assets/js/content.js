// Beschrijvingen, seizoensadvies, ervaringen en bronnen per sectie en variant.
// Maandscores: 0 = afraden, 1 = kan met beperkingen, 2 = goed, 3 = beste tijd.

export const RATING = ['Afraden', 'Kan, met beperkingen', 'Goed', 'Beste tijd'];

export const SECTIONS = {
  s1: {
    tag: 'Acht dagen over de Saar-Hunsrück-Steig: Ruwerdal, nationaal park en de Erbeskopf.',
    months: [0, 0, 1, 2, 3, 3, 2, 2, 3, 2, 1, 0],
    season: 'Loop dit deel tussen half april en eind oktober. Mei, juni en september geven de beste combinatie van lange dagen, open horeca en koel wandelweer.',
    seasonTips: [
      'Juli en augustus zijn warm, maar het pad loopt grotendeels door bos. Neem genoeg water mee: bronnen staan in de zomer vaak droog.',
      'November tot en met maart: sneeuw en ijzel boven 500 meter, veel modder, veel gesloten adressen. Niet doen.',
      'Teken zijn actief van maart tot oktober. Controleer dagelijks.',
    ],
    practical: [
      'Markering: het blauw-groene logo van de Saar-Hunsrück-Steig. De markering is foutloos.',
      'Het pad maakt tussen Hermeskeil en Idar-Oberstein een grote lus naar het noorden door het nationaal park. Hemelsbreed is dat 30 km, het pad doet er 87 km over.',
      'Overnachtingen liggen dun gezaaid. Riveris, Langweiler en Kempfeld hebben elk een of twee adressen.',
      'Bevoorrading: neem lunch mee. Tussen de dorpen ligt urenlang alleen bos.',
    ],
    ov: 'Trier bereik je per trein via Keulen en Koblenz of via Luxemburg in 5 tot 6 uur. Idar-Oberstein ligt aan de Nahelijn tussen Saarbrücken en Mainz. Hermeskeil heeft een bus naar Trier.',
    variants: {
      s1a: {
        tag: 'Van de Porta Nigra naar de edelsteenstad.',
        text: [
          'Je verlaat Trier over de Saar-Hunsrück-Steig. Het pad volgt het Ruwerdal langs de stuwdam van Riveris en klimt de Hochwald in naar Kell am See en Hermeskeil.',
          'Daarna doorkruis je het Nationalpark Hunsrück-Hochwald: beukenbos, veenmoerassen en kwartsietruggen. Bij de Erbeskopf (816 m) sta je op het hoogste punt van Rijnland-Palts.',
          'Na de Wildenburg bij Kempfeld daal je in een lange dag af naar Idar-Oberstein, met de Felsenkirche in de rotswand en de edelsteenmijnen.',
        ],
        plus: ['Een van de best beoordeelde paden van Duitsland', 'Veel smalle bospaden, weinig asfalt', 'Trier en Idar-Oberstein hebben een station'],
        minus: ['Weinig overnachtingen aan het pad', 'Veel kleine klimmen die optellen', 'Dagen achter elkaar bos, weinig uitzicht'],
        highlights: ['Porta Nigra in Trier', 'Riveristalsperre', 'Nationalpark Hunsrück-Hochwald', 'Erbeskopf', 'Wildenburg', 'Felsenkirche in Idar-Oberstein'],
        reviews: {
          points: [
            'Wandelaars roemen de afwisseling, het hoge aandeel smalle bospaden en de foutloze markering.',
            'Terugkerende kritiek: weinig overnachtingen op het pad zelf en veel kleine klimmetjes die optellen.',
          ],
          sources: [
            { label: 'Saar-Hunsrück-Steig, officiële site met etappes en gastgevers', url: 'https://www.saar-hunsrueck-steig.de/' },
            { label: 'Komoot: Saar-Hunsrück-Steig met tips van wandelaars', url: 'https://www.komoot.com/de-de/discover/Saar-Hunsr%C3%BCck-Steig/@49.7,7.0/tours?sport=hike' },
          ],
        },
      },
    },
  },

  s2: {
    tag: 'Van de Nahe door het Pfälzer Bergland naar het grootste bos van Duitsland.',
    months: [0, 0, 1, 2, 3, 3, 2, 2, 3, 2, 1, 0],
    season: 'Half april tot eind oktober. Mei, juni en september zijn het best.',
    seasonTips: [
      'Het Pfälzer Bergland is open boerenland: in juli en augustus loop je daar in de zon.',
      'In het Pfälzerwald zijn de hutten van de Pfälzerwald-Verein vooral in het weekend open.',
      'Oktober geeft herfstkleuren. De dagen worden kort.',
    ],
    practical: [
      'Markering: van Burg Lichtenberg tot Johanniskreuz een rood kruis (Franken-Hessen-Kurpfalz-Weg van de Pfälzerwald-Verein). Daarna het groen-witte embleem van de Pfälzer Waldpfad.',
      'Van Idar-Oberstein tot Burg Lichtenberg ligt geen doorgaand gemarkeerd pad. De lijn is berekend over lokale wandelpaden. Controleer die twee dagen vooraf op de kaart.',
      'Burg Lichtenberg heeft een jeugdherberg in de burcht met 106 bedden, ook tweepersoonskamers. Een goed alternatief voor Kusel.',
      'Het pad loopt bij Ramstein langs de Amerikaanse vliegbasis. Dat stuk is niet het mooiste.',
    ],
    ov: 'Idar-Oberstein, Baumholder, Kusel en Steinwenden hebben een station. Kaiserslautern-Hohenecken ligt bij de Gelterswoog. Waldfischbach en Hauenstein liggen aan lijnen naar Kaiserslautern en Landau.',
    variants: {
      s2a: {
        tag: 'Alles te voet over een gemarkeerd pad, langs de grootste burchtruïne van het land.',
        text: [
          'Van Idar-Oberstein loop je in twee dagen langs Baumholder naar Burg Lichtenberg. De burcht is 425 meter lang en geldt als een van de grootste ruïnes van Duitsland. Je loopt eronderdoor naar Kusel.',
          'Bij de burcht begint de Franken-Hessen-Kurpfalz-Weg, een langeafstandspad van de Pfälzerwald-Verein, gemarkeerd met een rood kruis. Het voert over de Potzberg (562 m), de koning van het Westrich, met uitzichttoren en wildpark. Daarna daal je af naar het Glandal en loop je langs Ramstein en Landstuhl naar de bosrand.',
          'Bij de Gelterswoog, een bosmeer onder Kaiserslautern, begint het Pfälzerwald. Het rode kruis brengt je naar Johanniskreuz, het kruispunt van alle hoofdpaden midden in het bos. Daar pak je de Pfälzer Waldpfad op: over Waldfischbach en Merzalben naar Hauenstein.',
        ],
        plus: ['Gemarkeerd pad vanaf Burg Lichtenberg', 'Burcht, Potzberg en bosmeer in plaats van akkers', 'Je slaat het zwakste begin van de Pfälzer Waldpfad over'],
        minus: ['Twee dagen zonder doorgaand pad aan het begin', 'Ramstein en de vliegbasis', 'De laatste dag naar Hauenstein duurt ruim 9 uur'],
        highlights: ['Burg Lichtenberg', 'Potzberg', 'Burg Nanstein bij Landstuhl', 'Gelterswoog', 'Johanniskreuz', 'Burg Gräfenstein bij Merzalben'],
        reviews: {
          points: [
            'Over de Franken-Hessen-Kurpfalz-Weg zijn weinig verslagen te vinden. Het is een rustig verenigingspad, geen bekende kwaliteitsroute.',
            'De Pfälzer Waldpfad is geliefd om de stilte. De noordelijke etappes gelden als minder spectaculair dan het zuiden.',
          ],
          sources: [
            { label: 'Wandelroutes in het Pfälzerwald, overzicht van de verenigingspaden', url: 'https://wiki.openstreetmap.org/wiki/Wanderwege_im_Pf%C3%A4lzerwald' },
            { label: 'Jeugdherberg Burg Lichtenberg', url: 'https://www.diejugendherbergen.de/' },
            { label: 'Pfälzer Waldpfad op pfalz.de', url: 'https://www.pfalz.de/de/pfaelzer-waldpfad' },
            { label: 'Outdoor Magazin over de Pfälzer Waldpfad', url: 'https://www.outdoor-magazin.com/wanderwege/im-pfaelzerwald-wandern-auf-dem-pfaelzer-waldpfad/' },
          ],
        },
      },
      s2b: {
        tag: 'De eerste lijn uit de app: via Kusel en Kaiserslautern, met de volledige Pfälzer Waldpfad.',
        text: [
          'Deze variant loopt van Idar-Oberstein over lokale paden via Baumholder en Kusel naar Kaiserslautern. Er ligt geen doorgaand gemarkeerd pad: de lijn is berekend.',
          'In Kaiserslautern begint de Pfälzer Waldpfad bij het officiële startpunt. Je loopt hem in zijn geheel, via Trippstadt en Johanniskreuz naar Hauenstein.',
        ],
        plus: ['De Pfälzer Waldpfad vanaf het begin', 'Kaiserslautern als bevoorradingspunt met station'],
        minus: ['Vier dagen zonder gemarkeerd pad', 'Een dag langer', 'Landschappelijk zwakker'],
        highlights: ['Kusel', 'Kaiserslautern', 'Karlstal bij Trippstadt', 'Johanniskreuz'],
        reviews: {
          points: ['De noordelijke etappes van de Pfälzer Waldpfad vanaf Kaiserslautern gelden als minder spectaculair. Het Karlstal bij Trippstadt is de uitzondering.'],
          sources: [{ label: 'Pfälzer Waldpfad op pfalz.de', url: 'https://www.pfalz.de/de/pfaelzer-waldpfad' }],
        },
      },
    },
  },

  s3: {
    tag: 'Rode zandsteenrotsen en burchten tot aan de Franse grens. Het mooiste stuk van de Pfalz.',
    months: [0, 0, 1, 2, 3, 3, 2, 2, 3, 3, 1, 0],
    season: 'April tot eind oktober. Mei, juni, september en oktober zijn het best.',
    seasonTips: [
      'Rond Hemelvaart, Pinksteren en Fronleichnam is het druk. Boek die nachten vroeg.',
      'De rotsen warmen snel op: in de zomer is het hier warmer dan in de Hunsrück.',
      'Oktober is de mooiste herfstmaand, met kastanjes en nieuwe wijn.',
    ],
    practical: [
      'Markering: het groen-witte embleem van de Pfälzer Waldpfad.',
      'Het pad maakt bij Dahn een lus langs de rotsen. Daardoor liggen Erfweiler en Dahn op het pad ver uit elkaar en hemelsbreed dichtbij.',
      'Hauenstein, Dahn en Wissembourg hebben veel hotels en pensions. Erlenbach heeft er weinig.',
      'Burg Berwartstein bij Erlenbach is bewoond en te bezichtigen.',
    ],
    ov: 'Hauenstein ligt aan de lijn Landau naar Pirmasens. Dahn heeft in het seizoen een toeristentrein. Wissembourg heeft treinen naar Straatsburg en naar Neustadt en Karlsruhe.',
    variants: {
      s3a: {
        tag: 'De standaardetappes: 17 tot 21 km per dag met 400 tot 550 meter klimmen.',
        text: [
          'Vanuit Hauenstein loop je door kastanjebossen naar Dahn. Het pad slingert langs rotstorens met namen als Jungfernsprung en Braut und Bräutigam.',
          'De tweede dag voert langs de burchtengroep Altdahn en door stille dalen naar Erlenbach, onder Burg Berwartstein. De derde dag loop je over de grens. Bij Schweigen ga je door de Deutsches Weintor en daal je af naar Wissembourg.',
        ],
        plus: ['Drie volle dagen in het mooiste landschap', 'Past in een kort schema'],
        minus: ['Te zwaar voor wie weinig getraind is', 'Weinig tijd voor burchten'],
        highlights: ['Teufelstisch bij Hinterweidenthal', 'Dahner Felsenland', 'Burgen Altdahn', 'Burg Berwartstein', 'Deutsches Weintor', 'Wissembourg'],
        reviews: {
          points: [
            'De zuidelijke etappes door het Dahner Felsenland gelden als het hoogtepunt van de Pfälzer Waldpfad.',
            'Hutten van de Pfälzerwald-Verein zijn doordeweeks vaak dicht. Reken er niet op voor de lunch.',
          ],
          sources: [
            { label: 'Pfälzer Waldpfad op pfalz.de', url: 'https://www.pfalz.de/de/pfaelzer-waldpfad' },
            { label: 'Outdoor Magazin over de Pfälzer Waldpfad', url: 'https://www.outdoor-magazin.com/wanderwege/im-pfaelzerwald-wandern-auf-dem-pfaelzer-waldpfad/' },
          ],
        },
      },
      s3b: {
        tag: 'Dezelfde route in korte dagen van 9 tot 13 km, gerekend met een rustig tempo. Voor een week samen.',
        text: [
          'Dit is dezelfde lijn, geknipt in vijf korte dagen van 4 tot 5,5 uur inclusief pauzes. Elke dag eindigt bij een plaats met meerdere adressen of een Waldrestaurant.',
          'De tweede dag is een lus van 9 km langs de rotsen bij Dahn. Start en eind liggen dicht bij elkaar: je kunt twee nachten op hetzelfde adres blijven en zonder rugzak lopen. De laatste dag is kort en eindigt in Wissembourg.',
        ],
        plus: ['Haalbaar voor minder getrainde lopers', 'Tijd voor burchten en terrassen', 'Dag twee kan zonder bagage'],
        minus: ['Twee dagen langer', 'Sankt Germanshof heeft weinig adressen: vroeg boeken'],
        highlights: ['Dahner Felsenland', 'Burgen Altdahn', 'Burg Berwartstein', 'Sankt Germanshof', 'Deutsches Weintor', 'Wissembourg'],
        reviews: {
          points: ['De zuidelijke etappes door het Dahner Felsenland gelden als het hoogtepunt van de Pfälzer Waldpfad.'],
          sources: [{ label: 'Pfälzer Waldpfad op pfalz.de', url: 'https://www.pfalz.de/de/pfaelzer-waldpfad' }],
        },
      },
    },
  },

  s4: {
    tag: 'Drie vlakke dagen: langs de grensrivier de Lauter, over de Rijn en naar Baden-Baden.',
    months: [1, 1, 2, 3, 3, 2, 1, 1, 3, 3, 2, 1],
    season: 'Maart tot en met oktober. De Rijnvlakte is het warmste deel van Duitsland.',
    seasonTips: [
      'Juli en augustus: 30 graden of meer en weinig schaduw buiten het Bienwald. Start vroeg.',
      'In de Rijnauen zitten in de zomer veel muggen.',
      'Dit deel kan ook in het vroege voorjaar, als de bergen nog dicht zijn.',
    ],
    practical: [
      'Er ligt geen doorgaand gemarkeerd pad. De lijn is berekend over wandel- en fietspaden langs de Lauter, door het Bienwald en over de Rijn bij de stuw van Iffezheim. Controleer de oversteek vooraf.',
      'Deze verbinding vervangt de omweg via Karlsruhe en Pforzheim uit het magazine. Je sluit bij de Badener Höhe aan op de Westweg en slaat de eerste drie etappes daarvan over.',
      'Baden-Baden is werelderfgoed als kuurstad. Een rustdag met een bezoek aan het Friedrichsbad past hier goed.',
    ],
    ov: 'Wissembourg heeft treinen naar Straatsburg en Karlsruhe. Lauterbourg ligt aan de lijn naar Wörth. Baden-Baden heeft een ICE-station aan de Rijnlijn: rechtstreeks vanuit Nederland in ongeveer 5,5 uur.',
    variants: {
      s4a: {
        tag: 'De kortste lijn van de Vogezenrand naar het Zwarte Woud.',
        text: [
          'Van Wissembourg volg je de Lauter stroomafwaarts. De rivier is hier de grens tussen Frankrijk en Duitsland. Je loopt door het Bienwald, een laaglandbos van eiken en dennen, naar Scheibenhard en Lauterbourg.',
          'Daarna steek je de Rijnvlakte over. Bij de stuw van Iffezheim loop je over de Rijn. Aan de overkant liggen Wintersdorf en de wijnheuvels van het Rebland. De derde dag eindigt in Baden-Baden, aan de voet van het Zwarte Woud.',
        ],
        plus: ['Drie lichte dagen tussen twee gebergten', 'Baden-Baden als rustpunt met ICE-station'],
        minus: ['Geen gemarkeerd pad', 'Veel asfalt en fietspad', 'Landschappelijk het minste deel'],
        highlights: ['Bienwald', 'Lauterbourg', 'Rijnoversteek bij Iffezheim', 'Kuurstad Baden-Baden'],
        reviews: {
          points: ['Dit is een eigen verbinding. Er zijn geen verslagen van andere lopers.'],
          sources: [{ label: 'Baden-Baden, toeristische informatie', url: 'https://www.baden-baden.com/' }],
        },
      },
    },
  },

  s5: {
    tag: 'Negen dagen over de Westweg, het oudste langeafstandspad van Duitsland, tot de splitsing bij de Titisee.',
    months: [0, 0, 0, 1, 3, 3, 2, 2, 3, 2, 0, 0],
    season: 'Mei tot en met oktober. Boven 1000 meter ligt tot in april sneeuw.',
    seasonTips: [
      'Mei en juni: fris groen en lange dagen. Op de Hornisgrinde kan het nog koud zijn.',
      'Juli en augustus: druk rond de Mummelsee en de Titisee, rustig daartussen. Onweer in de middag komt voor.',
      'September en begin oktober zijn het stabielst.',
      'November tot en met maart is de hoogte skigebied.',
    ],
    practical: [
      'Markering: een rode ruit op wit, sinds 1900.',
      'De klim uit Hausach naar de Farrenkopf is de zwaarste van dit deel: ruim 1000 meter stijgen.',
      'Onderweg slaap je in berghotels, Wanderheime en Naturfreundehäuser. De Harkhof en het Naturfreundehaus Brend zijn klassieke adressen: reserveer vroeg.',
      'In Titisee splitst je route. Route B volgt de Westweg over de Feldberg naar Basel. Routes C en D nemen de Querweg naar Konstanz.',
    ],
    ov: 'Baden-Baden heeft een ICE-station. Hausach ligt aan de Schwarzwaldbahn tussen Offenburg en Konstanz. Titisee heeft een trein naar Freiburg, vanwaar een ICE rechtstreeks naar Nederland rijdt.',
    variants: {
      s5a: {
        tag: 'Van de Badener Höhe over de Hornisgrinde en door het Kinzigdal naar de Titisee.',
        text: [
          'Uit Baden-Baden klim je langs de waterval van Geroldsau naar de Badener Höhe (1002 m). Daar sta je op de Westweg. Je loopt over de noordelijke kam: de Hornisgrinde (1164 m) met zijn hoogveen, de Mummelsee en de Schliffkopf in het Nationalpark Schwarzwald.',
          'Na de Kniebis en de eenzame Harkhof daal je af naar Hausach in het Kinzigdal, het laagste punt van de Westweg. Daarna volgt de zwaarste klim, naar de Farrenkopf.',
          'De laatste dagen loop je over de waterscheiding tussen Rijn en Donau. Bij de Martinskapelle ontspringt de Breg, de langste bronrivier van de Donau. Via de Brend en de Kalte Herberge bereik je de Titisee.',
        ],
        plus: ['Klassiek pad met foutloze markering', 'Hoog en open in het noorden', 'Goede berghotels en Wanderheime'],
        minus: ['Lange stukken bosweg', 'Geen beginnerstocht door de hoogteverschillen', 'Drukte bij Mummelsee en Titisee'],
        highlights: ['Badener Höhe', 'Hornisgrinde en Mummelsee', 'Schliffkopf', 'Harkhof', 'Farrenkopf', 'Martinskapelle en de bron van de Donau', 'Titisee'],
        reviews: {
          points: [
            'Komoot waarschuwt dat de Westweg door de hoogteverschillen en lange etappes geen beginnerstocht is.',
            'Het blog ich-geh-wandern.de kiest de dagen rond de Feldberg en de Belchen als mooiste. Die liggen voorbij de Titisee, op route B.',
            'Het noordelijke deel is zachter en loopt door lager bos, het zuidelijke deel is steiler en alpiener.',
          ],
          sources: [
            { label: 'ich-geh-wandern.de: tips en mooiste plekken van de Westweg', url: 'https://www.ich-geh-wandern.de/westweg-die-besten-tipps-und-schoensten-plaetze' },
            { label: 'Outdoor Magazin: 125 jaar Westweg', url: 'https://www.outdoor-magazin.com/wanderwege/auf-dem-westweg-quer-durch-den-schwarzwald/' },
            { label: 'Komoot: de Westweg', url: 'https://www.komoot.com/de-de/collection/899215/old-but-gold-100-prozent-schwarzwald-auf-dem-westweg' },
          ],
        },
      },
    },
  },
};

// Het vervolg na de Titisee is nog niet gekozen. De drie opties staan in het magazine.
export const NEXT = {
  magazine: 'https://claude.ai/artifact/CG18kKpCq645umtiH6igvx',
  options: [
    { key: 'B', name: 'Midden: Feldberg, Basel en de Gotthard', text: 'De Westweg uitlopen naar Basel, dan de Via Gottardo naar Ticino en via Milaan naar de Via Francigena. Kortste lijn, geen hutten. Vanaf de Titisee ruwweg 1.280 km in 55 dagen met jouw tempo.' },
    { key: 'C', name: 'Oost: Bodensee en de E5', text: 'De Querweg naar Konstanz, dan de E5 van hut naar hut over de Alpen naar Meran, Bozen en Verona. Daarna Bologna en Florence. Vanaf de Titisee ruwweg 1.435 km in 65 dagen.' },
    { key: 'D', name: 'Dolomieten', text: 'Als C tot Bozen, dan ruim een week door de Dolomieten over de Alta Via. Daarna Padua, Bologna en Florence. Vanaf de Titisee ruwweg 1.520 km in 71 dagen.' },
  ],
};

// Algemene bronnen met ervaringen en beoordelingen van andere wandelaars.
export const REVIEW_SITES = [
  { label: 'Komoot', note: 'foto\'s en tips per pad', url: (q) => `https://www.komoot.com/nl-nl/discover?q=${encodeURIComponent(q)}` },
  { label: 'Google', note: 'ervaringen en verslagen', url: (q) => `https://www.google.com/search?q=${encodeURIComponent(q + ' ervaringen wandelen')}` },
  { label: 'Reddit', note: 'vragen en verslagen van lopers', url: (q) => `https://www.reddit.com/search/?q=${encodeURIComponent(q + ' hike')}` },
  { label: 'YouTube', note: 'reisverslagen', url: (q) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q + ' wandelen hiking')}` },
];

export const TRAIL_QUERY = {
  'Saar-Hunsrück-Steig': 'Saar-Hunsrück-Steig', 'Pfälzer Waldpfad': 'Pfälzer Waldpfad', 'GR 53': 'GR 53 Vosges du Nord',
  'GR 5': 'GR 5', 'Westweg': 'Westweg Schwarzwald', 'Franken-Hessen-Kurpfalz-Weg': 'Franken-Hessen-Kurpfalz-Weg Pfälzerwald',
  'Chemin des Crêtes du Jura': 'Chemin des Crêtes du Jura',
};

export const GARMIN_STEPS = {
  phone: [
    'Tik op "Stuur naar Garmin". Het deelmenu van je telefoon opent.',
    'Kies Garmin Connect. De app toont de route als nieuwe koers.',
    'Kies als type "Wandelen" en sla op.',
    'Open de koers, tik op het pictogram met de telefoon en het horloge en kies je Forerunner 965.',
    'Synchroniseer. Op het horloge: Start, kies Wandelen, houd de middelste knop links ingedrukt, Navigatie, Koersen.',
  ],
  desktop: [
    'Download de GPX.',
    'Open connect.garmin.com, ga naar Training en planning, Koersen, Importeren.',
    'Kies het bestand, zet het type op Wandelen en sla op.',
    'Klik op "Verzenden naar toestel" en synchroniseer je horloge via de app of de kabel.',
  ],
  usb: [
    'Sluit de Forerunner 965 met de kabel aan op je computer.',
    'Kopieer het GPX-bestand naar de map GARMIN/NewFiles op het horloge.',
    'Koppel los. De koers staat onder Navigatie, Koersen.',
  ],
};
