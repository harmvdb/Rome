// Schermen: routeoverzicht, sectie, etappelijst, seizoenen en instellingen.

/* global L */
import { h, km, meters, hours, num, toast, download, MONTHS_LONG } from '../util.js';
import { state, save, exportJSON, importJSON, resetAll, defaultPace } from '../store.js';
import { route, chosen, totals, time, decode, section as getSection } from '../data.js';
import { SECTIONS, RATING } from '../content.js';
import { makeMap, COLORS } from '../mapview.js';
import { stageRow, monthStrip, monthLegend, climateChart, statGrid, variantStats, badge, extLink } from '../components.js';
import { propose, bestMonthsText, monthsForStages } from '../plan.js';
import { geocode } from '../ov.js';
import { newTripFrom } from './trips.js';

let climate = null;
async function getClimate() {
  if (!climate) climate = await (await fetch('data/climate.json')).json();
  return climate;
}

function drawRoute(map, opts = {}) {
  const bounds = L.latLngBounds([]);
  route.sections.forEach((sec, si) => {
    if (opts.only && opts.only !== sec.id) return;
    const v = chosen(sec);
    const pts = decode(v.overview);
    const line = L.polyline(pts, { color: COLORS[si % COLORS.length], weight: opts.only ? 4 : 3.5, opacity: 0.95 }).addTo(map);
    line.bindTooltip(`${si + 1}. ${sec.name}`, { sticky: true });
    if (!opts.only) line.on('click', () => { location.hash = `#/sectie/${sec.id}`; });
    bounds.extend(line.getBounds());
    for (const st of v.stages) {
      const done = !!state.done[st.id];
      const m = L.circleMarker(st.b, { radius: opts.only ? 5 : 3.2, color: '#fff', weight: 1, fillColor: done ? '#3d7a3a' : COLORS[si % COLORS.length], fillOpacity: 1 }).addTo(map);
      m.bindTooltip(`${st.to}${done ? ' (gelopen)' : ''}`);
      m.on('click', () => { location.hash = `#/etappe/${st.id}`; });
    }
  });
  if (!opts.only) {
    L.marker([49.7597, 6.644], { icon: L.divIcon({ className: '', html: '<span class="pin start">T</span>', iconSize: [24, 24], iconAnchor: [12, 12] }) }).addTo(map).bindTooltip('Trier');
    L.marker([41.9022, 12.4567], { icon: L.divIcon({ className: '', html: '<span class="pin end">R</span>', iconSize: [24, 24], iconAnchor: [12, 12] }) }).addTo(map).bindTooltip('Rome');
  }
  map.fitBounds(bounds, { padding: [18, 18] });
}

function variantPicker(sec, rerender) {
  if (sec.variants.length < 2) return null;
  const cur = chosen(sec);
  const info = SECTIONS[sec.id] || {};
  return h('div', { class: 'variants', role: 'radiogroup', 'aria-label': `Variant voor ${sec.name}` },
    sec.variants.map((v) => {
      const vi = (info.variants || {})[v.id] || {};
      return h('button', {
        class: 'variant' + (v.id === cur.id ? ' on' : ''), role: 'radio', 'aria-checked': v.id === cur.id ? 'true' : 'false',
        onclick: () => { state.choice[sec.id] = v.id; save(); rerender(); },
      },
        h('span', { class: 'vname' }, v.name, v.recommended ? badge('aanbevolen', 'rec') : null),
        h('span', { class: 'vfig' }, `${km(v.km)} · ${v.stages.length} etappes · ↑ ${num(v.up)} m · top ${num(v.max)} m`),
        vi.tag ? h('span', { class: 'vtag' }, vi.tag) : null);
    }));
}

