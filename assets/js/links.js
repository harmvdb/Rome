// Deeplinks naar boekingssites, kaarten en reisplanners. Geen API-sleutels nodig.

const enc = encodeURIComponent;

// Plaatsnaam zonder toevoeging tussen haakjes, bruikbaar als zoekterm.
export const plain = (name) => name.replace(/\s*\(.*?\)\s*/g, ' ').trim();
export const hint = (name) => { const m = name.match(/\(bij (.+?)\)/); return m ? m[1] : ''; };
export const searchPlace = (name) => [plain(name), hint(name)].filter(Boolean).join(', ');

function bookingDates(cin, cout, adults) {
  let q = `&group_adults=${adults || 1}&no_rooms=1&group_children=0`;
  if (cin && cout) q += `&checkin=${cin}&checkout=${cout}`;
  return q;
}

export function bookingArea(place, ll, cin, cout, adults, hostelsOnly) {
  return `https://www.booking.com/searchresults.nl.html?ss=${enc(searchPlace(place))}&latitude=${ll[0]}&longitude=${ll[1]}`
    + bookingDates(cin, cout, adults) + '&order=distance_from_search' + (hostelsOnly ? '&nflt=ht_id%3D203' : '');
}
export function bookingName(name, place, cin, cout, adults) {
  return `https://www.booking.com/searchresults.nl.html?ss=${enc(name + ', ' + searchPlace(place))}` + bookingDates(cin, cout, adults);
}
export function airbnb(place, cin, cout, adults) {
  let u = `https://www.airbnb.nl/s/${enc(searchPlace(place))}/homes?adults=${adults || 1}`;
  if (cin && cout) u += `&checkin=${cin}&checkout=${cout}`;
  return u;
}
export const gmapsPlace = (name, place) => `https://www.google.com/maps/search/?api=1&query=${enc(name + ' ' + searchPlace(place))}`;
export const gmapsNear = (what, ll) => `https://www.google.com/maps/search/${enc(what)}/@${ll[0]},${ll[1]},14z`;
export const tripadvisor = (name, place) => `https://www.tripadvisor.nl/Search?q=${enc(name + ' ' + searchPlace(place))}`;
export const osm = (ll, z = 15) => `https://www.openstreetmap.org/?mlat=${ll[0]}&mlon=${ll[1]}#map=${z}/${ll[0]}/${ll[1]}`;

// Reisplanners voor het openbaar vervoer.
export function transitLinks(from, to) {
  const f = from.ll ? `${from.ll[0]},${from.ll[1]}` : enc(from.name);
  const t = to.ll ? `${to.ll[0]},${to.ll[1]}` : enc(to.name);
  return [
    { label: 'Google Maps', url: `https://www.google.com/maps/dir/?api=1&origin=${f}&destination=${t}&travelmode=transit` },
    { label: 'Rome2Rio', url: `https://www.rome2rio.com/map/${enc(plain(from.name))}/${enc(plain(to.name))}` },
    { label: 'NS International', url: 'https://www.nsinternational.com/nl' },
    { label: 'Deutsche Bahn', url: 'https://int.bahn.de/nl' },
    { label: 'SBB', url: 'https://www.sbb.ch/en' },
    { label: 'SNCF Connect', url: 'https://www.sncf-connect.com/' },
    { label: 'Trenitalia', url: 'https://www.trenitalia.com/en.html' },
    { label: 'Trainline', url: 'https://www.thetrainline.com/nl' },
  ];
}
