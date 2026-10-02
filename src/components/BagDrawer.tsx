import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { waLink } from "../config";
import { inr, loadAccount, useStore } from "../store";
import ProductArt from "./ProductArt";

const FREE_SHIP = 2000;

export default function BagDrawer() {
  const { products, bag, setQty, bagOpen, setBagOpen, say, go } = useStore();
  const rows = [...bag].map(([id, q]) => ({ p: products.find((x) => x.id === id)!, q })).filter((r) => r.p);
  const total = rows.reduce((a, r) => a + r.p.price * r.q, 0);
  const left = Math.max(0, FREE_SHIP - total);

  // Orders are confirmed by hand for now: send the bag on WhatsApp, or as an enquiry if WhatsApp isn't set up.
  const checkout = () => {
    if (!rows.length) { say("Add something to your bag first"); return; }
    const reference = "ORD-" + Math.floor(100000 + Math.random() * 900000);
    const acc = loadAccount();
    // Saved for the admin page in the background; WhatsApp opens straight away either way.
    fetch("/api/orders", {
      method: "POST", keepalive: true, headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reference, items: rows.map((r) => ({ id: r.p.id, name: r.p.name, place: r.p.place, qty: r.q, price: r.p.price })),
        name: acc?.name, email: acc?.email, phone: acc?.phone, customer_id: acc?.id,
      }),
    }).catch(() => {});
    const lines = rows.map((r) => `• ${r.p.name} (${r.p.place}) × ${r.q}: ${inr(r.p.price * r.q)}`);
    const link = waLink(`Namaste! I'd like to place order ${reference}:\n${lines.join("\n")}\nTotal: ${inr(total)}\n\nPlease confirm availability and shipping.`);
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
            aria-label="Your bag"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 32 }}
            className="fixed bottom-0 right-0 top-0 z-[67] flex w-[min(440px,100%)] flex-col border-l border-white/10 bg-dusk"
            style={{ paddingTop: "env(safe-area-inset-top, 0px)", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
          >
            <header className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <h2 className="font-display text-3xl">Your bag</h2>
              <button onClick={() => setBagOpen(false)} className="grid h-10 w-10 place-items-center rounded-full border border-white/15 hover:border-zari" aria-label="Close bag" autoFocus>
                <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M1 1l12 12M13 1 1 13" stroke="currentColor" strokeWidth="1.6" /></svg>
              </button>
            </header>
            <div className="border-b border-white/10 px-6 py-4">
              <p className="text-sm text-ivory/80">{left > 0 ? <>Add <b className="text-zari">{inr(left)}</b> more for free shipping across India</> : "You've unlocked free shipping across India"}</p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                <motion.div className="h-full rounded-full bg-gradient-to-r from-saffron to-zari" animate={{ width: `${Math.min(100, (total / FREE_SHIP) * 100)}%` }} />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-6" data-lenis-prevent>
              {rows.length === 0 && <p className="py-10 text-ivory/60">Your bag is empty. The Banarasi sarees are a good place to start.</p>}
              <AnimatePresence initial={false}>
                {rows.map(({ p, q }) => (
                  <motion.div key={p.id} layout initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30, height: 0 }} className="grid grid-cols-[72px_1fr_auto] items-center gap-4 border-b border-white/10 py-4">
                    <div className="h-[72px] w-[72px] overflow-hidden rounded-xl"><ProductArt p={p} /></div>
                    <div className="min-w-0">
                      <p className="font-semibold leading-tight">{p.name}</p>
                      <p className="text-xs text-mist">{p.place}</p>
                      <div className="mt-2 inline-flex items-center gap-3 rounded-full border border-white/15 px-1">
                        <button onClick={() => setQty(p.id, q - 1)} className="grid h-7 w-7 place-items-center rounded-full hover:bg-white/10" aria-label={`One less ${p.name}`}>−</button>
                        <span className="w-4 text-center text-sm tabular-nums">{q}</span>
                        <button onClick={() => setQty(p.id, q + 1)} className="grid h-7 w-7 place-items-center rounded-full hover:bg-white/10" aria-label={`One more ${p.name}`}>+</button>
                      </div>
                    </div>
                    <span className="font-mono text-sm tabular-nums">{inr(p.price * q)}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <footer className="border-t border-white/10 px-6 py-5">
              <div className="flex justify-between text-lg font-semibold tabular-nums"><span>Total</span><span>{inr(total)}</span></div>
              <button onClick={checkout} className="mt-4 h-12 w-full rounded-full bg-zari font-semibold text-night">Place order</button>
              <p className="mt-3 text-center text-xs text-ivory/50">We confirm availability, shipping and payment with you directly before anything is charged.</p>
            </footer>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