export function viewRoute(root, rerender) {
  const t = totals();
  const pct = t.total ? (t.doneKm / t.total) * 100 : 0;
  const left = t.all.length - t.doneN;
  const mapEl = h('div', { class: 'map big' });
  const next = t.next;

  root.append(
    h('section', { class: 'hero' },
      h('div', { class: 'hero-text' },
        h('p', { class: 'eyebrow' }, 'Te voet over de Alpen'),
        h('h1', null, 'Van Trier naar Rome'),
        h('p', { class: 'lead' }, `${km(t.total)} in ${t.all.length} etappes over de Saar-Hunsrück-Steig, de GR 5 door Vogezen en Jura, de Alpen en de Via Francigena.`),
        h('div', { class: 'progress', role: 'progressbar', 'aria-valuenow': Math.round(pct), 'aria-valuemin': 0, 'aria-valuemax': 100 }, h('i', { style: { width: Math.max(pct, 0.8) + '%' } })),
        h('p', { class: 'progress-t' }, `${km(t.doneKm)} gelopen · ${km(t.total - t.doneKm)} te gaan · ${left} etappes · ongeveer ${Math.ceil(left / (state.settings.perTrip || 8))} reizen van ${state.settings.perTrip || 8} dagen`),
        next ? h('div', { class: 'cta' },
          h('a', { class: 'btn primary', href: '#/reizen' }, 'Plan je volgende reis'),
          h('a', { class: 'btn', href: `#/etappe/${next.st.id}` }, `Volgende etappe: ${next.st.from} → ${next.st.to}`)) : h('p', { class: 'lead' }, 'Je bent in Rome. Gefeliciteerd.')),
      mapEl),
    h('section', null,
      h('h2', null, 'De route in negen secties'),
      h('p', { class: 'muted' }, 'Kies per sectie je variant. De etappelijst, de kaart en je reizen volgen die keuze.'),
      h('div', { class: 'sections' }, route.sections.map((sec, si) => {
        const v = chosen(sec);
        const info = SECTIONS[sec.id] || {};
        const months = ((info.variants || {})[v.id] || {}).months || info.months;
        const done = v.stages.filter((st) => state.done[st.id]).length;
        return h('article', { class: 'card sec' },
          h('header', null,
            h('span', { class: 'secn', style: { background: COLORS[si % COLORS.length] } }, String(si + 1)),
            h('div', null,
              h('h3', null, h('a', { href: `#/sectie/${sec.id}` }, sec.name)),
              h('p', { class: 'fromto' }, `${sec.from} → ${sec.to}`))),
          h('p', null, info.tag || ''),
          h('p', { class: 'figs' }, `${km(v.km)} · ${v.stages.length} etappes · ↑ ${num(v.up)} m`, done ? ` · ${done} gelopen` : ''),
          months ? monthStrip(months, true) : null,
          variantPicker(sec, rerender),
          h('p', { class: 'more' }, h('a', { href: `#/sectie/${sec.id}` }, 'Beschrijving, seizoen en etappes →')));
      }))),
    h('section', { class: 'note' },
      h('h2', null, 'Zo werkt deze planner'),
      h('ol', { class: 'steps' },
        h('li', null, h('strong', null, 'Route. '), 'Kies varianten en lees per sectie de beschrijving, het seizoensadvies en de ervaringen van andere wandelaars.'),
        h('li', null, h('strong', null, 'Reizen. '), 'Maak een reis van 5 tot 10 etappes. De planner zet de dagen, de nachten en de heen- en terugreis klaar.'),
        h('li', null, h('strong', null, 'Overnachten. '), 'Kies per nacht een adres, open de boekingssite met je datums al ingevuld en houd bij wat geboekt is.'),
        h('li', null, h('strong', null, 'Garmin. '), 'Stuur per etappe de GPX naar Garmin Connect en zet hem als koers op je Forerunner 965.'))));
  requestAnimationFrame(() => { const map = makeMap(mapEl); drawRoute(map); });
}

