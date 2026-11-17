// Schermen: routeoverzicht, sectie, etappelijst, seizoenen en instellingen.

/* global L */
import { h, km, meters, hours, num, toast, download, MONTHS_LONG } from '../util.js';
import { state, save, exportJSON, importJSON, resetAll, defaultPace } from '../store.js';
import { route, chosen, totals, time, decode, section as getSection, isDone, dayWindow } from '../data.js';
import { parseGarminCSV, parseGPX, addLogs, fit, predicted } from '../calibrate.js';
import { SECTIONS, RATING, NEXT } from '../content.js';
import { makeMap, COLORS } from '../mapview.js';
import { stageRow, monthStrip, monthLegend, climateChart, statGrid, variantStats, badge, extLink } from '../components.js';
import { propose, bestMonthsText, monthsForStages } from '../plan.js';
import { geocode } from '../ov.js';
import { travelPanel } from './trips.js';
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
      const done = isDone(st);
      const m = L.circleMarker(st.b, { radius: opts.only ? 5 : 3.2, color: '#fff', weight: 1, fillColor: done ? '#3d7a3a' : COLORS[si % COLORS.length], fillOpacity: 1 }).addTo(map);
      m.bindTooltip(`${st.to}${done ? ' (gelopen)' : ''}`);
      m.on('click', () => { location.hash = `#/etappe/${st.id}`; });
    }
  });
  if (!opts.only) {
    L.marker([49.7597, 6.644], { icon: L.divIcon({ className: '', html: '<span class="pin start">T</span>', iconSize: [24, 24], iconAnchor: [12, 12] }) }).addTo(map).bindTooltip('Trier');
    const last = route.sections[route.sections.length - 1]; const le = chosen(last).stages.slice(-1)[0];
    L.marker(le.b, { icon: L.divIcon({ className: '', html: '<span class="pin end">?</span>', iconSize: [24, 24], iconAnchor: [12, 12] }) }).addTo(map).bindTooltip(`${le.to}: hier kies je het vervolg`);
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
        h('p', { class: 'eyebrow' }, 'Te voet naar Rome · deel 1'),
        h('h1', null, 'Van Trier naar de Titisee'),
        h('p', { class: 'lead' }, `${km(t.total)} in ${t.all.length} etappes over de Saar-Hunsrück-Steig, door het Pfälzerwald en over de Westweg. Bij de Titisee splitst de weg naar Rome. Die keuze maak je later.`),
        h('div', { class: 'progress', role: 'progressbar', 'aria-valuenow': Math.round(pct), 'aria-valuemin': 0, 'aria-valuemax': 100 }, h('i', { style: { width: Math.max(pct, 0.8) + '%' } })),
        h('p', { class: 'progress-t' }, `${km(t.doneKm)} gelopen · ${km(t.total - t.doneKm)} te gaan · ${left} etappes · ongeveer ${Math.ceil(left / (state.settings.perTrip || 8))} reizen van ${state.settings.perTrip || 8} dagen`),
        next ? h('div', { class: 'cta' },
          h('a', { class: 'btn primary', href: '#/reizen' }, 'Plan je volgende reis'),
          h('a', { class: 'btn', href: `#/etappe/${next.st.id}` }, `Volgende etappe: ${next.st.from} → ${next.st.to}`)) : h('p', { class: 'lead' }, 'Je staat bij de Titisee. Tijd om het vervolg te kiezen.')),
      mapEl),
    h('section', null,
      h('h2', null, `De route in ${route.sections.length} secties`),
      h('p', { class: 'muted' }, 'Kies per sectie je variant. De etappelijst, de kaart en je reizen volgen die keuze.'),
      h('div', { class: 'sections' }, route.sections.map((sec, si) => {
        const v = chosen(sec);
        const info = SECTIONS[sec.id] || {};
        const months = ((info.variants || {})[v.id] || {}).months || info.months;
        const done = v.stages.filter((st) => isDone(st)).length;
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
    h('section', null,
      h('h2', null, 'Het vervolg na de Titisee'),
      h('p', { class: 'muted' }, 'Tot hier lopen alle routes gelijk. Daarna kies je uit drie lijnen naar Rome. Zodra je kiest, komt dat deel in de app.'),
      h('div', { class: 'sections' }, NEXT.options.map((o) => h('article', { class: 'card sec' },
        h('header', null, h('span', { class: 'secn', style: { background: '#777' } }, o.key), h('div', null, h('h3', null, o.name))),
        h('p', null, o.text)))),
      h('p', { class: 'more' }, extLink('Lees het magazine met de drie routes', NEXT.magazine))),
    h('section', { class: 'note' },
      h('h2', null, 'Zo werkt deze planner'),
      h('ol', { class: 'steps' },
        h('li', null, h('strong', null, 'Route. '), 'Kies varianten en lees per sectie de beschrijving, het seizoensadvies en de ervaringen van andere wandelaars.'),
        h('li', null, h('strong', null, 'Reizen. '), 'Maak een reis van 5 tot 10 etappes. De planner zet de dagen, de nachten en de heen- en terugreis klaar.'),
        h('li', null, h('strong', null, 'Overnachten. '), 'Adressen leg je pas vast als een reis dichtbij komt. Bij elke etappe en elke nacht staat een zoekblok met actuele adressen en boekingslinks.'),
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
      h('ul', null, (info.practical || []).map((x) => h('li', null, x)))),
    h('section', null,
      h('h2', null, 'Aan- en afreis'),
      info.ov ? h('p', null, info.ov) : null,
      h('p', null, h('strong', null, 'Stations aan de route: '), [v.stages[0].from].concat(v.stages.filter((st) => st.rail && st.rail.m < 2500).map((st) => `${st.to} (${st.rail.n})`)).join(', '), '.'),
      h('div', { class: 'two' },
        h('div', null, h('h3', null, `Heen naar ${sec.from}`), travelPanel({ name: state.settings.home, ll: state.settings.homeLL }, { name: sec.from, ll: v.stages[0].a }, null)),
        h('div', null, h('h3', null, `Terug vanaf ${sec.to}`), travelPanel({ name: sec.to, ll: v.stages[v.stages.length - 1].b }, { name: state.settings.home, ll: state.settings.homeLL }, null, { time: '09:00' })))),
    h('section', null,
      h('div', { class: 'row-head' }, h('h2', null, `Etappes (${v.stages.length})`),
        h('button', { class: 'btn primary', onclick: () => newTripFrom(v.stages.find((st) => !isDone(st)) || v.stages[0]) }, 'Plan een reis in deze sectie')),
      h('div', { class: 'stage-list' }, v.stages.map((st, i) => stageRow(st, offset + i + 1)))),
    h('nav', { class: 'pager' },
      prev ? h('a', { href: `#/sectie/${prev.id}` }, `← ${prev.name}`) : h('span'),
      nxt ? h('a', { href: `#/sectie/${nxt.id}` }, `${nxt.name} →`) : h('span')));

  requestAnimationFrame(() => { const map = makeMap(mapEl); drawRoute(map, { only: sec.id }); });
  try {
    const c = await getClimate();
    if (c[sec.id]) climBox.append(climateChart(c[sec.id]));
  } catch (e) { /* grafiek is aanvulling */ }
}

export function viewStages(root) {
  const t = totals();
  root.append(
    h('header', { class: 'page-head' },
      h('h1', null, 'Alle etappes'),
      h('p', { class: 'lead' }, `${t.all.length} etappes, ${km(t.total)}, ${num(t.up)} m stijgen. Tijden zijn inclusief pauzes. De indeling volgt je tempo en je gewenste dagduur uit de instellingen.`)));
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
      h('p', { class: 'lead' }, 'Dit deel loopt door middelgebergte en kan van half april tot eind oktober. Mei, juni en september zijn het best.')),
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
      h('h2', null, 'Advies'),
      h('ul', null,
        h('li', null, 'Voor mei en juni 2027: Trier tot Wissembourg is ruim 350 km. Dat zijn 19 wandeldagen, of 21 met de vijf korte dagen door het Dahner Felsenland.'),
        h('li', null, 'De Rijnvlakte kan vroeg in het voorjaar, als het Zwarte Woud nog sneeuw heeft.'),
        h('li', null, 'Het Zwarte Woud vraagt een aparte reis van negen dagen tussen mei en oktober. Baden-Baden en Titisee hebben allebei een goede treinverbinding.'))));
}

