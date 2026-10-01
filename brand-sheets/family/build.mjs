import fs from "node:fs";
import { current, boat, peacock, weave, dawn } from "./marks.mjs";
const items = [
  ["V1.1", "Diya and crane", "Now live on the site. The moon is smaller and sits inside the P's bowl. The diya U and Sarus crane P stay as before.", current],
  ["F1", "Nauka", "The U is a wooden boat on the Ganga, and the P is its mast with a saffron sail. It rocks gently on the water, with a small moon above the sail.", boat],
  ["F2", "Mor", "The diya U stays, and the P becomes a peacock with a teal neck, a golden crest and a feather eye inside the bowl.", peacock],
  ["F3", "Zari weave", "U and P as two silk ribbons, gold and saffron, stitched with a woven edge and little buta motifs. A small moon sits inside the P.", weave],
  ["F4", "Bhor", "The same diya and crane at dawn. A pink and saffron sunrise sky, with a small rising sun inside the P instead of the moon.", dawn],
];
fs.writeFileSync(new URL("index.html", import.meta.url), `<title>Logo Family</title>
<link href="https://fonts.googleapis.com/css2?family=Rozha+One&family=Mukta:wght@400;600;700&display=swap" rel="stylesheet">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
:root{--bg:#0E0720;--card:#1A0F33;--ivory:#FFF4E2;--muted:#B7A8CF;--zari:#E7BE63;--line:rgba(255,255,255,.1)}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ivory);font-family:Mukta,system-ui,sans-serif}
.wrap{max-width:1280px;margin:0 auto;padding:56px 16px 80px}
.eyebrow{font:600 12px/1 ui-monospace,monospace;letter-spacing:.3em;text-transform:uppercase;color:#FFB627;margin:0}
h1{font:400 clamp(34px,5vw,60px)/1 "Rozha One",Georgia,serif;margin:14px 0 10px}
.lead{color:var(--muted);max-width:42em;font-size:18px;margin:0 0 40px}
.grid{display:grid;gap:20px;grid-template-columns:repeat(auto-fit,minmax(min(100%,230px),1fr))}
.card{background:var(--card);border:1px solid var(--line);border-radius:24px;padding:18px;display:flex;flex-direction:column;gap:12px}
.card.now{border-color:var(--zari)}
.hero{display:grid;place-items:center;border-radius:16px;padding:18px;background:radial-gradient(60% 60% at 50% 45%,rgba(255,182,39,.16),transparent 70%),#140A2E}
.hero svg{width:100%;max-width:220px;height:auto;filter:drop-shadow(0 18px 40px rgba(255,182,39,.2))}
h2{font:400 26px/1 "Rozha One",Georgia,serif;margin:0;display:flex;gap:10px;align-items:baseline}
h2 b{font:600 12px/1 ui-monospace,monospace;color:var(--zari);letter-spacing:.12em}
p{margin:0;color:var(--muted);line-height:1.55}
.lock{display:flex;gap:10px;align-items:center;border:1px solid var(--line);border-radius:12px;padding:8px 12px;background:#0E0720}
.lock .m{width:36px;height:44px;flex:none}.lock .m svg{width:100%;height:100%}
.lock .w{font:400 19px/1 "Rozha One",Georgia,serif}.lock i{font-style:normal;color:var(--zari)}
</style>
<div class="wrap"><p class="eyebrow">Same family as V1.1</p><h1>More designs of this type</h1>
<p class="lead">All keep the Rumi Darwaza arch, dusk on the Ganga, and gold light running through U and P. The first card is the updated V1.1 now on the site.</p>
<div class="grid">${items.map(([k, n, d, f], i) => `<article class="card${i ? "" : " now"}"><div class="hero">${f(k.replace(".", "") + "h")}</div><h2><b>${k}</b>${n}</h2><p>${d}</p><div class="lock"><span class="m">${f(k.replace(".", "") + "s")}</span><span class="w">Incredible <i>UP</i></span></div></article>`).join("")}</div></div>`);
console.log("ok");
