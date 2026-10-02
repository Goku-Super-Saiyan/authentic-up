import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { waLink } from "../config";
import { inr, loadAccount, useStore } from "../store";
import ProductArt from "./ProductArt";
import { productText } from "../data/catalog";
import { useLang } from "../i18n";

const FREE_SHIP = 2000;

export default function BagDrawer() {
  const { products, bag, setQty, bagOpen, setBagOpen, say, go } = useStore();
  const { t, lang } = useLang();
  const rows = [...bag].map(([id, q]) => ({ p: products.find((x) => x.id === id)!, q })).filter((r) => r.p);
  const total = rows.reduce((a, r) => a + (r.p.price ?? 0) * r.q, 0);
  // Pieces without a confirmed price make the bag a quote request: no total or shipping bar until we quote.
  const quote = rows.some((r) => !r.p.price);
  const left = Math.max(0, FREE_SHIP - total);

  // Orders are confirmed by hand for now: send the bag on WhatsApp, or as an enquiry if WhatsApp isn't set up.
  const checkout = () => {
    if (!rows.length) { say(t("Add something to your bag first", "पहले बैग में कुछ डालें")); return; }
    const reference = "ORD-" + Math.floor(100000 + Math.random() * 900000);
    const acc = loadAccount();
    // Saved for the admin page in the background; WhatsApp opens straight away either way.
    fetch("/api/orders", {
      method: "POST", keepalive: true, headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reference, items: rows.map((r) => ({ id: r.p.id, name: r.p.name, place: r.p.place, qty: r.q, price: r.p.price ?? 0 })),
        name: acc?.name, email: acc?.email, phone: acc?.phone, customer_id: acc?.id,
      }),
    }).catch(() => {});
    const lines = rows.map((r) => { const x = productText(r.p, lang); return `• ${x.name} (${x.place}) × ${r.q}${r.p.price ? `: ${inr(r.p.price * r.q)}` : ""}`; });
    const link = waLink(quote
      ? t(`Namaste! Please send me a quote for ${reference}:\n${lines.join("\n")}\n\nPlease share the price, availability and shipping.`,
          `नमस्ते! कृपया ${reference} के लिए कोटेशन भेजें:\n${lines.join("\n")}\n\nकृपया दाम, उपलब्धता और शिपिंग बताएँ।`)
      : t(`Namaste! I'd like to place order ${reference}:\n${lines.join("\n")}\nTotal: ${inr(total)}\n\nPlease confirm availability and shipping.`,
          `नमस्ते! मुझे ऑर्डर ${reference} देना है:\n${lines.join("\n")}\nकुल: ${inr(total)}\n\nकृपया उपलब्धता और शिपिंग की पुष्टि करें।`));
    setBagOpen(false);
    if (link) window.open(link, "_blank", "noopener");
    else go("enquire");
  };

  useEffect(() => {
    if (!bagOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setBagOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [bagOpen, setBagOpen]);

  return (
    <AnimatePresence>
      {bagOpen && (
        <>
          <motion.div key="scrim" className="fixed inset-0 z-[66] bg-night/70 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setBagOpen(false)} />
          <motion.aside
            key="drawer"
            aria-label={t("Your bag", "आपका बैग")}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 32 }}
            className="fixed bottom-0 right-0 top-0 z-[67] flex w-[min(440px,100%)] flex-col border-l border-white/10 bg-dusk"
            style={{ paddingTop: "env(safe-area-inset-top, 0px)", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
          >
            <header className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <h2 className="font-display text-3xl">{t("Your bag", "आपका बैग")}</h2>
              <button onClick={() => setBagOpen(false)} className="grid h-10 w-10 place-items-center rounded-full border border-white/15 hover:border-zari" aria-label={t("Close bag", "बैग बंद करें")} autoFocus>
                <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M1 1l12 12M13 1 1 13" stroke="currentColor" strokeWidth="1.6" /></svg>
              </button>
            </header>
            {!quote && rows.length > 0 && <div className="border-b border-white/10 px-6 py-4">
              <p className="text-sm text-ivory/80">{left > 0
                ? lang === "hi" ? <>पूरे भारत में मुफ़्त शिपिंग के लिए <b className="text-zari">{inr(left)}</b> का सामान और डालें</> : <>Add <b className="text-zari">{inr(left)}</b> more for free shipping across India</>
                : t("You've unlocked free shipping across India", "आपको पूरे भारत में मुफ़्त शिपिंग मिलेगी")}</p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                <motion.div className="h-full rounded-full bg-gradient-to-r from-saffron to-zari" animate={{ width: `${Math.min(100, (total / FREE_SHIP) * 100)}%` }} />
              </div>
            </div>}
            <div className="flex-1 overflow-y-auto px-6" data-lenis-prevent>
              {rows.length === 0 && <p className="py-10 text-ivory/60">{t("Your bag is empty. The Banarasi sarees are a good place to start.", "आपका बैग ख़ाली है। शुरुआत बनारसी साड़ियों से कीजिए।")}</p>}
              <AnimatePresence initial={false}>
                {rows.map(({ p, q }) => { const x = productText(p, lang); return (
                  <motion.div key={p.id} layout initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30, height: 0 }} className="grid grid-cols-[72px_1fr_auto] items-center gap-4 border-b border-white/10 py-4">
                    <div className="h-[72px] w-[72px] overflow-hidden rounded-xl"><ProductArt p={p} /></div>
                    <div className="min-w-0">
                      <p className="font-semibold leading-tight">{x.name}</p>
                      <p className="text-xs text-mist">{x.place}</p>
                      <div className="mt-2 inline-flex items-center gap-3 rounded-full border border-white/15 px-1">
                        <button onClick={() => setQty(p.id, q - 1)} className="grid h-7 w-7 place-items-center rounded-full hover:bg-white/10" aria-label={t(`One less ${p.name}`, `${x.name} एक कम`)}>−</button>
                        <span className="w-4 text-center text-sm tabular-nums">{q}</span>
                        <button onClick={() => setQty(p.id, q + 1)} className="grid h-7 w-7 place-items-center rounded-full hover:bg-white/10" aria-label={t(`One more ${p.name}`, `${x.name} एक और`)}>+</button>
                      </div>
                    </div>
                    <span className="font-mono text-sm tabular-nums">{p.price ? inr(p.price * q) : <span className="font-body text-xs text-zari">{t("On request", "पूछें")}</span>}</span>
                  </motion.div>
                ); })}
              </AnimatePresence>
            </div>
            <footer className="border-t border-white/10 px-6 py-5">
              {quote
                ? <p className="text-sm text-ivory/70">{t("We'll send you the maker's price for each piece, with shipping, before you pay anything.", "भुगतान से पहले हम आपको हर चीज़ का कारीगर का दाम और शिपिंग बताएँगे।")}</p>
                : <div className="flex justify-between text-lg font-semibold tabular-nums"><span>{t("Total", "कुल")}</span><span>{inr(total)}</span></div>}
              <button onClick={checkout} className="mt-4 h-12 w-full rounded-full bg-zari font-semibold text-night">{quote ? t("Ask for a quote", "कोटेशन माँगें") : t("Place order", "ऑर्डर करें")}</button>
              <p className="mt-3 text-center text-xs text-ivory/50">{t("We confirm availability, shipping and payment with you directly before anything is charged.", "कोई भी पैसा लेने से पहले हम उपलब्धता, शिपिंग और भुगतान आपसे सीधे तय करते हैं।")}</p>
            </footer>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
