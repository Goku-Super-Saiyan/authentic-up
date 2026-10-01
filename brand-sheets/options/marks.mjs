// Six flat, modern logo directions for Incredible UP. Each mark is a 240×240 SVG.
import { DISTRICTS } from "../iup/src/data/districts.ts";

const C = { saffron: "#F28C28", marigold: "#FFB627", magenta: "#C2185B", indigo: "#2B1B5A", teal: "#1FA7A0", gold: "#E0A526", red: "#E2403A", ivory: "#FFF4E2", sky: "#3A8DDE" };
const svg = (label, body) => `<svg viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label}">${body}</svg>`;

// 1. 75 dots: every district of UP as one dot, placed by its real latitude and longitude, so the dots draw the state.
export function dots(dark = true) {
  const lats = DISTRICTS.map((d) => d.lat), lons = DISTRICTS.map((d) => d.lon);
  const [la0, la1, lo0, lo1] = [Math.min(...lats), Math.max(...lats), Math.min(...lons), Math.max(...lons)];
  const k = 206 / Math.max(lo1 - lo0, (la1 - la0) * 1.1);
  const ox = 120 - ((lo1 - lo0) * k) / 2, oy = 120 - ((la1 - la0) * 1.1 * k) / 2;
  const palette = [C.saffron, C.magenta, C.teal, C.gold, C.red, C.sky];
  const big = new Set(["Varanasi", "Lucknow", "Agra", "Bhadohi"]);
  const pts = DISTRICTS.map((d, i) => {
    const x = ox + (d.lon - lo0) * k, y = oy + (la1 - d.lat) * 1.1 * k;
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${big.has(d.name) ? 12 : 8.5}" fill="${palette[(i * 7) % palette.length]}"/>`;
  }).join("");
  return svg("Incredible UP, 75 districts", pts);
}

// 2. Patang: a Lucknow kite in four colours, its string looping into a U.
export function kite(dark = true) {
  const line = dark ? C.ivory : C.indigo;
  return svg("Incredible UP kite", `
  <path d="M150 22L210 82L150 142L90 82Z" fill="${C.magenta}"/>
  <path d="M150 22L210 82H150Z" fill="${C.saffron}"/><path d="M90 82L150 142V82Z" fill="${C.marigold}"/>
  <path d="M150 22V142M90 82H210" stroke="${C.ivory}" stroke-width="3"/>
  <path d="M150 142l-8 16h16z" fill="${C.teal}"/>
  <path d="M150 158C150 196 128 214 98 214C62 214 44 190 44 156V100" fill="none" stroke="${line}" stroke-width="12" stroke-linecap="round"/>
  <path d="M30 112l14-16 14 16" fill="none" stroke="${line}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`);
}

// 3. Friendly "up": lowercase u and p on one stem, the p's bowl is a rising sun. App-icon ready.
export function upIcon() {
  return svg("Incredible UP app icon", `
  <rect x="8" y="8" width="224" height="224" rx="56" fill="${C.saffron}"/>
  <circle cx="152" cy="104" r="34" fill="${C.marigold}"/>
  <path d="M60 70V114A30 30 0 0 0 120 114V70" fill="none" stroke="${C.ivory}" stroke-width="22" stroke-linecap="round"/>
  <path d="M120 70V196" fill="none" stroke="${C.ivory}" stroke-width="22" stroke-linecap="round"/>
  <path d="M120 70H150A34 34 0 0 1 150 138H120" fill="none" stroke="${C.ivory}" stroke-width="22" stroke-linejoin="round"/>
  <path d="M176 44l8-8M190 62l11-3M160 34l2-11" stroke="${C.ivory}" stroke-width="5" stroke-linecap="round"/>`);
}

// 4. Peacock feather: the feather's eye is the bowl of the P, the quill is its stem, and a bold U stands beside it.
export function feather(dark = true) {
  const ink = dark ? C.ivory : C.indigo;
  const barbs = Array.from({ length: 7 }, (_, i) => {
    const y = 136 + i * 13;
    return `<path d="M120 ${y}q22 -4 ${34 - i * 3} -${12 - i}" stroke="${C.teal}" stroke-width="4" fill="none" stroke-linecap="round" opacity="${0.95 - i * 0.1}"/>`;
  }).join("");
  return svg("Incredible UP peacock feather", `
  ${barbs}
  <ellipse cx="162" cy="78" rx="48" ry="58" fill="${C.teal}"/>
  <ellipse cx="160" cy="82" rx="32" ry="40" fill="${C.gold}"/>
  <ellipse cx="158" cy="86" rx="21" ry="27" fill="${C.sky}"/>
  <ellipse cx="156" cy="90" rx="11" ry="14" fill="${C.indigo}"/>
  <path d="M120 40V224" stroke="${ink}" stroke-width="16" stroke-linecap="round"/>
  <path d="M30 60V150A34 34 0 0 0 98 150V60" fill="none" stroke="${ink}" stroke-width="16" stroke-linecap="round"/>`);
}

// 5. Wordmark only: the lettering is the logo, with a zari saree border under UP and a diya dot on the i.
export function wordmark(dark = true) {
  const ink = dark ? C.ivory : C.indigo;
  const border = Array.from({ length: 13 }, (_, i) => `<path d="M${20 + i * 16} 196l8-8 8 8-8 8z" fill="${i % 2 ? C.magenta : C.gold}"/>`).join("");
  return `<svg viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Incredible UP wordmark">
  <text x="120" y="94" text-anchor="middle" font-family="'Rozha One', Georgia, serif" font-size="44" fill="${ink}">Incredible</text>
  <text x="120" y="176" text-anchor="middle" font-family="'Rozha One', Georgia, serif" font-size="96" fill="${C.saffron}" letter-spacing="4">UP</text>
  <rect x="16" y="184" width="208" height="24" fill="${dark ? "#3A1555" : "#F7E6C8"}"/>${border}
  <path d="M16 184H224M16 208H224" stroke="${C.gold}" stroke-width="2.5"/>
  <text x="120" y="232" text-anchor="middle" font-family="Mukta, sans-serif" font-weight="600" font-size="14" fill="${ink}" opacity=".75" letter-spacing="3">अतुल्य उत्तर प्रदेश</text>
</svg>`;
}

// 6. Flat sunrise: a bold sun rising over the Ganga, U and P cut out of the sun.
export function sunrise() {
  const rays = Array.from({ length: 11 }, (_, i) => `<path d="M120 132L120 28" stroke="${C.marigold}" stroke-width="7" stroke-linecap="round" transform="rotate(${-75 + i * 15} 120 132)"/>`).join("");
  return svg("Incredible UP sunrise", `
  ${rays}
  <circle cx="120" cy="132" r="72" fill="${C.saffron}"/>
  <path d="M84 96V134A20 20 0 0 0 124 134V96" fill="none" stroke="${C.ivory}" stroke-width="15"/>
  <path d="M124 96V168M124 96H140A18 18 0 0 1 140 132H124" fill="none" stroke="${C.ivory}" stroke-width="15"/>
  <rect x="20" y="168" width="200" height="72" fill="${C.indigo}"/>
  <path d="M28 186q11-9 22 0t22 0t22 0t22 0t22 0t22 0t22 0t22 0t22 0" fill="none" stroke="${C.teal}" stroke-width="6" stroke-linecap="round"/>
  <path d="M52 210q11-9 22 0t22 0t22 0t22 0t22 0t22 0" fill="none" stroke="${C.teal}" stroke-width="6" stroke-linecap="round" opacity=".6"/>`);
}
