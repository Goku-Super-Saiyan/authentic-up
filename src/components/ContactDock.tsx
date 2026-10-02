import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { SITE, telLink, waLink } from "../config";
import { scrollToTop, useStore } from "../store";

// Floating buttons, bottom right on every page: Home on top (once you've scrolled or left the home
// page), then WhatsApp and call. The contact button is hidden until a number is configured.
export default function ContactDock() {
  const { page, go } = useStore();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 500);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  const wa = waLink(`Namaste! I found ${SITE.name} and have a question.`);
  const tel = telLink();
  const showHome = page !== "home" || scrolled;
  return (
    <div className="fixed bottom-5 right-4 z-[60] flex flex-col items-end gap-3 sm:right-6">
      <AnimatePresence>
        {showHome && (
          <motion.button key="home" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }} whileTap={{ scale: 0.92 }}
            onClick={() => { setOpen(false); if (page === "home") scrollToTop(); else go("home"); }} aria-label="Go to home page" title="Home"
            className="mr-1 grid h-12 w-12 place-items-center rounded-full border border-zari/50 bg-night/90 text-zari shadow-xl shadow-black/40 backdrop-blur transition-colors hover:bg-zari hover:text-night">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" /></svg>
          </motion.button>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} className="flex flex-col items-end gap-2">
            {wa && <a href={wa} target="_blank" rel="noopener" className="rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-[#063] shadow-lg">Chat on WhatsApp</a>}
            {tel && <a href={tel} className="rounded-full bg-zari px-5 py-3 text-sm font-semibold text-night shadow-lg">Call us</a>}
          </motion.div>
        )}
      </AnimatePresence>
      {(wa || tel) && <motion.button whileTap={{ scale: 0.92 }} onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label={open ? "Close contact options" : "Contact us"}
        className="grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-xl shadow-black/40">
        {open
          ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
          : <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3Z" /></svg>}
      </motion.button>}
    </div>
  );
}
