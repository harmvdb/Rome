// Reizen: een reeks etappes met datums, overnachtingen per nacht en de heen- en terugreis.

import { h, km, hours, num, euro, toast, fmtDate, addDays, todayISO, parseISO, uid, download, MONTHS_LONG } from '../util.js';
import { state, save } from '../store.js';
import { stage as getStage, totals, time, KIND, stageStay, isDone } from '../data.js';
import { RATING } from '../content.js';
import { statGrid, stageBadges, extLink, monthStrip } from '../components.js';
import { shareGPX, downloadGPX } from '../gpx.js';
import { stayBlock } from '../stays.js';
import * as links from '../links.js';
import { plan as planOV, MODE } from '../ov.js';
import { monthsForStages, bestMonthsText } from '../plan.js';

const STATUS = { open: 'Nog regelen', requested: 'Aangevraagd', booked: 'Geboekt' };

// ---------- reisadvies ----------

const clock = (iso) => new Date(iso).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
const dur = (s) => `${Math.floor(s / 3600)} u ${String(Math.round((s % 3600) / 60)).padStart(2, '0')}`;

export function travelPanel(from, to, dateISO, opts = {}) {
  const out = h('div', { class: 'ov-result' });
  const timeIn = h('input', { type: 'time', value: opts.time || '07:00', 'aria-label': 'Vertrektijd' });
  const dateIn = h('input', { type: 'date', value: dateISO || addDays(todayISO(), 14), 'aria-label': 'Reisdatum' });
  async function go(btn) {
    btn.disabled = true;
    out.replaceChildren(h('p', { class: 'muted' }, 'Verbindingen zoeken…'));
    try {
      const res = await planOV(from.ll, to.ll, dateIn.value, timeIn.value);
      if (!res.itineraries.length) {
        out.replaceChildren(h('p', { class: 'muted' }, 'Geen verbinding gevonden. Gebruik de reisplanners hierboven.'));
      } else {
        out.replaceChildren(
          res.proxy ? h('p', { class: 'warn-t' }, `De dienstregeling voor ${fmtDate(dateIn.value)} is nog niet bekend. Dit is een indicatie op basis van ${fmtDate(res.date)}, dezelfde weekdag.`) : h('p', { class: 'muted small' }, `Verbindingen op ${fmtDate(res.date)}.`),
          ...res.itineraries.slice(0, 4).map((it) => h('details', { class: 'itin' },
            h('summary', null,
              h('strong', null, `${clock(it.start)} → ${clock(it.end)}`), ` · ${dur(it.duration)} · ${it.transfers} keer overstappen`,
              h('span', { class: 'modes' }, ' ' + it.legs.filter((l) => l.mode !== 'WALK').map((l) => l.name || MODE[l.mode] || l.mode).join(' › '))),
            h('ol', null, it.legs.map((l) => h('li', null,
              h('span', { class: 'leg-t' }, `${clock(l.dep)} ${l.from}`), ' → ', h('span', { class: 'leg-t' }, `${clock(l.arr)} ${l.to}`),
              h('span', { class: 'muted' }, ` · ${MODE[l.mode] || l.mode}${l.name ? ' ' + l.name : ''}${l.headsign ? ' richting ' + l.headsign : ''}`)))))),
          h('p', { class: 'muted small' }, 'Bron: Transitous, open dienstregelingen. Controleer tijden en koop kaartjes bij de vervoerder.'));
      }
    } catch (e) {
      out.replaceChildren(h('p', { class: 'muted' }, 'De reisplanner reageert niet. Gebruik de links hierboven.'));
    }
    btn.disabled = false;
  }
  const ls = links.transitLinks(from, to);
  return h('div', { class: 'ov' },
    h('p', { class: 'ov-route' }, h('strong', null, links.plain(from.name)), ' → ', h('strong', null, links.plain(to.name))),
    h('div', { class: 'inline-form' }, dateIn, timeIn, h('button', { class: 'btn small primary', onclick: (e) => go(e.target) }, 'Zoek verbindingen')),
    out,
    h('div', { class: 'actions' }, ls.slice(0, 2).map((l) => extLink(l.label, l.url, 'btn small'))),
    h('p', { class: 'muted small' }, 'Kaartjes: ', ls.slice(2).map((l, i) => [i ? ', ' : '', extLink(l.label, l.url)]), '.'));
}

