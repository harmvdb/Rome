// Lijst met overnachtingsadressen bij een etappe-einde, met boekingslinks en beoordelingen.

import { h, num, toast, hav } from './util.js';
import { KIND, stageStay } from './data.js';
import { state } from './store.js';
import * as links from './links.js';
import { extLink, badge } from './components.js';

const FILTERS = [
  ['bed', 'Hotels en pensions', (p) => ['hotel', 'guest_house', 'motel'].includes(p.k)],
  ['hostel', 'Hostels en herbergen', (p) => p.k === 'hostel'],
  ['hut', 'Berghutten', (p) => p.k === 'alpine_hut' || p.k === 'wilderness_hut'],
  ['camp', 'Campings', (p) => p.k === 'camp_site'],
  ['gite', 'Gîtes en appartementen', (p) => p.k === 'chalet' || p.k === 'apartment'],
];

function fixUrl(u) {
  if (!u) return '';
  u = u.split(';')[0].trim();
  return /^https?:\/\//i.test(u) ? u : 'https://' + u;
}

export function stayCard(p, place, ctx = {}) {
  const k = KIND[p.k] || { label: p.k, c: '#777' };
  const { cin, cout } = ctx;
  const adults = state.settings.adults;
  const web = fixUrl(p.web);
  const tel = p.tel ? p.tel.split(';')[0].trim() : '';
  const card = h('article', { class: 'stay' + (ctx.picked ? ' picked' : '') },
    h('header', null,
      h('span', { class: 'kdot', style: { background: k.c } }),
      h('div', null,
        h('h4', null, p.n, p.stars ? h('span', { class: 'stars' }, ' ' + '★'.repeat(Math.min(5, parseInt(p.stars, 10) || 0))) : null),
        h('p', { class: 'meta' }, k.label,
          p.m !== undefined ? ` · ${num(p.m)} m van het eindpunt` : '', p.km !== undefined ? ` · na ${p.km} km` : '',
          p.ele ? ` · ${p.ele} m hoogte` : '', p.beds ? ` · ${p.beds} bedden` : '', p.op ? ` · ${p.op}` : ''))),
    p.k === 'wilderness_hut' ? h('p', { class: 'warn-t' }, 'Onbemand: geen beheerder, geen maaltijden. Controleer of de hut open is.') : null,
    p.k === 'alpine_hut' ? h('p', { class: 'meta' }, 'Reserveer rechtstreeks bij de hut. Halfpension is gebruikelijk.') : null,
    h('div', { class: 'actions' },
      web ? extLink(p.k === 'alpine_hut' ? 'Site van de hut' : 'Eigen site', web, 'btn small primary') : null,
      p.k !== 'alpine_hut' && p.k !== 'wilderness_hut' && p.k !== 'camp_site' ? extLink(cin ? 'Booking.com met je datums' : 'Booking.com', links.bookingName(p.n, place, cin, cout, adults), 'btn small') : null,
      tel ? h('a', { class: 'btn small', href: `tel:${tel.replace(/[^+\d]/g, '')}` }, tel) : null,
      p.mail ? h('a', { class: 'btn small', href: `mailto:${p.mail.split(';')[0].trim()}` }, 'E-mail') : null,
      extLink('Beoordelingen op Google', links.gmapsPlace(p.n, place), 'btn small'),
      p.k !== 'camp_site' && p.k !== 'wilderness_hut' ? extLink('Tripadvisor', links.tripadvisor(p.n, place), 'btn small') : null,
      ctx.onPick ? h('button', { class: 'btn small pick', onclick: () => ctx.onPick(p) }, ctx.picked ? 'Gekozen ✓' : 'Kies dit adres') : null));
  return card;
}