export async function viewSection(root, id, rerender) {
  const sec = getSection(id);
  if (!sec) { root.append(h('p', null, 'Sectie niet gevonden.')); return; }
  const si = route.sections.indexOf(sec);
  const v = chosen(sec);
  const info = SECTIONS[sec.id] || {};
  const vi = (info.variants || {})[v.id] || {};
  const months = vi.months || info.months;
  const mapEl = h('div', { class: 'map' });
  const all = totals().all;
  const offset = all.findIndex((a) => a.st.id === v.stages[0].id);
  const climBox = h('div');
  const prev = route.sections[si - 1], nxt = route.sections[si + 1];

  root.append(
    h('nav', { class: 'crumbs' }, h('a', { href: '#/' }, 'Route'), ' / ', `Sectie ${si + 1}`),
    h('header', { class: 'page-head' },
      h('p', { class: 'eyebrow' }, `Sectie ${si + 1} van ${route.sections.length} · ${sec.from} → ${sec.to}`),
      h('h1', null, sec.name),
      h('p', { class: 'lead' }, info.tag || '')),
    variantPicker(sec, rerender),
    statGrid(variantStats(v)),
    h('div', { class: 'two' },
      h('section', null,
        h('h2', null, v.name),
        (vi.text || []).map((p) => h('p', null, p)),
        vi.highlights ? h('div', null, h('h3', null, 'Hoogtepunten'), h('ul', { class: 'chips' }, vi.highlights.map((x) => h('li', null, x)))) : null,
        (vi.plus || vi.minus) ? h('div', { class: 'proscons' },
          h('div', null, h('h3', null, 'Sterk'), h('ul', { class: 'plus' }, (vi.plus || []).map((x) => h('li', null, x)))),
          h('div', null, h('h3', null, 'Zwak'), h('ul', { class: 'minus' }, (vi.minus || []).map((x) => h('li', null, x))))) : null),
      h('aside', null, mapEl,
        h('p', { class: 'muted small' }, 'Paden: ', v.trails.join(', '), '.'))),
    h('section', { class: 'season' },
      h('h2', null, 'Wanneer wel en wanneer niet'),
      months ? monthStrip(months) : null, monthLegend(),
      h('p', null, info.season || ''),
      h('ul', null, (info.seasonTips || []).map((x) => h('li', null, x))),
      climBox),
    vi.reviews ? h('section', { class: 'reviews' },
      h('h2', null, 'Wat andere wandelaars zeggen'),
      h('ul', { class: 'quotes' }, vi.reviews.points.map((x) => h('li', null, x))),
      h('p', { class: 'muted small' }, 'Samenvatting van veelgenoemde ervaringen in reisverslagen, forums en gidsen. Geen letterlijke citaten. Lees de beoordelingen zelf bij deze bronnen:'),
      h('ul', { class: 'links' }, vi.reviews.sources.map((s) => h('li', null, extLink(s.label, s.url))))) : null,
    h('section', null,
      h('h2', null, 'Praktisch'),
      h('ul', null, (info.practical || []).map((x) => h('li', null, x))),
      info.ov ? h('p', null, h('strong', null, 'Openbaar vervoer. '), info.ov) : null),
    h('section', null,
      h('div', { class: 'row-head' }, h('h2', null, `Etappes (${v.stages.length})`),
        h('button', { class: 'btn primary', onclick: () => newTripFrom(v.stages.find((st) => !state.done[st.id]) || v.stages[0]) }, 'Plan een reis in deze sectie')),
      h('div', { class: 'stage-list' }, v.stages.map((st, i) => stageRow(st, offset + i + 1)))),
    h('nav', { class: 'pager' },
      prev ? h('a', { href: `#/sectie/${prev.id}` }, `← ${prev.name}`) : h('span'),
      nxt ? h('a', { href: `#/sectie/${nxt.id}` }, `${nxt.name} →`) : h('span')));

  requestAnimationFrame(() => { const map = makeMap(mapEl); drawRoute(map, { only: sec.id }); });
  try {
    const c = await getClimate();
    if (c[sec.id]) climBox.append(climateChart(c[sec.id]));
    if (sec.id === 's4' && c.s4lake) climBox.append(climateChart(c.s4lake));
  } catch (e) { /* grafiek is aanvulling */ }
}

export function viewStages(root) {
  const t = totals();
  root.append(
    h('header', { class: 'page-head' },
      h('h1', null, 'Alle etappes'),
      h('p', { class: 'lead' }, `${t.all.length} etappes, ${km(t.total)}, ${num(t.up)} m stijgen. Tijden zijn inclusief pauzes en volgen je tempo uit de instellingen.`)));
  let i = 0;
  route.sections.forEach((sec, si) => {
    const v = chosen(sec);
    root.append(h('section', null,
      h('div', { class: 'row-head' },
        h('h2', null, h('span', { class: 'secn', style: { background: COLORS[si % COLORS.length] } }, String(si + 1)), ' ', h('a', { href: `#/sectie/${sec.id}` }, sec.name)),
        h('span', { class: 'muted' }, `${v.name} · ${km(v.km)}`)),
      h('div', { class: 'stage-list' }, v.stages.map((st) => stageRow(st, ++i)))));
  });
}