function dayCard(rerender) {
  const d = state.settings.day;
  const w = dayWindow();
  const set = (k) => (e) => { const v = Number(e.target.value); if (v >= 3 && v <= 12) { d[k] = v; if (d.max < d.min + 0.5) d.max = d.min + 0.5; save(); rerender(); } };
  const rows = route.sections.map((sec) => { const v = chosen(sec); return { sec, v, n: v.stages.length, ref: v.refStages, long: v.stages.filter((st) => time(st).cls === 'long').length, short: v.stages.filter((st) => time(st).cls === 'short').length }; });
  const tot = rows.reduce((x, r) => x + r.n, 0), ref = rows.reduce((x, r) => x + r.ref, 0);
  return h('section', { class: 'card form' },
    h('h2', null, 'Dagduur'),
    h('p', { class: 'muted' }, 'Hoe lang wil je per dag onderweg zijn? De app deelt de route opnieuw in etappes in die binnen deze uren vallen, met jouw tempo. Elke etappe eindigt bij een plek met een bed.'),
    h('div', { class: 'grid-form' },
      h('label', null, 'Minimaal (uur)', h('input', { type: 'number', step: '0.5', min: '3', max: '11', value: d.min, onchange: set('min') })),
      h('label', null, 'Maximaal (uur)', h('input', { type: 'number', step: '0.5', min: '4', max: '12', value: d.max, onchange: set('max') })),
      h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: d.net, onchange: (e) => { d.net = e.target.checked; save(); rerender(); } }), 'Tel alleen looptijd, pauzes komen er nog bij')),
    h('p', null, h('strong', null, `${tot} etappes`), ` met ${w.min} tot ${w.max} uur ${w.net ? 'looptijd' : 'onderweg, inclusief pauzes'}. De eerste indeling (6 tot 9 uur, standaardtempo) had er ${ref}.`,
      tot < ref ? ` Dat scheelt ${ref - tot} dagen en overnachtingen.` : ''),
    h('div', { class: 'tablebox' }, h('table', { class: 'mini' },
      h('thead', null, h('tr', null, h('th', null, 'Sectie'), h('th', null, 'Etappes'), h('th', null, 'Eerst'), h('th', null, 'Te lang'), h('th', null, 'Te kort'))),
      h('tbody', null, rows.map((r) => h('tr', null, h('td', null, h('a', { href: `#/sectie/${r.sec.id}` }, r.sec.name), r.v.hours ? ' (vaste korte dagen)' : ''), h('td', null, String(r.n)), h('td', null, String(r.ref)), h('td', null, r.long ? String(r.long) : ''), h('td', null, r.short ? String(r.short) : '')))))),
    h('p', { class: 'muted small' }, 'Te lang of te kort betekent: er ligt geen overnachting op de goede afstand. Bekijk die etappes en beslis zelf.'));
}

