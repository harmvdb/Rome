// Leaflet-kaart met wandelkaartlagen en markeringen.

/* global L */
import { KIND } from './data.js';

const OSM_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

export function makeMap(el, opts = {}) {
  const map = L.map(el, { scrollWheelZoom: false, zoomControl: true, attributionControl: true, ...opts });
  const osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: OSM_ATTR });
  const topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    maxZoom: 17, attribution: OSM_ATTR + ', SRTM | <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA)',
  });
  const trails = L.tileLayer('https://tile.waymarkedtrails.org/hiking/{z}/{x}/{y}.png', {
    maxZoom: 18, opacity: 0.7, attribution: '<a href="https://hiking.waymarkedtrails.org">Waymarked Trails</a>',
  });
  (opts.topo ? topo : osm).addTo(map);
  L.control.layers({ 'Kaart': osm, 'Topografisch': topo }, { 'Gemarkeerde wandelroutes': trails }, { position: 'topright' }).addTo(map);
  map.on('click', () => map.scrollWheelZoom.enable());
  map.on('mouseout', () => map.scrollWheelZoom.disable());
  setTimeout(() => map.invalidateSize(), 150);
  return map;
}

export function dot(ll, cls, label, title) {
  return L.marker(ll, {
    title: title || '',
    icon: L.divIcon({ className: '', html: `<span class="pin ${cls || ''}">${label || ''}</span>`, iconSize: [24, 24], iconAnchor: [12, 12] }),
  });
}

export function stayMarker(p) {
  const k = KIND[p.k] || { c: '#777', label: p.k };
  return L.circleMarker([p.lat, p.lon], { radius: 6, color: '#fff', weight: 1.5, fillColor: k.c, fillOpacity: 1 });
}

export const COLORS = ['#b5482a', '#2f5d7c', '#5f6b3a', '#8a4f9e', '#c77b2c', '#2c7a70', '#a3324f', '#4a5fa8', '#7a6a2c'];
