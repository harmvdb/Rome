// Beschrijvingen, seizoensadvies, ervaringen en bronnen per sectie en variant.
// Maandscores: 0 = afraden, 1 = kan met beperkingen, 2 = goed, 3 = beste tijd.

export const RATING = ['Afraden', 'Kan, met beperkingen', 'Goed', 'Beste tijd'];

export const SECTIONS = {
  s1: {
    tag: 'Middelgebergte, bos en burchten. Van de Moezel naar de eerste Vogezentoppen.',
    months: [0, 0, 1, 2, 3, 3, 2, 2, 3, 2, 1, 0],
    season: 'Loop dit deel tussen half april en eind oktober. Mei, juni en september geven de beste combinatie van lange dagen, open horeca en koel wandelweer.',
    seasonTips: [
      'Juli en augustus zijn warm, maar het pad loopt grotendeels door bos. Neem genoeg water mee: bronnen staan in de zomer vaak droog.',
      'Oktober geeft herfstkleuren in het Pfälzerwald. De dagen worden kort en pensions gaan dicht na de herfstvakantie.',
      'November tot en met maart: sneeuw en ijzel boven 500 meter, veel modder, veel gesloten adressen. Niet doen.',
      'In Frankrijk loopt het jachtseizoen van half september tot eind februari, vooral in het weekend. Draag dan een felle kleur.',
      'Teken zijn actief van maart tot oktober. Controleer dagelijks.',
    ],
    climate: { name: 'Idar-Oberstein', ll: [49.70, 7.30], ele: 400 },
    practical: [
      'Markering: Saar-Hunsrück-Steig met een blauw-groen logo, Pfälzer Waldpfad met een groen-wit embleem, GR 53 met een rode rechthoek van de Club Vosgien.',
      'Overnachten: pensions en kleine hotels in de dorpen. Reserveer in weekenden en in mei, juni en september een paar weken vooruit. In de Hunsrück liggen de adressen dun gezaaid.',
      'Hutten van de Pfälzerwald-Verein en de Club Vosgien zijn meestal alleen in het weekend open en serveren eenvoudig eten. Reken er niet op als slaapplek.',
      'Bevoorrading: neem lunch mee. Tussen de dorpen ligt urenlang alleen bos.',
    ],
    ov: 'Trier bereik je per trein via Keulen en Koblenz of via Luxemburg in 5 tot 6 uur. Goede tussenstations: Idar-Oberstein, Kaiserslautern, Wissembourg, Saverne en Schirmeck (lijn Straatsburg naar Saint-Dié).',
    variants: {
      s1a: {
        tag: 'Vier paden achter elkaar door de mooiste bossen van West-Duitsland en de Elzas.',
        text: [
          'Je verlaat Trier over de Saar-Hunsrück-Steig. Het pad volgt het Ruwerdal, klimt de Hochwald in en doorkruist het Nationalpark Hunsrück-Hochwald. Bij de Erbeskopf (816 m) sta je op het hoogste punt van Rijnland-Palts. Na de Wildenburg daal je af naar Idar-Oberstein met zijn Felsenkirche en edelsteenmijnen.',
          'Van Idar-Oberstein naar Kaiserslautern bestaat geen doorgaand kwaliteitspad. De app heeft hier een eigen verbinding berekend over lokale wandelpaden door het Pfälzer Bergland: drie rustige dagen door boerenland en heuvels. Controleer deze etappes vooraf op de kaart.',
          'In Kaiserslautern begint de Pfälzer Waldpfad. Die doorkruist het Pfälzerwald, het grootste aaneengesloten bos van Duitsland, en eindigt tussen de rode zandsteenrotsen van het Dahner Felsenland. Bij Schweigen steek je door de Deutsches Weintor de grens over naar Wissembourg.',
          'De GR 53 voert door de Noord-Vogezen langs een reeks burchtruïnes op zandsteenrotsen: Fleckenstein, Wasigenstein, Lichtenberg. Na La Petite-Pierre en Saverne volgen de rots van Dabo, de Schneeberg en de klim naar de Donon (1009 m) met zijn Gallo-Romeinse tempel. De sectie eindigt in Schirmeck.',
        ],
        plus: ['Vier sterk gewaardeerde paden op rij', 'Veel onverhard, veel schaduw', 'Goede treinverbindingen onderweg'],
        minus: ['Ruim 530 km, vier reizen', 'Verbinding door de Westpfalz is geen officieel pad', 'Weinig uitzicht: dagen achter elkaar bos'],
        highlights: ['Erbeskopf en Nationalpark Hunsrück-Hochwald', 'Felsenkirche in Idar-Oberstein', 'Dahner Felsenland en Burg Berwartstein', 'Château de Fleckenstein', 'La Petite-Pierre', 'Tempel op de Donon'],
        reviews: {
          points: [
            'Saar-Hunsrück-Steig: wandelaars roemen de afwisseling, het hoge aandeel smalle bospaden en de foutloze markering. Terugkerende kritiek: weinig overnachtingen op het pad zelf en veel kleine klimmetjes die optellen.',
            'Pfälzer Waldpfad: geliefd om de stilte en de zandsteenrotsen in het zuiden. De noordelijke etappes vanaf Kaiserslautern gelden als minder spectaculair. Hutten zijn doordeweeks vaak dicht.',
            'GR 53: de burchtenroute door de Noord-Vogezen krijgt hoge waardering voor de dagen tussen Obersteinbach en La Petite-Pierre. Markering van de Club Vosgien is betrouwbaar. Op zondag is in de dorpen weinig open.',
          ],
          sources: [
            { label: 'Saar-Hunsrück-Steig, officiële site met etappes en gastgevers', url: 'https://www.saar-hunsrueck-steig.de/' },
            { label: 'Pfälzer Waldpfad op pfalz.de', url: 'https://www.pfalz.de/de/pfaelzer-waldpfad' },
            { label: 'GR 53 op gr-infos.com (etappes en overnachtingen)', url: 'https://www.gr-infos.com/gr53.htm' },
            { label: 'Komoot: Saar-Hunsrück-Steig met tips van wandelaars', url: 'https://www.komoot.com/de-de/discover/Saar-Hunsr%C3%BCck-Steig/@49.7,7.0/tours?sport=hike' },
          ],
        },
      },
      s1b: {
        tag: 'De directe lijn: Saarschleife, Metz en het lege Lotharingse plateau.',
        text: [
          'Deze variant volgt de westtak van de Saar-Hunsrück-Steig naar de Saarschleife bij Mettlach en bereikt bij Perl de Moezel. In Schengen begint de GR 5 door Lotharingen.',
          'Het Franse deel loopt over het plateau langs de Moezel naar Metz, met kathedraal en Centre Pompidou. Daarna volgen Gorze, de Moezeloevers en de meren van het Parc naturel régional de Lorraine. Bij Abreschviller bereik je de Vogezen en klim je naar de Donon.',
          'Lotharingen is leeg. Tussen Metz en Abreschviller liggen de overnachtingen ver uit elkaar, waardoor enkele dagen langer zijn dan 9 uur. De etappelijst markeert die dagen. Een taxi of een extra korte dag lost dat op.',
        ],
        plus: ['90 km korter dan de aanbevolen variant', 'Saarschleife en Metz', 'De echte GR 5'],
        minus: ['Veel akkers en asfalt in Lotharingen', 'Te weinig overnachtingen: meerdere dagen boven 10 uur', 'Minder afwisseling'],
        highlights: ['Saarschleife bij Mettlach', 'Schengen en de Moezel', 'Kathedraal van Metz', 'Étang de Lindre'],
        reviews: {
          points: [
            'GR 5 door Lotharingen: doorlopers beschrijven dit als het stilste en minst spectaculaire deel van de GR 5. Positief: rust, Metz en de meren. Negatief: lange stukken landbouwweg en een gebrek aan slaapplaatsen en winkels.',
            'De westtak van de Saar-Hunsrück-Steig met de Saarschleife krijgt dezelfde hoge waardering als de rest van het pad.',
          ],
          sources: [
            { label: 'GR 5 op gr-infos.com (Lotharingen, etappes en overnachtingen)', url: 'https://www.gr-infos.com/gr5.htm' },
            { label: 'Saar-Hunsrück-Steig, officiële site', url: 'https://www.saar-hunsrueck-steig.de/' },
          ],
        },
      },
    },
  },

  s2: {
    tag: 'De Vogezenkam: hoogweiden, meren en ferme-auberges tussen 900 en 1400 meter.',
    months: [0, 0, 0, 1, 2, 3, 2, 2, 3, 2, 0, 0],
    season: 'De kam is sneeuwvrij van half mei tot half oktober. Juni en september zijn het best: stabiel weer, bloeiende hoogweiden of eerste herfstkleuren, en ruimte in de ferme-auberges.',
    seasonTips: [
      'April en begin mei: sneeuwresten op de noordhellingen boven 1100 meter, vooral rond de Hohneck. Veel ferme-auberges openen pas met Pasen of in mei.',
      'Juli en augustus: druk rond Col de la Schlucht en Grand Ballon. Onweer in de middag komt vaak voor. Start vroeg en blijf bij onweer van de kam af.',
      'Vanaf half oktober sluiten ferme-auberges en hotels op de kam. Controleer de openingsdata voor je boekt.',
      'November tot en met maart is de kam skigebied. Het pad is dan niet begaanbaar zonder sneeuwschoenen.',
    ],
    climate: { name: 'Col de la Schlucht', ll: [48.06, 7.02], ele: 1139 },
    practical: [
      'Markering: rode rechthoek van de Club Vosgien, onderweg vaak zonder GR-nummer. Volg je horloge op splitsingen.',
      'Overnachten: ferme-auberges op de kam bieden eenvoudige kamers of slaapzalen met een repas marcaire. Reserveer telefonisch, veel adressen staan niet op boekingssites.',
      'Hutten van skiclubs en de Club Vosgien zijn vaak alleen op afspraak open. Bel vooraf.',
      'Water: op de kam staan weinig bronnen. Vul bij elke ferme-auberge.',
    ],
    ov: 'Schirmeck ligt aan de lijn Straatsburg naar Saint-Dié. Belfort heeft een TGV-station (Belfort-Montbéliard) en directe treinen naar Mulhouse en Straatsburg. Tussenin: Barr, Sélestat (bij Châtenois), Thann en Munster via bus vanaf de kam.',
    variants: {
      s2a: {
        tag: 'Over de volle lengte van de Vogezen, van de Donon naar de Leeuw van Belfort.',
        text: [
          'Vanuit Schirmeck klim je naar de Champ du Feu en loop je langs het klooster op de Mont Sainte-Odile naar het wijnstadje Barr. Het pad blijft op de oostflank boven de Elzasser wijndorpen en passeert het kasteel Haut-Koenigsbourg en de drie burchten van Ribeauvillé.',
          'Na Aubure en de Col du Bonhomme begint de kam. Twee dagen loop je over open hoogweiden langs de Lac Blanc, de Gazon du Faing en de Col de la Schlucht naar de Hohneck (1363 m). Bij helder weer zie je de Alpen.',
          'De route vervolgt over de Route des Crêtes naar de Markstein en de Grand Ballon (1424 m), het dak van de Vogezen. Na de afdaling naar Thann volgt de laatste top, de Ballon d\'Alsace. Via Giromagny bereik je Belfort met zijn citadel en de Leeuw van Bartholdi.',
        ],
        plus: ['Het mooiste middelgebergtepad van de hele tocht', 'Dagen achter elkaar uitzicht', 'Eten en slapen in ferme-auberges'],
        minus: ['Stevige hoogteverschillen: gemiddeld 600 meter klimmen per dag', 'Kam is weergevoelig', 'In het hoogseizoen druk rond de passen'],
        highlights: ['Mont Sainte-Odile', 'Haut-Koenigsbourg', 'Lac Blanc en Gazon du Faing', 'Hohneck', 'Grand Ballon', 'Ballon d\'Alsace', 'Citadel van Belfort'],
        reviews: {
          points: [
            'De Vogezentraverse geldt onder GR 5-lopers als een hoogtepunt van het traject tussen Noordzee en Alpen. De dagen tussen Col du Bonhomme en Grand Ballon scoren het hoogst.',
            'Ferme-auberges krijgen lof voor sfeer en eten. Kritiek: beperkt comfort, vaak contant betalen en telefonisch reserveren in het Frans.',
            'De eerste dagen langs de wijndorpen vinden sommige lopers te veel bos en te weinig kam. De afdalingen naar Thann en Giromagny zijn lang en belasten de knieën.',
          ],
          sources: [
            { label: 'GR 5 Vogezen op gr-infos.com (etappes en overnachtingen)', url: 'https://www.gr-infos.com/gr5.htm' },
            { label: 'Club Vosgien, beheerder van de paden en hutten', url: 'https://www.club-vosgien.eu/' },
            { label: 'Massif des Vosges, wandelinformatie en ferme-auberges', url: 'https://www.massif-des-vosges.fr/' },
            { label: 'MonGR van de FFRandonnée: GR 5', url: 'https://www.mongr.fr/' },
          ],
        },
      },
    },
  },

  s3: {
    tag: 'Kalkplateaus, de kloof van de Doubs en de hoge Jura met zicht op de Mont Blanc.',
    months: [0, 0, 0, 1, 2, 3, 3, 2, 3, 2, 0, 0],
    season: 'Half mei tot half oktober. De hoge Jura boven 1000 meter houdt sneeuw tot eind april. Juni, juli en september zijn ideaal: het is hier in de zomer koeler dan in de dalen.',
    seasonTips: [
      'Mei: de Doubskloof is op zijn mooist met hoog water bij de Saut du Doubs. Paden in de kloof zijn dan glad.',
      'Juli en augustus: warm in de kloof, aangenaam op de plateaus. Nachten koelen sterk af, ook in de zomer.',
      'Mouthe geldt als het koudste dorp van Frankrijk. Nachtvorst komt voor tot in mei en vanaf eind september.',
      'Vanaf november ligt er sneeuw en zijn de paden langlaufloipes.',
    ],
    climate: { name: 'Mouthe', ll: [46.71, 6.19], ele: 940 },
    practical: [
      'Markering: wit-rood van de GR 5. Op de hoge Jura valt het pad samen met de Grande Traversée du Jura.',
      'Overnachten: gîtes d\'étape, auberges en kleine hotels. Tussen Saint-Hippolyte en Villers-le-Lac is het aanbod klein. Boek die nachten als eerste.',
      'De route loopt enkele keren over Zwitsers grondgebied en eindigt in Nyon. Neem je identiteitsbewijs mee en reken op Zwitserse prijzen.',
      'Winkels: in de Doubskloof ligt dagenlang geen supermarkt. Bevoorraad in Saint-Hippolyte en Villers-le-Lac.',
    ],
    ov: 'Belfort heeft TGV-verbindingen. Nyon ligt aan de hoofdlijn Genève naar Lausanne. Tussenin: Morteau en Pontarlier (trein), Métabief en Les Rousses (bus), La Cure (trein naar Nyon).',
    variants: {
      s3a: {
        tag: 'De GR 5 door de Franse Jura, van de Bourgondische Poort naar het Meer van Genève.',
        text: [
          'Na Belfort steek je de Bourgondische Poort over en bereik je bij Saint-Hippolyte de Doubs. Drie dagen volg je de rivier door een diepe, beboste kloof op de grens met Zwitserland, langs Goumois en de Échelles de la Mort naar de waterval Saut du Doubs bij Villers-le-Lac.',
          'Daarna klim je naar de plateaus van de Haut-Doubs. Je passeert het Château de Joux en beklimt de Mont d\'Or (1463 m) met zijn steile kalkwand en het eerste grote Alpenpanorama.',
          'Via Mouthe, bron van de Doubs, en de bossen van de Risoux bereik je Chapelle-des-Bois, Morez en Les Rousses. Bij La Cure ga je Zwitserland in. De laatste dag daal je met uitzicht op het meer en de Mont Blanc af naar Nyon.',
        ],
        plus: ['Rustig en dunbevolkt', 'Koel in de zomer', 'Spectaculaire aankomst boven het Meer van Genève'],
        minus: ['Beperkt aanbod van overnachtingen in de Doubskloof', 'Lange transfers naar de startpunten', 'Veel bos op de plateaus'],
        highlights: ['Doubskloof bij Goumois', 'Saut du Doubs', 'Château de Joux', 'Mont d\'Or', 'Chapelle-des-Bois', 'Afdaling naar Nyon'],
        reviews: {
          points: [
            'De Doubskloof en de Mont d\'Or worden het vaakst genoemd als hoogtepunt. Lopers waarderen de rust: je komt weinig anderen tegen.',
            'Kritiekpunten: lange bosetappes zonder uitzicht op de plateaus en gîtes die buiten het seizoen dicht zijn. Vooraf bellen is nodig.',
            'Het eten in de Haut-Doubs (comté, morteau, mont d\'or) krijgt consequent lof.',
          ],
          sources: [
            { label: 'GR 5 Jura op gr-infos.com (etappes en overnachtingen)', url: 'https://www.gr-infos.com/gr5.htm' },
            { label: 'Grandes Traversées du Jura, officiële site', url: 'https://www.gtj.asso.fr/' },
            { label: 'Montagnes du Jura, wandelinformatie', url: 'https://www.montagnes-du-jura.fr/' },
          ],
        },
      },
    },
  },

  s4: {
    tag: 'Langs het Meer van Genève en over de hoofdkam van de Alpen naar Italië.',
    months: [0, 0, 0, 0, 0, 1, 3, 3, 2, 0, 0, 0],
    season: 'De Alpenpassen op deze route liggen tussen 2470 en 2540 meter. Ze zijn begaanbaar van begin juli tot half september. Het deel langs het meer kan van april tot en met oktober.',
    seasonTips: [
      'Tot eind juni liggen er sneeuwvelden op de passen. Zonder ervaring en uitrusting is oversteken dan gevaarlijk.',
      'Hutten openen rond half juni en sluiten tussen half en eind september. Het hospitium op de Grote Sint-Bernhard is het hele jaar open, maar het wandelpad is alleen in de zomer sneeuwvrij.',
      'Juli en augustus: stabielst, maar hutten zitten vol. Reserveer de hutten rond de Mont Blanc zodra de boekingen opengaan, vaak al in het najaar ervoor.',
      'Begin september is de beste keuze: minder drukte, helder zicht, hutten nog open. Vanaf half september valt de eerste sneeuw.',
      'Middagonweer is in de Alpen normaal. Sta voor 12 uur op de pas.',
      'Splits deze sectie: loop het meer in het voorjaar of najaar en de Alpen in de zomer.',
    ],
    climate: { name: 'Col du Grand-Saint-Bernard', ll: [45.869, 7.171], ele: 2470 },
    climate2: { name: 'Lausanne', ll: [46.52, 6.63], ele: 450 },
    practical: [
      'Het meer: de ViaJacobi en de Via Francigena (Zwitserse route 70) zijn geel gemarkeerd. Tussen Lausanne en Vevey loop je door de wijnterrassen van de Lavaux.',
      'Zwitserland is duur. Reken op 120 tot 180 euro per nacht voor een hotel. Pelgrimsherbergen en de abdij van Saint-Maurice zijn goedkoper.',
      'Hutten: halfpension is de norm. Neem een lakenzak, contant geld en oordoppen mee. Lid van NKBV of een andere Alpenvereniging krijgt korting in veel hutten.',
      'Vanaf Lausanne is een pelgrimspaspoort (credenziale) zinvol. Het geeft toegang tot pelgrimsonderkomens tot in Rome.',
      'Van Courmayeur naar Aosta volgt de app een eigen verbinding door het dal langs wijngaarden en kastelen. Een bus rijdt hetzelfde traject in een uur.',
    ],
    ov: 'Nyon, Lausanne, Vevey, Aigle, Saint-Maurice en Martigny liggen aan de spoorlijn langs het meer en door het Rhônedal. Orsières heeft een treinstation. Aosta bereik je per trein via Turijn of per bus vanuit Martigny door de tunnel. Courmayeur heeft busverbindingen naar Aosta en Chamonix.',
    variants: {
      s4a: {
        tag: 'De historische pelgrimsroute: één hoge pas, vier dagen berg.',
        months: [0, 0, 0, 0, 0, 1, 3, 3, 3, 1, 0, 0],
        text: [
          'Na de dagen langs het meer en door het Rhônedal volg je vanaf Martigny de Via Francigena het dal van de Dranse in. Via Sembrancher, Orsières en Bourg-Saint-Pierre klim je in drie dagen naar de Col du Grand-Saint-Bernard (2473 m).',
          'Op de pas slaap je in het hospitium dat hier sinds de elfde eeuw reizigers opvangt. De afdaling naar Italië loopt over oude muilezelpaden langs Saint-Rhémy en Étroubles naar de Romeinse stad Aosta.',
          'Dit is de lichtste oversteek: één pas, goede paden, elke dag een dorp. Je mist het hooggebergte van dichtbij.',
        ],
        plus: ['Kortste en lichtste oversteek', 'Historische route met hospitium', 'Langste seizoen: half juni tot begin oktober'],
        minus: ['Weinig hooggebergte', 'Het pad loopt delen langs de pasweg', 'Geen hutten, wel het hospitium'],
        highlights: ['Wijnterrassen van de Lavaux', 'Château de Chillon', 'Abdij van Saint-Maurice', 'Hospitium op de Grote Sint-Bernhard', 'Aosta'],
        reviews: {
          points: [
            'De nacht in het hospitium op de pas is voor de meeste pelgrims het hoogtepunt van de hele Via Francigena. Reserveren is nodig.',
            'De Lavaux tussen Lausanne en Vevey krijgt de hoogste waardering van het Zwitserse deel. Het Rhônedal tussen Villeneuve en Martigny vinden veel lopers vlak en druk.',
            'De klim vanaf Bourg-Saint-Pierre is zwaar maar technisch eenvoudig. Bij mist of verse sneeuw raden lopers aan de weg te volgen.',
          ],
          sources: [
            { label: 'Via Francigena in Zwitserland, route 70 op SchweizMobil', url: 'https://schweizmobil.ch/en/hiking-in-switzerland/route-70' },
            { label: 'Vie Francigene, officiële site met etappes en onderkomens', url: 'https://www.viefrancigene.org/en/' },
            { label: 'Gronze: Via Francigena met beoordelingen van onderkomens', url: 'https://www.gronze.com/via-francigena' },
            { label: 'Hospitium Grand-Saint-Bernard, reserveren', url: 'https://www.gsbernard.com/' },
          ],
        },
      },
      s4b: {
        tag: 'De grote Alpenvariant: twee weken hooggebergte met hutten rond de Mont Blanc.',
        months: [0, 0, 0, 0, 0, 0, 3, 3, 2, 0, 0, 0],
        text: [
          'Bij Villeneuve verlaat je de Via Francigena en loop je door de Rhônedelta naar Saint-Gingolph. Daar begint de alpiene GR 5. In vijf dagen doorkruis je de Chablais langs de Dents d\'Oche, La Chapelle-d\'Abondance en Samoëns.',
          'De klim naar de Col d\'Anterne en de Brévent levert het beroemdste panorama van de GR 5 op: de volle noordkant van de Mont Blanc. Je daalt af naar Les Houches en volgt daar de Tour du Mont Blanc.',
          'Via Les Contamines, de Col du Bonhomme en de Col de la Seigne (2516 m) loop je Italië binnen. Het Val Veny brengt je onder de gletsjers door naar Courmayeur. De laatste dagen dalen af door het Aostadal.',
        ],
        plus: ['Hooggebergte van wereldklasse', 'Overnachten in berghutten', 'Mont Blanc van drie kanten'],
        minus: ['Zwaar: dagelijks 1000 meter of meer klimmen', 'Hutten rond de Mont Blanc maanden vooruit vol', 'Seizoen van tien weken', 'Negen dagen langer dan de pelgrimsroute'],
        highlights: ['Lac d\'Anterne en Col d\'Anterne', 'Brévent tegenover de Mont Blanc', 'Col de la Croix du Bonhomme', 'Col de la Seigne', 'Val Veny en Lac Combal'],
        reviews: {
          points: [
            'De etappes Anterne en Brévent gelden als de mooiste van de hele GR 5. De Tour du Mont Blanc staat op vrijwel elke lijst van beste trektochten ter wereld.',
            'Grootste klacht: drukte en volle hutten in juli en augustus. Zonder reservering is er geen plek. Lopers raden begin september aan.',
            'De Chablais is rustig en steil. De klimmen vanaf het meer worden vaak onderschat.',
          ],
          sources: [
            { label: 'Autour du Mont-Blanc, officiële site van de Tour du Mont Blanc', url: 'https://www.autourdumontblanc.com/en/' },
            { label: 'Mon Tour du Mont-Blanc, hutten reserveren', url: 'https://www.montourdumontblanc.com/' },
            { label: 'Refuges.info, hutten met ervaringen van bezoekers', url: 'https://www.refuges.info/' },
            { label: 'GR 5 Alpen op gr-infos.com', url: 'https://www.gr-infos.com/gr5.htm' },
            { label: 'FFCAM, hutten van de Franse Alpenclub', url: 'https://www.ffcam.fr/refuges.html' },
          ],
        },
      },
      s4c: {
        tag: 'Pelgrimsroute tot Orsières, daarna drie dagen hooggebergte langs de Mont Blanc.',
        months: [0, 0, 0, 0, 0, 0, 3, 3, 2, 0, 0, 0],
        text: [
          'Je volgt de Via Francigena langs het meer en door het Rhônedal tot Orsières. Daar buig je af het Zwitserse Val Ferret in en sluit je aan op de Tour du Mont Blanc.',
          'Vanaf La Fouly klim je naar de Grand Col Ferret (2537 m), de grens met Italië. Aan de overkant ligt het Italiaanse Val Ferret onder de wanden van de Grandes Jorasses. Het balkonpad langs Rifugio Bonatti naar Courmayeur is een van de mooiste dagen van de hele tocht.',
          'Van Courmayeur daal je in drie korte dagen door het dal af naar Aosta, waar je de Via Francigena weer oppakt.',
        ],
        plus: ['Hooggebergte in drie dagen', 'Hutten Elena en Bonatti aan de route', 'Slechts twee dagen langer dan de pelgrimsroute'],
        minus: ['Je mist het hospitium op de Grote Sint-Bernhard', 'Hutten vroeg reserveren', 'Seizoen van tien weken'],
        highlights: ['Wijnterrassen van de Lavaux', 'Abdij van Saint-Maurice', 'Grand Col Ferret', 'Rifugio Bonatti en de Grandes Jorasses', 'Courmayeur'],
        reviews: {
          points: [
            'Het Italiaanse Val Ferret met Rifugio Bonatti wordt door lopers van de Tour du Mont Blanc het vaakst genoemd als mooiste dag.',
            'De Grand Col Ferret is een lange maar gelijkmatige klim zonder technische passages. Bij slecht zicht is de route goed gemarkeerd.',
            'Rifugio Bonatti zit het hele seizoen vol. Boeken lukt alleen ver vooruit.',
          ],
          sources: [
            { label: 'Autour du Mont-Blanc, officiële site van de Tour du Mont Blanc', url: 'https://www.autourdumontblanc.com/en/' },
            { label: 'Mon Tour du Mont-Blanc, hutten reserveren', url: 'https://www.montourdumontblanc.com/' },
            { label: 'Via Francigena in Zwitserland, route 70 op SchweizMobil', url: 'https://schweizmobil.ch/en/hiking-in-switzerland/route-70' },
            { label: 'Rifugio Bonatti', url: 'https://www.rifugiobonatti.it/' },
            { label: 'Refuges.info, hutten met ervaringen van bezoekers', url: 'https://www.refuges.info/' },
          ],
        },
      },
    },
  },

  s5: {
    tag: 'Romeinse wegen, kastelen en wijnterrassen in het dal van de Dora Baltea.',
    months: [1, 1, 2, 3, 3, 2, 1, 1, 3, 3, 2, 1],
    season: 'April tot half juni en september tot eind oktober. De route blijft laag en is bijna het hele jaar begaanbaar.',
    seasonTips: [
      'Juli en augustus: de dalbodem wordt 30 graden of warmer. Start vroeg.',
      'Oktober: druivenoogst en herfstkleuren op de terrassen, een aanrader.',
      'Winter: begaanbaar, maar het dal ligt lang in de schaduw en een deel van de onderkomens is dicht.',
    ],
    climate: { name: 'Aosta', ll: [45.737, 7.32], ele: 580 },
    practical: [
      'Markering: geel-witte pelgrimsborden en het nummer 103 op gele paaltjes.',
      'Het pad kiest steeds de zonnige noordzijde van het dal en klimt vaker dan je verwacht van een dalroute.',
      'Onderkomens: hotels, B&B\'s en pelgrimsherbergen. Met een credenziale slaap je voor 15 tot 30 euro in parochies en ostelli.',
    ],
    ov: 'De spoorlijn Aosta naar Ivrea en Turijn loopt parallel aan de route. Vrijwel elke etappeplaats heeft een station.',
    variants: {
      s5a: {
        tag: 'Van Aosta naar Ivrea over de Via Francigena.',
        text: [
          'Je verlaat Aosta door de Arco d\'Augusto en volgt de noordflank van het dal langs kastelen en wijngaarden. Het kasteel van Fénis, Châtillon en Saint-Vincent liggen aan de route.',
          'Voorbij Verrès versmalt het dal. Je loopt onder het fort van Bard door en bij Donnas over een stuk Romeinse weg met karrensporen in de rots. De Romeinse brug van Pont-Saint-Martin markeert het einde van het Aostadal.',
          'Tussen de wijnpergola\'s van Carema loop je Piemonte binnen. De sectie eindigt in Ivrea, werelderfgoed als industriestad van Olivetti.',
        ],
        plus: ['Veel cultuur op korte afstand', 'Elke dag treinstations', 'Lang seizoen'],
        minus: ['Snelweg en spoor zijn nooit ver weg', 'Heet in de zomer'],
        highlights: ['Romeins Aosta', 'Kasteel van Fénis', 'Fort van Bard', 'Romeinse weg bij Donnas', 'Brug van Pont-Saint-Martin'],
        reviews: {
          points: [
            'Pelgrims waarderen de dichtheid aan bezienswaardigheden en de goede markering. Het stuk Romeinse weg bij Donnas wordt het vaakst genoemd.',
            'Kritiek: het pad klimt en daalt veel om het asfalt te vermijden, en het verkeer in het dal blijft hoorbaar.',
          ],
          sources: [
            { label: 'Vie Francigene, etappes in Valle d\'Aosta', url: 'https://www.viefrancigene.org/en/' },
            { label: 'Gronze: Via Francigena met beoordelingen van onderkomens', url: 'https://www.gronze.com/via-francigena' },
            { label: 'Lovevda, toerisme Aostadal', url: 'https://www.lovevda.it/en' },
          ],
        },
      },
    },
  },

  s6: {
    tag: 'Rijstvelden, kanalen en baksteensteden. Vlak, open en eerlijk gezegd eentonig.',
    months: [1, 1, 2, 3, 3, 1, 0, 0, 2, 3, 2, 1],
    season: 'April, mei en oktober. De Po-vlakte heeft geen schaduw en is in de zomer te heet.',
    seasonTips: [
      'April en mei: de rijstvelden staan onder water en spiegelen de Alpen. Dit is het moment om hier te lopen.',
      'Half juni tot eind augustus: 32 tot 38 graden, geen schaduw, muggen in de rijstvelden. Afraden.',
      'September: nog warm en veel muggen tot de oogst. Oktober is beter.',
      'November tot februari: dichte mist, kou en korte dagen. Het kan, maar je ziet weinig.',
      'Neem van mei tot oktober muggenmiddel mee.',
    ],
    climate: { name: 'Pavia', ll: [45.185, 9.16], ele: 77 },
    practical: [
      'De Po steek je over met de pelgrimsboot Transitum Padi tussen Corte Sant\'Andrea en Soprarivo. De schipper vaart op afspraak: bel een tot twee dagen vooraf. Het nummer staat op de site van de Via Francigena. Zonder boot loop je om via de brug bij Piacenza.',
      'Dagen zijn lang in kilometers, kort in hoogtemeters. Het tempo ligt hoger dan in de bergen, de belasting op voeten ook.',
      'Water en schaduw zijn schaars tussen de dorpen. Neem twee liter mee.',
      'Wie tijd wil winnen, slaat hier per trein een deel over. Vercelli, Pavia, Piacenza en Fidenza liggen aan doorgaande spoorlijnen.',
    ],
    ov: 'Ivrea, Santhià, Vercelli, Pavia, Piacenza en Fidenza hebben treinstations. Milaan is vanaf Pavia en Piacenza binnen een uur bereikbaar.',
    variants: {
      s6a: {
        tag: 'Van Ivrea naar Fidenza over de Via Francigena.',
        text: [
          'Na Ivrea loop je over de morenenheuvels langs het Lago di Viverone naar Santhià. Daar begint de vlakte. Tot Pavia volg je dijken en kanalen door de rijstvelden van Vercelli en de Lomellina.',
          'Vercelli heeft de basiliek van Sant\'Andrea, Pavia de overdekte brug over de Ticino en een van de oudste universiteiten van Europa. Daarna steek je bij Corte Sant\'Andrea de Po over, op de plek waar aartsbisschop Sigeric dat in 990 deed.',
          'Via Piacenza en de abdij van Chiaravalle della Colomba bereik je Fidenza. Op de gevel van de dom wijst een stenen apostel de weg naar Rome.',
        ],
        plus: ['Snel kilometers maken', 'Mooie steden: Vercelli, Pavia, Piacenza', 'In het voorjaar unieke rijstveldlandschappen'],
        minus: ['Minst mooie deel van de tocht', 'Lange rechte stukken, deels asfalt', 'Onleefbaar in de zomer'],
        highlights: ['Lago di Viverone', 'Sant\'Andrea in Vercelli', 'Rijstvelden van de Lomellina', 'Pavia', 'Oversteek van de Po', 'Dom van Fidenza'],
        reviews: {
          points: [
            'De meningen zijn verdeeld. Een deel van de pelgrims slaat de vlakte over. Wie hem loopt in april of mei, noemt de stilte en de ondergelopen rijstvelden een onverwacht hoogtepunt.',
            'De bootoversteek van de Po is voor velen de meest memorabele ervaring van Noord-Italië.',
            'Terugkerende klachten: muggen, hitte, asfalt en weinig voorzieningen tussen de dorpen.',
          ],
          sources: [
            { label: 'Vie Francigene, etappes Piemonte en Lombardije', url: 'https://www.viefrancigene.org/en/' },
            { label: 'Gronze: Via Francigena met beoordelingen van onderkomens', url: 'https://www.gronze.com/via-francigena' },
            { label: 'Vereniging Pelgrimswegen naar Rome', url: 'https://www.pelgrimswegen.nl/' },
          ],
        },
      },
    },
  },

  s7: {
    tag: 'Over de Apennijnen bij de Cisapas, door de Lunigiana naar de kust en Lucca.',
    months: [0, 1, 2, 3, 3, 2, 1, 1, 3, 3, 1, 0],
    season: 'April tot half juni en september tot eind oktober. Op de Cisapas (1041 m) kan van december tot maart sneeuw liggen.',
    seasonTips: [
      'Mei: de Apennijnen zijn groen en koel. Regenbuien komen vaak voor, neem regenkleding mee.',
      'Juli en augustus: aangenaam op de pas, heet in de Lunigiana en aan de kust.',
      'Oktober en november: de natste maanden aan de Tyrreense kant. Paden in de Lunigiana worden modderig en beken zwellen op.',
      'Winter: mist en sneeuw rond de Cisa. De afdaling naar Pontremoli is dan glad.',
    ],
    climate: { name: 'Pontremoli', ll: [44.375, 9.88], ele: 240 },
    practical: [
      'De klim van Fornovo naar Cassio en Berceto is de zwaarste van de Italiaanse Via Francigena.',
      'De afdaling van de Cisapas naar Pontremoli is lang: ruim 1300 meter dalen. Stokken helpen.',
      'Tussen Aulla en Sarzana loopt het pad over een heuvelrug met het eerste zicht op zee.',
      'Onderkomens: ostelli in Cassio, Berceto, op de Cisapas en in Pontremoli. Aan de kust volop hotels.',
    ],
    ov: 'Fidenza ligt aan de lijn Milaan naar Bologna. De lijn Parma naar La Spezia volgt de route: stations in Fornovo, Berceto, Pontremoli en Aulla. Sarzana, Massa, Pietrasanta en Lucca hebben treinstations.',
    variants: {
      s7a: {
        tag: 'Van Fidenza naar Lucca over de Via Francigena.',
        text: [
          'Vanuit Fidenza loop je door de heuvels van Parma naar Fornovo aan de Taro. Daarna klimt de route naar de bergdorpen Cassio en Berceto en bereikt de Passo della Cisa, de grens tussen Emilia en Toscane.',
          'De afdaling door kastanjebossen eindigt in Pontremoli, hoofdstad van de Lunigiana. Het dal van de Magra voert je langs middeleeuwse dorpen en burchten naar Aulla. Na een laatste heuvelrug zie je bij Sarzana de zee.',
          'De route volgt de voet van de Apuaanse Alpen, het marmergebergte van Carrara, langs Massa en de kunstenaarsstad Pietrasanta. Via Camaiore bereik je het ommuurde Lucca.',
        ],
        plus: ['Afwisselend: bergen, dalen en kust', 'Rustige paden in de Lunigiana', 'Lucca als beloning'],
        minus: ['Zware klim en lange afdaling rond de Cisa', 'Aan de kust veel bebouwing en asfalt', 'Nat in het najaar'],
        highlights: ['Pieve van Bardone', 'Passo della Cisa', 'Pontremoli en de stele-beelden', 'Sarzana', 'Pietrasanta', 'Stadsmuren van Lucca'],
        reviews: {
          points: [
            'De oversteek van de Apennijnen en de Lunigiana gelden onder pelgrims als een van de mooiste stukken ten noorden van Lucca.',
            'Het kusttraject tussen Sarzana en Pietrasanta valt velen tegen door verstedelijking. De heuvelvariant boven Massa maakt veel goed.',
            'De ostelli in Cassio en op de Cisapas krijgen lof om de gastvrijheid.',
          ],
          sources: [
            { label: 'Vie Francigene, etappes Emilia-Romagna en Toscane', url: 'https://www.viefrancigene.org/en/' },
            { label: 'Gronze: Via Francigena met beoordelingen van onderkomens', url: 'https://www.gronze.com/via-francigena' },
            { label: 'Visit Tuscany, officiële toeristische site', url: 'https://www.visittuscany.com/en/' },
          ],
        },
      },
    },
  },

  s8: {
    tag: 'Het hart van de tocht: San Gimignano, Siena en de Val d\'Orcia.',
    months: [1, 1, 2, 3, 3, 2, 0, 0, 3, 3, 2, 1],
    season: 'April tot half juni en half september tot eind oktober. In het voorjaar is het landschap groen, in het najaar goudbruin.',
    seasonTips: [
      'Mei: klaprozen, groen graan, lange dagen. De drukste pelgrimsmaand: boek op tijd.',
      'Juli en augustus: 33 tot 38 graden op de witte grindwegen zonder schaduw. Afraden. Wie toch gaat, loopt van 6 tot 12 uur.',
      'September en oktober: druiven- en olijvenoogst, zacht licht. Na regen plakt de klei van de Crete Senesi aan je schoenen.',
      'Winter: zacht en stil, maar korte dagen en een deel van de agriturismi is dicht.',
      'Tussen San Quirico en Radicofani ligt 30 kilometer zonder dorp. Neem water en eten mee.',
    ],
    climate: { name: 'Siena', ll: [43.32, 11.33], ele: 320 },
    practical: [
      'Dit is het drukste deel van de Via Francigena. In april, mei, september en oktober zijn pelgrimsherbergen vaak vol. Reserveer drie tot zes weken vooruit.',
      'Veel kilometers over strade bianche: witte grindwegen, mooi maar hard en stoffig.',
      'San Gimignano en Siena verdienen extra tijd. De etappe na San Gimignano is bewust kort gehouden.',
      'De klim naar Radicofani (800 m) is de zwaarste van Toscane. Start vroeg.',
    ],
    ov: 'Lucca, Altopascio, San Miniato en Siena hebben treinstations. Ten zuiden van Siena rijden bussen: Buonconvento heeft een station, San Quirico en Radicofani alleen bus. Vanuit Acquapendente rijdt een bus naar station Orvieto.',
    variants: {
      s8a: {
        tag: 'Van Lucca naar Acquapendente over de Via Francigena.',
        text: [
          'Na Lucca steek je de vlakte van de Arno over naar San Miniato. Daar beginnen de heuvels van de Val d\'Elsa. Over kammen met cipressen en wijngaarden loop je naar de torens van San Gimignano.',
          'Via Colle di Val d\'Elsa en de ringmuur van Monteriggioni bereik je Siena. Je komt de stad binnen door de Porta Camollia en eindigt op de Piazza del Campo.',
          'Ten zuiden van Siena opent het landschap zich: de kale kleiheuvels van de Crete Senesi en daarna de Val d\'Orcia, werelderfgoed. Je passeert Buonconvento, San Quirico en de thermen van Bagno Vignoni. De burcht van Radicofani is twee dagen lang het baken aan de horizon. Daarachter daal je af naar Lazio.',
        ],
        plus: ['Landschappelijk en cultureel de top van de route', 'Uitstekende voorzieningen voor wandelaars', 'Goed eten, elke dag'],
        minus: ['Druk in voorjaar en najaar', 'Weinig schaduw', 'Prijzen in San Gimignano en Siena liggen hoog'],
        highlights: ['San Miniato', 'San Gimignano', 'Monteriggioni', 'Siena', 'Crete Senesi', 'Bagno Vignoni', 'Radicofani'],
        reviews: {
          points: [
            'Vrijwel elke pelgrim noemt Toscane het mooiste deel van de Via Francigena. De dagen San Gimignano naar Monteriggioni en San Quirico naar Radicofani scoren het hoogst.',
            'De voorzieningen krijgen lof: goede markering, waterpunten, ostelli met keuken.',
            'Kritiek: drukte en volle herbergen in mei en september, hitte, en de lange etappe naar Radicofani.',
          ],
          sources: [
            { label: 'Visit Tuscany, officiële toeristische site', url: 'https://www.visittuscany.com/en/' },
            { label: 'Vie Francigene, officiële site', url: 'https://www.viefrancigene.org/en/' },
            { label: 'Gronze: Via Francigena met beoordelingen van onderkomens', url: 'https://www.gronze.com/via-francigena' },
            { label: 'Vereniging Pelgrimswegen naar Rome', url: 'https://www.pelgrimswegen.nl/' },
          ],
        },
      },
    },
  },

  s9: {
    tag: 'De laatste honderdzeventig kilometer: vulkaanmeren, Etruskische holle wegen en de koepel van Sint-Pieter.',
    months: [1, 2, 3, 3, 3, 1, 0, 0, 2, 3, 3, 1],
    season: 'Maart tot en met mei en oktober tot half november. Lazio is warmer dan Toscane: het voorjaar begint vroeg en de zomer duurt lang.',
    seasonTips: [
      'Maart en april: zacht, groen en rustig. Rond Pasen is Rome vol en duur.',
      'Juni tot half september: 30 tot 37 graden. Afraden, zeker op de open stukken rond Sutri en Campagnano.',
      'Oktober en november: aangenaam, wel kans op zware regenbuien.',
      'Plan je aankomst in Rome niet op woensdagochtend (pauselijke audiëntie) of op een kerkelijke feestdag als je snel de Sint-Pieter in wilt.',
    ],
    climate: { name: 'Viterbo', ll: [42.42, 12.10], ele: 330 },
    practical: [
      'Voor het Testimonium, het certificaat in Rome, moet je de laatste 100 kilometer te voet afleggen en dagelijks twee stempels verzamelen in je credenziale. Je haalt het op in de Sint-Pieter.',
      'De laatste etappe loopt door het park van Veio en over de Monte Mario. Vanaf dat punt zie je voor het eerst de koepel. De ingang naar Rome langs de Via Trionfale is druk: volg het voetpad door het reservaat.',
      'Bij Viterbo liggen gratis warmwaterbronnen aan de route (Bagnaccio).',
      'Boek je verblijf in Rome ruim vooraf en plan een rustdag.',
    ],
    ov: 'Vanuit Rome vlieg je in 2,5 uur naar Nederland of reis je per trein via Milaan en Zwitserland in ongeveer 20 uur. Viterbo en La Storta liggen aan de regionale lijn naar Rome. Acquapendente bereik je per bus vanaf station Orvieto.',
    variants: {
      s9a: {
        tag: 'Van Acquapendente naar het Sint-Pietersplein.',
        text: [
          'Je daalt af naar het Meer van Bolsena, een kratermeer met zwarte stranden, en loopt langs de oever naar Montefiascone. Daar staat de steen die 100 kilometer tot Rome aangeeft.',
          'Over een stuk originele Romeinse Via Cassia bereik je Viterbo, de stad van de pausen. Via de Etruskische holle wegen bij Vetralla en het amfitheater van Sutri loop je door hazelnootboomgaarden naar Campagnano.',
          'De laatste twee dagen voeren door het natuurpark van Veio naar La Storta en over de Monte Mario. Vanaf de Mons Gaudii, de berg van de vreugde, daal je af naar het Sint-Pietersplein.',
        ],
        plus: ['Sterke finale', 'Bolsena en Viterbo', 'Etruskisch en Romeins erfgoed langs het pad'],
        minus: ['De laatste 15 kilometer door de buitenwijken van Rome', 'Lange etappes rond Sutri', 'Heet van juni tot september'],
        highlights: ['Meer van Bolsena', 'Montefiascone', 'Pauselijk paleis in Viterbo', 'Amfitheater van Sutri', 'Monte Mario', 'Sint-Pietersplein'],
        reviews: {
          points: [
            'Het Meer van Bolsena en de Romeinse weg voor Montefiascone worden het vaakst als hoogtepunt genoemd. Sutri verrast veel lopers.',
            'De aankomst via de Monte Mario krijgt lof. De kilometers langs de Via Cassia bij La Storta vinden veel pelgrims onaangenaam door het verkeer.',
            'Praktische tip die steeds terugkomt: kom vroeg op de dag aan in Rome en haal het Testimonium dezelfde dag.',
          ],
          sources: [
            { label: 'Vie Francigene, etappes in Lazio en het Testimonium', url: 'https://www.viefrancigene.org/en/' },
            { label: 'Gronze: Via Francigena met beoordelingen van onderkomens', url: 'https://www.gronze.com/via-francigena' },
            { label: 'Vereniging Pelgrimswegen naar Rome', url: 'https://www.pelgrimswegen.nl/' },
          ],
        },
      },
    },
  },
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
  'GR 5': 'GR 5', 'Via Francigena': 'Via Francigena', 'ViaJacobi': 'ViaJacobi', 'Tour du Mont Blanc': 'Tour du Mont Blanc',
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
