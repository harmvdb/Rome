// Tempokalibratie: leid wandeltempo en pauzegedrag af uit echte wandelingen (handmatig, Garmin-CSV of GPX).

import { state, save } from './store.js';
import { timeOf } from './data.js';
import { hav, uid } from './util.js';

// ---------- invoer ----------

function hoursFrom(txt) {
  if (!txt) return 0;
  const p = String(txt).trim().split(':').map((x) => parseFloat(x.replace(',', '.')));
  if (p.some(Number.isNaN)) return 0;
  if (p.length === 3) return p[0] + p[1] / 60 + p[2] / 3600;
  if (p.length === 2) return p[0] / 60 + p[1] / 3600;
  return p[0];
}

function numFrom(txt, integer) {
  if (txt === undefined || txt === null) return 0;
  let t = String(txt).trim().replace(/[^\d.,-]/g, '');
  if (!t || t === '--') return 0;
  if (integer) return parseInt(t.replace(/[.,]/g, ''), 10) || 0;
  if (/^\d{1,3}([.,]\d{3})+$/.test(t)) t = t.replace(/[.,]/g, '');       // duizendtallen
  else if (t.includes(',') && t.includes('.')) t = t.lastIndexOf(',') > t.lastIndexOf('.') ? t.replace(/\./g, '').replace(',', '.') : t.replace(/,/g, '');
  else t = t.replace(',', '.');
  return parseFloat(t) || 0;
}

