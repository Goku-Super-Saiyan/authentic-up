import fs from "node:fs";
import { monogram, seal, buta } from "./marks.mjs";
const items = [
  ["A", "Bold monogram", "The U's right arm runs straight on as the P's stem, so the two letters are one ligature. Heavy gold strokes and a saffron bowl, like a fashion house mark. Works tiny, on a tag or as an app icon.", monogram],
  ["B", "Royal seal", "A mohur stamp with a lotus-petal edge. अतुल्य उत्तर प्रदेश runs over the top and the name under it, with UP at the heart. Reads like a mark of authenticity on every parcel.", seal],
  ["C", "Paisley buta", "The kalka paisley woven on Banarasi sarees. The U sits in its belly and the P's stem rises and curls into the paisley tip, as if the letters were woven into silk.", buta],
];
const html = `<title>Logo Drafts</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Rozha+One&family=Mukta:wght@400;600;700&display=swap" rel="stylesheet">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
:root{--bg:#0E0720;--card:#1A0F33;--ivory:#FFF4E2;--muted:#B7A8CF;--zari:#E7BE63;--line:rgba(255,255,255,.1)}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ivory);font-family:Mukta,system-ui,sans-serif}
.wrap{max-width:1240px;margin:0 auto;padding:56px 16px 80px}
.eyebrow{font:600 12px/1 ui-monospace,monospace;letter-spacing:.3em;text-transform:uppercase;color:#FFB627;margin:0}
h1{font:400 clamp(36px,5vw,64px)/1 "Rozha One",Georgia,serif;margin:14px 0 10px}
.lead{color:var(--muted);max-width:40em;font-size:18px;margin:0 0 40px}
.grid{display:grid;gap:20px;grid-template-columns:repeat(auto-fit,minmax(min(100%,340px),1fr))}
.card{background:var(--card);border:1px solid var(--line);border-radius:24px;padding:24px;display:flex;flex-direction:column;gap:18px}
.hero{aspect-ratio:1;display:grid;place-items:center;border-radius:16px;background:radial-gradient(60% 60% at 50% 45%,rgba(255,182,39,.14),transparent 70%),#140A2E}
.hero svg{width:72%;height:auto}
h2{font:400 32px/1 "Rozha One",Georgia,serif;margin:0;display:flex;gap:12px;align-items:baseline}
h2 b{font:600 13px/1 ui-monospace,monospace;color:var(--zari);letter-spacing:.2em}
p.d{margin:0;color:var(--muted);line-height:1.55}
.uses{display:grid;grid-template-columns:1.6fr 1fr 1fr;gap:10px}
.u{border-radius:12px;display:grid;place-items:center;padding:12px;min-height:84px;border:1px solid var(--line)}
.u.paper{background:#FFF4E2}.u.dark{background:#0E0720}
.lock{display:flex;align-items:center;gap:8px}.lock svg{width:40px;height:40px}.lock span{font:400 18px/1 "Rozha One",Georgia,serif;white-space:nowrap}.lock span i{font-style:normal;color:var(--zari)}
.u svg{width:44px;height:44px}.fav svg{width:20px;height:20px}
.cap{font-size:12px;color:var(--muted);margin-top:-8px;display:grid;grid-template-columns:1.6fr 1fr 1fr;gap:10px;text-align:center}
</style>
<div class="wrap">
<p class="eyebrow">Logo drafts · pick one</p>
<h1>Three directions for Incredible UP</h1>
<p class="lead">Rough drafts to compare styles, not finished logos. Pick the one that feels closest, and I'll refine it into the full logo with colour and print versions.</p>
<div class="grid">
${items.map(([k, name, desc, fn]) => `<article class="card">
  <div class="hero">${fn(k + "h")}</div>
  <h2><b>${k}</b>${name}</h2>
  <p class="d">${desc}</p>
  <div class="uses">
    <div class="u dark"><div class="lock">${fn(k + "l")}<span>Incredible <i>UP</i></span></div></div>
    <div class="u paper">${fn(k + "i", "#22102A")}</div>
    <div class="u dark fav">${fn(k + "f")}</div>
  </div>
  <div class="cap"><span>Site header</span><span>One colour</span><span>Favicon</span></div>
</article>`).join("")}
</div>
</div>`;
fs.writeFileSync("index.html", html);
console.log("ok");