// ---------- reis opbouwen ----------

export function newTripFrom(st, count) {
  const all = totals().all.map((a) => a.st);
  const i = Math.max(0, all.findIndex((s) => s.id === st.id));
  const n = Math.min(count || state.settings.perTrip || 8, all.length - i);
  const stages = all.slice(i, i + n);
  const months = monthsForStages(stages);
  // eerste geschikte maand vanaf volgende maand
  const now = new Date();
  let start = null;
  for (let k = 1; k <= 18 && !start; k++) {
    const d = new Date(now.getFullYear(), now.getMonth() + k, 1, 12);
    if (months[d.getMonth()] >= 2) { while (d.getDay() !== 6) d.setDate(d.getDate() + 1); start = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
  }
  const trip = {
    id: uid(), name: `${stages[0].from} → ${stages[stages.length - 1].to}`, start: start || addDays(todayISO(), 60),
    stages: stages.map((s) => s.id), rest: {}, eve: true, lastNight: true, nights: {}, travel: { out: { status: 'open', note: '' }, back: { status: 'open', note: '' } }, note: '',
  };
  state.trips.push(trip);
  save();
  location.hash = `#/reis/${trip.id}`;
}

function schedule(trip) {
  const stages = trip.stages.map(getStage).filter(Boolean);
  const days = [];
  let date = trip.start;
  if (trip.eve && stages.length) {
    days.push({ type: 'travel-out', date: addDays(date, -1) });
    days.push({ type: 'night', key: 'pre', date: addDays(date, -1), place: stages[0].from, ll: stages[0].a, stayOf: prevStage(stages[0]), first: stages[0] });
  } else if (stages.length) {
    days.push({ type: 'travel-out', date });
  }
  stages.forEach((st, i) => {
    days.push({ type: 'stage', date, st, i });
    const last = i === stages.length - 1;
    if (!last || trip.lastNight) days.push({ type: 'night', key: st.id, date, place: st.to, ll: st.b, stayOf: st });
    if (trip.rest[st.id] && !last) {
      date = addDays(date, 1);
      days.push({ type: 'rest', date, st });
      days.push({ type: 'night', key: 'rest:' + st.id, date, place: st.to, ll: st.b, stayOf: st, rest: true });
    }
    if (!last) date = addDays(date, 1);
  });
  const back = trip.lastNight ? addDays(date, 1) : date;
  if (stages.length) days.push({ type: 'travel-back', date: back });
  return { stages, days, end: back, first: days.length ? days[0].date : trip.start };
}

function prevStage(st) {
  const all = totals().all.map((a) => a.st);
  const i = all.findIndex((s) => s.id === st.id);
  return i > 0 ? all[i - 1] : null;
}

function icsFor(trip) {
  const { days } = schedule(trip);
  const d8 = (iso) => iso.replace(/-/g, '');
  const esc = (s) => String(s).replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n');
  const ev = [];
  let n = 0;
  for (const d of days) {
    let sum = null, loc = '', desc = '';
    if (d.type === 'travel-out') sum = `Heenreis naar ${getStage(trip.stages[0]).from}`;
    if (d.type === 'travel-back') sum = `Terugreis vanaf ${getStage(trip.stages[trip.stages.length - 1]).to}`;
    if (d.type === 'rest') sum = `Rustdag in ${d.st.to}`;
    if (d.type === 'stage') {
      const t = time(d.st);
      sum = `Etappe ${d.i + 1}: ${d.st.from} - ${d.st.to}`;
      desc = `${d.st.km} km, ${d.st.up} m stijgen, ${d.st.down} m dalen, ongeveer ${hours(t.total)} met pauzes.`;
      const night = trip.nights[d.st.id];
      if (night && night.poi) { loc = `${night.poi.n}, ${d.st.to}`; desc += ` Overnachting: ${night.poi.n} (${STATUS[night.status || 'open']}).`; }
    }
    if (!sum) continue;
    ev.push(['BEGIN:VEVENT', `UID:${trip.id}-${n++}@trier-rome`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`,
      `DTSTART;VALUE=DATE:${d8(d.date)}`, `DTEND;VALUE=DATE:${d8(addDays(d.date, 1))}`, `SUMMARY:${esc(sum)}`,
      loc ? `LOCATION:${esc(loc)}` : null, desc ? `DESCRIPTION:${esc(desc)}` : null, 'END:VEVENT'].filter(Boolean).join('\r\n'));
  }
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Trier naar Rome//NL', 'CALSCALE:GREGORIAN', ...ev, 'END:VCALENDAR'].join('\r\n');
}

// ---------- schermen ----------

export function viewTrips(root, rerender) {
  const t = totals();
  const all = t.all.map((a) => a.st);
  const def = t.next ? t.next.st.id : all[0].id;
  const startSel = h('select', { id: 'trip-start' }, t.all.map((a) => h('option', { value: a.st.id, selected: a.st.id === def }, `${a.n}. ${a.st.from} → ${a.st.to}${isDone(a.st) ? ' (gelopen)' : ''}`)));
  const countSel = h('select', { id: 'trip-count' }, [5, 6, 7, 8, 9, 10].map((n) => h('option', { value: n, selected: n === (state.settings.perTrip || 8) }, `${n} etappes`)));
  const preview = h('p', { class: 'muted small' });
  const upd = () => {
    const i = all.findIndex((s) => s.id === startSel.value);
    const sel = all.slice(i, i + Number(countSel.value));
    if (!sel.length) return;
    preview.replaceChildren(`${sel[0].from} → ${sel[sel.length - 1].to}: ${km(sel.reduce((s, x) => s + x.km, 0))}, ↑ ${num(sel.reduce((s, x) => s + x.up, 0))} m. Beste tijd: ${bestMonthsText(monthsForStages(sel))}.`);
  };
  startSel.onchange = upd; countSel.onchange = upd; upd();

  root.append(
    h('header', { class: 'page-head' },
      h('h1', null, 'Reizen'),
      h('p', { class: 'lead' }, 'Een reis is een aaneengesloten reeks etappes met datums, overnachtingen en vervoer.')),
    h('section', { class: 'card form' },
      h('h2', null, 'Nieuwe reis'),
      h('div', { class: 'grid-form' },
        h('label', null, 'Eerste etappe', startSel),
        h('label', null, 'Aantal etappes', countSel)),
      preview,
      h('div', { class: 'cta' },
        h('button', { class: 'btn primary', onclick: () => newTripFrom(getStage(startSel.value), Number(countSel.value)) }, 'Maak reis'),
        h('a', { class: 'btn', href: '#/wanneer' }, 'Bekijk het voorstel voor alle reizen'))),
    h('section', null,
      h('h2', null, state.trips.length ? 'Mijn reizen' : 'Nog geen reizen'),
      h('div', { class: 'plan-list' }, state.trips.slice().sort((a, b) => a.start.localeCompare(b.start)).map((trip) => {
        const s = schedule(trip);
        const nights = s.days.filter((d) => d.type === 'night');
        const booked = nights.filter((d) => (trip.nights[d.key] || {}).status === 'booked').length;
        return h('a', { class: 'card plan link', href: `#/reis/${trip.id}` },
          h('header', null, h('span', { class: 'plan-n' }, fmtDate(s.first, 'short') + ' tot ' + fmtDate(s.end)), h('h3', null, trip.name)),
          h('p', { class: 'figs' }, `${s.stages.length} etappes · ${km(s.stages.reduce((x, st) => x + st.km, 0))} · ${booked} van ${nights.length} nachten geboekt`),
          h('div', { class: 'progress thin' }, h('i', { style: { width: (nights.length ? booked / nights.length * 100 : 0) + '%' } })));
      }))));
}

