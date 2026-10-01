// More marks in the V1.1 family: the cusped Rumi Darwaza arch, dusk on the Ganga, and U and P drawn as things from UP.
import { CUSPED, OUTER, emblemSvgV11 } from "../iup/src/brand/emblem-v1-1.ts";

const defs = (id, sky) => `<defs>
  <linearGradient id="${id}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFE7A6"/><stop offset=".35" stop-color="#E7BE63"/><stop offset=".65" stop-color="#B8862B"/><stop offset="1" stop-color="#F6D98C"/></linearGradient>
  <linearGradient id="${id}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE08A"/><stop offset=".45" stop-color="#FFB627"/><stop offset="1" stop-color="#F0445A"/></linearGradient>
  <linearGradient id="${id}k" x1="0" y1="0" x2="0" y2="1">${sky.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join("")}</linearGradient>
  <linearGradient id="${id}t" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4FD1C5"/><stop offset="1" stop-color="#1F6FB2"/></linearGradient>
  <radialGradient id="${id}m"><stop offset="0" stop-color="#FFF4E2" stop-opacity=".5"/><stop offset="1" stop-color="#FFF4E2" stop-opacity="0"/></radialGradient>
</defs>
<style>
  .${id}run{animation:${id}run 2.8s linear infinite}@keyframes ${id}run{to{stroke-dashoffset:-232}}
  .${id}fl{animation:${id}fl 1.6s ease-in-out infinite;transform-box:fill-box;transform-origin:50% 90%}@keyframes ${id}fl{50%{transform:scale(.9,1.08) rotate(-3deg)}}
  .${id}wv{animation:${id}wv 3s linear infinite}@keyframes ${id}wv{to{stroke-dashoffset:-40}}
  .${id}bob{animation:${id}bob 3.4s ease-in-out infinite}@keyframes ${id}bob{50%{transform:translateY(3px) rotate(-1deg)}}
  @media (prefers-reduced-motion: reduce){.${id}run,.${id}fl,.${id}wv,.${id}bob{animation:none}}
</style>`;
const DUSK = [[0, "#120A2C"], [0.5, "#341452"], [0.8, "#7A2A5E"], [1, "#B33A58"]];
const DAWN = [[0, "#3B2A6B"], [0.45, "#C2507A"], [0.75, "#F28C5A"], [1, "#FFD08A"]];
const frame = (id, sky, inner) => `<svg viewBox="0 0 240 290" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Incredible UP emblem">${defs(id, sky)}
  <path d="${OUTER}" fill="none" stroke="url(#${id}g)" stroke-width="2" opacity=".75"/>
  <path d="${CUSPED}" fill="url(#${id}k)" stroke="url(#${id}g)" stroke-width="5" stroke-linejoin="round"/>
  <g fill="#FFF4E2"><circle cx="44" cy="124" r="1.6" opacity=".7"/><circle cx="64" cy="98" r="1.2" opacity=".6"/><circle cx="206" cy="176" r="1.3" opacity=".6"/><path d="M196 140l1.8 4.5 4.5 1.8-4.5 1.8-1.8 4.5-1.8-4.5-4.5-1.8 4.5-1.8z" opacity=".85"/></g>
  ${inner}
  <path class="${id}wv" d="M40 236q10-6 20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0" fill="none" stroke="#7FD3DE" stroke-width="2.4" stroke-dasharray="14 6" stroke-linecap="round" opacity=".85"/>
  <path d="M56 246q8-4 16 0t16 0t16 0t16 0t16 0t16 0t16 0t16 0" fill="none" stroke="#7FD3DE" stroke-width="1.4" opacity=".5"/>
  <g fill="url(#${id}g)" opacity=".9"><rect x="28" y="262" width="184" height="3"/><rect x="20" y="272" width="200" height="3"/></g>
</svg>`;
const run = (id, d, delay = 0) => `<path class="${id}run" d="${d}" fill="none" stroke="#FFE7A6" stroke-width="12" stroke-linecap="round" stroke-dasharray="30 202" opacity=".45" style="animation-delay:${delay}s"/><path class="${id}run" d="${d}" fill="none" stroke="#FFFBEF" stroke-width="4.5" stroke-linecap="round" stroke-dasharray="30 202" style="animation-delay:${delay}s"/>`;
const moon = (x, y, k = 1) => `<circle cx="${x + 2}" cy="${y + 9}" r="${13 * k}" fill="url(#MOONID)"/><path d="M${x} ${y}a${9 * k} ${9 * k} 0 1 0 ${6.5 * k} ${15.5 * k}a${7 * k} ${7 * k} 0 1 1 -${6.5 * k} -${15.5 * k}z" fill="#FFF4E2"/>`;
const G = (id) => `url(#${id}g)`, S = (id) => `url(#${id}s)`;
const wrap = (inner) => `<g transform="translate(120 170) scale(.84) translate(-125 -160)">${inner}</g>`;
const DIYA_U = "M44 120V178A38 38 0 0 0 120 178V120";
const diya = (id) => `<path class="${id}fl" d="M82 116C96 128 98 150 86 162C76 170 64 162 68 150C71 141 80 141 80 133C80 127 82 121 82 116Z" fill="${S(id)}"/>
  <path d="M44 128C38 124 36 120 38 116M120 128C126 124 128 120 126 116" fill="none" stroke="${G(id)}" stroke-width="6" stroke-linecap="round"/>
  <path d="${DIYA_U}" fill="none" stroke="${G(id)}" stroke-width="17" stroke-linecap="round"/>${run(id, DIYA_U)}`;