export async function viewWhen(root, rerender) {
  const per = state.settings.perTrip || 8;
  const trips = propose(per);
  const perSel = h('select', { onchange: (e) => { state.settings.perTrip = Number(e.target.value); save(); rerender(); } },
    [5, 6, 7, 8, 9, 10].map((n) => h('option', { value: n, selected: n === per }, `${n} etappes`)));
  root.append(
    h('header', { class: 'page-head' },
      h('h1', null, 'Wanneer loop je wat'),
      h('p', { class: 'lead' }, 'De volgorde ligt vast, het seizoen niet. De Alpen kunnen alleen in de zomer, de Po-vlakte en Toscane juist niet. Plan je reizen daaromheen.')),
    h('section', null,
      h('h2', null, 'Seizoenskalender per sectie'),
      monthLegend(),
      h('div', { class: 'when-table' }, route.sections.map((sec, si) => {
        const v = chosen(sec);
        const info = SECTIONS[sec.id] || {};
        const months = ((info.variants || {})[v.id] || {}).months || info.months;
        return h('div', { class: 'when-row' },
          h('a', { href: `#/sectie/${sec.id}`, class: 'when-name' }, h('span', { class: 'secn', style: { background: COLORS[si % COLORS.length] } }, String(si + 1)), ' ', sec.name),
          monthStrip(months, true),
          h('p', { class: 'muted small' }, info.season || ''));
      }))),
    h('section', null,
      h('div', { class: 'row-head' }, h('h2', null, 'Voorstel voor je meerjarenplan'), h('label', { class: 'inline' }, 'Per reis ongeveer ', perSel)),
      h('p', { class: 'muted' }, `De resterende etappes verdeeld over ${trips.length} reizen. Elke reis eindigt waar mogelijk bij een station. De maanden gelden voor alle etappes van die reis samen.`),
      h('div', { class: 'plan-list' }, trips.map((tr) => h('article', { class: 'card plan' },
        h('header', null, h('span', { class: 'plan-n' }, `Reis ${tr.n}`), h('h3', null, `${tr.from} → ${tr.to}`)),
        h('p', { class: 'figs' }, `${tr.stages.length} etappes · ${km(tr.km)} · ↑ ${num(tr.up)} m · gemiddeld ${hours(tr.hours / tr.stages.length)} per dag`),
        monthStrip(tr.months, true),
        h('p', { class: 'small' }, h('strong', null, 'Beste tijd: '), bestMonthsText(tr.months)),
        h('p', { class: 'small muted' }, tr.rail ? `Terugreis vanaf station ${tr.rail.n} (${num(tr.rail.m)} m van het eindpunt).` : 'Geen station bij het eindpunt: reken op bus of taxi naar de trein.'),
        h('button', { class: 'btn', onclick: () => newTripFrom(tr.stages[0], tr.stages.length) }, 'Maak deze reis aan'))))),
    h('section', { class: 'note' },
      h('h2', null, 'Strategisch advies'),
      h('ul', null,
        h('li', null, 'Het knelpunt is de Alpenoversteek: tien weken per jaar, van begin juli tot half september. Leg die reis als eerste vast en reken terug.'),
        h('li', null, 'Loop de dagen langs het Meer van Genève los van de bergdagen. Dat geeft een voorjaarsreis extra en houdt de zomerreis kort.'),
        h('li', null, 'Bewaar Po-vlakte, Toscane en Lazio voor april, mei of oktober. Wie in de zomervakantie vastzit, loopt beter eerst de Vogezen en Jura en schuift Italië naar het voor- of najaar.'),
        h('li', null, 'Met twee reizen per jaar, één in mei of juni en één in september, sta je in ongeveer zeven jaar in Rome. Met drie reizen per jaar in vijf.'))));
}

