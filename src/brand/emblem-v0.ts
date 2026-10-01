// Logo V0 (kept for reference). The Incredible UP emblem, as SVG markup shared by the site and the logo sheet.
//
// How it reads: a Mughal arch frames dusk over the ghats. The U is the Ganga's
// crescent bend at Varanasi, cradling the setting sun. Its right bank rises into
// a temple flagpole whose saffron dhwaja forms the bowl of the P. Diyas float
// on the ghat steps below, and a crescent moon rises over the city.

import type { EmblemVariant } from "./emblem";

export function emblemSvgV0(id: string, variant: EmblemVariant = "full", animated = false): string {
  const g = (n: string) => `${id}-${n}`;
  const mono = variant !== "full";
  const ink = variant === "ink" ? "#22102A" : "#E7BE63";
  const gold = mono ? ink : `url(#${g("gold")})`;
  const saffron = mono ? ink : `url(#${g("saffron")})`;
  const sky = variant === "full" ? `url(#${g("sky")})` : "none";
  const river = mono ? (variant === "ink" ? "#FFF4E2" : "#5E0F2C") : "#7FD3DE";
  const sun = mono ? ink : `url(#${g("sun")})`;
  const anim = animated
    ? `<style>
        .${g("flow")}{animation:${g("flow")} 2.4s linear infinite}
        @keyframes ${g("flow")}{to{stroke-dashoffset:-26}}
        .${g("glow")}{animation:${g("glow")} 3.2s ease-in-out infinite;transform-origin:100px 176px}
        @keyframes ${g("glow")}{50%{opacity:.15;transform:scale(1.18)}}
        .${g("flame")}{animation:${g("flame")} 1.3s ease-in-out infinite;transform-box:fill-box;transform-origin:50% 100%}
        @keyframes ${g("flame")}{50%{transform:scaleY(.75)}}
        @media (prefers-reduced-motion: reduce){.${g("flow")},.${g("glow")},.${g("flame")}{animation:none}}
      </style>`
    : "";

  return `<svg viewBox="0 0 240 290" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Incredible UP emblem">
  <defs>
    <linearGradient id="${g("gold")}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#FFE7A6"/><stop offset=".35" stop-color="#E7BE63"/><stop offset=".65" stop-color="#B8862B"/><stop offset="1" stop-color="#F6D98C"/>
    </linearGradient>
    <linearGradient id="${g("saffron")}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#FFB627"/><stop offset="1" stop-color="#F0445A"/>
    </linearGradient>
    <linearGradient id="${g("sky")}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#140A2E"/><stop offset=".55" stop-color="#3A1555"/><stop offset=".82" stop-color="#8C2F5C"/><stop offset="1" stop-color="#C2415A"/>
    </linearGradient>
    <radialGradient id="${g("sun")}" cx=".45" cy=".4" r=".7">
      <stop offset="0" stop-color="#FFF1C9"/><stop offset=".55" stop-color="#FFB627"/><stop offset="1" stop-color="#FF8A1F"/>
    </radialGradient>
  </defs>
  ${anim}
  <path d="M18 284V118C18 74 64 44 120 10C176 44 222 74 222 118V284Z" fill="${sky}" stroke="${gold}" stroke-width="5" stroke-linejoin="round"/>
  <path d="M30 284V122C30 84 70 58 120 26C170 58 210 84 210 122V284" fill="none" stroke="${gold}" stroke-width="1.2" opacity=".7"/>
  <g fill="${mono ? ink : "#FFF4E2"}">
    <path d="M58 140l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/>
    <path d="M40 110l1.6 4 4 1.6-4 1.6-1.6 4-1.6-4-4-1.6 4-1.6z" opacity=".8"/>
    <path d="M193 132a14 14 0 1 0 8 24a11 11 0 1 1 -8 -24z"/>
    <circle cx="176" cy="160" r="1.6" opacity=".7"/><circle cx="48" cy="182" r="1.4" opacity=".6"/><circle cx="196" cy="186" r="1.2" opacity=".6"/>
  </g>
  ${mono ? "" : `<circle class="${g("glow")}" cx="100" cy="176" r="34" fill="#FFB627" opacity=".28"/>`}
  <circle cx="100" cy="176" r="19" fill="${sun}"/>
  <path d="M64 92V176A36 36 0 0 0 136 176V50" fill="none" stroke="${gold}" stroke-width="18" stroke-linecap="round"/>
  <path class="${g("flow")}" d="M64 98V176A36 36 0 0 0 136 176V122" fill="none" stroke="${river}" stroke-width="2.6" stroke-dasharray="9 4" stroke-linecap="round" opacity=".9"/>
  <path d="M136 60H157A20 20 0 0 1 157 100H136" fill="none" stroke="${saffron}" stroke-width="13" stroke-linejoin="round"/>
  <circle cx="136" cy="38" r="6" fill="${gold}"/>
  <path d="M136 26q4 6 0 9q-4-3 0-9z" fill="${saffron}"/>
  <g fill="${mono ? ink : "#E7BE63"}" opacity="${mono ? 1 : 0.85}">
    <rect x="30" y="254" width="180" height="3"/><rect x="24" y="264" width="192" height="3"/><rect x="18" y="274" width="204" height="3"/>
  </g>
  <g>
    ${[52, 120, 188].map((x) => `<path d="M${x - 7} 252q7 6 14 0z" fill="${mono ? ink : "#B5562C"}"/><path class="${g("flame")}" d="M${x} 241q4 5 0 10q-4-5 0-10z" fill="${mono ? ink : "#FFD27A"}"/>`).join("")}
  </g>
</svg>`;
}
