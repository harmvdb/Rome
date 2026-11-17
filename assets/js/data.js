// Routedata: secties, varianten en etappes, plus het lui laden van lijnen en overnachtingen.

import { state } from './store.js';

export let route = null;
const variantIdx = new Map();
const plans = new Map();
const BEDK = new Set(['hotel', 'guest_house', 'hostel', 'motel', 'alpine_hut']);

async function getJSON(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${url}: ${r.status}`);
  return r.json();
}

export async function init() {
  route = await getJSON('data/route.json');
  const all = [];
  for (const sec of route.sections) {
    for (const v of sec.variants) {
      v.section = sec;
      variantIdx.set(v.id, v);
      Object.defineProperty(v, 'stages', { get: () => stagesOf(v) });
      all.push(getJSON(`data/plan/${v.id}.json`).then((p) => plans.set(v.id, p)));
    }
  }
  await Promise.all(all);
}

export const variant = (id) => variantIdx.get(id);
export const section = (id) => route.sections.find((s) => s.id === id);

export function chosen(sec) {
  return sec.variants.find((v) => v.id === state.choice[sec.id]) || sec.variants.find((v) => v.recommended) || sec.variants[0];
}

// ---------- looptijd ----------

// Bergwandelformule: horizontaal en verticaal apart, de kleinste telt half. Pauzes komen erbij.
export function timeOf(km, up, down, p0) {
  const p = p0 || state.settings.pace;
  const th = km / p.flat;
  const tv = up / p.up + down / p.down;
  const walk = Math.max(th, tv) + Math.min(th, tv) / 2;
  return { walk, total: walk * (1 + p.pauseMin / 60) + p.lunchMin / 60 };
}

export function dayWindow(v) {
  if (v && v.hours) return { min: v.hours[0], max: v.hours[1], ideal: v.hours[2], net: false, fixed: true };
  const d = state.settings.day;
  const min = Math.min(d.min, d.max - 0.5), max = d.max;
  return { min, max, ideal: min + 0.55 * (max - min), net: !!d.net, fixed: false };
}

export function time(st) {
  const t = timeOf(st.km, st.up, st.down, st.variant.pace);
  const w = dayWindow(st.variant);
  const day = w.net ? t.walk : t.total;
  return { walk: t.walk, total: t.total, day, cls: day < w.min - 0.4 ? 'short' : day > w.max + 0.4 ? 'long' : 'ok' };
}

// ---------- etappes indelen ----------

const hm = (s) => Math.round(s / 100);

function at(arr, s) {
  const x = Math.min(arr.length - 1, Math.max(0, s / 100));
  const i = Math.floor(x), f = x - i;
  return i + 1 < arr.length ? arr[i] * (1 - f) + arr[i + 1] * f : arr[i];
}

function stopCost(b) {
  if (b.f) return 0;
  let c = b.q < 1.5 ? 0.9 : b.q < 2.5 ? 0.3 : b.q < 6 ? -0.2 : -0.4;
  if (b.t === 2) c += 0.6 + 0.0006 * b.off;
  if (b.t === 3) c += 1.8;
  if (b.pt === 'city' || b.pt === 'town') c -= 0.9;
  else if (b.pt === 'village') c -= 0.3;
  if (b.a) c -= 1.2;
  return c;
}

// Kies de stopplaatsen zo dat elke dag zo dicht mogelijk bij de gewenste duur ligt (dynamisch programmeren).
function split(plan, v) {
  const w = dayWindow(v);
  // Waar je werkelijk gestopt bent, ligt vast: de indeling van de rest begint daar.
  const fixed = new Set();
  for (const id of Object.keys(state.done)) {
    const m = /^(\w+):(\d+)-(\d+)$/.exec(id);
    if (m && m[1] === v.id) { fixed.add(Number(m[2])); fixed.add(Number(m[3])); }
  }
  const nodes = plan.stops.map((x) => (fixed.has(hm(x.s)) && !x.f ? { ...x, f: true } : x));
  const n = nodes.length;
  const best = new Array(n).fill(Infinity), prev = new Array(n).fill(-1);
  best[0] = 0;
  const scale = 1.4 * w.ideal / 7.4;
  for (let j = 1; j < n; j++) {
    for (let i = j - 1; i >= 0; i--) {
      if (nodes[j].s - nodes[i].s > 70000 && best[j] < Infinity) break;
      if (best[i] < Infinity) {
        const t = timeOf((nodes[j].s - nodes[i].s) / 1000, at(plan.up, nodes[j].s) - at(plan.up, nodes[i].s), at(plan.down, nodes[j].s) - at(plan.down, nodes[i].s), v.pace);
        const T = w.net ? t.walk : t.total;
        let c = ((T - w.ideal) / scale) ** 2 + stopCost(nodes[j]);
        if (T < w.min) c += 1 + 3 * (w.min - T) ** 2;
        if (T > w.max) c += 1.5 + 5 * (T - w.max) ** 2;
        if (T > w.max + 2.5) c += 200 + 80 * (T - w.max - 2.5);
        if (best[i] + c < best[j]) { best[j] = best[i] + c; prev[j] = i; }
      }
      if (nodes[i].f) break;
    }
  }
  const path = [n - 1];
  while (path[path.length - 1] > 0) path.push(prev[path[path.length - 1]]);
  return path.reverse();
}

const stageMemo = new Map();

function makeStage(v, a, b) {
  const id = `${v.id}:${hm(a.s)}-${hm(b.s)}`;
  if (stageMemo.has(id)) return stageMemo.get(id);
  const plan = plans.get(v.id);
  const i0 = Math.floor(a.s / 100), i1 = Math.min(plan.ele.length - 1, Math.ceil(b.s / 100));
  let lo = Infinity, hi = -Infinity;
  for (let i = i0; i <= i1; i++) { if (plan.ele[i] < lo) lo = plan.ele[i]; if (plan.ele[i] > hi) hi = plan.ele[i]; }
  const len = {};
  plan.segs.forEach(([s, t], k) => {
    const e = k + 1 < plan.segs.length ? plan.segs[k + 1][0] : plan.len;
    const o = Math.min(e, b.s) - Math.max(s, a.s);
    if (o > 0) len[t] = (len[t] || 0) + o;
  });
  const near = b.p.map(([, i]) => plan.pois[i]);
  const bedsNear = near.filter((p) => BEDK.has(p.k));
  const st = {
    id, variant: v, section: v.section, from: a.n, to: b.n, a: a.ll, b: b.ll, s0: a.s, s1: b.s, stop: b,
    km: Math.round((b.s - a.s) / 100) / 10,
    up: Math.round(at(plan.up, b.s) - at(plan.up, a.s)), down: Math.round(at(plan.down, b.s) - at(plan.down, a.s)),
    min: lo, max: hi,
    trail: Object.keys(len).sort((x, y) => len[y] - len[x]).map((t) => plan.trails[t]),
    beds: bedsNear.length, camp: near.filter((p) => p.k === 'camp_site').length,
    hut: bedsNear.length > 0 && bedsNear.every((p) => p.k === 'alpine_hut'),
    tier: b.t, off: b.off, rail: b.rail || null,
    shops: plan.supply.filter((x) => x.k === 'shop' && x.s >= a.s && x.s <= b.s).length,
    water: plan.supply.filter((x) => x.k === 'water' && x.s >= a.s && x.s <= b.s).length,
  };
  stageMemo.set(id, st);
  return st;
}

let splitKey = '';
const splitMemo = new Map();

function stagesOf(v) {
  const key = JSON.stringify([state.settings.pace, state.settings.day, Object.keys(state.done)]);
  if (key !== splitKey) { splitKey = key; splitMemo.clear(); }
  if (!splitMemo.has(v.id)) {
    const plan = plans.get(v.id);
    const path = split(plan, v);
    const list = [];
    for (let k = 1; k < path.length; k++) list.push(makeStage(v, plan.stops[path[k - 1]], plan.stops[path[k]]));
    splitMemo.set(v.id, list);
  }
  return splitMemo.get(v.id);
}

// Een etappe-id bevat variant en begin- en eindpunt. Daardoor blijft een opgeslagen etappe vindbaar, ook na een nieuwe indeling.
export function stage(id) {
  if (stageMemo.has(id)) return stageMemo.get(id);
  const m = /^(\w+):(\d+)-(\d+)$/.exec(id || '');
  if (!m || !variantIdx.has(m[1])) return undefined;
  const plan = plans.get(m[1]);
  const a = plan.stops.find((x) => hm(x.s) === Number(m[2])), b = plan.stops.find((x) => hm(x.s) === Number(m[3]));
  return a && b && b.s > a.s ? makeStage(variantIdx.get(m[1]), a, b) : undefined;
}

// Alle etappes van de gekozen route, met oplopende kilometerstand.
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

// Voortgang telt op de lijn zelf: een gelopen etappe blijft tellen als de indeling daarna verandert.
export function isDone(st) {
  if (state.done[st.id]) return true;
  for (const id of Object.keys(state.done)) {
    const d = stage(id);
    if (d && d.variant === st.variant && d.s0 <= st.s0 + 150 && d.s1 >= st.s1 - 150) return true;
  }
  return false;
}

export function totals() {
  const all = activeStages();
  const total = all.length ? all[all.length - 1].end : 0;
  let doneKm = 0, doneN = 0;
  for (const a of all) if (isDone(a.st)) { doneKm += a.st.km; doneN++; }
  const next = all.find((a) => !isDone(a.st)) || null;
  return { all, total, doneKm, doneN, next, up: all.reduce((s, a) => s + a.st.up, 0) };
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

const lineMemo = new Map();
export async function stageLine(st) {
  const plan = plans.get(st.variant.id);
  if (!lineMemo.has(plan.id)) lineMemo.set(plan.id, decode(plan.line));
  const all = lineMemo.get(plan.id);
  const pts = [], ele = [];
  for (let i = 0; i < all.length; i++) {
    if (plan.ls[i] < st.s0 - 1) continue;
    if (plan.ls[i] > st.s1 + 1) break;
    pts.push(all[i]); ele.push(Math.round(at(plan.ele, plan.ls[i])));
  }
  const prof = plan.ele.slice(Math.floor(st.s0 / 100), Math.ceil(st.s1 / 100) + 1);
  return { pts, ele, prof, step: 100 };
}

export async function stageStay(st) {
  const plan = plans.get(st.variant.id);
  const end = st.stop.p.map(([m, i]) => ({ ...plan.pois[i], m })).sort((x, y) => x.m - y.m);
  let along = plan.pois.filter((p) => BEDK.has(p.k) && p.d < 900 && p.s > st.s0 + 2500 && p.s < st.s1 - 2500)
    .map((p) => ({ ...p, km: Math.round((p.s - st.s0) / 100) / 10 })).sort((x, y) => x.km - y.km);
  if (along.length > 30) along = along.filter((_, i) => i % Math.ceil(along.length / 30) === 0);
  const sup = plan.supply.filter((x) => x.s >= st.s0 && x.s <= st.s1).map((x) => ({ ...x, km: Math.round((x.s - st.s0) / 100) / 10 }));
  const thin = (l, n) => (l.length > n ? l.filter((_, i) => i % Math.ceil(l.length / n) === 0) : l);
  return { end, along, shops: thin(sup.filter((x) => x.k === 'shop'), 12), water: thin(sup.filter((x) => x.k === 'water'), 15) };
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
