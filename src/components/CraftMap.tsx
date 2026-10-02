import { AnimatePresence, motion, useInView } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import { DISTRICTS, LANDMARKS, ODOP_CATS, RIVERS, type District, type OdopCat } from "../data/districts";
import { scrollToId, useStore } from "../store";
import { useLang } from "../i18n";
import { startEnquiry } from "./Enquire";

const RIVER_HI: Record<string, string> = { Ganga: "गंगा", Yamuna: "यमुना", Gomti: "गोमती", Ghaghara: "घाघरा" };

const VW = 790, VH = 720;
const px = (lon: number) => 30 + (lon - 77) * 97.9;
const py = (lat: number) => 30 + (30.6 - lat) * 110;

function smooth(points: [number, number][]) {
  const p = points.map(([lat, lon]) => [px(lon), py(lat)] as const);
  let d = `M${p[0][0]} ${p[0][1]}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] ?? p[i], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2] ?? p2;
    d += `C${p1[0] + (p2[0] - p0[0]) / 6} ${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6} ${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]} ${p2[1]}`;
  }
  return d;
}

export default function CraftMap() {
  const { setFilter, go, products } = useStore();
  const { t, lang } = useLang();
  const hi = lang === "hi";
  const dn = (d: District) => (hi ? d.nameHi : d.name);
  const dp = (d: District) => (hi ? d.productHi : d.product);
  const catLabel = (k: OdopCat) => (hi ? ODOP_CATS[k].hi : ODOP_CATS[k].label);
  const [sel, setSel] = useState<District>(DISTRICTS.find((d) => d.name === "Varanasi")!);
  const [hover, setHover] = useState<District | null>(null);
  const [cat, setCat] = useState<OdopCat | null>(null);
  const [q, setQ] = useState("");
  const svgRef = useRef<SVGSVGElement>(null);
  const seen = useInView(svgRef, { once: true, margin: "-15% 0px" });
  const rivers = useMemo(() => RIVERS.map((r) => ({ ...r, d: smooth(r.points) })), []);
  const order = useMemo(() => [...DISTRICTS].sort((a, b) => a.lon - b.lon), []);
  const matches = q.trim() ? DISTRICTS.filter((d) => [d.name, d.product, d.nameHi, d.productHi].join(" ").toLowerCase().includes(q.trim().toLowerCase())).slice(0, 6) : [];
  const live = products.find((p) => p.district === sel.name);
  const tip = hover ?? null;

  return (
    <section id="map" className="relative scroll-mt-16 overflow-hidden py-[clamp(72px,10vw,140px)]">
      <span className="pointer-events-none absolute -right-10 top-10 select-none font-display text-[clamp(120px,22vw,340px)] leading-none text-white/[0.03]" aria-hidden="true">उत्तर प्रदेश</span>
      <div className="relative mx-auto max-w-[1320px] px-4 sm:px-8">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-marigold">{t("One District One Product", "एक ज़िला एक उत्पाद")}</p>
        <h2 className="mt-4 max-w-[14em] font-display text-[clamp(44px,6.5vw,96px)] leading-[0.92]">{hi ? <><span className="zari-text">75 शिल्पों</span> से बना नक्शा</> : <>A map drawn in <span className="zari-text">75 crafts</span></>}</h2>
        <p className="mt-6 max-w-[38em] text-lg text-ivory/70">{t("Each light is a district and the craft it is known for, placed where it sits along the Ganga, Yamuna, Gomti and Ghaghara. Pick one to meet its makers.", "हर रोशनी एक ज़िला है और वह शिल्प जिसके लिए वह जाना जाता है, गंगा, यमुना, गोमती और घाघरा के किनारे अपनी जगह पर। किसी एक को चुनें और उसके कारीगरों से मिलें।")}</p>

        <div className="mt-12 grid items-start gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
          <div className="relative min-w-0 rounded-[28px] border border-white/10 bg-gradient-to-br from-dusk/70 to-night p-2 sm:p-4">
            <svg ref={svgRef} viewBox={`0 0 ${VW} ${VH}`} className="h-auto w-full" role="img" aria-label={t("Map of Uttar Pradesh districts and their crafts", "उत्तर प्रदेश के ज़िलों और उनके शिल्पों का नक्शा")}>
              <defs>
                <pattern id="grid" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#FFF4E2" opacity=".08" /></pattern>
                <radialGradient id="dotGlow"><stop offset="0" stopColor="#fff" stopOpacity=".6" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></radialGradient>
                <linearGradient id="riverStroke" x1="0" x2="1"><stop offset="0" stopColor="#49B3C2" /><stop offset="1" stopColor="#7FD3DE" /></linearGradient>
              </defs>
              <rect width={VW} height={VH} fill="url(#grid)" />
              {rivers.map((r, i) => (
                <g key={r.name}>
                  <motion.path d={r.d} fill="none" stroke="url(#riverStroke)" strokeWidth={r.name === "Ganga" ? 5 : 3} strokeLinecap="round" opacity=".55" initial={{ pathLength: 0 }} animate={seen ? { pathLength: 1 } : {}} transition={{ duration: 2.4, delay: i * 0.3, ease: "easeInOut" }} />
                  <path d={r.d} fill="none" stroke="#C9F2F7" strokeWidth="1.2" strokeDasharray="2 14" opacity=".7">
                    <animate attributeName="stroke-dashoffset" from="160" to="0" dur="6s" repeatCount="indefinite" />
                  </path>
                </g>
              ))}
              {rivers.map((r) => {
                const [lat, lon] = r.points[Math.floor(r.points.length * (r.name === "Ganga" ? 0.42 : 0.3))];
                return <text key={r.name} x={px(lon) + 10} y={py(lat) + (r.name === "Yamuna" ? 22 : -10)} fill="#7FD3DE" opacity=".8" fontSize="13" fontStyle="italic" fontFamily="Mukta, sans-serif">{hi ? RIVER_HI[r.name] : r.name}</text>;
              })}
              {order.map((d, i) => {
                const x = px(d.lon), y = py(d.lat), c = ODOP_CATS[d.cat].color;
                const dim = cat && cat !== d.cat;
                const active = sel.name === d.name;
                return (
                  <motion.g
                    key={d.name}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={seen ? { opacity: dim ? 0.18 : 1, scale: 1 } : {}}
                    transition={{ delay: seen && !cat ? 0.6 + i * 0.018 : 0, type: "spring", stiffness: 300, damping: 18 }}
                    style={{ transformOrigin: `${x}px ${y}px`, transformBox: "view-box", cursor: "pointer" }}
                    onPointerEnter={() => setHover(d)}
                    onPointerLeave={() => setHover(null)}
                    onClick={() => setSel(d)}
                    role="button"
                    tabIndex={0}
                    aria-label={`${dn(d)}: ${dp(d)}`}
                    onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), setSel(d))}
                  >
                    <circle cx={x} cy={y} r="16" fill="transparent" />
                    <circle cx={x} cy={y} r="12" fill={c} opacity=".18" />
                    <circle cx={x} cy={y} r={active ? 7 : 5} fill={c} stroke="#0E0720" strokeWidth="1.5" />
                    {active && (
                      <motion.circle cx={x} cy={y} fill="none" stroke={c} strokeWidth="2" initial={{ r: 7, opacity: 0.9 }} animate={{ r: 26, opacity: 0 }} transition={{ duration: 1.6, repeat: Infinity }} />
                    )}
                    {LANDMARKS.includes(d.name) && (
                      <text x={x + 10} y={y + 4} fontSize="13" fill="#FFF4E2" opacity={dim ? 0.3 : 0.85} fontFamily="Mukta, sans-serif" style={{ paintOrder: "stroke", stroke: "#0E0720", strokeWidth: 4 }}>
                        {d.name === "Kanpur Nagar" ? t("Kanpur", "कानपुर") : dn(d)}
                      </text>
                    )}
                  </motion.g>
                );
              })}
              {tip && (
                <g pointerEvents="none" transform={`translate(${Math.min(px(tip.lon) + 14, VW - 230)} ${Math.max(py(tip.lat) - 58, 8)})`}>
                  <rect width="216" height="48" rx="10" fill="#1E0F3D" stroke="#E7BE63" strokeOpacity=".5" />
                  <text x="12" y="20" fontSize="14" fontWeight="600" fill="#FFF4E2" fontFamily="Mukta, sans-serif">{dn(tip)}</text>
                  <text x="12" y="38" fontSize="12.5" fill="#E7BE63" fontFamily="Mukta, sans-serif">{dp(tip)}</text>
                </g>
              )}
            </svg>
            <div className="flex flex-wrap gap-2 px-2 pb-2 pt-1 sm:px-0">
              {(Object.keys(ODOP_CATS) as OdopCat[]).map((k) => (
                <button key={k} onClick={() => setCat(cat === k ? null : k)} aria-pressed={cat === k} className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition ${cat === k ? "border-zari bg-white/10" : "border-white/10 hover:border-white/30"}`}>
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: ODOP_CATS[k].color }} />
                  {catLabel(k)}
                </button>
              ))}
            </div>
          </div>

          <div className="min-w-0 lg:sticky lg:top-24">
            <label htmlFor="district-search" className="sr-only">{t("Search districts or crafts", "ज़िला या शिल्प खोजें")}</label>
            <div className="relative">
              <input
                id="district-search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t("Search a district or craft, e.g. Kannauj, bansuri", "ज़िला या शिल्प खोजें, जैसे कन्नौज, बाँसुरी")}
                autoComplete="off"
                className="h-14 w-full rounded-2xl border border-white/15 bg-white/5 pl-12 pr-4 text-[16px] text-ivory outline-none placeholder:text-ivory/40 focus:border-zari"
              />
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-mist" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
              <AnimatePresence>
                {matches.length > 0 && (
                  <motion.ul initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute inset-x-0 top-16 z-10 overflow-hidden rounded-2xl border border-white/10 bg-dusk shadow-2xl">
                    {matches.map((d) => (
                      <li key={d.name}>
                        <button onClick={() => { setSel(d); setQ(""); }} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-white/5">
                          <span className="flex items-center gap-3"><span className="h-2.5 w-2.5 rounded-full" style={{ background: ODOP_CATS[d.cat].color }} />{dn(d)}</span>
                          <span className="text-sm text-mist">{dp(d)}</span>
                        </button>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={sel.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.35 }} className="mt-6 overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-plum/60 to-dusk/60 p-7 sm:p-9">
                <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em]" style={{ color: ODOP_CATS[sel.cat].color }}>
                  <span className="h-2 w-2 rounded-full" style={{ background: ODOP_CATS[sel.cat].color }} />
                  {catLabel(sel.cat)}
                </div>
                <h3 className="mt-4 font-display text-[clamp(40px,5vw,64px)] leading-none">{dn(sel)}</h3>
                <p className="mt-3 text-2xl text-zari">{dp(sel)}</p>
                <div className="mt-7 grid grid-cols-2 gap-4 border-t border-white/10 pt-6">
                  <div><p className="font-display text-3xl">{t("ODOP", "ओडीओपी")}</p><p className="text-sm text-ivory/60">{t("One District One Product craft", "एक ज़िला एक उत्पाद शिल्प")}</p></div>
                  <div><p className="font-display text-3xl">{live ? t("In the bazaar", "बाज़ार में") : t("Joining soon", "जल्द आ रहे हैं")}</p><p className="text-sm text-ivory/60">{live ? t("Pieces from this district", "इस ज़िले की चीज़ें") : t("Makers from this district", "इस ज़िले के कारीगर")}</p></div>
                </div>
                <button
                  onClick={() => {
                    if (live) { setFilter(live.cat); scrollToId("bazaar"); }
                    else {
                      startEnquiry({
                        type: "Something else", district: sel.name,
                        message: t(`Please let me know when pieces from ${sel.name} (${sel.product}) are available.`, `${sel.nameHi} (${sel.productHi}) की चीज़ें आने पर कृपया मुझे बताएँ।`),
                      });
                      go("enquire");
                    }
                  }}
                  className="mt-7 h-12 w-full rounded-full bg-zari font-semibold text-night transition hover:brightness-110"
                >
                  {live ? t(`Shop ${sel.product.toLowerCase()} from ${sel.name}`, `${sel.nameHi} से ${sel.productHi} ख़रीदें`) : t(`Notify me when ${sel.name} opens`, `${sel.nameHi} शुरू होने पर मुझे बताएँ`)}
                </button>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
