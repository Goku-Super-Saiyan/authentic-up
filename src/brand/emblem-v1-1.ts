// Logo V1.1, the current mark. V1 with a small crescent moon inside the P's bowl and light running inside U and P.
//
// How it reads: a cusped Mughal arch, like Lucknow's Rumi Darwaza, frames dusk on the Ganga.
// The U is a clay diya floating on the river, its flame a Banarasi buta.
// The P is a Sarus crane, the state bird of Uttar Pradesh: its neck is the stem,
// and its head and beak curl round to close the bowl.
// When animated, a spark of zari light runs through the U and up the crane's neck, and the moon glows.
// The original V1 is kept in emblem-v1.ts and V0 in emblem-v0.ts.

import type { EmblemVariant } from "./emblem";

const bez = (t: number, a: number, b: number, c: number, d: number) =>
  (1 - t) ** 3 * a + 3 * (1 - t) ** 2 * t * b + 3 * (1 - t) * t ** 2 * c + t ** 3 * d;

// Points up the left side of a pointed arch, then mirrored down the right.
function archPoints(x0: number, yBase: number, ySpring: number, apexY: number, lobes: number) {
  const pts: [number, number][] = [];
  const cx = 120;
  for (let i = 0; i <= lobes; i++) {
    const t = i / lobes;
    pts.push([bez(t, x0, x0, cx - (cx - x0) * 0.45, cx), bez(t, ySpring, ySpring - 46, apexY + 22, apexY)]);
  }
  const right = pts.slice(0, -1).reverse().map(([x, y]) => [240 - x, y] as [number, number]);
  return { start: [x0, yBase] as const, pts: [...pts, ...right], end: [240 - x0, yBase] as const };
}

