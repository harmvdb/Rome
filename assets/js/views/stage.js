// Scherm van één etappe: kaart, profiel, Garmin, overnachten, onderweg, openbaar vervoer, eigen notities.

/* global L */
import { h, km, meters, hours, num, toast, todayISO, hav } from '../util.js';
import { state, save } from '../store.js';
import { stage as getStage, totals, time, stageLine, KIND } from '../data.js';
import { SECTIONS, GARMIN_STEPS, REVIEW_SITES, TRAIL_QUERY } from '../content.js';
import { makeMap, dot, stayMarker } from '../mapview.js';
import { profile, statGrid, stageBadges, extLink, monthStrip } from '../components.js';
import { shareGPX, downloadGPX } from '../gpx.js';
import { stayBlock } from '../stays.js';
import { transitLinks } from '../links.js';
import { monthsFor } from '../plan.js';
import { travelPanel } from './trips.js';

export function garminHelp() {
  const list = (title, steps) => h('div', null, h('h4', null, title), h('ol', null, steps.map((s) => h('li', null, s))));
  return h('details', { class: 'help' },
    h('summary', null, 'Zo zet je de route op je Forerunner 965'),
    h('div', { class: 'three' }, list('Via je telefoon', GARMIN_STEPS.phone), list('Via de computer', GARMIN_STEPS.desktop), list('Via de USB-kabel', GARMIN_STEPS.usb)),
    h('p', { class: 'muted small' }, 'Op een iPhone opent het deelmenu Garmin Connect direct. Op Android laat Chrome het delen van GPX-bestanden niet altijd toe: de app downloadt het bestand dan en je opent het vanuit Downloads met Garmin Connect.'));
}