function nightRow(trip, d, rerender) {
  const rec = trip.nights[d.key] || (trip.nights[d.key] = { status: 'open', price: '', note: '', poi: null });
  const cin = d.date, cout = addDays(d.date, 1);
  const panel = h('div', { class: 'night-panel' });
  let open = false;
  const pick = (p) => {
    rec.poi = { id: p.id, n: p.n, k: p.k, lat: p.lat, lon: p.lon, web: p.web || '', tel: p.tel || '', mail: p.mail || '' };
    save(); toast(`${p.n} gekozen`); rerender();
  };
  async function toggle(btn) {
    open = !open;
    if (!open) { panel.replaceChildren(); btn.textContent = rec.poi ? 'Wijzig adres' : 'Kies een adres'; return; }
    btn.textContent = 'Sluit';
    panel.replaceChildren(h('p', { class: 'muted' }, 'Adressen laden…'));
    const nameIn = h('input', { type: 'text', placeholder: 'Naam van het adres' });
    const urlIn = h('input', { type: 'url', placeholder: 'Link (optioneel)' });
    const own = h('div', { class: 'inline-form own' }, nameIn, urlIn,
      h('button', { class: 'btn small', onclick: () => { if (nameIn.value.trim()) pick({ id: 'own-' + uid(), n: nameIn.value.trim(), k: 'own', web: urlIn.value.trim() }); } }, 'Gebruik eigen adres'));
    if (d.stayOf) {
      const sb = await stayBlock(d.stayOf, { cin, cout, onPick: pick, pickedId: rec.poi && rec.poi.id });
      panel.replaceChildren(sb.el, h('h4', null, 'Zelf iets gevonden?'), own);
    } else {
      panel.replaceChildren(
        h('p', { class: 'muted' }, `Voor ${d.place} staan geen adressen klaar. Zoek via deze links:`),
        h('div', { class: 'actions' },
          extLink('Booking.com met je datums', links.bookingArea(d.place, d.ll, cin, cout, state.settings.adults), 'btn small primary'),
          extLink('Airbnb', links.airbnb(d.place, cin, cout, state.settings.adults), 'btn small'),
          extLink('Hotels op Google Maps', links.gmapsNear('hotels', d.ll), 'btn small')),
        h('h4', null, 'Gevonden?'), own);
    }
  }
  const k = rec.poi ? (KIND[rec.poi.k] || { label: 'Eigen adres' }) : null;
  const web = rec.poi && rec.poi.web ? (/^https?:/.test(rec.poi.web) ? rec.poi.web : 'https://' + rec.poi.web) : '';
  return h('div', { class: 'day night st-' + (rec.status || 'open') },
    h('div', { class: 'day-date' }, h('span', { class: 'moon' }, '☾')),
    h('div', { class: 'day-body' },
      h('div', { class: 'night-head' },
        h('div', null,
          h('p', { class: 'night-t' }, d.rest ? 'Tweede nacht in ' : d.key === 'pre' ? 'Nacht voor vertrek in ' : 'Nacht in ', h('strong', null, d.place)),
          rec.poi ? h('p', { class: 'night-poi' }, h('strong', null, rec.poi.n), ` · ${k.label}`,
            web ? [' · ', extLink('site', web)] : null,
            rec.poi.tel ? [' · ', h('a', { href: `tel:${rec.poi.tel.replace(/[^+\d]/g, '')}` }, rec.poi.tel)] : null,
            rec.poi.k !== 'own' && rec.poi.k !== 'alpine_hut' ? [' · ', extLink('Booking.com', links.bookingName(rec.poi.n, d.place, cin, cout, state.settings.adults))] : null,
            rec.poi.k !== 'own' ? [' · ', extLink('beoordelingen', links.gmapsPlace(rec.poi.n, d.place))] : null)
            : h('p', { class: 'night-poi muted' }, 'Nog geen adres gekozen')),
        h('div', { class: 'night-ctl' },
          h('select', { 'aria-label': 'Status', onchange: (e) => { rec.status = e.target.value; save(); rerender(); } },
            Object.entries(STATUS).map(([v, l]) => h('option', { value: v, selected: (rec.status || 'open') === v }, l))),
          h('input', { type: 'number', min: '0', step: '1', placeholder: '€', 'aria-label': 'Prijs in euro', value: rec.price, onchange: (e) => { rec.price = e.target.value; save(); rerender(); } }),
          h('button', { class: 'btn small', onclick: (e) => toggle(e.target) }, rec.poi ? 'Wijzig adres' : 'Kies een adres'))),
      h('input', { class: 'note-in', type: 'text', placeholder: 'Notitie: bevestigingsnummer, aankomsttijd, ontbijt…', value: rec.note || '', onchange: (e) => { rec.note = e.target.value; save(); } }),
      panel));
}

