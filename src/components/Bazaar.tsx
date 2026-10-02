import { AnimatePresence, motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import { CATEGORIES, CATEGORY_HI, productText, type Product } from "../data/catalog";
import { useLang } from "../i18n";
import { inr, useStore } from "../store";
import ProductArt from "./ProductArt";

export function Heart({ on }: { on: boolean }) {
  return (
    <motion.svg key={String(on)} initial={{ scale: on ? 0.4 : 1 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 600, damping: 12 }} width="18" height="18" viewBox="0 0 24 24" fill={on ? "#F0445A" : "none"} stroke={on ? "#F0445A" : "currentColor"} strokeWidth="2" aria-hidden="true">
      <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />
    </motion.svg>
  );
}

function Card({ p }: { p: Product }) {
  const { add, bag, wish, toggleWish, setQuick } = useStore();
  const { t, lang } = useLang();
  const x = productText(p, lang);
  const rx = useMotionValue(0), ry = useMotionValue(0), mx = useMotionValue(50), my = useMotionValue(50);
  const srx = useSpring(rx, { stiffness: 200, damping: 20 }), sry = useSpring(ry, { stiffness: 200, damping: 20 });
  const shine = useMotionTemplate`radial-gradient(circle at ${mx}% ${my}%, rgba(255,231,166,.35), transparent 55%)`;
  const inBag = bag.has(p.id);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
      className="group min-w-0 [perspective:900px]"
    >
      <motion.div
        style={{ rotateX: srx, rotateY: sry }}
        onPointerMove={(e) => {
          if (e.pointerType !== "mouse") return;
          const r = e.currentTarget.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
          ry.set((px - 0.5) * 14); rx.set((0.5 - py) * 14); mx.set(px * 100); my.set(py * 100);
        }}
        onPointerLeave={() => { rx.set(0); ry.set(0); }}
        className="relative overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.03]"
      >
        <button onClick={() => setQuick(p.id)} className="block w-full text-left" aria-label={t(`Quick view: ${p.name}`, `झलक: ${x.name}`)}>
          <motion.div layoutId={`art-${p.id}`} className="aspect-[4/5] w-full overflow-hidden">
            <ProductArt p={p} className="transition-transform duration-700 group-hover:scale-[1.06]" />
          </motion.div>
        </button>
        <motion.div style={{ background: shine }} className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="pointer-events-none absolute left-3 top-3 flex flex-wrap gap-1.5">
          {x.tags.map((tag) => (
            <span key={tag} className="rounded-md bg-night/75 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-zari backdrop-blur">{tag}</span>
          ))}
        </div>
        <button onClick={() => toggleWish(p.id)} aria-pressed={wish.has(p.id)} aria-label={t(`Save ${p.name}`, `${x.name} सहेजें`)} className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-night/60 text-ivory backdrop-blur transition hover:bg-night/80">
          <Heart on={wish.has(p.id)} />
        </button>
        <div className="absolute inset-x-3 bottom-3 translate-y-3 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 max-md:hidden">
          <span className="block rounded-full bg-night/70 py-2 text-center text-xs text-ivory/90 backdrop-blur">{t("Tap the picture for the maker's story", "कारीगर की कहानी के लिए तस्वीर पर टैप करें")}</span>
        </div>
      </motion.div>
      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[17px] font-semibold leading-snug">{x.name}</h3>
          <p className="text-sm text-mist">{x.place}</p>
          {!p.price && <p className="mt-1 text-sm font-semibold text-zari">{t("Price on request", "दाम पूछें")}</p>}
        </div>
        {p.price ? <span className="whitespace-nowrap font-display text-xl text-zari">{inr(p.price)}</span> : null}
      </div>
      <p className="mt-1.5 font-mono text-[11px] uppercase tracking-wide text-ivory/50">{x.spec}</p>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => add(p.id)}
        className={`mt-4 inline-flex h-10 items-center gap-2 rounded-full px-5 text-sm font-semibold transition ${inBag ? "bg-zari text-night" : "border border-ivory/25 hover:border-zari hover:text-zari"}`}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={String(inBag)} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }}>
            {inBag ? t("In bag · add another", "बैग में है · एक और डालें") : t("Add to bag", "बैग में डालें")}
          </motion.span>
        </AnimatePresence>
      </motion.button>
    </motion.article>
  );
}

export default function Bazaar() {
  const { filter, setFilter, products } = useStore();
  const { t, lang } = useLang();
  const list = products.filter((p) => filter === "All" || p.cat === filter);
  return (
    <section id="bazaar" className="relative scroll-mt-16 bg-gradient-to-b from-night via-[#160A2C] to-night py-[clamp(72px,10vw,140px)]">
      <div className="mx-auto max-w-[1320px] px-4 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-marigold">{t("The bazaar · बाज़ार", "बाज़ार")}</p>
            <h2 className="mt-4 font-display text-[clamp(44px,6.5vw,96px)] leading-[0.92]">{lang === "hi" ? <>सीधे करघे,<br />भट्ठी और <span className="zari-text">कारख़ाने से</span></> : <>Fresh off the loom,<br />kiln &amp; <span className="zari-text">karkhana</span></>}</h2>
          </div>
          <p className="max-w-[26em] text-lg text-ivory/70">{t("Every listing names the town, the workshop and the hands behind it. No warehouses in between.", "हर चीज़ के साथ उसका शहर, कारख़ाना और बनाने वाले हाथों का नाम है। बीच में कोई गोदाम नहीं।")}</p>
        </div>
        <div className="mt-10 flex flex-wrap gap-2" role="group" aria-label={t("Filter by craft", "शिल्प से छाँटें")}>
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => setFilter(c)} aria-pressed={filter === c} className="relative h-10 rounded-full px-5 text-sm font-medium">
              {filter === c && <motion.span layoutId="chip" className="absolute inset-0 rounded-full bg-zari" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
              <span className={`relative ${filter === c ? "text-night" : "text-ivory/75 hover:text-ivory"}`}>{lang === "hi" ? CATEGORY_HI[c] : c}</span>
            </button>
          ))}
        </div>
        <motion.div layout className="mt-12 grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-x-6 gap-y-14">
          <AnimatePresence mode="popLayout">
            {list.map((p) => <Card key={p.id} p={p} />)}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