export async function viewStage(root, id, rerender) {
  const st = getStage(id);
  if (!st) { root.append(h('p', null, 'Etappe niet gevonden.')); return; }
  const all = totals().all;
  const pos = all.findIndex((a) => a.st.id === id);
  const n = pos >= 0 ? pos + 1 : st.n;
  const prev = pos > 0 ? all[pos - 1].st : null, next = pos >= 0 && pos < all.length - 1 ? all[pos + 1].st : null;
  const t = time(st);
  const done = state.done[id];
  const mapEl = h('div', { class: 'map' });
  const profEl = h('div', { class: 'profile-slot' }, h('p', { class: 'muted' }, 'Profiel laden…'));
  const stayEl = h('div', null, h('p', { class: 'muted' }, 'Adressen laden…'));
  const alongEl = h('div');
  const note = state.notes[id] || { rating: 0, text: '' };
  const info = SECTIONS[st.section.id] || {};
  const inActive = pos >= 0;

  const stars = h('div', { class: 'rating', role: 'radiogroup', 'aria-label': 'Eigen waardering' });
  const drawStars = () => stars.replaceChildren(...[1, 2, 3, 4, 5].map((v) => h('button', {
    class: v <= note.rating ? 'on' : '', 'aria-label': `${v} van 5`, onclick: () => { note.rating = note.rating === v ? 0 : v; state.notes[id] = note; save(); drawStars(); },
  }, '★')));
  drawStars();

  root.append(
    h('nav', { class: 'crumbs' }, h('a', { href: '#/' }, 'Route'), ' / ', h('a', { href: `#/sectie/${st.section.id}` }, st.section.name), ' / ', `Etappe ${n}`),
    h('header', { class: 'page-head' },
      h('p', { class: 'eyebrow' }, `Etappe ${n}${inActive ? ` van ${all.length}` : ''} · ${st.trail.join(' en ')}`),
      h('h1', null, st.from, h('span', { class: 'arrow' }, ' → '), st.to),
      h('p', { class: 'badges' }, stageBadges(st), done ? h('span', { class: 'badge ok' }, `gelopen${done !== true ? ' op ' + done : ''}`) : null),
      inActive ? null : h('p', { class: 'warn-t' }, `Deze etappe hoort bij de variant "${st.variant.name}". Die is nu niet gekozen in je route.`)),
    statGrid([
      ['Afstand', km(st.km)], ['Stijgen', meters(st.up)], ['Dalen', meters(st.down)],
      ['Hoogste punt', meters(st.max)], ['Tijd met pauzes', hours(t.total), `${hours(t.walk)} lopen`],
    ]),
    h('div', { class: 'cta wrap' },
      h('button', { class: 'btn primary', onclick: () => shareGPX(st, n) }, 'Stuur naar Garmin'),
      h('button', { class: 'btn', onclick: () => downloadGPX(st, n) }, 'Download GPX'),
      h('button', { class: 'btn' + (done ? ' on' : ''), onclick: () => {
        if (state.done[id]) delete state.done[id]; else state.done[id] = todayISO();
        save(); rerender();
      } }, done ? 'Gelopen ✓ (ongedaan maken)' : 'Markeer als gelopen')),
    garminHelp(),
    mapEl, profEl,
    h('section', null,
      h('h2', null, 'Seizoen'),
      monthStrip(monthsFor(st), false),
      st.max >= 2000 ? h('p', null, `Deze etappe komt tot ${meters(st.max)}. Begaanbaar van begin juli tot half september. Daarbuiten ligt er sneeuw.`)
        : h('p', null, info.season || '')),
    h('section', null, h('h2', null, 'Overnachten'), stayEl),
    h('section', null, h('h2', null, 'Onderweg'), alongEl),
    h('section', null,
      h('h2', null, 'Openbaar vervoer'),
      st.rail ? h('p', null, `Dichtstbijzijnde station bij het eindpunt: ${st.rail.n}, ${num(st.rail.m)} m lopen.`) : h('p', null, 'Geen treinstation binnen 3 km van het eindpunt. Reken op een bus of taxi.'),
      h('div', { class: 'two' },
        h('div', null, h('h3', null, `Naar het startpunt ${st.from}`), travelPanel({ name: state.settings.home, ll: state.settings.homeLL }, { name: st.from, ll: st.a }, null)),
        h('div', null, h('h3', null, `Terug vanaf ${st.to}`), travelPanel({ name: st.to, ll: st.b }, { name: state.settings.home, ll: state.settings.homeLL }, null)))),
    h('section', null,
      h('h2', null, 'Ervaringen van anderen'),
      h('p', { class: 'muted' }, 'Zoek foto\'s, verslagen en beoordelingen van dit pad:'),
      h('div', { class: 'actions' }, st.trail.filter((x) => TRAIL_QUERY[x]).flatMap((tr) => REVIEW_SITES.map((s) => extLink(`${s.label}: ${tr}`, s.url(TRAIL_QUERY[tr]), 'btn small')))),
      h('p', { class: 'small' }, h('a', { href: `#/sectie/${st.section.id}` }, `Samenvatting van ervaringen in de sectie ${st.section.name} →`))),
    h('section', { class: 'card form' },
      h('h2', null, 'Mijn eigen waardering en notities'),
      stars,
      h('textarea', { rows: 4, placeholder: 'Hoe was deze etappe? Wat moet je de volgende keer weten?', oninput: (e) => { note.text = e.target.value; state.notes[id] = note; save(); } }, note.text)),
    h('nav', { class: 'pager' },
      prev ? h('a', { href: `#/etappe/${prev.id}` }, `← ${prev.from} → ${prev.to}`) : h('span'),
      next ? h('a', { href: `#/etappe/${next.id}` }, `${next.from} → ${next.to} →`) : h('span')));

  const map = makeMap(mapEl, { topo: st.max > 1500 });
  const [line, sb] = await Promise.all([stageLine(st), stayBlock(st)]);
  const poly = L.polyline(line.pts, { color: '#b5482a', weight: 4.5, opacity: 0.95 }).addTo(map);
  map.fitBounds(poly.getBounds(), { padding: [24, 24] });
  dot(line.pts[0], 'start', 'A', st.from).addTo(map);
  dot(line.pts[line.pts.length - 1], 'end', 'B', st.to).addTo(map);

  // cumulatieve afstand per lijnpunt, voor de koppeling tussen profiel en kaart
  const cum = [0];
  for (let i = 1; i < line.pts.length; i++) cum.push(cum[i - 1] + hav(line.pts[i - 1], line.pts[i]));
  const scale = (line.prof.length - 1) * line.step / (cum[cum.length - 1] || 1);
  const cursor = L.circleMarker(line.pts[0], { radius: 7, color: '#fff', weight: 2, fillColor: '#1f2a44', fillOpacity: 1 });
  profEl.replaceChildren(profile(line.prof, line.step, (m) => {
    if (m === null) { cursor.remove(); return; }
    const target = m / scale;
    let lo = 0, hi = cum.length - 1;
    while (lo < hi) { const mid = (lo + hi) >> 1; if (cum[mid] < target) lo = mid + 1; else hi = mid; }
    cursor.setLatLng(line.pts[lo]).addTo(map);
  }), h('p', { class: 'muted small' }, 'Hoogte in meters, afstand in kilometers. Beweeg over het profiel om de plek op de kaart te zien.'));

  const layerStay = L.layerGroup().addTo(map);
  for (const p of sb.data.end) stayMarker(p).bindPopup(`<strong>${p.n}</strong><br>${(KIND[p.k] || {}).label || p.k}`).addTo(layerStay);
  for (const p of sb.data.along) stayMarker(p).bindPopup(`<strong>${p.n}</strong><br>${(KIND[p.k] || {}).label || p.k}, na ${p.km} km`).addTo(layerStay);
  for (const p of sb.data.shops) L.circleMarker([p.lat, p.lon], { radius: 4, color: '#fff', weight: 1, fillColor: '#444', fillOpacity: 0.9 }).bindPopup(`${p.n} (winkel), na ${p.km} km`).addTo(layerStay);
  for (const p of sb.data.water) L.circleMarker([p.lat, p.lon], { radius: 3.5, color: '#fff', weight: 1, fillColor: '#2a8fd6', fillOpacity: 0.9 }).bindPopup(`Drinkwater, na ${p.km} km`).addTo(layerStay);
  stayEl.replaceChildren(h('details', { class: 'help' },
    h('summary', null, `Zoek overnachtingen in ${st.to}: ${sb.data.end.length} adressen en boekingslinks`),
    h('p', { class: 'muted small' }, 'Deze lijst is een momentopname uit OpenStreetMap. Leg adressen pas vast als de reis dichtbij komt en ververs dan de lijst.'),
    sb.el));

  alongEl.replaceChildren(
    h('p', null,
      sb.data.shops.length ? `Winkels langs de route: ${sb.data.shops.map((s) => `${s.n} (km ${s.km})`).slice(0, 8).join(', ')}. ` : 'Geen winkels direct aan de route. Neem eten mee. ',
      sb.data.water.length ? `Drinkwaterpunten in OpenStreetMap: ${sb.data.water.length}, onder meer bij km ${sb.data.water.slice(0, 6).map((w) => w.km).join(', ')}.` : 'Geen drinkwaterpunten bekend. Vul voor vertrek.'),
    sb.data.along.length ? h('details', { class: 'help' },
      h('summary', null, `Etappe inkorten of verlengen: ${sb.data.along.length} adressen onderweg`),
      h('ul', { class: 'along' }, sb.data.along.map((p) => h('li', null,
        h('strong', null, `km ${p.km}`), ' · ', p.web ? extLink(p.n, /^https?:/.test(p.web) ? p.web : 'https://' + p.web) : p.n, ` (${(KIND[p.k] || {}).label || p.k})`,
        p.tel ? ` · ${p.tel}` : '')))) : null);
}

export { transitLinks };