const hm = (t) => `${Math.floor(t)}:${String(Math.round((t % 1) * 60)).padStart(2, '0')}`;
function parseHM(txt) {
  const p = String(txt || '').trim().split(':').map(Number);
  if (p.some(Number.isNaN) || !txt) return 0;
  return p.length > 1 ? p[0] + p[1] / 60 : p[0];
}

function calibrationCard(rerender) {
  const res = fit();
  const cur = state.settings.pace;
  const pick = (accept, multiple, handler) => { const el = h('input', { type: 'file', accept, multiple, style: { display: 'none' }, onchange: async (e) => { await handler([...e.target.files]); e.target.value = ''; } }); return el; };
  const csvIn = pick('.csv,text/csv', false, async (files) => {
    try { const n = addLogs(parseGarminCSV(await files[0].text())); toast(n ? `${n} wandelingen toegevoegd` : 'Geen nieuwe wandelingen van 8 km of meer gevonden'); rerender(); } catch (err) { toast(err.message); }
  });
  const gpxIn = pick('.gpx,application/gpx+xml', true, async (files) => {
    const list = [];
    for (const f of files) { try { list.push(parseGPX(await f.text(), f.name)); } catch (err) { toast(err.message); } }
    if (list.length) { toast(`${addLogs(list)} wandelingen toegevoegd`); rerender(); }
  });
  const f = { date: h('input', { type: 'date', 'aria-label': 'Datum' }), name: h('input', { type: 'text', placeholder: 'Naam' }), km: h('input', { type: 'number', step: '0.1', placeholder: 'km' }),
    up: h('input', { type: 'number', placeholder: 'm stijgen' }), down: h('input', { type: 'number', placeholder: 'm dalen' }), moving: h('input', { type: 'text', placeholder: 'looptijd u:mm' }), total: h('input', { type: 'text', placeholder: 'totaal u:mm' }) };
  const addManual = () => {
    const km = Number(f.km.value), moving = parseHM(f.moving.value), total = parseHM(f.total.value) || moving;
    if (!(km > 0) || !(moving > 0)) { toast('Vul minstens afstand en looptijd in'); return; }
    addLogs([{ id: Math.random().toString(36).slice(2, 9), date: f.date.value, name: f.name.value || 'Wandeling', km, up: Number(f.up.value) || 0, down: Number(f.down.value) || Number(f.up.value) || 0, moving, total: Math.max(total, moving), src: 'hand' }]);
    rerender();
  };
  return h('section', { class: 'card form' },
    h('h2', null, 'Tempo afleiden uit echte wandelingen'),
    h('p', { class: 'muted' }, 'Voeg wandelingen toe die je al gelopen hebt. De app zoekt het tempo dat jouw looptijden het best verklaart, apart voor vlak lopen en voor klimmen. Lange dagen met hoogtemeters wegen het zwaarst. Gelopen etappes uit deze app komen er vanzelf bij.'),
    h('div', { class: 'cta wrap' },
      h('button', { class: 'btn primary', onclick: () => csvIn.click() }, 'Importeer Garmin-CSV'), csvIn,
      h('button', { class: 'btn', onclick: () => gpxIn.click() }, 'Importeer GPX-bestanden'), gpxIn),
    h('details', { class: 'help' }, h('summary', null, 'Zo haal je de lijst uit Garmin Connect'),
      h('ol', null,
        h('li', null, 'Open connect.garmin.com op een computer en ga naar Activiteiten, Alle activiteiten.'),
        h('li', null, 'Filter op Wandelen en scrol omlaag tot alle wandelingen die je wilt gebruiken zichtbaar zijn.'),
        h('li', null, 'Klik rechtsboven op Exporteer CSV en kies dat bestand hier.')),
      h('p', { class: 'muted small' }, 'De app gebruikt alleen wandelingen van 8 km of meer. Voor één wandeling kun je ook de GPX exporteren via het tandwiel bij de activiteit.')),
    h('details', { class: 'help' }, h('summary', null, 'Voeg zelf een wandeling toe'),
      h('div', { class: 'inline-form' }, f.date, f.name, f.km, f.up, f.down, f.moving, f.total, h('button', { class: 'btn small', onclick: addManual }, 'Voeg toe'))),
    state.logs.length ? h('div', { class: 'tablebox' }, h('table', { class: 'mini' },
      h('thead', null, h('tr', null, h('th', null, 'Datum'), h('th', null, 'Wandeling'), h('th', null, 'km'), h('th', null, 'Stijgen'), h('th', null, 'Gelopen'), h('th', null, 'Model nu'), h('th', null, 'Verschil'), h('th', null, ''))),
      h('tbody', null, state.logs.map((l) => { const m = predicted(l); const dv = (m - l.moving) / l.moving * 100; return h('tr', { class: l.skip ? 'off' : '' },
        h('td', null, l.date || ''), h('td', null, (l.name || '').slice(0, 40)), h('td', null, l.km.toFixed(1)), h('td', null, String(l.up)), h('td', null, hm(l.moving)), h('td', null, hm(m)),
        h('td', { class: Math.abs(dv) > 15 ? 'warn' : '' }, `${dv > 0 ? '+' : ''}${Math.round(dv)}%`),
        h('td', null, h('button', { class: 'btn small ghost', title: 'Telt mee of niet', onclick: () => { l.skip = !l.skip; save(); rerender(); } }, l.skip ? 'telt niet' : 'telt mee'),
          h('button', { class: 'btn small ghost', 'aria-label': 'Verwijder', onclick: () => { state.logs = state.logs.filter((x) => x !== l); save(); rerender(); } }, '×'))); })))) : h('p', { class: 'muted' }, 'Nog geen wandelingen.'),
    res ? h('div', { class: 'fitbox' },
      h('p', null, h('strong', null, `Uit ${res.n} ${res.n === 1 ? 'wandeling' : 'wandelingen'} (${Math.round(res.flatKm)} km, ${num(res.upM)} m stijgen): `),
        `${res.pace.flat.toLocaleString('nl-NL')} km per uur vlak, ${res.pace.up} m per uur stijgen, ${res.pace.down} m per uur dalen, ${res.pace.pauseMin} minuten pauze per loopuur. `,
        `Nu ingesteld: ${cur.flat.toLocaleString('nl-NL')} km per uur en ${cur.up} m per uur.`),
      h('p', { class: 'muted small' }, res.mode === 'vol' ? `Vlak en klimmen zijn apart bepaald. Gemiddelde afwijking per wandeling: ${Math.round(res.rms * 100)} procent.`
        : 'Te weinig wandelingen of te weinig verschil in hoogtemeters om vlak en klimmen apart te bepalen. Het tempo is als geheel geschaald. Voeg minstens vier wandelingen toe, waaronder vlakke en bergachtige.'),
      h('button', { class: 'btn primary', onclick: () => { state.settings.pace = { ...res.pace }; save(); toast('Tempo overgenomen. De etappes zijn opnieuw ingedeeld.'); rerender(); } }, 'Neem dit tempo over')) : null);
}

export function viewSettings(root, rerender) {
  const s = state.settings;
  const p = s.pace;
  const homeIn = h('input', { type: 'text', value: s.home, id: 'home' });
  const results = h('div', { class: 'suggest' });
  const setPace = (k) => (e) => { const v = Number(e.target.value); if (v > 0 || k.endsWith('Min')) { p[k] = v; save(); } };
  const sv = route.sections[1].variants[0].stages; const sample = sv[sv.length - 1];

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
    dayCard(rerender),
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
    calibrationCard(rerender),
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