function travelRow(trip, d, s) {
  const out = d.type === 'travel-out';
  const rec = trip.travel[out ? 'out' : 'back'];
  const first = s.stages[0], last = s.stages[s.stages.length - 1];
  const home = { name: state.settings.home, ll: state.settings.homeLL };
  const from = out ? home : { name: last.to, ll: last.b };
  const to = out ? { name: first.from, ll: first.a } : home;
  return h('div', { class: 'day travel st-' + (rec.status || 'open') },
    h('div', { class: 'day-date' }, h('strong', null, fmtDate(d.date, 'short'))),
    h('div', { class: 'day-body' },
      h('div', { class: 'night-head' },
        h('h3', null, out ? 'Heenreis' : 'Terugreis'),
        h('div', { class: 'night-ctl' },
          h('select', { 'aria-label': 'Status', onchange: (e) => { rec.status = e.target.value; save(); } },
            Object.entries(STATUS).map(([v, l]) => h('option', { value: v, selected: (rec.status || 'open') === v }, l))),
          h('input', { type: 'number', min: '0', placeholder: '€', 'aria-label': 'Prijs in euro', value: rec.price || '', onchange: (e) => { rec.price = e.target.value; save(); } }))),
      travelPanel(from, to, d.date, { time: out ? '07:00' : '09:00' }),
      !out && last.rail ? h('p', { class: 'muted small' }, `Station ${last.rail.n} ligt ${num(last.rail.m)} m van het eindpunt.`) : null,
      !out && !last.rail ? h('p', { class: 'warn-t' }, 'Geen station bij het eindpunt. Zoek een bus of reserveer een taxi.') : null,
      h('input', { class: 'note-in', type: 'text', placeholder: 'Notitie: treinnummers, reservering, zitplaats…', value: rec.note || '', onchange: (e) => { rec.note = e.target.value; save(); } })));
}

