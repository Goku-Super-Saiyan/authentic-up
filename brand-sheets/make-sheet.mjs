import { emblemSvgV3 as emblemSvg } from "./iup/src/brand/emblem-v3.ts";
import { emblemSvgV11 } from "./iup/src/brand/emblem-v1-1.ts";
import { emblemSvgV0 } from "./iup/src/brand/emblem-v0.ts";
import { emblemSvgV1 } from "./iup/src/brand/emblem-v1.ts";
import fs from "fs";

const E = (id, v = "full", a = false) => emblemSvg(id, v, a);
const swatches = [["Night", "#0E0720"], ["Zari gold", "#E7BE63"], ["Marigold", "#FFB627"], ["Sindoor", "#F0445A"], ["Ganga", "#7FD3DE"], ["Banarasi silk", "#5E0F2C"], ["Ivory", "#FFF4E2"]];
const parts = [
  ["The U is a diya", "A clay diya with a flame shaped like a Banarasi buta. It flickers and glows, and zari light runs through the gold."],
  ["The P is a peacock", "The mor, India's national bird. Its teal neck is the stem of the P, its crested head closes the bowl, and a feather eye sits inside."],
  ["The ghats of Kashi", "Temple shikharas with saffron flags, old havelis with lit windows, and chhatri umbrellas on the steps rise behind the letters."],
  ["Dusk on the Ganga", "The sun sinks between the temples. Its light breaks into shimmering streaks on the river, diyas float past and birds fly home."],
  ["अतुल्य उत्तर प्रदेश", "The Hindi name sits on the river below UP, inside the Rumi Darwaza arch."],
];

