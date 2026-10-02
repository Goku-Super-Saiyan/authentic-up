import { motion } from "framer-motion";
import { Emblem } from "./Logo";
import { scrollToId, useStore } from "../store";
import { SITE, telLink, waLink } from "../config";
import { BRAND } from "../brand/brand";

export default function Footer() {
  const { go, page } = useStore();
  const toSection = (id: string) => { if (page !== "home") { go("home"); setTimeout(() => scrollToId(id), 60); } else scrollToId(id); };
  return (
    <footer className="relative overflow-hidden pb-28 pt-24">
      <motion.div initial={{ opacity: 0, scale: 0.85 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.9 }} className="mx-auto mb-6 w-fit">
        <Emblem className="h-[180px] w-[149px] drop-shadow-[0_20px_60px_rgba(255,182,39,.25)]" animated />
      </motion.div>
      <motion.p
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="zari-text select-none text-center font-display text-[clamp(64px,15vw,240px)] leading-[1.1]"
        aria-hidden="true"
      >
        {BRAND.hindi}
      </motion.p>
      <div className="mx-auto mt-10 flex max-w-[1320px] flex-wrap justify-between gap-6 border-t border-white/10 px-4 pt-8 text-sm text-ivory/60 sm:px-8">
        <p><span className="font-display text-xl text-ivory">{SITE.name}</span><br />{BRAND.slogan && <span className="text-zari">{BRAND.slogan}<br /></span>}{BRAND.footerLine}</p>
        <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Footer">
          <button onClick={() => toSection("bazaar")} className="hover:text-zari">Bazaar</button>
          <button onClick={() => toSection("map")} className="hover:text-zari">Craft map</button>
          <button onClick={() => go("enquire")} className="hover:text-zari">Enquire</button>
          <button onClick={() => go("login")} className="hover:text-zari">Log in</button>
          <button onClick={() => toSection("sell")} className="hover:text-zari">Sell with us</button>
        </nav>
        <div className="grid gap-1">
          <a href={`mailto:${SITE.email}`} className="hover:text-zari">{SITE.email}</a>
          {waLink("Namaste!") && <a href={waLink("Namaste!")!} target="_blank" rel="noopener" className="hover:text-zari">WhatsApp +{SITE.whatsapp}</a>}
          {telLink() && <a href={telLink()!} className="hover:text-zari">Call {SITE.phone.startsWith("+") ? SITE.phone : "+" + SITE.phone}</a>}
          <span>{SITE.address}</span>
        </div>
      </div>
      <div className="mx-auto mt-6 flex max-w-[1320px] flex-wrap justify-between gap-4 px-4 text-xs text-ivory/45 sm:px-8">
        <nav className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Policies">
          <button onClick={() => go("privacy")} className="hover:text-zari">Privacy</button>
          <button onClick={() => go("terms")} className="hover:text-zari">Terms</button>
          <button onClick={() => go("shipping")} className="hover:text-zari">Shipping</button>
          <button onClick={() => go("returns")} className="hover:text-zari">Returns and refunds</button>
        </nav>
        <p>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</p>
      </div>
    </footer>
  );
}
