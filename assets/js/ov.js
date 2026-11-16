// Reisadvies openbaar vervoer via Transitous (open data, MOTIS). Dienstregelingen lopen een paar weken vooruit.

import { addDays, parseISO, todayISO, toISO } from './util.js';

const API = 'https://api.transitous.org/api/v1';

export async function geocode(text) {
  const r = await fetch(`${API}/geocode?text=${encodeURIComponent(text)}&language=nl`);
  if (!r.ok) throw new Error('Zoeken mislukt');
  const list = await r.json();
  return list.filter((x) => x.lat && x.lon).slice(0, 6).map((x) => ({
    name: x.name, ll: [x.lat, x.lon], type: x.type,
    area: (x.areas || []).filter((a) => a.default || a.adminLevel === 2).map((a) => a.name).filter((n, i, arr) => arr.indexOf(n) === i).join(', '),
  }));
}

// Zelfde weekdag binnen de komende weken, voor reizen die verder weg liggen dan de dienstregeling reikt.
function proxyDate(iso) {
  const want = parseISO(iso).getDay();
  const d = parseISO(addDays(todayISO(), 7));
  while (d.getDay() !== want) d.setDate(d.getDate() + 1);
  return toISO(d);
}

async function query(from, to, iso, hhmm, arriveBy) {
  const local = new Date(`${iso}T${hhmm}:00`);
  const url = `${API}/plan?fromPlace=${from[0]},${from[1]}&toPlace=${to[0]},${to[1]}&time=${encodeURIComponent(local.toISOString())}`
    + `&arriveBy=${arriveBy ? 'true' : 'false'}&numItineraries=5&maxPreTransitTime=1800&maxPostTransitTime=1800`;
  const r = await fetch(url);
  if (!r.ok) throw new Error('Reisplanner gaf een fout');
  const d = await r.json();
  return (d.itineraries || []).map((it) => ({
    start: it.startTime, end: it.endTime, duration: it.duration, transfers: it.transfers,
    legs: it.legs.filter((l) => l.mode !== 'WALK' || l.duration > 420).map((l) => ({
      mode: l.mode, name: l.routeShortName || l.displayName || '', from: l.from.name, to: l.to.name,
      dep: l.startTime, arr: l.endTime, headsign: l.headsign || '', agency: l.agencyName || '',
    })),
  }));
}

export async function plan(from, to, iso, hhmm = '08:00', arriveBy = false) {
  let used = iso, proxy = false;
  let its = [];
  const days = (parseISO(iso) - parseISO(todayISO())) / 864e5;
  if (days >= 0 && days <= 60) its = await query(from, to, iso, hhmm, arriveBy);
  if (!its.length) {
    used = proxyDate(iso); proxy = true;
    its = await query(from, to, used, hhmm, arriveBy);
  }
  its.sort((a, b) => new Date(a.end) - new Date(b.end));
  return { itineraries: its, date: used, proxy };
}

export const MODE = {
  HIGHSPEED_RAIL: 'Hogesnelheidstrein', LONG_DISTANCE: 'Intercity', REGIONAL_RAIL: 'Trein', REGIONAL_FAST_RAIL: 'Sneltrein',
  NIGHT_RAIL: 'Nachttrein', SUBURBAN: 'S-Bahn', METRO: 'Metro', SUBWAY: 'Metro', TRAM: 'Tram', BUS: 'Bus', COACH: 'Langeafstandsbus',
  FERRY: 'Boot', WALK: 'Lopen', RAIL: 'Trein', FUNICULAR: 'Kabelspoor', AERIAL_LIFT: 'Kabelbaan', AIRPLANE: 'Vliegtuig', CABLE_CAR: 'Kabelbaan',
};
