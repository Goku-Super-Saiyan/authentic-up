// Logo V3, the current mark. The Mor emblem from the V1.1 family, set at dusk on the ghats of Kashi.
//
// How it reads: the cusped Rumi Darwaza arch frames the Ganga at Varanasi as the sun sets.
// Behind the letters, the ghats rise in silhouette: temple shikharas with flags, old havelis with
// lit windows, chhatri umbrellas on the steps. The sun sinks behind them and its light breaks into
// shimmering streaks on the river, where little diyas float.
// In front, the U is a clay diya with a buta flame and the P is a peacock: its teal neck is the stem,
// its crested head closes the bowl, and a feather eye sits inside. अतुल्य उत्तर प्रदेश sits below UP.
// When animated, light runs through the letters, the flame flickers, the river shimmers, diyas bob and birds drift.
// Earlier marks are kept in emblem-v1-1.ts, emblem-v1.ts and emblem-v0.ts.
import type { EmblemVariant } from "./emblem";
import { CUSPED, OUTER } from "./emblem-v1-1";
import { BRAND } from "./brand";

// Ghat skyline, left to right, in viewBox units. Each entry: [kind, x, width, height].
type Part = ["box" | "shikhara" | "dome" | "chhatri", number, number, number];
const SKYLINE: Part[] = [
  ["box", 20, 16, 30], ["shikhara", 34, 16, 56], ["box", 48, 18, 38], ["dome", 64, 16, 44], ["shikhara", 78, 20, 66],
  ["box", 96, 12, 24], ["box", 106, 16, 14], ["box", 122, 14, 18], ["box", 134, 12, 26],
  ["dome", 144, 18, 46], ["shikhara", 160, 20, 62], ["box", 178, 18, 34], ["shikhara", 194, 14, 46], ["box", 206, 14, 28],
];
const BASE = 204; // waterline of the ghats

function skyline(fill: string, lit: string, flag: string) {
  let shapes = "", windows = "", flags = "";
  for (const [kind, x, w, h] of SKYLINE) {
    const top = BASE - h, cx = x + w / 2;
    if (kind === "box") {
      shapes += `<rect x="${x}" y="${top}" width="${w}" height="${h}"/>`;
      for (let r = top + 6; r < BASE - 10; r += 9)
        for (let c = x + 4; c < x + w - 3; c += 6) if ((r * 7 + c * 3) % 5 < 3) windows += `<rect x="${c}" y="${r}" width="2.2" height="3.4" rx="1"/>`;
    } else if (kind === "shikhara") {
      const shoulder = top + h * 0.45;
      shapes += `<path d="M${x} ${BASE}V${shoulder}C${x} ${top + h * 0.2} ${cx - 3} ${top + 6} ${cx} ${top}C${cx + 3} ${top + 6} ${x + w} ${top + h * 0.2} ${x + w} ${shoulder}V${BASE}Z"/><circle cx="${cx}" cy="${top - 2}" r="2"/>`;
      flags += `<path d="M${cx} ${top - 3}V${top - 15}l8 3-8 3"/>`;
      windows += `<path d="M${cx - 2} ${BASE - 16}v-6a2 2 0 0 1 4 0v6z"/>`;
    } else if (kind === "dome") {
      const wallTop = top + w * 0.55;
      shapes += `<rect x="${x}" y="${wallTop}" width="${w}" height="${BASE - wallTop}"/><path d="M${x} ${wallTop}A${w / 2} ${w * 0.55} 0 0 1 ${x + w} ${wallTop}Z"/><path d="M${cx} ${top - 4}v6" stroke="${fill}" stroke-width="1.6"/>`;
      windows += `<path d="M${cx - 2.5} ${BASE - 12}v-7a2.5 2.5 0 0 1 5 0v7z"/>`;
    }
  }
  // chhatri umbrellas on the steps
  const umbrellas = [44, 88, 152, 190].map((x) => `<path d="M${x - 7} 210q7-8 14 0z"/><path d="M${x} 210v6" stroke="${fill}" stroke-width="1.2"/>`).join("");
  return `<g fill="${fill}">${shapes}${umbrellas}</g><g fill="${lit}" opacity=".85">${windows}</g><g fill="none" stroke="${flag}" stroke-width="1.4" stroke-linejoin="round">${flags}</g>`;
}