function cuspedPath() {
  const { start, pts, end } = archPoints(24, 284, 132, 18, 7);
  let d = `M${start[0]} ${start[1]}V${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    const [x1, y1] = pts[i - 1], [x2, y2] = pts[i];
    const r = Math.hypot(x2 - x1, y2 - y1) * 0.62;
    d += `A${r.toFixed(1)} ${r.toFixed(1)} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`;
  }
  return d + `V${end[1]}Z`;
}
export const CUSPED = cuspedPath();
export const OUTER = "M14 284V128C14 80 66 44 120 6C174 44 226 80 226 128V284";

export function emblemSvgV11(id: string, variant: EmblemVariant = "full", animated = false): string {
  const g = (n: string) => `${id}-${n}`;
  const mono = variant !== "full";
  const ink = variant === "ink" ? "#22102A" : "#E7BE63";
  const gold = mono ? ink : `url(#${g("gold")})`;
  const saffron = mono ? ink : `url(#${g("saffron")})`;
  const sky = variant === "full" ? `url(#${g("sky")})` : "none";
  const water = mono ? ink : "#7FD3DE";
  const crown = mono ? ink : "#F0445A";
  const star = mono ? ink : "#FFF4E2";
  const anim = animated
    ? `<style>
        .${g("flame")}{animation:${g("flame")} 1.6s ease-in-out infinite;transform-box:fill-box;transform-origin:50% 90%}
        @keyframes ${g("flame")}{50%{transform:scale(.9,1.08) rotate(-3deg)}}
        .${g("glow")}{animation:${g("glow")} 1.6s ease-in-out infinite;transform-box:fill-box;transform-origin:50% 50%}
        @keyframes ${g("glow")}{50%{opacity:.18;transform:scale(1.15)}}
        .${g("wave")}{animation:${g("wave")} 3s linear infinite}
        @keyframes ${g("wave")}{to{stroke-dashoffset:-40}}
        .${g("float")}{animation:${g("float")} 3.4s ease-in-out infinite}
        @keyframes ${g("float")}{50%{transform:translateY(2.5px)}}
        .${g("run")}{animation:${g("run")} 2.8s linear infinite}
        @keyframes ${g("run")}{from{stroke-dashoffset:0}to{stroke-dashoffset:-232}}
        .${g("run2")}{animation:${g("run")} 2.8s linear infinite;animation-delay:-1.4s}
        .${g("moon")}{animation:${g("moon")} 4s ease-in-out infinite;transform-box:fill-box;transform-origin:50% 50%}
        @keyframes ${g("moon")}{50%{opacity:.55;transform:scale(1.25)}}
        .${g("blink")}{animation:${g("blink")} 2.2s ease-in-out infinite}
        @keyframes ${g("blink")}{50%{opacity:.2}}
        @media (prefers-reduced-motion: reduce){.${g("flame")},.${g("glow")},.${g("wave")},.${g("float")},.${g("run")},.${g("run2")},.${g("moon")},.${g("blink")}{animation:none}}
      </style>`
    : "";

  return `<svg viewBox="0 0 240 290" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Incredible UP emblem">
  <defs>
    <linearGradient id="${g("gold")}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#FFE7A6"/><stop offset=".35" stop-color="#E7BE63"/><stop offset=".65" stop-color="#B8862B"/><stop offset="1" stop-color="#F6D98C"/>
    </linearGradient>
    <linearGradient id="${g("saffron")}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#FFE08A"/><stop offset=".45" stop-color="#FFB627"/><stop offset="1" stop-color="#F0445A"/>
    </linearGradient>
    <linearGradient id="${g("sky")}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#120A2C"/><stop offset=".5" stop-color="#341452"/><stop offset=".8" stop-color="#7A2A5E"/><stop offset="1" stop-color="#B33A58"/>
    </linearGradient>
    <radialGradient id="${g("moonGlow")}"><stop offset="0" stop-color="#FFF4E2" stop-opacity=".5"/><stop offset="1" stop-color="#FFF4E2" stop-opacity="0"/></radialGradient>
    <radialGradient id="${g("halo")}"><stop offset="0" stop-color="#FFB627" stop-opacity=".7"/><stop offset="1" stop-color="#FF8A1F" stop-opacity="0"/></radialGradient>
  </defs>
  ${anim}
  <path d="${OUTER}" fill="none" stroke="${gold}" stroke-width="2" opacity=".75"/>
  <path d="${CUSPED}" fill="${sky}" stroke="${gold}" stroke-width="5" stroke-linejoin="round"/>
  <g fill="${star}">
    <path d="M196 140l1.8 4.5 4.5 1.8-4.5 1.8-1.8 4.5-1.8-4.5-4.5-1.8 4.5-1.8z" opacity=".85"/>
    <circle cx="44" cy="124" r="1.6" opacity=".7"/><circle cx="64" cy="98" r="1.2" opacity=".6"/><circle cx="206" cy="176" r="1.3" opacity=".6"/>
    <circle class="${g("blink")}" cx="98" cy="62" r="1.3" opacity=".7"/>
  </g>

  <g transform="translate(120 170) scale(.84) translate(-125 -160)">
  <!-- U: a clay diya floating on the Ganga, its flame a Banarasi buta -->
  <g class="${g("float")}">
    ${mono ? "" : `<circle class="${g("glow")}" cx="82" cy="150" r="34" fill="url(#${g("halo")})"/>`}
    <path class="${g("flame")}" d="M82 116C96 128 98 150 86 162C76 170 64 162 68 150C71 141 80 141 80 133C80 127 82 121 82 116Z" fill="${saffron}"/>
    <path d="M78 156c-3-5 0-10 4-10" fill="none" stroke="${mono ? (variant === "ink" ? "#FFF4E2" : "#5E0F2C") : "#FFF1C9"}" stroke-width="2.4" stroke-linecap="round" opacity=".9"/>
    <path d="M44 128C38 124 36 120 38 116M120 128C126 124 128 120 126 116" fill="none" stroke="${gold}" stroke-width="6" stroke-linecap="round"/>
    <path d="M44 120V178A38 38 0 0 0 120 178V120" fill="none" stroke="${gold}" stroke-width="17" stroke-linecap="round"/>
    ${animated && !mono ? `<path class="${g("run")}" d="M44 120V178A38 38 0 0 0 120 178V120" fill="none" stroke="#FFE7A6" stroke-width="12" stroke-linecap="round" stroke-dasharray="30 202" opacity=".45"/><path class="${g("run")}" d="M44 120V178A38 38 0 0 0 120 178V120" fill="none" stroke="#FFFBEF" stroke-width="4.5" stroke-linecap="round" stroke-dasharray="30 202"/>` : ""}
    <path d="M52 196q30 18 60 0" fill="none" stroke="${mono ? (variant === "ink" ? "#FFF4E2" : "#5E0F2C") : "#8A5A17"}" stroke-width="2" opacity=".6"/>
  </g>

  <!-- P: a Sarus crane. Neck is the stem; head and beak close the bowl. -->
  <path d="M156 244V100C156 72 176 60 194 66C212 72 214 100 196 110L176 118" fill="none" stroke="${gold}" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/>
  ${animated && !mono ? `<path class="${g("run2")}" d="M156 244V100C156 72 176 60 194 66C212 72 214 100 196 110L176 118" fill="none" stroke="#FFE7A6" stroke-width="12" stroke-linecap="round" stroke-dasharray="30 202" opacity=".45"/><path class="${g("run2")}" d="M156 244V100C156 72 176 60 194 66C212 72 214 100 196 110L176 118" fill="none" stroke="#FFFBEF" stroke-width="4.5" stroke-linecap="round" stroke-dasharray="30 202"/>` : ""}
  <path d="M184 110L140 140L178 124Z" fill="${gold}" stroke="${gold}" stroke-width="2" stroke-linejoin="round"/>
  <path d="M176 66C182 58 196 56 202 64C196 66 186 68 176 66Z" fill="${crown}"/>
  <!-- small crescent moon inside the P's bowl -->
  ${mono ? "" : `<circle class="${g("moon")}" cx="183" cy="90" r="13" fill="url(#${g("moonGlow")})"/>`}
  <path d="M181 81a9 9 0 1 0 6.5 15.5a7 7 0 1 1 -6.5 -15.5z" fill="${star}"/>
  <circle cx="197" cy="72" r="3" fill="${mono ? (variant === "ink" ? "#FFF4E2" : "#5E0F2C") : "#140A2E"}"/>
  </g>
  <path class="${g("wave")}" d="M40 236q10-6 20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0" fill="none" stroke="${water}" stroke-width="2.4" stroke-dasharray="14 6" stroke-linecap="round" opacity=".85"/>
  <path d="M56 246q8-4 16 0t16 0t16 0t16 0t16 0t16 0t16 0t16 0" fill="none" stroke="${water}" stroke-width="1.4" opacity=".5"/>
  <g fill="${gold}" opacity="${mono ? 1 : 0.9}">
    <rect x="28" y="262" width="184" height="3"/><rect x="20" y="272" width="200" height="3"/>
  </g>
</svg>`;
}