export function viewTrip(root, id, rerender) {
  const trip = state.trips.find((t) => t.id === id);
  if (!trip) { root.append(h('p', null, 'Reis niet gevonden. ', h('a', { href: '#/reizen' }, 'Terug naar reizen'))); return; }
  const s = schedule(trip);
  const nights = s.days.filter((d) => d.type === 'night');
  const booked = nights.filter((d) => (trip.nights[d.key] || {}).status === 'booked').length;
  const cost = nights.reduce((x, d) => x + (Number((trip.nights[d.key] || {}).price) || 0), 0) + (Number(trip.travel.out.price) || 0) + (Number(trip.travel.back.price) || 0);
  const months = monthsForStages(s.stages);
  const mIdx = parseISO(trip.start).getMonth();
  const rating = months[mIdx];
  const all = totals().all.map((a) => a.st);
  const lastIdx = all.findIndex((x) => x.id === trip.stages[trip.stages.length - 1]);
  const nextStage = lastIdx >= 0 ? all[lastIdx + 1] : null;
  const longDays = s.stages.filter((st) => time(st).cls === 'long');
  const huts = s.stages.filter((st) => st.hut);
  const totalH = s.stages.reduce((x, st) => x + time(st).total, 0);

  root.append(
    h('nav', { class: 'crumbs' }, h('a', { href: '#/reizen' }, 'Reizen'), ' / ', trip.name),
    h('header', { class: 'page-head' },
      h('p', { class: 'eyebrow' }, `${fmtDate(s.first)} tot ${fmtDate(s.end)}`),
      h('input', { class: 'title-in', type: 'text', value: trip.name, 'aria-label': 'Naam van de reis', onchange: (e) => { trip.name = e.target.value || trip.name; save(); } })),
    statGrid([
      ['Etappes', String(s.stages.length)], ['Afstand', km(s.stages.reduce((x, st) => x + st.km, 0))],
      ['Stijgen', num(s.stages.reduce((x, st) => x + st.up, 0)) + ' m'], ['Gemiddelde dag', s.stages.length ? hours(totalH / s.stages.length) : ''],
      ['Nachten geboekt', `${booked} van ${nights.length}`], ['Kosten tot nu', euro(cost)],
    ]),
    h('section', { class: 'card form no-print' },
      h('div', { class: 'grid-form' },
        h('label', null, 'Eerste wandeldag', h('input', { type: 'date', value: trip.start, onchange: (e) => { if (e.target.value) { trip.start = e.target.value; save(); rerender(); } } })),
        h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: trip.eve, onchange: (e) => { trip.eve = e.target.checked; save(); rerender(); } }), 'Dag eerder aanreizen en bij de start slapen'),
        h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: trip.lastNight, onchange: (e) => { trip.lastNight = e.target.checked; save(); rerender(); } }), 'Na de laatste etappe overnachten, dag erna terugreizen')),
      h('div', { class: 'cta wrap' },
        nextStage && trip.stages.length < 10 ? h('button', { class: 'btn', onclick: () => { trip.stages.push(nextStage.id); save(); rerender(); } }, `+ Etappe erbij: ${nextStage.to}`) : null,
        trip.stages.length > 1 ? h('button', { class: 'btn', onclick: () => { const r = trip.stages.pop(); delete trip.rest[r]; save(); rerender(); } }, '− Laatste etappe eraf') : null,
        h('button', { class: 'btn', onclick: async () => { for (const [i, st] of s.stages.entries()) { await downloadGPX(st, all.findIndex((x) => x.id === st.id) + 1); await new Promise((r) => setTimeout(r, 400)); } } }, 'Download alle GPX'),
        h('button', { class: 'btn', onclick: () => download(`reis-${trip.start}.ics`, icsFor(trip), 'text/calendar') }, 'Zet in agenda (.ics)'),
        h('button', { class: 'btn', onclick: () => window.print() }, 'Print reisplan'),
        h('button', { class: 'btn danger', onclick: () => { if (confirm('Deze reis verwijderen?')) { state.trips = state.trips.filter((t) => t.id !== trip.id); save(); location.hash = '#/reizen'; } } }, 'Verwijder reis'))),
    h('section', { class: 'checks' },
      h('h2', null, 'Controle'),
      h('ul', { class: 'checklist' },
        h('li', { class: rating >= 2 ? 'ok' : rating === 1 ? 'mid' : 'bad' },
          h('strong', null, `Seizoen: ${MONTHS_LONG[mIdx]} is ${RATING[rating].toLowerCase()}. `), `Beste tijd voor deze etappes: ${bestMonthsText(months)}.`, monthStrip(months, true)),
        huts.length ? h('li', { class: 'mid' }, h('strong', null, `${huts.length} hutnachten. `), 'Reserveer deze als eerste. Rond de Mont Blanc gaan boekingen maanden vooraf open.') : null,
        longDays.length ? h('li', { class: 'mid' }, h('strong', null, `${longDays.length} lange ${longDays.length === 1 ? 'dag' : 'dagen'}: `), longDays.map((st) => `${st.from} → ${st.to} (${hours(time(st).total)})`).join(', '), '. Bekijk bij die etappe de adressen onderweg om in te korten.') : null,
        h('li', { class: booked === nights.length && nights.length ? 'ok' : 'mid' }, h('strong', null, `${booked} van ${nights.length} nachten geboekt. `), booked < nights.length ? 'Open nachten staan hieronder gemarkeerd.' : 'Alles rond.'),
        h('li', { class: trip.travel.out.status === 'booked' && trip.travel.back.status === 'booked' ? 'ok' : 'mid' }, h('strong', null, 'Vervoer: '), `heenreis ${STATUS[trip.travel.out.status || 'open'].toLowerCase()}, terugreis ${STATUS[trip.travel.back.status || 'open'].toLowerCase()}.`))),
    h('section', null,
      h('h2', null, 'Dag voor dag'),
      h('div', { class: 'days' }, s.days.map((d) => {
        if (d.type === 'travel-out' || d.type === 'travel-back') return travelRow(trip, d, s);
        if (d.type === 'night') return nightRow(trip, d, rerender);
        if (d.type === 'rest') return h('div', { class: 'day rest' }, h('div', { class: 'day-date' }, h('strong', null, fmtDate(d.date, 'short'))), h('div', { class: 'day-body' }, h('h3', null, `Rustdag in ${d.st.to}`),
          h('button', { class: 'btn small ghost no-print', onclick: () => { delete trip.rest[d.st.id]; delete trip.nights['rest:' + d.st.id]; save(); rerender(); } }, 'Rustdag verwijderen')));
        const st = d.st, t = time(st), n = all.findIndex((x) => x.id === st.id) + 1;
        return h('div', { class: 'day walk' },
          h('div', { class: 'day-date' }, h('strong', null, fmtDate(d.date, 'short')), h('span', null, `dag ${d.i + 1}`)),
          h('div', { class: 'day-body' },
            h('h3', null, h('a', { href: `#/etappe/${st.id}` }, `${st.from} → ${st.to}`)),
            h('p', { class: 'figs' }, `${km(st.km)} · ↑ ${num(st.up)} m · ↓ ${num(st.down)} m · `, h('span', { class: 'time ' + t.cls }, hours(t.total)), ` met pauzes · ${st.trail[0]}`),
            h('p', { class: 'badges' }, stageBadges(st)),
            h('div', { class: 'actions no-print' },
              h('button', { class: 'btn small primary', onclick: () => shareGPX(st, n) }, 'Stuur naar Garmin'),
              h('button', { class: 'btn small', onclick: () => downloadGPX(st, n) }, 'GPX'),
              h('a', { class: 'btn small', href: `#/etappe/${st.id}` }, 'Kaart en profiel'),
              d.i < s.stages.length - 1 && !trip.rest[st.id] ? h('button', { class: 'btn small ghost', onclick: () => { trip.rest[st.id] = true; save(); rerender(); } }, '+ Rustdag hierna') : null)));
      }))),
    h('section', { class: 'card form' },
      h('h2', null, 'Notities bij deze reis'),
      h('textarea', { rows: 4, placeholder: 'Paklijst, afspraken, dingen om na te bellen…', oninput: (e) => { trip.note = e.target.value; save(); } }, trip.note || '')));
}

export { stageStay };