// 1. Current V1.1: diya U, Sarus crane P, small moon in the bowl.
export const current = (id) => emblemSvgV11(id, "full", true);

// 2. Nauka: the U is a Ganga boat, the P is its mast with a saffron sail for the bowl, moon over the sail.
export function boat(id) {
  const hull = "M34 150C40 200 70 214 92 214C114 214 122 200 128 186";
  const mast = "M128 236V60";
  return frame(id, DUSK, wrap(`<g class="${id}bob">
    <path d="M128 70C158 74 176 84 176 100C176 116 158 124 128 126Z" fill="${S(id)}"/>
    <path d="M128 70C158 74 176 84 176 100C176 116 158 124 128 126" fill="none" stroke="${G(id)}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M34 150V178A38 38 0 0 0 110 178V150" fill="none" stroke="${G(id)}" stroke-width="17" stroke-linecap="round"/>
    ${run(id, "M34 150V178A38 38 0 0 0 110 178V150")}
    <path d="M110 178H128" stroke="#C99A3E" stroke-width="8"/>
    <path d="${mast}" stroke="#D9AE52" stroke-width="14" stroke-linecap="round"/>${run(id, mast, -1.4)}
    <path d="M128 56l12 6-12 6z" fill="#F0445A"/>
    <path d="M34 152C34 140 26 132 18 136M110 152C110 140 118 132 126 136" fill="none" stroke="#D9AE52" stroke-width="7" stroke-linecap="round"/>
    <path d="M58 168q14 8 28 0" fill="none" stroke="#8A5A17" stroke-width="2" opacity=".6"/>
  </g>`)).replace("<!--m-->", "") .replace("</svg>", `<g transform="translate(120 170) scale(.84) translate(-125 -160)">${moon(170, 38, 0.75).replace(/MOONID/g, id + "m")}</g></svg>`);
}

// 3. Mor: the P is a peacock, its neck the stem and its crested head closing the bowl, with a feather eye inside.
export function peacock(id) {
  const neck = "M156 244V100C156 72 176 60 194 66C212 72 214 100 196 110L176 118";
  return frame(id, DUSK, wrap(`${diya(id)}
    <path d="${neck}" fill="none" stroke="url(#${id}t)" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/>${run(id, neck, -1.4)}
    <path d="M184 110L150 132L178 124Z" fill="#E7BE63"/>
    <g stroke="url(#${id}t)" stroke-width="2.4" stroke-linecap="round"><path d="M188 62l-6-16M194 61l0-17M200 62l6-16"/></g>
    <g fill="#FFB627"><circle cx="182" cy="45" r="3"/><circle cx="194" cy="42" r="3"/><circle cx="206" cy="45" r="3"/></g>
    <ellipse cx="182" cy="92" rx="10" ry="13" fill="#E7BE63"/><ellipse cx="182" cy="93" rx="6" ry="8" fill="#1F6FB2"/><ellipse cx="182" cy="94" rx="3" ry="4" fill="#140A2E"/>
    <circle cx="197" cy="72" r="3" fill="#FFF4E2"/>`));
}

// 4. Zari weave: U and P as two silk ribbons with a woven border and buta dots, moon inside the P.
export function weave(id) {
  const U = "M50 100V172A38 38 0 0 0 126 172V100";
  const P = "M126 100V244M126 100H150A30 30 0 0 1 150 160H126";
  const butas = [[50, 120], [50, 150], [70, 202], [106, 202], [126, 130], [126, 200], [174, 128]].map(([x, y]) => `<path d="M${x} ${y - 4}c3 2 3 6 0 8c-3-2-3-6 0-8z" fill="#5E0F2C"/>`).join("");
  return frame(id, DUSK, wrap(`
    <path d="${U}" fill="none" stroke="#5E0F2C" stroke-width="26" stroke-linecap="round"/>
    <path d="${U}" fill="none" stroke="${G(id)}" stroke-width="20" stroke-linecap="round"/>
    <path d="${U}" fill="none" stroke="#5E0F2C" stroke-width="1.6" stroke-dasharray="3 3"/>
    <path d="${P}" fill="none" stroke="#5E0F2C" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="${P}" fill="none" stroke="${S(id)}" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="${P}" fill="none" stroke="#5E0F2C" stroke-width="1.6" stroke-dasharray="3 3"/>
    ${butas}${run(id, U)}${run(id, "M126 244V100H150A30 30 0 0 1 150 160H126", -1.4)}
    ${moon(146, 120, 0.8).replace(/MOONID/g, id + "m")}`));
}

// 5. Bhor (dawn): the V1.1 diya and crane at sunrise, with a small rising sun inside the P instead of the moon.
export function dawn(id) {
  const neck = "M156 244V100C156 72 176 60 194 66C212 72 214 100 196 110L176 118";
  return frame(id, DAWN, wrap(`${diya(id)}
    <path d="${neck}" fill="none" stroke="${G(id)}" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/>${run(id, neck, -1.4)}
    <path d="M184 110L140 140L178 124Z" fill="${G(id)}"/>
    <path d="M176 66C182 58 196 56 202 64C196 66 186 68 176 66Z" fill="#F0445A"/>
    <circle cx="183" cy="92" r="16" fill="#FFB627" opacity=".35"/><circle cx="183" cy="92" r="9" fill="#FFF1C9"/>
    <circle cx="197" cy="72" r="3" fill="#140A2E"/>`));
}