export function emblemSvgV3(id: string, variant: EmblemVariant = "full", animated = false, brand = BRAND): string {
  const g = (n: string) => `${id}-${n}`;
  const full = variant === "full";
  const ink = variant === "ink" ? "#22102A" : "#E7BE63";
  const paper = variant === "ink" ? "#FFF4E2" : "#5E0F2C";
  const gold = full ? `url(#${g("gold")})` : ink;
  const teal = full ? `url(#${g("teal")})` : ink;
  const saffron = full ? `url(#${g("silk")})` : ink;
  const dark = full ? "#140A2E" : paper;

  const anim = animated
    ? `<style>
        .${g("run")}{animation:${g("run")} 3s linear infinite}
        @keyframes ${g("run")}{to{stroke-dashoffset:-240}}
        .${g("shim")}{animation:${g("shim")} 2.6s ease-in-out infinite}
        @keyframes ${g("shim")}{50%{opacity:.25;transform:translateX(3px)}}
        .${g("shim2")}{animation:${g("shim")} 2.6s ease-in-out -1.3s infinite}
        .${g("bob")}{animation:${g("bob")} 3s ease-in-out infinite}
        @keyframes ${g("bob")}{50%{transform:translateY(1.6px)}}
        .${g("sun")}{animation:${g("sun")} 5s ease-in-out infinite;transform-box:fill-box;transform-origin:50% 50%}
        @keyframes ${g("sun")}{50%{transform:scale(1.08);opacity:.8}}
        .${g("fly")}{animation:${g("fly")} 9s ease-in-out infinite}
        @keyframes ${g("fly")}{50%{transform:translate(8px,-4px)}}
        .${g("flame")}{animation:${g("flame")} 1.6s ease-in-out infinite;transform-box:fill-box;transform-origin:50% 90%}
        @keyframes ${g("flame")}{50%{transform:scale(.9,1.08) rotate(-3deg)}}
        .${g("halo")}{animation:${g("halo")} 1.6s ease-in-out infinite;transform-box:fill-box;transform-origin:50% 50%}
        @keyframes ${g("halo")}{50%{opacity:.35;transform:scale(1.15)}}
        @media (prefers-reduced-motion: reduce){.${g("run")},.${g("shim")},.${g("shim2")},.${g("bob")},.${g("sun")},.${g("fly")},.${g("flame")},.${g("halo")}{animation:none}}
      </style>`
    : "";

  // U and P, in their own coordinates, placed by the group transform below.
  const U = "M44 120V178A38 38 0 0 0 120 178V120";
  const NECK = "M156 214V100C156 72 176 60 194 66C212 72 214 100 196 110L176 118";
  const run = (d: string, delay: number) => animated && full
    ? `<path class="${g("run")}" d="${d}" fill="none" stroke="#FFE7A6" stroke-width="12" stroke-linecap="round" stroke-dasharray="30 210" opacity=".4" style="animation-delay:${delay}s"/><path class="${g("run")}" d="${d}" fill="none" stroke="#FFFBEF" stroke-width="4.5" stroke-linecap="round" stroke-dasharray="30 210" style="animation-delay:${delay}s"/>`
    : "";

  const diyas = [[58, 236], [150, 244], [190, 232]].map(([x, y], i) =>
    `<g class="${g("bob")}" style="animation-delay:${-i}s"><path d="M${x - 5} ${y}h10l-2 3h-6z" fill="${full ? "#C9772B" : ink}"/><path d="M${x} ${y - 7}c2.5 2.5 2.5 5 0 7c-2.5-2-2.5-4.5 0-7z" fill="${full ? "#FFD27A" : ink}"/>${full ? `<circle cx="${x}" cy="${y - 3}" r="6" fill="#FFB627" opacity=".25"/>` : ""}</g>`).join("");

  return `<svg viewBox="0 0 240 290" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${brand.name} emblem, ${brand.hindi}">
  <defs>
    <linearGradient id="${g("gold")}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#FFE7A6"/><stop offset=".35" stop-color="#E7BE63"/><stop offset=".65" stop-color="#B8862B"/><stop offset="1" stop-color="#F6D98C"/>
    </linearGradient>
    <linearGradient id="${g("silk")}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#FFE08A"/><stop offset=".45" stop-color="#FFB627"/><stop offset="1" stop-color="#F0445A"/>
    </linearGradient>
    <linearGradient id="${g("sky")}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0F0828"/><stop offset=".35" stop-color="#2E1257"/><stop offset=".6" stop-color="#7A2763"/><stop offset=".8" stop-color="#E0565B"/><stop offset="1" stop-color="#FFB25E"/>
    </linearGradient>
    <linearGradient id="${g("river")}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#C2415A"/><stop offset=".35" stop-color="#5E1D52"/><stop offset="1" stop-color="#1A0B30"/>
    </linearGradient>
    <radialGradient id="${g("sunGlow")}"><stop offset="0" stop-color="#FFD27A" stop-opacity=".9"/><stop offset=".45" stop-color="#FF8A3D" stop-opacity=".45"/><stop offset="1" stop-color="#FF8A3D" stop-opacity="0"/></radialGradient>
    <linearGradient id="${g("teal")}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4FD1C5"/><stop offset="1" stop-color="#1F6FB2"/></linearGradient>
    <radialGradient id="${g("flameGlow")}"><stop offset="0" stop-color="#FFB627" stop-opacity=".7"/><stop offset="1" stop-color="#FF8A1F" stop-opacity="0"/></radialGradient>
    <clipPath id="${g("clip")}"><path d="${CUSPED}"/></clipPath>
  </defs>
  ${anim}
  <path d="${OUTER}" fill="none" stroke="${gold}" stroke-width="2" opacity=".75"/>
  <path d="${CUSPED}" fill="${full ? `url(#${g("sky")})` : "none"}"/>

  <g clip-path="url(#${g("clip")})">
    ${full ? `<g fill="#FFF4E2"><circle cx="48" cy="104" r="1.3" opacity=".7"/><circle cx="72" cy="70" r="1" opacity=".6"/><circle cx="182" cy="84" r="1.2" opacity=".6"/><circle cx="198" cy="118" r="1" opacity=".5"/><path d="M196 96l1.4 3.6 3.6 1.4-3.6 1.4-1.4 3.6-1.4-3.6-3.6-1.4 3.6-1.4z" opacity=".8"/></g>` : ""}
    <!-- birds heading home -->
    <g class="${g("fly")}" fill="none" stroke="${full ? "#2A0F3A" : ink}" stroke-width="1.6" stroke-linecap="round" opacity=".8">
      <path d="M150 132q4-4 8 0q4-4 8 0"/><path d="M168 122q3-3 6 0q3-3 6 0"/><path d="M140 118q2.5-2.5 5 0q2.5-2.5 5 0"/>
    </g>
    <!-- Kashi ghats in silhouette -->
    ${full ? `<g opacity=".55" transform="translate(240 0) scale(-1 1) translate(0 -14)">${skyline("#4A1A55", "#4A1A55", "#4A1A55")}</g>` : ""}
    <!-- the setting sun behind the ghats -->
    ${full ? `<circle class="${g("sun")}" cx="124" cy="184" r="58" fill="url(#${g("sunGlow")})"/>` : ""}
    <circle cx="124" cy="186" r="22" fill="${full ? "#FFC46B" : "none"}" stroke="${full ? "none" : ink}" stroke-width="1.5"/>
    ${skyline(full ? "#2A0F3A" : (variant === "ink" ? "#22102A" : "#E7BE63"), full ? "#FFC46B" : paper, full ? "#FF8A3D" : ink)}
    <!-- ghat steps -->
    <g fill="${full ? "#3A1648" : ink}" opacity="${full ? 1 : 0.5}"><rect x="10" y="204" width="220" height="4"/><rect x="10" y="210" width="220" height="3"/><rect x="10" y="215" width="220" height="3"/></g>
    <!-- the Ganga at dusk, with the sun's light broken into streaks -->
    <rect x="10" y="218" width="220" height="70" fill="${full ? `url(#${g("river")})` : "none"}"/>
    <g stroke="${full ? "#FFC46B" : ink}" stroke-linecap="round">
      <path class="${g("shim")}" d="M106 223h28M98 230h18M122 230h22M110 237h20" stroke-width="2.4" opacity=".9"/>
      <path class="${g("shim2")}" d="M112 249h18M100 256h12M122 256h14" stroke-width="1.8" opacity=".6"/>
    </g>
    <path d="M30 228q8-3 16 0t16 0M176 236q8-3 16 0t16 0" fill="none" stroke="${full ? "#7FD3DE" : ink}" stroke-width="1.4" opacity=".55"/>
    ${diyas}
  </g>
  <path d="${CUSPED}" fill="none" stroke="${gold}" stroke-width="5" stroke-linejoin="round"/>

  <!-- U: a clay diya with a buta flame. P: a peacock. -->
  <g transform="translate(116 112) scale(.62) translate(-125 -130)">
    ${full ? `<circle class="${g("halo")}" cx="82" cy="150" r="36" fill="url(#${g("flameGlow")})"/>` : ""}
    <path class="${g("flame")}" d="M82 116C96 128 98 150 86 162C76 170 64 162 68 150C71 141 80 141 80 133C80 127 82 121 82 116Z" fill="${saffron}"/>
    <path d="M78 156c-3-5 0-10 4-10" fill="none" stroke="${full ? "#FFF1C9" : paper}" stroke-width="2.4" stroke-linecap="round" opacity=".9"/>
    <path d="M44 128C38 124 36 120 38 116M120 128C126 124 128 120 126 116" fill="none" stroke="${gold}" stroke-width="6" stroke-linecap="round"/>
    <path d="${U}" fill="none" stroke="${dark}" stroke-width="22" stroke-linecap="round" opacity="${full ? 0.5 : 0}"/>
    <path d="${U}" fill="none" stroke="${gold}" stroke-width="17" stroke-linecap="round"/>${run(U, 0)}
    <path d="${NECK}" fill="none" stroke="${dark}" stroke-width="20" stroke-linecap="round" stroke-linejoin="round" opacity="${full ? 0.5 : 0}"/>
    <path d="${NECK}" fill="none" stroke="${teal}" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/>${run(NECK, -1.5)}
    <path d="M184 110L150 132L178 124Z" fill="${gold}"/>
    <g stroke="${teal}" stroke-width="2.4" stroke-linecap="round"><path d="M188 62l-6-16M194 61l0-17M200 62l6-16"/></g>
    <g fill="${full ? "#FFB627" : ink}"><circle cx="182" cy="45" r="3"/><circle cx="194" cy="42" r="3"/><circle cx="206" cy="45" r="3"/></g>
    <ellipse cx="182" cy="92" rx="10" ry="13" fill="${gold}"/><ellipse cx="182" cy="93" rx="6" ry="8" fill="${full ? "#1F6FB2" : paper}"/><ellipse cx="182" cy="94" rx="3" ry="4" fill="${full ? "#140A2E" : ink}"/>
    <circle cx="197" cy="72" r="3" fill="${full ? "#FFF4E2" : paper}"/>
  </g>

  <!-- अतुल्य उत्तर प्रदेश, below UP -->
  <text x="120" y="250" text-anchor="middle" font-family="Mukta, 'Noto Sans Devanagari', sans-serif" font-weight="700" font-size="17" letter-spacing=".5"
    fill="${full ? "#FFE7A6" : ink}" stroke="${full ? "#1A0B30" : paper}" stroke-width="${full ? 3.2 : 0}" paint-order="stroke" stroke-linejoin="round">${brand.hindi}</text>

  <g fill="${gold}" opacity="${full ? 0.9 : 1}">
    <rect x="28" y="262" width="184" height="3"/><rect x="20" y="272" width="200" height="3"/>
  </g>
</svg>`;
}