export function viewSettings(root, rerender) {
  const s = state.settings;
  const p = s.pace;
  const homeIn = h('input', { type: 'text', value: s.home, id: 'home' });
  const results = h('div', { class: 'suggest' });
  const setPace = (k) => (e) => { const v = Number(e.target.value); if (v > 0 || k.endsWith('Min')) { p[k] = v; save(); } };
  const sample = route.sections[1].variants[0].stages[7];

  async function findHome() {
    results.replaceChildren(h('p', { class: 'muted' }, 'Zoeken…'));
    try {
      const list = await geocode(homeIn.value);
      results.replaceChildren(...(list.length ? list.map((x) => h('button', { class: 'btn small', onclick: () => {
        s.home = x.name; s.homeLL = x.ll; save(); toast(`Vertrekpunt: ${x.name}`); rerender();
      } }, `${x.name}${x.area ? ' (' + x.area + ')' : ''}`)) : [h('p', { class: 'muted' }, 'Niets gevonden.')]));
    } catch (e) { results.replaceChildren(h('p', { class: 'muted' }, 'Zoeken lukt nu niet. Probeer het later opnieuw.')); }
  }

  const fileIn = h('input', { type: 'file', accept: 'application/json,.json', style: { display: 'none' }, onchange: async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    try { importJSON(await f.text()); toast('Reservekopie teruggezet'); rerender(); } catch (err) { toast(err.message); }
  } });

  root.append(
    h('header', { class: 'page-head' }, h('h1', null, 'Instellingen')),
    h('section', { class: 'card form' },
      h('h2', null, 'Vertrekpunt voor de heen- en terugreis'),
      h('p', { class: 'muted' }, `Nu ingesteld: ${s.home}. Zoek je eigen station of adres.`),
      h('div', { class: 'inline-form' }, homeIn, h('button', { class: 'btn', onclick: findHome }, 'Zoek')),
      results),
    h('section', { class: 'card form' },
      h('h2', null, 'Wandeltempo'),
      h('p', { class: 'muted' }, 'De looptijd telt afstand en hoogteverschil apart en neemt de kleinste van de twee voor de helft mee. Pauzes komen erbij. Pas de waarden aan tot de tijden kloppen met je eigen ervaring.'),
      h('div', { class: 'grid-form' },
        h('label', null, 'Snelheid vlak (km per uur)', h('input', { type: 'number', step: '0.1', min: '2', max: '7', value: p.flat, onchange: setPace('flat') })),
        h('label', null, 'Stijgen (meter per uur)', h('input', { type: 'number', step: '10', min: '150', max: '700', value: p.up, onchange: setPace('up') })),
        h('label', null, 'Dalen (meter per uur)', h('input', { type: 'number', step: '10', min: '200', max: '1000', value: p.down, onchange: setPace('down') })),
        h('label', null, 'Korte pauzes (minuten per loopuur)', h('input', { type: 'number', step: '1', min: '0', max: '30', value: p.pauseMin, onchange: setPace('pauseMin') })),
        h('label', null, 'Lunchpauze (minuten)', h('input', { type: 'number', step: '5', min: '0', max: '120', value: p.lunchMin, onchange: setPace('lunchMin') })),
        h('label', null, 'Aantal personen', h('input', { type: 'number', step: '1', min: '1', max: '8', value: s.adults, onchange: (e) => { s.adults = Math.max(1, Number(e.target.value) || 1); save(); } }))),
      h('p', { class: 'small' }, `Voorbeeld: ${sample.from} → ${sample.to}, ${km(sample.km)} met ${num(sample.up)} m stijgen duurt met deze instellingen ${hours(time(sample).total)}, waarvan ${hours(time(sample).walk)} lopen.`),
      h('div', { class: 'cta' }, h('button', { class: 'btn', onclick: () => rerender() }, 'Herbereken voorbeeld'),
        h('button', { class: 'btn', onclick: () => { s.pace = defaultPace(); save(); rerender(); } }, 'Standaardwaarden'))),
    h('section', { class: 'card form' },
      h('h2', null, 'Reservekopie'),
      h('p', { class: 'muted' }, 'Je keuzes, reizen en boekingen staan alleen in deze browser. Maak een reservekopie en zet die terug op een ander apparaat om verder te werken.'),
      h('div', { class: 'cta' },
        h('button', { class: 'btn primary', onclick: () => download(`trier-rome-reservekopie-${new Date().toISOString().slice(0, 10)}.json`, exportJSON(), 'application/json') }, 'Download reservekopie'),
        h('button', { class: 'btn', onclick: () => fileIn.click() }, 'Zet reservekopie terug'), fileIn,
        h('button', { class: 'btn danger', onclick: () => { if (confirm('Alle keuzes, reizen en notities wissen?')) { resetAll(); toast('Alles gewist'); rerender(); } } }, 'Wis alles'))),
    h('section', { class: 'note' },
      h('h2', null, 'Over de data'),
      h('ul', null,
        h('li', null, 'Routes: officiële lijn van elk pad uit OpenStreetMap via Waymarked Trails. Verbindingsstukken berekend met BRouter. Peildatum ', route.generated, '.'),
        h('li', null, 'Hoogte: SRTM, gladgestreken. Stijgmeters wijken tot 10 procent af van gidsen.'),
        h('li', null, 'Overnachtingen, stations, winkels en waterpunten: OpenStreetMap. Niet elk adres staat erin en openingstijden ontbreken vaak. Bel of boek vooraf.'),
        h('li', null, 'Reisadvies: Transitous. Klimaat: Open-Meteo. Kaarten: OpenStreetMap en OpenTopoMap.'),
        h('li', null, 'Controleer elke etappe vooraf op de kaart en volg onderweg de markering als die afwijkt van de lijn op je horloge. Paden worden verlegd.'))));
}

export { MONTHS_LONG, RATING, monthsForStages, meters };
