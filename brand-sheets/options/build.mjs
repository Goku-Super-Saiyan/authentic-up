import fs from "node:fs";
import { dots, kite, upIcon, feather, wordmark, sunrise } from "./marks.mjs";
const items = [
  ["1", "75 districts", "Every district of UP is one coloured dot, placed by its real map position, so together they draw the state. Modern and data-led, like a tech brand.", dots],
  ["2", "Patang", "A Lucknow kite in festival colours. Its string loops down into a U and points upward, the way the bazaar lifts makers up.", kite],
  ["3", "Friendly up", "Lowercase u and p on one stem, white on saffron, with a rising sun. Simple and warm, like a shopping app icon.", upIcon],
  ["4", "Peacock feather", "The eye of a peacock feather forms the bowl of the P, the quill is its stem, and a U sits beside it.", feather],
  ["5", "Wordmark", "No symbol, just lettering. Incredible UP in a bold serif over a saree border, with the Hindi name below. Classic, like a heritage store.", wordmark],
  ["6", "Sunrise", "A bold flat sun rising over the Ganga at Varanasi, with U and P cut out of the sun.", sunrise],
];
const lock = (f) => `<div class="lock"><span class="m">${f(false)}</span><span class="w">Incredible <i>UP</i></span></div>`;
fs.writeFileSync(new URL("index.html", import.meta.url), `<title>Logo Options</title>
<link href="https://fonts.googleapis.com/css2?family=Rozha+One&family=Mukta:wght@400;600;700&display=swap" rel="stylesheet">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
:root{--bg:#FBF6EE;--card:#FFFFFF;--ink:#2B1B5A;--muted:#6B5E7E;--line:rgba(43,27,90,.12)}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font-family:Mukta,system-ui,sans-serif}
.wrap{max-width:1240px;margin:0 auto;padding:56px 16px 80px}
.eyebrow{font:700 12px/1 ui-monospace,monospace;letter-spacing:.3em;text-transform:uppercase;color:#C2185B;margin:0}
h1{font:400 clamp(34px,5vw,60px)/1 "Rozha One",Georgia,serif;margin:14px 0 10px}
.lead{color:var(--muted);max-width:42em;font-size:18px;margin:0 0 40px}
.grid{display:grid;gap:20px;grid-template-columns:repeat(auto-fit,minmax(min(100%,340px),1fr))}
.card{background:var(--card);border:1px solid var(--line);border-radius:24px;padding:20px;display:flex;flex-direction:column;gap:14px}
.pair{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.t{aspect-ratio:1;display:grid;place-items:center;border-radius:16px}
.t.l{background:#FFF4E2}.t.d{background:#1B1035}
.t svg{width:76%;height:auto}
h2{font:400 28px/1 "Rozha One",Georgia,serif;margin:4px 0 0;display:flex;gap:10px;align-items:baseline}
h2 b{font:700 14px/1 ui-monospace,monospace;color:#C2185B}
p{margin:0;color:var(--muted);line-height:1.55}
.lock{display:flex;gap:10px;align-items:center;border:1px solid var(--line);border-radius:12px;padding:10px 12px}
.lock .m{width:40px;height:40px;flex:none}.lock .m svg{width:100%;height:100%}
.lock .w{font:400 20px/1 "Rozha One",Georgia,serif}.lock i{font-style:normal;color:#F28C28}
</style>
<div class="wrap"><p class="eyebrow">New logo options</p><h1>Six different directions</h1>
<p class="lead">Each one is a different style, flat and modern rather than ornate. Each is shown on light and dark, with the site header underneath. Pick a number, or tell me what to combine.</p>
<div class="grid">${items.map(([k, n, d, f]) => `<article class="card"><div class="pair"><div class="t l">${f(false)}</div><div class="t d">${f(true)}</div></div><h2><b>${k}</b>${n}</h2><p>${d}</p>${k === "5" ? "" : lock(f)}</article>`).join("")}</div></div>`);
console.log("ok");
