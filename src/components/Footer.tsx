import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Emblem } from "./Logo";
import { useStore } from "../store";
import { prettyPhone, SITE, telLink, waLink } from "../config";
import { BRAND } from "../brand/brand";
import { useLang } from "../i18n";

export default function Footer() {
  const { go } = useStore();
  const { t } = useLang();
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
        <p><span className="font-display text-xl text-ivory">{SITE.name}</span><br />{BRAND.slogan && <span className="text-zari">{BRAND.slogan}<br /></span>}{t(BRAND.footerLine, BRAND.hi.footerLine)}</p>
        <div className="grid gap-1">
          <a href={`mailto:${SITE.email}`} className="hover:text-zari">{SITE.email}</a>
          {SITE.phone && (
            <span>
              {telLink() && <a href={telLink()!} className="hover:text-zari">{prettyPhone(SITE.phone)}</a>}
              {waLink("Namaste!") && <> · <a href={waLink("Namaste!")!} target="_blank" rel="noopener" className="hover:text-zari">{t("WhatsApp", "व्हाट्सऐप")}</a></>}
            </span>
          )}
          <span>{SITE.address}</span>
        </div>
      </div>
      <div className="mx-auto mt-6 flex max-w-[1320px] flex-wrap justify-between gap-4 px-4 text-xs text-ivory/45 sm:px-8">
        <nav className="flex flex-wrap gap-x-5 gap-y-2" aria-label={t("Policies", "नीतियाँ")}>
          <button onClick={() => go("privacy")} className="hover:text-zari">{t("Privacy", "गोपनीयता")}</button>
          <button onClick={() => go("terms")} className="hover:text-zari">{t("Terms", "शर्तें")}</button>
          <button onClick={() => go("shipping")} className="hover:text-zari">{t("Shipping", "शिपिंग")}</button>
          <button onClick={() => go("returns")} className="hover:text-zari">{t("Returns and refunds", "वापसी और रिफ़ंड")}</button>
        </nav>
        <p>© {new Date().getFullYear()} {SITE.name}. {t("All rights reserved.", "सर्वाधिकार सुरक्षित।")}</p>
      </div>
      <VisitorCount />
    </footer>
  );
}

// Small running count at the very end of the page. Each browser counts once a day (India time);
// the line stays hidden until the count loads, so nothing shows if the counter isn't set up.
const VISIT_KEY = "iup-visit-day";

function VisitorCount() {
  const { t } = useLang();
  const [total, setTotal] = useState<number | null>(null);
  useEffect(() => {
    const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
    let counted = false;
    try { counted = localStorage.getItem(VISIT_KEY) === today; } catch { /* private mode */ }
    fetch("/api/visits", { method: counted ? "GET" : "POST" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { total: number | null } | null) => {
        if (typeof d?.total !== "number" || d.total < 1) return;
        setTotal(d.total);
        if (!counted) try { localStorage.setItem(VISIT_KEY, today); } catch { /* private mode */ }
      })
      .catch(() => {});
  }, []);
  if (total === null) return null;
  return (
    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto mt-8 flex w-fit items-center gap-2 rounded-full border border-white/10 px-3.5 py-1.5 font-mono text-[11px] tracking-wide text-ivory/50">
      <span className="relative flex h-1.5 w-1.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-zari/70" /><span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-zari" /></span>
      <span className="tabular-nums text-ivory/75">{total.toLocaleString("en-IN")}</span> {t(total === 1 ? "visitor" : "visitors", "विज़िटर")}
    </motion.p>
  );
}