// Volledig blok voor een etappe-einde: filters, adressen, zoeklinks en verversen uit OpenStreetMap.
export async function stayBlock(st, ctx = {}) {
  const data = await stageStay(st);
  let list = data.end.slice();
  const place = st.to;
  const adults = state.settings.adults;
  const active = new Set();
  const listEl = h('div', { class: 'stay-list' });
  const countEl = h('p', { class: 'muted small' });
  const chips = h('div', { class: 'filter' });

  function draw() {
    const shown = list.filter((p) => !active.size || FILTERS.some(([id, , fn]) => active.has(id) && fn(p)));
    countEl.textContent = `${shown.length} van ${list.length} adressen uit OpenStreetMap binnen ongeveer 2 km van het eindpunt.`;
    listEl.replaceChildren(...(shown.length ? shown.map((p) => stayCard(p, place, { ...ctx, picked: ctx.pickedId && ctx.pickedId === p.id }))
      : [h('p', { class: 'muted' }, 'Geen adressen in deze selectie. Gebruik de zoeklinks hieronder.')]));
    chips.replaceChildren(...FILTERS.filter(([, , fn]) => list.some(fn)).map(([id, label, fn]) =>
      h('button', { class: 'chip' + (active.has(id) ? ' on' : ''), onclick: () => { active.has(id) ? active.delete(id) : active.add(id); draw(); } },
        `${label} (${list.filter(fn).length})`)));
  }

  async function refresh(btn) {
    btn.disabled = true; btn.textContent = 'Bezig…';
    const q = `[out:json][timeout:25];nwr(around:2500,${st.b[0]},${st.b[1]})[tourism~"^(hotel|guest_house|hostel|motel|alpine_hut|wilderness_hut|camp_site|chalet|apartment)$"];out center tags;`;
    try {
      const r = await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', body: 'data=' + encodeURIComponent(q), headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
      const d = await r.json();
      const fresh = d.elements.filter((e) => e.tags && e.tags.name).map((e) => {
        const lat = e.lat ?? e.center?.lat, lon = e.lon ?? e.center?.lon, t = e.tags;
        return { id: e.type[0] + e.id, k: t.tourism, n: t.name, lat, lon, m: Math.round(hav(st.b, [lat, lon])),
          web: t.website || t['contact:website'] || '', tel: t.phone || t['contact:phone'] || '', mail: t.email || t['contact:email'] || '', stars: t.stars || '', beds: t.beds || t.capacity || '' };
      }).sort((a, b) => a.m - b.m);
      const before = list.length;
      const ids = new Set(fresh.map((p) => p.id));
      list = fresh.concat(list.filter((p) => !ids.has(p.id) && p.m > 2500));
      draw();
      toast(`${list.length} adressen, ${Math.max(0, list.length - before)} nieuw`);
    } catch (e) { toast('Verversen lukt nu niet'); }
    btn.disabled = false; btn.textContent = 'Ververs uit OpenStreetMap';
  }

  draw();
  const search = h('div', { class: 'search-links' },
    h('h4', null, 'Zoek en boek in de omgeving', ctx.cin ? h('span', { class: 'muted' }, ` · nacht van ${ctx.cin}`) : null),
    h('div', { class: 'actions' },
      extLink('Booking.com rond het eindpunt', links.bookingArea(place, st.b, ctx.cin, ctx.cout, adults), 'btn small primary'),
      extLink('Alleen hostels', links.bookingArea(place, st.b, ctx.cin, ctx.cout, adults, true), 'btn small'),
      extLink('Airbnb', links.airbnb(place, ctx.cin, ctx.cout, adults), 'btn small'),
      extLink('Hotels op Google Maps', links.gmapsNear('hotels', st.b), 'btn small'),
      extLink('Campings op Google Maps', links.gmapsNear('camping', st.b), 'btn small'),
      st.hut || st.max > 1800 ? extLink('Hutten op refuges.info', `https://www.refuges.info/nav?map=14/${st.b[1]}/${st.b[0]}`, 'btn small') : null,
      st.trail.includes('Via Francigena') ? extLink('Pelgrimsonderkomens (Gronze)', 'https://www.gronze.com/via-francigena', 'btn small') : null));
  const wrap = h('div', { class: 'stay-block' },
    st.tier === 3 || st.beds === 0 ? h('p', { class: 'warn-t' }, 'Bij dit eindpunt staat in OpenStreetMap geen hotel, pension of hostel. Zoek via de links hieronder of kies een adres onderweg.') : null,
    st.hut ? h('p', { class: 'warn-t' }, 'Dit is een hutovernachting. Reserveer vroeg: in juli en augustus zijn hutten weken tot maanden vooruit vol.') : null,
    chips, countEl, listEl, search,
    h('p', null, h('button', { class: 'btn small ghost', onclick: (e) => refresh(e.target) }, 'Ververs uit OpenStreetMap')));
  return { el: wrap, data, list: () => list };
}

export { FILTERS, badge };
