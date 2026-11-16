// Gedeelde schermonderdelen: etapperijen, maandbalk, klimaatgrafiek, hoogteprofiel.

import { h, km, meters, hours, num, MONTHS } from './util.js';
import { time } from './data.js';
import { state } from './store.js';
import { RATING } from './content.js';

export function badge(text, cls) { return h('span', { class: 'badge ' + (cls || '') }, text); }

export function stageBadges(st) {
  const t = time(st);
  const out = [];
  if (t.cls === 'long') out.push(badge('lange dag', 'warn'));
  if (t.cls === 'short') out.push(badge('korte dag', 'soft'));
  if (st.hut) out.push(badge('berghut', 'hut'));
  if (st.max >= 2000) out.push(badge('hooggebergte', 'hut'));
  if (st.tier === 2) out.push(badge(`slapen ${num(Math.round(st.off / 100) * 100)} m van de route`, 'soft'));
  if (st.tier === 3 || st.beds === 0) out.push(badge('alleen gîte of camping', 'warn'));
  else if (st.beds === 1) out.push(badge('1 adres', 'soft'));
  return out;
}

export function stageRow(st, n, extra) {
  const t = time(st);
  const done = !!state.done[st.id];
  return h('a', { class: 'stage-row' + (done ? ' done' : ''), href: `#/etappe/${st.id}` },
    h('span', { class: 'n' }, done ? '✓' : String(n)),
    h('span', { class: 'name' },
      h('strong', null, st.from, h('span', { class: 'arrow' }, ' → '), st.to),
      h('span', { class: 'sub' }, st.trail[0], st.rail ? ` · station ${st.rail.n}` : '', extra ? ` · ${extra}` : ''),
      h('span', { class: 'badges' }, stageBadges(st))),
    h('span', { class: 'fig' }, km(st.km)),
    h('span', { class: 'fig updown' }, `↑ ${num(st.up)}  ↓ ${num(st.down)}`),
    h('span', { class: 'fig time ' + t.cls }, hours(t.total)));
}

export function monthStrip(months, compact) {
  return h('div', { class: 'months' + (compact ? ' compact' : '') },
    months.map((r, i) => h('span', { class: 'm r' + r, title: `${MONTHS[i]}: ${RATING[r]}` }, compact ? MONTHS[i][0] : MONTHS[i])));
}

export function monthLegend() {
  return h('div', { class: 'legend' }, [3, 2, 1, 0].map((r) => h('span', null, h('i', { class: 'm r' + r }), RATING[r])));
}

// Klimaatgrafiek: band tussen gemiddelde minimum- en maximumtemperatuur, neerslag als staven.
export function climateChart(c) {
  const W = 560, H = 210, L = 34, R = 34, T = 14, B = 26;
  const iw = (W - L - R) / 12, ih = H - T - B;
  const tmin = Math.min(-5, Math.floor(Math.min(...c.tmin) / 5) * 5), tmax = Math.max(30, Math.ceil(Math.max(...c.tmax) / 5) * 5);
  const y = (t) => T + ih * (1 - (t - tmin) / (tmax - tmin));
  const pmax = Math.max(200, Math.ceil(Math.max(...c.rain) / 50) * 50);
  const x = (i) => L + iw * (i + 0.5);
  let s = `<svg viewBox="0 0 ${W} ${H}" class="climate" role="img" aria-label="Klimaat ${c.name}">`;
  for (let t = tmin; t <= tmax; t += 10) {
    s += `<line x1="${L}" x2="${W - R}" y1="${y(t)}" y2="${y(t)}" class="grid${t === 0 ? ' zero' : ''}"/><text x="${L - 6}" y="${y(t) + 4}" class="ax" text-anchor="end">${t}°</text>`;
  }
  c.rain.forEach((p, i) => {
    const bh = ih * p / pmax;
    s += `<rect x="${x(i) - iw * 0.3}" y="${T + ih - bh}" width="${iw * 0.6}" height="${bh}" class="rain"><title>${MONTHS[i]}: ${p} mm, ${c.wet[i]} regendagen${c.snow[i] ? `, ${c.snow[i]} cm sneeuw` : ''}</title></rect>`;
  });
  const top = c.tmax.map((t, i) => `${x(i)},${y(t)}`), bot = c.tmin.map((t, i) => `${x(i)},${y(t)}`).reverse();
  s += `<polygon points="${top.concat(bot).join(' ')}" class="band"/>`;
  s += `<polyline points="${top.join(' ')}" class="tmax"/><polyline points="${bot.join(' ')}" class="tmin"/>`;
  c.tmax.forEach((t, i) => {
    s += `<text x="${x(i)}" y="${y(t) - 5}" class="val" text-anchor="middle">${Math.round(t)}</text>`;
    s += `<text x="${x(i)}" y="${H - 8}" class="ax" text-anchor="middle">${MONTHS[i]}</text>`;
  });
  s += `<text x="${W - R + 6}" y="${T + 4}" class="ax">${pmax}</text><text x="${W - R + 6}" y="${T + ih}" class="ax">mm</text></svg>`;
  return h('figure', { class: 'climate-fig' },
    h('div', { html: s }),
    h('figcaption', null, `${c.name} (${num(c.ele)} m): gemiddelde dagtemperatuur van minimum tot maximum en neerslag per maand, 2016 tot 2025. Bron: Open-Meteo, ERA5.`));
}

