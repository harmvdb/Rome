// Routedata: secties, varianten en etappes, plus het lui laden van lijnen en overnachtingen.

import { state } from './store.js';

export let route = null;
const stageIdx = new Map();
const variantIdx = new Map();
const cache = { geo: new Map(), stay: new Map() };

async function getJSON(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${url}: ${r.status}`);
  return r.json();
}

export async function init() {
  route = await getJSON('data/route.json');
  for (const sec of route.sections) {
    for (const v of sec.variants) {
      v.section = sec;
      variantIdx.set(v.id, v);
      v.stages.forEach((st, i) => { st.variant = v; st.section = sec; st.i = i; stageIdx.set(st.id, st); });
    }
  }
}

export const stage = (id) => stageIdx.get(id);
export const variant = (id) => variantIdx.get(id);
export const section = (id) => route.sections.find((s) => s.id === id);

export function chosen(sec) {
  return sec.variants.find((v) => v.id === state.choice[sec.id]) || sec.variants.find((v) => v.recommended) || sec.variants[0];
}

// Alle etappes van de gekozen route, van Trier tot Rome, met oplopende kilometerstand.
export function activeStages() {
  const out = [];
  let cum = 0;
  for (const sec of route.sections) {
    for (const st of chosen(sec).stages) {
      out.push({ st, start: cum, end: cum + st.km, n: out.length + 1 });
      cum += st.km;
    }
  }
  return out;
}

export function totals() {
  const all = activeStages();
  const total = all.length ? all[all.length - 1].end : 0;
  let doneKm = 0, doneN = 0;
  for (const a of all) if (state.done[a.st.id]) { doneKm += a.st.km; doneN++; }
  const next = all.find((a) => !state.done[a.st.id]) || null;
  return { all, total, doneKm, doneN, next, up: all.reduce((s, a) => s + a.st.up, 0) };
}

// Looptijd volgens de bergwandelformule: horizontaal en verticaal apart, de kleinste telt half.
export function time(st) {
  const p = state.settings.pace;
  const th = st.km / p.flat;
  const tv = st.up / p.up + st.down / p.down;
  const walk = Math.max(th, tv) + Math.min(th, tv) / 2;
  const total = walk * (1 + p.pauseMin / 60) + p.lunchMin / 60;
  return { walk, total, cls: total < 5.6 ? 'short' : total > 9.4 ? 'long' : 'ok' };
}

export async function geo(variantId) {
  if (!cache.geo.has(variantId)) cache.geo.set(variantId, getJSON(`data/geo/${variantId}.json`));
  return cache.geo.get(variantId);
}
export async function stay(variantId) {
  if (!cache.stay.has(variantId)) cache.stay.set(variantId, getJSON(`data/stay/${variantId}.json`));
  return cache.stay.get(variantId);
}

export function decode(str) {
  const out = [];
  let i = 0, lat = 0, lon = 0;
  while (i < str.length) {
    for (const which of [0, 1]) {
      let shift = 0, result = 0, b;
      do { b = str.charCodeAt(i++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
      const d = result & 1 ? ~(result >> 1) : result >> 1;
      if (which === 0) lat += d; else lon += d;
    }
    out.push([lat / 1e5, lon / 1e5]);
  }
  return out;
}

export async function stageLine(st) {
  const g = (await geo(st.variant.id))[st.id];
  const pts = decode(g.line);
  return { pts, ele: g.ele, prof: g.prof, step: g.step };
}

export async function stageStay(st) {
  return (await stay(st.variant.id))[st.id] || { end: [], along: [], shops: [], water: [] };
}

export const KIND = {
  hotel: { label: 'Hotel', c: '#b5482a', bed: true },
  guest_house: { label: 'Pension of B&B', c: '#c77b2c', bed: true },
  hostel: { label: 'Hostel of herberg', c: '#7a5aa6', bed: true },
  motel: { label: 'Motel', c: '#b5482a', bed: true },
  alpine_hut: { label: 'Berghut', c: '#2f5d7c', bed: true },
  wilderness_hut: { label: 'Onbemande hut', c: '#6b7f8c', bed: false },
  camp_site: { label: 'Camping', c: '#5f6b3a', bed: false },
  chalet: { label: 'Gîte of vakantiehuis', c: '#8a7f6a', bed: false },
  apartment: { label: 'Appartement', c: '#8a7f6a', bed: false },
};
