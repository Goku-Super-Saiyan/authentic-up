import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { SITE, telLink, waLink } from "../config";

// Floating WhatsApp and call buttons, bottom right on every page. Hidden until a number is configured.
export default function ContactDock() {
  const [open, setOpen] = useState(false);
  const wa = waLink(`Namaste! I found ${SITE.name} and have a question.`);
  const tel = telLink();
  if (!wa && !tel) return null;
  return (
    <div className="fixed bottom-5 right-4 z-[60] flex flex-col items-end gap-3 sm:right-6">
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} className="flex flex-col items-end gap-2">
            {wa && <a href={wa} target="_blank" rel="noopener" className="rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-[#063] shadow-lg">Chat on WhatsApp</a>}
            {tel && <a href={tel} className="rounded-full bg-zari px-5 py-3 text-sm font-semibold text-night shadow-lg">Call us</a>}
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button whileTap={{ scale: 0.92 }} onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label={open ? "Close contact options" : "Contact us"}
        className="grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-xl shadow-black/40">
        {open
          ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
          : <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3Z" /></svg>}
      </motion.button>
    </div>
  );
}
