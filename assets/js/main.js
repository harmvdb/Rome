// Start van de app: data laden en het juiste scherm tonen op basis van de hash in de adresbalk.

import { h } from './util.js';
import { init } from './data.js';
import { viewRoute, viewSection, viewStages, viewWhen, viewSettings } from './views/route.js';
import { viewStage } from './views/stage.js';
import { viewTrips, viewTrip } from './views/trips.js';

const app = document.getElementById('app');
let token = 0;

async function render(keepScroll) {
  const my = ++token;
  const y = window.scrollY;
  const [, name, arg] = (location.hash || '#/').split('/');
  const root = h('div', { class: 'view' });
  // append negeert lege waarden, zodat schermen voorwaardelijke onderdelen kunnen meegeven
  root.append = (...kids) => Element.prototype.append.call(root, ...kids.flat(Infinity).filter((k) => k !== null && k !== undefined && k !== false));
  const rerender = () => render(true);
  let tab = 'route';
  app.replaceChildren(root);
  try {
    if (name === 'sectie') { await viewSection(root, arg, rerender); }
    else if (name === 'etappes') { tab = 'etappes'; viewStages(root); }
    else if (name === 'etappe') { tab = 'etappes'; await viewStage(root, arg, rerender); }
    else if (name === 'reizen') { tab = 'reizen'; viewTrips(root, rerender); }
    else if (name === 'reis') { tab = 'reizen'; viewTrip(root, arg, rerender); }
    else if (name === 'wanneer') { tab = 'wanneer'; await viewWhen(root, rerender); }
    else if (name === 'instellingen') { tab = 'instellingen'; viewSettings(root, rerender); }
    else { viewRoute(root, rerender); }
  } catch (e) {
    console.error(e);
    root.append(h('p', { class: 'warn-t' }, 'Er ging iets mis bij het tonen van dit scherm: ' + e.message));
  }
  if (my !== token) return;
  document.querySelectorAll('.tabs a').forEach((a) => a.classList.toggle('on', a.dataset.tab === tab));
  if (keepScroll) window.scrollTo(0, y); else window.scrollTo(0, 0);
}

init().then(() => {
  window.addEventListener('hashchange', () => render(false));
  render(false);
}).catch((e) => {
  console.error(e);
  app.replaceChildren(h('p', { class: 'warn-t' }, 'De routedata kon niet geladen worden. Ververs de pagina.'));
});

if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
