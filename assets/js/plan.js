// Meerjarenplan: verdeel de resterende etappes in reizen van 5 tot 10 dagen die bij een station eindigen.

import { state } from './store.js';
import { activeStages, time } from './data.js';
import { SECTIONS } from './content.js';
import { MONTHS } from './util.js';

export function monthsFor(st) {
  const info = SECTIONS[st.section.id] || {};
  const v = (info.variants || {})[st.variant.id] || {};
  let m = v.months || info.months || new Array(12).fill(2);
  // Het meerdeel van de Alpensectie volgt het seizoen van het meer, niet dat van de passen.
  if (st.section.id === 's4' && st.max < 1300) m = [0, 0, 1, 2, 3, 3, 2, 2, 3, 2, 1, 0];
  return m;
}

// Maandscore van een reeks etappes: de zwakste etappe bepaalt de maand.
export function monthsForStages(stages) {
  const out = new Array(12).fill(3);
  for (const st of stages) monthsFor(st).forEach((r, i) => { if (r < out[i]) out[i] = r; });
  return out;
}

export function bestMonthsText(months) {
  const best = months.map((r, i) => (r === 3 ? MONTHS[i] : null)).filter(Boolean);
  const good = months.map((r, i) => (r === 2 ? MONTHS[i] : null)).filter(Boolean);
  if (best.length) return best.join(', ') + (good.length ? ` (ook goed: ${good.join(', ')})` : '');
  if (good.length) return good.join(', ');
  const ok = months.map((r, i) => (r === 1 ? MONTHS[i] : null)).filter(Boolean);
  return ok.length ? `alleen met beperkingen: ${ok.join(', ')}` : 'geen maand waarin alle etappes passen: splits deze reis';
}

export function propose(per) {
  const target = Math.min(10, Math.max(5, per || state.settings.perTrip || 8));
  const all = activeStages().filter((a) => !state.done[a.st.id]).map((a) => a.st);
  const n = all.length;
  if (!n) return [];
  const lo = Math.max(5, target - 2), hi = Math.min(10, target + 2);
  const endCost = (i) => {
    const st = all[i];
    if (i === n - 1) return 0;
    const sectionEnd = all[i + 1].section.id !== st.section.id;
    let c = st.rail ? (st.rail.m < 1500 ? 0 : 0.6) : 2.5;
    if (sectionEnd) c -= 0.8;
    // liever geen reis die het hooggebergte halverwege verlaat
    if (st.max >= 1800 && all[i + 1].max >= 1800) c += 2;
    return c;
  };
  const best = new Array(n + 1).fill(Infinity), prev = new Array(n + 1).fill(-1);
  best[0] = 0;
  for (let j = 1; j <= n; j++) {
    for (let size = 1; size <= hi; size++) {
      const i = j - size;
      if (i < 0 || best[i] === Infinity) continue;
      let c = best[i] + 1 + 0.25 * (size - target) ** 2 + endCost(j - 1);
      if (size < lo) c += j === n ? 0.5 * (lo - size) : 50;
      const months = monthsForStages(all.slice(i, j));
      if (Math.max(...months) < 2) c += 6;
      if (c < best[j]) { best[j] = c; prev[j] = i; }
    }
  }
  const cuts = [];
  for (let j = n; j > 0; j = prev[j]) cuts.push([prev[j], j]);
  cuts.reverse();
  return cuts.map(([i, j], k) => {
    const stages = all.slice(i, j);
    return {
      n: k + 1, stages, from: stages[0].from, to: stages[stages.length - 1].to,
      km: stages.reduce((s, st) => s + st.km, 0), up: stages.reduce((s, st) => s + st.up, 0),
      hours: stages.reduce((s, st) => s + time(st).total, 0), months: monthsForStages(stages),
      rail: stages[stages.length - 1].rail || null,
    };
  });
}