// Hoogteprofiel met aanwijsbare positie. onHover krijgt de afstand in meters of null.
export function profile(prof, step, onHover) {
  const W = 800, H = 190, L = 44, R = 10, T = 12, B = 24;
  const n = prof.length;
  const lo = Math.min(...prof), hi = Math.max(...prof);
  const span = Math.max(120, hi - lo);
  const base = Math.floor((lo - span * 0.08) / 50) * 50, top = Math.ceil((hi + span * 0.08) / 50) * 50;
  const x = (i) => L + (W - L - R) * i / Math.max(1, n - 1);
  const y = (e) => T + (H - T - B) * (1 - (e - base) / (top - base));
  const totalKm = (n - 1) * step / 1000;
  const tickE = (top - base) > 1200 ? 500 : (top - base) > 500 ? 200 : 100;
  let s = `<svg viewBox="0 0 ${W} ${H}" class="profile" role="img" aria-label="Hoogteprofiel">`;
  for (let e = Math.ceil(base / tickE) * tickE; e <= top; e += tickE) {
    s += `<line x1="${L}" x2="${W - R}" y1="${y(e)}" y2="${y(e)}" class="grid"/><text x="${L - 6}" y="${y(e) + 4}" class="ax" text-anchor="end">${e}</text>`;
  }
  const tickK = totalKm > 20 ? 5 : totalKm > 8 ? 2 : 1;
  for (let k = 0; k <= totalKm; k += tickK) {
    const xi = L + (W - L - R) * k / totalKm;
    s += `<text x="${xi}" y="${H - 7}" class="ax" text-anchor="middle">${k}</text>`;
  }
  const line = prof.map((e, i) => `${x(i).toFixed(1)},${y(e).toFixed(1)}`).join(' ');
  s += `<polygon points="${L},${H - B} ${line} ${W - R},${H - B}" class="area"/><polyline points="${line}" class="line"/>`;
  s += `<line class="cursor" x1="0" x2="0" y1="${T}" y2="${H - B}" style="display:none"/><text class="cursor-t" x="0" y="${T + 10}" style="display:none"></text></svg>`;
  const wrap = h('div', { class: 'profile-wrap', html: s });
  const el = wrap.querySelector('svg'), cur = el.querySelector('.cursor'), txt = el.querySelector('.cursor-t');
  const move = (ev) => {
    const r = el.getBoundingClientRect();
    const cx = (ev.touches ? ev.touches[0].clientX : ev.clientX) - r.left;
    const fx = Math.min(1, Math.max(0, (cx / r.width * W - L) / (W - L - R)));
    const i = Math.round(fx * (n - 1));
    cur.setAttribute('x1', x(i)); cur.setAttribute('x2', x(i)); cur.style.display = '';
    txt.textContent = `${(i * step / 1000).toFixed(1)} km · ${prof[i]} m`;
    txt.setAttribute('x', Math.min(W - R - 110, Math.max(L + 4, x(i) + 6))); txt.style.display = '';
    if (onHover) onHover(i * step);
  };
  const leave = () => { cur.style.display = 'none'; txt.style.display = 'none'; if (onHover) onHover(null); };
  el.addEventListener('mousemove', move); el.addEventListener('touchmove', move, { passive: true });
  el.addEventListener('mouseleave', leave); el.addEventListener('touchend', leave);
  return wrap;
}

export function statGrid(items) {
  return h('dl', { class: 'stats' }, items.filter(Boolean).map(([label, value, sub]) =>
    h('div', null, h('dt', null, label), h('dd', null, value, sub ? h('small', null, sub) : null))));
}

export function variantStats(v) {
  const t = v.stages.reduce((s, st) => s + time(st).total, 0);
  return [
    ['Afstand', km(v.km)], ['Etappes', String(v.stages.length)], ['Stijgen', meters(v.up)],
    ['Hoogste punt', meters(v.max)], ['Gemiddelde dag', hours(t / v.stages.length)],
  ];
}

export function extLink(label, url, cls) {
  return h('a', { href: url, target: '_blank', rel: 'noopener', class: cls || 'ext' }, label);
}
