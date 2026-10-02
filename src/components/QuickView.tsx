import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { inr, useStore } from "../store";
import { Heart } from "./Bazaar";
import ProductArt from "./ProductArt";
import { waLink } from "../config";
import { productText } from "../data/catalog";
import { useLang } from "../i18n";

export default function QuickView() {
  const { quick, setQuick, add, wish, toggleWish, products } = useStore();
  const p = products.find((x) => x.id === quick);
  const [shot, setShot] = useState(0);
  useEffect(() => setShot(0), [quick]);
  const photos = p?.photos ?? [];
  const { t, lang } = useLang();
  const x = p ? productText(p, lang) : null;
  // Built-in pieces have no price yet, so the WhatsApp button asks for one instead of ordering.
  const wa = p && x ? waLink(p.price
    ? t(`Namaste! I'd like to order: ${p.name} (${inr(p.price)}) by ${p.maker}.`, `नमस्ते! मुझे यह ऑर्डर करना है: ${x.name} (${inr(p.price)}), ${x.maker}।`)
    : t(`Namaste! Could you share the price of ${p.name} by ${p.maker}?`, `नमस्ते! क्या आप ${x.name} (${x.maker}) का दाम बता सकते हैं?`)) : null;

  useEffect(() => {
    if (!p) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setQuick(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [p, setQuick]);

  return (
    <AnimatePresence>
      {p && x && (
        <motion.div key="qv" data-lenis-prevent className="fixed inset-0 z-[65] grid place-items-center overflow-y-auto p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="fixed inset-0 bg-night/80 backdrop-blur-md" onClick={() => setQuick(null)} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={x.name}
            initial={{ y: 40 }}
            animate={{ y: 0 }}
            exit={{ y: 40 }}
            className="relative grid w-full max-w-[980px] overflow-hidden rounded-[28px] border border-white/10 bg-dusk md:grid-cols-2"
          >
            <motion.div layoutId={`art-${p.id}`} className="relative aspect-[4/5] w-full md:aspect-auto md:min-h-[560px]">
              <ProductArt p={photos[shot] ? { ...p, photo: photos[shot] } : p} label={x.name} />
            {photos.length > 1 && (
              <div className="absolute bottom-3 left-3 flex gap-2 md:bottom-4 md:left-4" role="group" aria-label={t("Photos", "तस्वीरें")}>
                {photos.slice(0, 6).map((src, i) => (
                  <button key={src} onClick={() => setShot(i)} aria-label={t(`Photo ${i + 1}`, `तस्वीर ${i + 1}`)} aria-pressed={shot === i} className={`h-12 w-12 overflow-hidden rounded-lg border-2 ${shot === i ? "border-zari" : "border-white/30"}`}>
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            </motion.div>
            <div className="flex min-w-0 flex-col p-6 sm:p-9">
              <div className="flex items-start justify-between gap-4">
                <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-marigold">{x.place}</p>
                <button onClick={() => setQuick(null)} className="-mr-2 -mt-2 grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/15 hover:border-zari" aria-label={t("Close", "बंद करें")} autoFocus>
                  <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M1 1l12 12M13 1 1 13" stroke="currentColor" strokeWidth="1.6" /></svg>
                </button>
              </div>
              <h2 className="mt-3 font-display text-[clamp(32px,4vw,46px)] leading-[1.02]">{x.name}</h2>
              {p.price
                ? <p className="mt-3 font-display text-3xl text-zari">{inr(p.price)}</p>
                : <div className="mt-3">
                    <p className="font-display text-2xl text-zari">{t("Price on request", "दाम पूछें")}</p>
                    <p className="mt-1 text-sm text-ivory/60">{t("Each piece is priced by the family that makes it. Ask us and we'll share the current price.", "हर चीज़ का दाम उसे बनाने वाला परिवार तय करता है। हमसे पूछिए, हम आज का दाम बताएँगे।")}</p>
                  </div>}
              <p className="mt-5 text-[17px] leading-relaxed text-ivory/80">{x.story}</p>
              <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-white/10 pt-5 text-sm">
                <div className="col-span-2"><dt className="font-mono text-[10px] uppercase tracking-widest text-mist">{t("Made by", "बनाने वाले")}</dt><dd className="mt-0.5 font-semibold">{x.maker}</dd></div>
                {x.details.map((d, i) => <div key={i} className="flex gap-2 text-ivory/80"><span className="mt-[7px] h-1.5 w-1.5 shrink-0 rotate-45 bg-zari" />{d}</div>)}
              </dl>
              <div className="mt-auto flex flex-wrap gap-3 pt-8">
                <motion.button whileTap={{ scale: 0.96 }} onClick={() => add(p.id)} className="h-12 flex-1 rounded-full bg-zari px-7 font-semibold text-night">{t("Add to bag", "बैग में डालें")}</motion.button>
                {!p.price && wa && (
                  <a href={wa} target="_blank" rel="noopener" className="inline-flex h-12 flex-1 items-center justify-center rounded-full bg-[#25D366] px-6 font-semibold text-white">{t("Ask for price", "दाम पूछें")}</a>
                )}
                {p.price && wa && (
                  <a href={wa} target="_blank" rel="noopener" aria-label={t("Order on WhatsApp", "व्हाट्सऐप पर ऑर्डर करें")} className="grid h-12 w-12 place-items-center rounded-full bg-[#25D366] text-white">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm4.5 12.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3Z" /></svg>
                  </a>
                )}
                <button onClick={() => toggleWish(p.id)} aria-pressed={wish.has(p.id)} aria-label={t("Save to wishlist", "पसंद में सहेजें")} className="grid h-12 w-12 place-items-center rounded-full border border-white/20 hover:border-zari"><Heart on={wish.has(p.id)} /></button>
              </div>
              <p className="mt-4 font-mono text-[11px] text-ivory/45">{x.tags.join(" · ")}</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
