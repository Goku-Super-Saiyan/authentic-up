// Draws the social preview cards (public/og/<brand>.jpg, 1200x630) and square logos (public/og/logo-<brand>.png).
// Run: node scripts/og-image.mjs   (needs Playwright with Chromium)
import { chromium } from "playwright";
import { readFileSync } from "node:fs";

const emblem = (dir) => readFileSync(new URL(`../public/brand/${dir}/emblem-full.svg`, import.meta.url), "utf8");
const brands = {
  authentic: { dir: "authentic-v3", word: "Authentic", line: "From their hands to your home", hindi: "यूपी की प्रामाणिक पहचान", domain: "authenticup.in" },
  incredible: { dir: "v3", word: "Incredible", line: "The crafts of Uttar Pradesh, from the people who make them", hindi: "अतुल्य उत्तर प्रदेश", domain: "incredible-up.vercel.app" },
};
const fonts = `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Rozha+One&family=Mukta:wght@400;600&display=block">`;
const base = `*{margin:0;box-sizing:border-box}body{width:1200px;height:630px;overflow:hidden;font-family:Mukta,sans-serif;color:#FFF4E2;
  background:radial-gradient(120% 90% at 85% 110%,#FF8A1F55,transparent 55%),radial-gradient(90% 80% at 0% 0%,#3A1442,transparent 60%),linear-gradient(160deg,#1E0F3D,#0E0720 60%);}`;

const card = (b) => `<!doctype html><html><head><meta charset="utf-8">${fonts}<style>${base}
  .wrap{display:flex;align-items:center;gap:56px;height:100%;padding:0 80px}
  .em{width:300px;flex:none}.em svg{width:100%;height:auto;display:block}
  h1{font-family:"Rozha One",serif;font-weight:400;font-size:104px;line-height:.95}
  h1 span{background:linear-gradient(120deg,#FFE7A6,#E7BE63 40%,#B8862B 70%,#F6D98C);-webkit-background-clip:text;color:transparent}
  .line{margin-top:18px;font-size:38px;line-height:1.2;color:#FFF4E2}
  .crafts{margin-top:28px;font-size:25px;color:#B7A8CF}
  .dom{margin-top:30px;font-size:24px;letter-spacing:.08em;color:#FFB627;font-weight:600}
  .bar{position:absolute;inset:auto 0 0 0;height:10px;background:linear-gradient(90deg,#FF8A1F,#E7BE63,#F0445A)}
</style></head><body><div class="wrap"><div class="em">${emblem(b.dir)}</div><div>
  <h1>${b.word} <span>UP</span></h1>
  <p class="line">${b.line}</p>
  <p class="crafts">Banarasi silk · Bhadohi carpets · Lucknow chikan · ODOP crafts of 75 districts</p>
  <p class="dom">${b.domain.toUpperCase()}</p>
</div></div><div class="bar"></div></body></html>`;

const logo = (b) => `<!doctype html><html><head><meta charset="utf-8"><style>*{margin:0}body{width:512px;height:512px;display:grid;place-items:center;
  background:radial-gradient(90% 90% at 50% 100%,#FF8A1F44,transparent 60%),linear-gradient(160deg,#1E0F3D,#0E0720)}
  svg{height:440px;width:auto}</style></head><body>${emblem(b.dir)}</body></html>`;

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH, proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined });
const page = await browser.newPage({ ignoreHTTPSErrors: true });
for (const [key, b] of Object.entries(brands)) {
  await page.setViewportSize({ width: 1200, height: 630 });
  await page.setContent(card(b), { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: new URL(`../public/og/${key}.jpg`, import.meta.url).pathname, type: "jpeg", quality: 86 });
  await page.setViewportSize({ width: 512, height: 512 });
  await page.setContent(logo(b), { waitUntil: "networkidle" });
  await page.screenshot({ path: new URL(`../public/og/logo-${key}.png`, import.meta.url).pathname });
}
await browser.close();
