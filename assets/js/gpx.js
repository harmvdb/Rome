// GPX maken van een etappe en naar de telefoon of Garmin Connect sturen.

import { stageLine } from './data.js';
import { download, slug, toast } from './util.js';

const x = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function stageTitle(st, n) {
  return `${String(n ?? 0).padStart(2, '0')} ${st.from} - ${st.to}`;
}
export function fileName(st, n) {
  return `trier-rome-${String(n ?? 0).padStart(3, '0')}-${slug(st.from)}-${slug(st.to)}.gpx`;
}

export async function buildGPX(st, n) {
  const { pts, ele } = await stageLine(st);
  const name = x(stageTitle(st, n));
  const trk = pts.map((p, i) => `<trkpt lat="${p[0].toFixed(5)}" lon="${p[1].toFixed(5)}"><ele>${ele[i]}</ele></trkpt>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Trier naar Rome planner" xmlns="http://www.topografix.com/GPX/1/1">
<metadata><name>${name}</name><desc>${x(st.km)} km, ${st.up} m stijgen, ${st.down} m dalen. Kaartdata OpenStreetMap.</desc></metadata>
<trk><name>${name}</name><type>hiking</type><trkseg>
${trk}
</trkseg></trk>
</gpx>
`;
}

export async function downloadGPX(st, n) {
  download(fileName(st, n), await buildGPX(st, n), 'application/gpx+xml');
  toast('GPX gedownload');
}

// Delen via het deelmenu van de telefoon: kies daar Garmin Connect. Lukt dat niet, dan volgt een download.
export async function shareGPX(st, n) {
  const text = await buildGPX(st, n);
  const name = fileName(st, n);
  for (const type of ['application/gpx+xml', 'application/octet-stream', 'text/xml']) {
    try {
      const file = new File([text], name, { type });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: stageTitle(st, n) });
        return 'shared';
      }
    } catch (e) {
      if (e && e.name === 'AbortError') return 'cancelled';
    }
  }
  download(name, text, 'application/gpx+xml');
  toast('Delen kan hier niet. De GPX is gedownload.');
  return 'downloaded';
}
