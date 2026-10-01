import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useState } from "react";
import { scrollToId, scrollToTop, useStore } from "../store";
import { Wordmark } from "./Logo";

const LINKS = [
  ["Icons of UP", "icons"],
  ["Bazaar", "bazaar"],
  ["Craft map", "map"],
  ["Sell with us", "sell"],
] as const;

export default function Nav() {
  const { bag, setBagOpen, page, go, user } = useStore();
  const { scrollY } = useScroll();
  const [solid, setSolid] = useState(false);
  useMotionValueEvent(scrollY, "change", (v) => setSolid(v > 40));
  const count = [...bag.values()].reduce((a, b) => a + b, 0);

  return (
    <header
      className={`fixed inset-x-0 z-50 transition-colors duration-500 ${solid ? "border-b border-white/10 bg-night/75 backdrop-blur-xl" : "bg-transparent"}`}
      style={{ top: 0, paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      <div className="mx-auto flex h-16 max-w-[1320px] items-center gap-6 px-4 sm:px-8">
        <button onClick={() => (page === "home" ? scrollToTop() : go("home"))} className="whitespace-nowrap" aria-label="Incredible UP, back to top">
          <Wordmark compact />
        </button>
        <nav className="ml-auto hidden items-center gap-1 md:flex" aria-label="Main">
          {LINKS.map(([label, id]) => (
            <button key={id} onClick={() => { if (page !== "home") { go("home"); setTimeout(() => scrollToId(id), 60); } else scrollToId(id); }} className="rounded-full px-4 py-2 text-[15px] text-ivory/80 transition hover:bg-white/5 hover:text-ivory">
              {label}
            </button>
          ))}
          <button onClick={() => go("enquire")} className={`rounded-full px-4 py-2 text-[15px] transition hover:bg-white/5 ${page === "enquire" ? "text-zari" : "text-ivory/80 hover:text-ivory"}`}>
            Enquire
          </button>
        </nav>
        <button
          onClick={() => go("login")}
          className={`ml-auto flex h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition md:ml-2 ${user ? "border-zari/50 text-zari" : "border-white/15 hover:border-zari/60"}`}
          aria-label={user ? `Signed in as ${user}` : "Log in"}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></svg>
          <span className="hidden sm:inline">{user ?? "Log in"}</span>
        </button>
        <button
          onClick={() => setBagOpen(true)}
          className="relative grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-white/5 transition hover:border-zari/60"
          aria-label={`Open bag, ${count} items`}
        >
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M5 8h14l-1 12H6L5 8Z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></svg>
          <AnimatePresence>
            {count > 0 && (
              <motion.span
                key={count}
                initial={{ scale: 0.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.3, opacity: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 18 }}
                className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-sindoor px-1 text-[11px] font-bold text-white"
              >
                {count}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </header>
  );
}