function csvRows(text) {
  const rows = [];
  let row = [], cell = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; } else if (c === '"') q = false; else cell += c;
    } else if (c === '"') q = true;
    else if (c === ',' || c === ';') { row.push(cell); cell = ''; }
    else if (c === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
    else if (c !== '\r') cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

// Activiteitenlijst uit Garmin Connect (Activiteiten, Exporteer CSV). Werkt met Nederlandse en Engelse kolomnamen.
export function parseGarminCSV(text) {
  const rows = csvRows(text.replace(/^﻿/, ''));
  if (rows.length < 2) throw new Error('Dit bestand bevat geen activiteiten.');
  const head = rows[0].map((h) => h.trim().toLowerCase());
  const col = (re, not) => head.findIndex((h) => re.test(h) && !(not && not.test(h)));
  const c = {
    type: col(/type/), date: col(/^(datum|date)/), title: col(/^(titel|title)/), km: col(/^(afstand|distance)/),
    time: col(/^(tijd|time)$/), moving: col(/beweging|moving/), elapsed: col(/verstreken|elapsed/),
    up: col(/stijging|ascent/), down: col(/daling|descent/),
  };
  if (c.km < 0 || c.type < 0) throw new Error('De kolommen Afstand en Activiteittype ontbreken. Is dit de CSV-export van de activiteitenlijst?');
  const out = [];
  for (const r of rows.slice(1)) {
    if (!/wandel|hik|walk|trek/i.test(r[c.type] || '')) continue;
    const km = numFrom(r[c.km]);
    const moving = hoursFrom(r[c.moving]) || hoursFrom(r[c.time]);
    const total = hoursFrom(r[c.elapsed]) || hoursFrom(r[c.time]) || moving;
    if (km < 8 || moving < 1.5) continue;
    out.push({ id: uid(), date: (r[c.date] || '').slice(0, 10), name: r[c.title] || r[c.type], km, up: numFrom(r[c.up], true), down: numFrom(r[c.down], true), moving, total: Math.max(total, moving), src: 'garmin' });
  }
  return out;
}

// GPX van een gelopen wandeling, met tijdstempels.
export function parseGPX(text, fileName) {
  const doc = new DOMParser().parseFromString(text, 'application/xml');
  const pts = [...doc.getElementsByTagName('trkpt')].map((p) => ({
    ll: [parseFloat(p.getAttribute('lat')), parseFloat(p.getAttribute('lon'))],
    ele: parseFloat((p.getElementsByTagName('ele')[0] || {}).textContent),
    t: Date.parse((p.getElementsByTagName('time')[0] || {}).textContent),
  })).filter((p) => !Number.isNaN(p.ll[0]));
  if (pts.length < 10 || Number.isNaN(pts[0].t)) throw new Error(`${fileName}: geen track met tijden gevonden.`);
  let dist = 0, moving = 0;
  for (let i = 1; i < pts.length; i++) {
    const d = hav(pts[i - 1].ll, pts[i].ll), dt = (pts[i].t - pts[i - 1].t) / 1000;
    dist += d;
    if (dt > 0 && dt < 300 && d / dt > 0.25) moving += dt;   // sneller dan 0,9 km per uur telt als lopen
  }
  const e = pts.map((p) => p.ele).filter((x) => !Number.isNaN(x));
  let up = 0, down = 0;
  if (e.length > 10) {
    const sm = e.map((_, i) => { const a = e.slice(Math.max(0, i - 3), i + 4); return a.reduce((s, x) => s + x, 0) / a.length; });
    let ref = sm[0];
    for (const v of sm) { if (v - ref > 3) { up += v - ref; ref = v; } else if (ref - v > 3) { down += ref - v; ref = v; } }
  }
  const nameEl = doc.getElementsByTagName('name')[0];
  return { id: uid(), date: new Date(pts[0].t).toISOString().slice(0, 10), name: (nameEl && nameEl.textContent) || fileName, km: dist / 1000, up: Math.round(up), down: Math.round(down),
    moving: moving / 3600, total: (pts[pts.length - 1].t - pts[0].t) / 3600e3, src: 'gpx' };
}

export function addLogs(list) {
  const key = (l) => `${l.date}|${Math.round(l.km)}|${Math.round(l.moving * 10)}`;
  const have = new Set(state.logs.map(key));
  let n = 0;
  for (const l of list) if (!have.has(key(l))) { state.logs.push(l); have.add(key(l)); n++; }
  state.logs.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  save();
  return n;
}

// ---------- model passen ----------

// Zoek het tempo dat de gemeten looptijden het best verklaart. Dalen blijft gekoppeld aan stijgen (verhouding 5 op 3).
export function fit(logs = state.logs) {
  const use = logs.filter((l) => l.km >= 8 && l.moving > 1 && !l.skip);
  if (!use.length) return null;
  const cur = state.settings.pace;
  const err = (flat, up) => use.reduce((s, l) => s + ((timeOf(l.km, l.up, l.down, { flat, up, down: up * 5 / 3, pauseMin: 0, lunchMin: 0 }).walk - l.moving) / l.moving) ** 2, 0) / use.length;
  const climb = use.map((l) => l.up / l.km);
  const spread = Math.max(...climb) - Math.min(...climb);
  let best;
  if (use.length >= 4 && spread >= 12) {
    best = { e: Infinity };
    for (let flat = 3; flat <= 6.5; flat += 0.05) for (let up = 200; up <= 800; up += 10) { const e = err(flat, up); if (e < best.e) best = { e, flat, up }; }
    best.mode = 'vol';
  } else {
    // te weinig variatie in hoogtemeters: schaal het huidige tempo als geheel
    const f = use.reduce((s, l) => s + timeOf(l.km, l.up, l.down, cur).walk, 0) / use.reduce((s, l) => s + l.moving, 0);
    best = { flat: cur.flat * f, up: cur.up * f, mode: 'schaal' };
    best.e = err(best.flat, best.up);
  }
  const mov = use.reduce((s, l) => s + l.moving, 0), pause = use.reduce((s, l) => s + Math.max(0, l.total - l.moving), 0);
  return {
    n: use.length, mode: best.mode, rms: Math.sqrt(best.e),
    pace: { flat: Math.round(best.flat * 10) / 10, up: Math.round(best.up / 10) * 10, down: Math.round(best.up * 5 / 3 / 10) * 10,
      pauseMin: Math.min(30, Math.round(60 * pause / mov)), lunchMin: 0 },
    flatKm: use.reduce((s, l) => s + l.km, 0), upM: use.reduce((s, l) => s + l.up, 0),
  };
}

export function predicted(l, pace = state.settings.pace) {
  return timeOf(l.km, l.up, l.down, pace).walk;
}
