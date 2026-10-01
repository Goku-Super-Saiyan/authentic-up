// Three logo drafts for Incredible UP. Each returns SVG markup.
const defs = (id) => `
  <linearGradient id="${id}g" gradientUnits="userSpaceOnUse" x1="20" y1="10" x2="220" y2="230">
    <stop offset="0" stop-color="#FFE7A6"/><stop offset=".35" stop-color="#E7BE63"/><stop offset=".7" stop-color="#B8862B"/><stop offset="1" stop-color="#F6D98C"/>
  </linearGradient>
  <linearGradient id="${id}s" gradientUnits="userSpaceOnUse" x1="120" y1="40" x2="220" y2="140"><stop offset="0" stop-color="#FFB627"/><stop offset="1" stop-color="#F0445A"/></linearGradient>`;

// A. Bold monogram: the U's right arm runs straight on as the P's stem, one ligature.
export function monogram(id = "m", ink = null) {
  const g = ink ?? `url(#${id}g)`, s = ink ?? `url(#${id}s)`, bg = ink ? "#FFF4E2" : "#140A2E";
  return `<svg viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Incredible UP monogram">
  <defs>${defs(id)}</defs>
  <g transform="translate(6 0)">
    <path d="M128 40H156A38 38 0 0 1 156 116H128" fill="none" stroke="${s}" stroke-width="30"/>
    <path d="M52 40V134A38 38 0 0 0 128 134V40" fill="none" stroke="${g}" stroke-width="30"/>
    <path d="M128 40V214" fill="none" stroke="${g}" stroke-width="30"/>
    <path d="M37 214H96M160 214H209" stroke="${g}" stroke-width="3"/>
    <path d="M52 22l5 5-5 5-5-5z" fill="${s}"/>
  </g>
</svg>`;
}

// B. Royal seal: a mohur stamp with lotus-petal edge, Hindi and English around the rim, UP at the heart.
export function seal(id = "r", ink = null) {
  const g = ink ?? `url(#${id}g)`, bg = ink ? "none" : "#5E0F2C", txt = ink ?? "#F6D98C";
  const petals = Array.from({ length: 32 }, (_, i) => `<path d="M120 4q7 8 0 16q-7-8 0-16z" transform="rotate(${i * 11.25} 120 120)"/>`).join("");
  const beads = Array.from({ length: 48 }, (_, i) => { const a = (i / 48) * Math.PI * 2; return `<circle cx="${(120 + 72 * Math.cos(a)).toFixed(1)}" cy="${(120 + 72 * Math.sin(a)).toFixed(1)}" r="1.6"/>`; }).join("");
  return `<svg viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Incredible UP seal">
  <defs>${defs(id)}
    <path id="${id}top" d="M120 120m-86 0a86 86 0 0 1 172 0"/>
    <path id="${id}bot" d="M120 120m-94 0a94 94 0 0 0 188 0"/>
  </defs>
  <g fill="${g}">${petals}</g>
  <circle cx="120" cy="120" r="104" fill="${bg}" stroke="${g}" stroke-width="4"/>
  <circle cx="120" cy="120" r="97" fill="none" stroke="${g}" stroke-width="1"/>
  <circle cx="120" cy="120" r="66" fill="none" stroke="${g}" stroke-width="2.5"/>
  <g fill="${g}">${beads}</g>
  <text font-family="Mukta, sans-serif" font-weight="700" font-size="19" fill="${txt}" letter-spacing="1"><textPath href="#${id}top" startOffset="50%" text-anchor="middle">अतुल्य उत्तर प्रदेश</textPath></text>
  <text font-family="Rozha One, Georgia, serif" font-size="12.5" fill="${txt}" letter-spacing="3"><textPath href="#${id}bot" startOffset="50%" text-anchor="middle">HANDMADE IN UTTAR PRADESH</textPath></text>
  <g fill="${g}"><path d="M28 120l5-5 5 5-5 5z"/><path d="M202 120l5-5 5 5-5 5z"/></g>
  <text x="120" y="146" text-anchor="middle" font-family="Rozha One, Georgia, serif" font-size="70" fill="${g}">UP</text>
  <path d="M96 86q24-16 48 0" fill="none" stroke="${g}" stroke-width="2.5"/>
  <path d="M120 66l4 10 10 4-10 4-4 10-4-10-10-4 10-4z" fill="${ink ?? `url(#${id}s)`}" transform="translate(0 -4) scale(1)"/>
  <path d="M100 162h40" stroke="${g}" stroke-width="2"/>
</svg>`;
}

// C. Paisley buta: U sits in the paisley's belly, and the P's stem rises and curls into the paisley tip.
export function buta(id = "b", ink = null) {
  const g = ink ?? `url(#${id}g)`, s = ink ?? `url(#${id}s)`, fill = ink ? "none" : "#24104A";
  const outline = "M108 228C46 228 20 172 36 122C52 74 104 60 140 42C162 30 180 16 204 16C214 16 222 24 220 34C218 44 206 46 202 38C196 52 194 64 196 80C214 114 222 164 196 200C178 222 146 228 108 228Z";
  return `<svg viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Incredible UP paisley">
  <defs>${defs(id)}</defs>
  <path d="${outline}" fill="${fill}" stroke="${g}" stroke-width="5" stroke-linejoin="round"/>
  <path d="${outline}" fill="none" stroke="${g}" stroke-width="3" stroke-dasharray="0 9" stroke-linecap="round" transform="translate(116 148) scale(.86) translate(-116 -148)" opacity=".85"/>
  <path d="M60 104V158A32 32 0 0 0 124 158V88" fill="none" stroke="${g}" stroke-width="18" stroke-linecap="round"/>
  <path d="M124 200V88C124 64 150 50 172 40C186 34 196 30 202 38" fill="none" stroke="${g}" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M124 96H150A22 22 0 0 1 150 140H124" fill="none" stroke="${s}" stroke-width="15" stroke-linecap="round"/>
</svg>`;
}