const page = `<title>Incredible UP Logo</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Rozha+One&family=Mukta:wght@300;400;600&family=IBM+Plex+Mono:wght@400;500&display=swap">
<style>
/* Logo sheet: one dusk-dark look. Hero reveal, then the story of the mark, lockups, colour versions, sizes, palette. */
:root {
  color-scheme: dark;
  --night: #0E0720; --dusk: #1E0F3D; --zari: #E7BE63; --marigold: #FFB627; --sindoor: #F0445A;
  --ganga: #7FD3DE; --silk: #5E0F2C; --ivory: #FFF4E2; --mist: #B7A8CF; --line: rgba(255,244,226,.12);
  --f-display: "Rozha One", "Noto Serif Devanagari", Georgia, serif;
  --f-body: "Mukta", "Noto Sans Devanagari", system-ui, sans-serif;
  --f-mono: "IBM Plex Mono", ui-monospace, monospace;
}
* { box-sizing: border-box; }
body { margin: 0; background: var(--night); color: var(--ivory); font-family: var(--f-body); font-size: 17px; line-height: 1.6; }
.wrap { max-width: 1180px; margin: 0 auto; padding-inline: clamp(16px, 4vw, 40px); }
.eyebrow { font-family: var(--f-mono); font-size: 12px; letter-spacing: .28em; text-transform: uppercase; color: var(--marigold); margin: 0; }
h1, h2, h3 { font-family: var(--f-display); font-weight: 400; margin: 0; line-height: 1; text-wrap: balance; }
h2 { font-size: clamp(36px, 5vw, 64px); margin-top: 12px; }
.zari { background: linear-gradient(100deg,#B8862B,#FFE7A6 25%,#E7BE63 45%,#9C6A1C 65%,#FFE7A6 85%,#E7BE63); background-size: 200% 100%; -webkit-background-clip: text; background-clip: text; color: transparent; animation: zari 6s linear infinite; }
@keyframes zari { to { background-position: -200% 0; } }
svg { display: block; width: 100%; height: 100%; }
section { padding-block: clamp(64px, 9vw, 120px); border-top: 1px solid var(--line); }

.hero { border: 0; position: relative; overflow: hidden; text-align: center; padding-block: clamp(56px, 8vw, 110px) clamp(64px, 9vw, 120px);
  background: radial-gradient(60% 50% at 50% 38%, rgba(255,182,39,.18), transparent 70%), linear-gradient(180deg, #0E0720 0%, #1E0F3D 60%, #3A1555 100%); }
.hero .mark { width: min(300px, 62vw); aspect-ratio: 240 / 290; margin: 0 auto; filter: drop-shadow(0 30px 80px rgba(255,182,39,.28));
  animation: rise 1.6s cubic-bezier(.2,.8,.2,1) both; }
@keyframes rise { from { opacity: 0; transform: translateY(40px) scale(.85); filter: blur(14px); } }
.hero h1 { margin-top: 36px; font-size: clamp(54px, 9vw, 120px); letter-spacing: -.01em; animation: fade 1.2s .6s both; }
.hero .hi { font-family: var(--f-display); font-size: clamp(22px, 3vw, 34px); color: var(--mist); margin: 10px 0 0; animation: fade 1.2s .9s both; }
@keyframes fade { from { opacity: 0; transform: translateY(16px); } }

.story { display: grid; grid-template-columns: minmax(0, .8fr) minmax(0, 1fr); gap: clamp(32px, 6vw, 80px); align-items: center; margin-top: 40px; }
.story .mark { max-width: 360px; aspect-ratio: 240 / 290; width: 100%; margin-inline: auto; }
.parts { display: grid; gap: 0; margin: 0; padding: 0; list-style: none; }
.parts li { padding: 22px 0; border-top: 1px solid var(--line); display: grid; grid-template-columns: 14px 1fr; gap: 16px; }
.parts li:last-child { border-bottom: 1px solid var(--line); }
.parts i { width: 10px; height: 10px; margin-top: 10px; transform: rotate(45deg); background: var(--zari); }
.parts b { font-size: 21px; font-weight: 600; display: block; }
.parts span { color: rgba(255,244,226,.72); }

.lockups { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; margin-top: 40px; }
.tile { border-radius: 24px; border: 1px solid var(--line); padding: 32px 24px; display: grid; place-items: center; min-height: 340px; position: relative; }
.tile .cap { position: absolute; left: 20px; bottom: 16px; font-family: var(--f-mono); font-size: 11px; letter-spacing: .14em; text-transform: uppercase; opacity: .65; }
.stack { display: grid; justify-items: center; gap: 14px; text-align: center; }
.stack .m { width: 120px; aspect-ratio: 240/290; }
.word { font-family: var(--f-display); font-size: 34px; line-height: 1; }
.word small { display: block; font-family: var(--f-body); font-size: 13px; color: var(--mist); margin-top: 6px; letter-spacing: .02em; }
.row { display: flex; align-items: center; gap: 14px; }
.row .m { width: 56px; aspect-ratio: 240 / 290; flex: none; }
.row .word { font-size: 30px; }
.solo .m { width: 170px; aspect-ratio: 240 / 290; }

.versions { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; margin-top: 40px; }
.versions .tile .m { width: 150px; aspect-ratio: 240 / 290; }
.t-night { background: linear-gradient(180deg, #160B30, #0E0720); }
.t-silk { background: var(--silk); color: var(--zari); }
.t-ivory { background: var(--ivory); color: #22102A; }
.t-ivory .word small { color: #5A4A66; }

.sizes { display: flex; flex-wrap: wrap; align-items: flex-end; gap: 36px; margin-top: 40px; }
.sizes figure { margin: 0; display: grid; gap: 10px; justify-items: center; }
.sizes figcaption { font-family: var(--f-mono); font-size: 12px; color: var(--mist); font-variant-numeric: tabular-nums; }
.fav { display: flex; align-items: center; gap: 10px; background: #2A2340; border-radius: 10px 10px 0 0; padding: 8px 14px; font-size: 13px; width: fit-content; }
.fav .m { width: 16px; aspect-ratio: 240 / 290; }

.palette { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 14px; margin-top: 40px; }
.sw { border-radius: 18px; overflow: hidden; border: 1px solid var(--line); }
.sw div { height: 110px; }
.sw p { margin: 0; padding: 10px 14px 12px; font-size: 15px; }
.sw code { display: block; font-family: var(--f-mono); font-size: 12px; color: var(--mist); }

.type { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; margin-top: 40px; }
.type .tile { place-items: start; min-height: 0; padding: 28px; }
.type .big { font-family: var(--f-display); font-size: clamp(48px, 6vw, 76px); line-height: 1; }
.type .body { font-size: 22px; }
.type p { margin: 8px 0 0; color: rgba(255,244,226,.7); }
.note { margin-top: 28px; color: var(--mist); font-size: 15px; max-width: 60em; }

@media (max-width: 860px) {
  .story, .type { grid-template-columns: 1fr; }
  .lockups, .versions { grid-template-columns: 1fr !important; }
}
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation: none !important; } }
</style>

<header class="hero">
  <div class="wrap">
    <div class="mark">${E("hero", "full", true)}</div>
    <p class="eyebrow" style="margin-top:28px">Logo V3</p>
    <h1 style="margin-top:14px">Incredible <span class="zari">UP</span></h1>
    <p class="hi">अतुल्य उत्तर प्रदेश</p>
  </div>
</header>

<section>
  <div class="wrap">
    <p class="eyebrow">How the mark reads</p>
    <h2>A diya and a peacock, <span class="zari">dusk on the ghats</span></h2>
    <div class="story">
      <div class="mark">${E("story", "full", true)}</div>
      <ul class="parts">
        ${parts.map(([t, d]) => `<li><i></i><div><b>${t}</b><span>${d}</span></div></li>`).join("")}
      </ul>
    </div>
  </div>
</section>

<section>
  <div class="wrap">
    <p class="eyebrow">Lockups</p>
    <h2>Three ways to sign the bazaar</h2>
    <div class="lockups">
      <div class="tile t-night"><div class="stack"><div class="m">${E("l1")}</div><div class="word">Incredible <span class="zari">UP</span><small>अतुल्य उत्तर प्रदेश</small></div></div><span class="cap">Stacked · splash, packaging</span></div>
      <div class="tile t-night"><div class="row"><div class="m">${E("l2")}</div><div class="word">Incredible <span class="zari">UP</span><small>अतुल्य उत्तर प्रदेश</small></div></div><span class="cap">Horizontal · site header</span></div>
      <div class="tile t-night solo"><div class="m">${E("l3")}</div><span class="cap">Emblem · app icon, stamps</span></div>
    </div>
  </div>
</section>

<section>
  <div class="wrap">
    <p class="eyebrow">Colour versions</p>
    <h2>Full colour, zari on silk, ink on paper</h2>
    <div class="versions">
      <div class="tile t-night"><div class="stack"><div class="m">${E("v1")}</div><div class="word">Incredible UP</div></div><span class="cap">Full colour</span></div>
      <div class="tile t-silk"><div class="stack"><div class="m">${E("cv2", "gold")}</div><div class="word">Incredible UP</div></div><span class="cap">Gold foil · gift boxes, tags</span></div>
      <div class="tile t-ivory"><div class="stack"><div class="m">${E("v3", "ink")}</div><div class="word">Incredible UP</div></div><span class="cap">Single ink · invoices, rubber stamp</span></div>
    </div>
  </div>
</section>

<section>
  <div class="wrap">
    <p class="eyebrow">Small sizes</p>
    <h2>Still reads as UP at a glance</h2>
    <div class="sizes">
      ${[96, 64, 40, 24].map((s, i) => `<figure><div style="width:${Math.round(s * 240 / 290)}px;height:${s}px">${E("s" + i)}</div><figcaption>${s}px</figcaption></figure>`).join("")}
      <figure><div class="fav"><span class="m">${E("fav")}</span>Incredible UP</div><figcaption>Browser tab</figcaption></figure>
    </div>
  </div>
</section>

<section>
  <div class="wrap">
    <p class="eyebrow">Version history</p>
    <h2>V3 with V1.1 and V1 kept alongside</h2>
    <div class="versions">
      <div class="tile t-night"><div class="stack"><div class="m" style="width:150px">${E("h2", "full", true)}</div><div class="word">V3 · current<small>Diya U, peacock P, dusk on the Kashi ghats</small></div></div></div>
      <div class="tile t-night"><div class="stack"><div class="m" style="width:150px">${emblemSvgV11("h1", "full", true)}</div><div class="word">V1.1<small>Diya U, Sarus crane P, moon in the P</small></div></div></div>
      <div class="tile t-night"><div class="stack"><div class="m" style="width:150px">${emblemSvgV1("h0", "full", true)}</div><div class="word">V1<small>Diya U, Sarus crane P, cusped arch</small></div></div></div>
    </div>
    <p class="note">V1.1, V1 and V0 are kept unchanged in brand/v1-1, brand/v1 and brand/v0, and in their emblem files, so any of them can be brought back at any time.</p>
  </div>
</section>

<section>
  <div class="wrap">
    <p class="eyebrow">Palette</p>
    <h2>Colours taken from the river at dusk</h2>
    <div class="palette">
      ${swatches.map(([n, h]) => `<div class="sw"><div style="background:${h}"></div><p>${n}<code>${h}</code></p></div>`).join("")}
    </div>
  </div>
</section>

<section>
  <div class="wrap">
    <p class="eyebrow">Type</p>
    <h2>Two faces that speak Hindi and English</h2>
    <div class="type">
      <div class="tile t-night"><span class="big">Rozha One</span><span class="big" style="font-size:clamp(36px,4vw,52px);color:var(--zari)">अतुल्य</span><p>Display. Headlines, the wordmark, prices.</p></div>
      <div class="tile t-night"><span class="body" style="font-family:var(--f-body);font-weight:600">Mukta</span><span class="body" style="font-family:var(--f-body)">Handwoven in Madanpura, Varanasi · वाराणसी</span><p>Body text, buttons and product details.</p></div>
    </div>
    <p class="note">The V3 SVG files are saved with the site source in brand/v3, with earlier versions in brand/v1-1, brand/v1 and brand/v0. The wordmark uses Rozha One. Before it goes to print, the text should be converted to outlines so it looks the same without the font installed.</p>
  </div>
</section>
`;
fs.writeFileSync("logo-sheet/index.html", page);

// Standalone SVG files for the brand folder.
const out = "iup/public/brand/v3";
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(`${out}/emblem-full.svg`, E("full"));
fs.writeFileSync(`${out}/emblem-gold.svg`, E("gold", "gold"));
fs.writeFileSync(`${out}/emblem-ink.svg`, E("ink", "ink"));
const inner = E("h").replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "");
fs.writeFileSync(`${out}/logo-horizontal.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 140" role="img" aria-label="Incredible UP">
  <svg x="10" y="10" width="100" height="120" viewBox="0 0 240 290">${inner}</svg>
  <text x="128" y="78" font-family="Rozha One, Georgia, serif" font-size="56" fill="#FFF4E2">Incredible <tspan fill="#E7BE63">UP</tspan></text>
  <text x="130" y="112" font-family="Mukta, sans-serif" font-size="20" fill="#B7A8CF">अतुल्य उत्तर प्रदेश</text>
</svg>`);
console.log("ok");
