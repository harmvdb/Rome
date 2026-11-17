// Opslag van keuzes en plannen in de browser (localStorage), met export en import als reservekopie.

const KEY = 'trier-rome.v1';

const defaults = () => ({
  settings: {
    home: 'Utrecht Centraal',
    homeLL: [52.0894, 5.1101],
    pace: { flat: 4, up: 300, down: 500, pauseMin: 10, lunchMin: 30 },
    adults: 1,
    perTrip: 8,
    day: { min: 7, max: 9, net: false },  // gewenste dagduur in uren; net = alleen looptijd, zonder pauzes
  },
  choice: {},   // sectie-id -> variant-id
  done: {},     // etappe-id -> datum
  notes: {},    // etappe-id -> { rating, text }
  logs: [],     // gelopen wandelingen voor de tempokalibratie
  trips: [],
});

function load() {
  const base = defaults();
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (raw && typeof raw === 'object') {
      return { ...base, ...raw, settings: { ...base.settings, ...(raw.settings || {}), pace: { ...base.settings.pace, ...((raw.settings || {}).pace || {}) }, day: { ...base.settings.day, ...((raw.settings || {}).day || {}) } } };
    }
  } catch (e) { /* opslag niet beschikbaar of beschadigd: start schoon */ }
  return base;
}

export const state = load();

const listeners = new Set();
export function onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }

export function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* vol of geblokkeerd */ }
  listeners.forEach((fn) => fn());
}

export function exportJSON() {
  return JSON.stringify({ app: 'trier-rome', version: 1, exported: new Date().toISOString(), data: state }, null, 2);
}

export function importJSON(text) {
  const obj = JSON.parse(text);
  const data = obj && obj.app === 'trier-rome' ? obj.data : null;
  if (!data || !Array.isArray(data.trips)) throw new Error('Dit is geen reservekopie van deze app.');
  const base = defaults();
  Object.assign(state, base, data, { settings: { ...base.settings, ...(data.settings || {}), pace: { ...base.settings.pace, ...((data.settings || {}).pace || {}) } } });
  save();
}

export function resetAll() {
  Object.assign(state, defaults());
  save();
}

export const defaultPace = () => defaults().settings.pace;
