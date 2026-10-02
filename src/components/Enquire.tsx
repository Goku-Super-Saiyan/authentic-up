import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { DISTRICTS } from "../data/districts";
import { useLang } from "../i18n";
import { useStore } from "../store";
import { SITE, waLink, prettyPhone } from "../config";

const TYPES = ["Bulk or wholesale", "Export", "Custom design", "Corporate gifting", "Wedding trousseau", `Selling on ${SITE.name}`, "Something else"];
const BUDGETS = ["Under ₹25,000", "₹25,000 – 1 lakh", "₹1 – 5 lakh", "Above ₹5 lakh"];
const CRAFTS = ["Banarasi silk sarees", "Hand-knotted carpets", "Chikankari", "Glass bangles", "Brass and metal craft", "Attar", "Zari zardozi", "Black pottery", "Wood carving", "Terracotta", "Other ODOP craft"];
// Hindi labels for the choices above. The English value is what gets sent, so the admin page stays consistent.
const OPT_HI: Record<string, string> = {
  "Bulk or wholesale": "थोक ख़रीद", Export: "निर्यात", "Custom design": "अपना डिज़ाइन", "Corporate gifting": "कॉर्पोरेट उपहार",
  "Wedding trousseau": "शादी का सामान", [`Selling on ${SITE.name}`]: `${SITE.name} पर बेचना`, "Something else": "कुछ और",
  "Under ₹25,000": "₹25,000 से कम", "₹25,000 – 1 lakh": "₹25,000 – 1 लाख", "₹1 – 5 lakh": "₹1 – 5 लाख", "Above ₹5 lakh": "₹5 लाख से ज़्यादा",
  "Banarasi silk sarees": "बनारसी सिल्क साड़ियाँ", "Hand-knotted carpets": "हाथ से बुने क़ालीन", Chikankari: "चिकनकारी", "Glass bangles": "काँच की चूड़ियाँ",
  "Brass and metal craft": "पीतल और धातु शिल्प", Attar: "इत्र", "Zari zardozi": "ज़री ज़रदोज़ी", "Black pottery": "काली मिट्टी के बर्तन",
  "Wood carving": "लकड़ी पर नक्काशी", Terracotta: "टेराकोटा", "Other ODOP craft": "कोई और ओडीओपी शिल्प", "Any district": "कोई भी ज़िला",
};
const FAQ = [
  ["How fast will I hear back?", "Within one working day. Bulk and export enquiries go to a buyer support lead who speaks Hindi and English.",
    "जवाब कितनी जल्दी मिलेगा?", "एक कामकाजी दिन के अंदर। थोक और निर्यात की पूछताछ हमारी ख़रीदार सहायता टीम देखती है, जो हिंदी और अंग्रेज़ी दोनों बोलती है।"],
  ["Can artisans make a custom design?", "Yes. Most weavers and carvers take commissions. Lead times run from 3 weeks for embroidery to 4 months for a large carpet.",
    "क्या कारीगर मेरी पसंद का डिज़ाइन बना सकते हैं?", "हाँ। ज़्यादातर बुनकर और नक्काश ऑर्डर पर काम करते हैं। कढ़ाई में 3 हफ़्ते से लेकर बड़े क़ालीन में 4 महीने तक लगते हैं।"],
  ["Do you ship outside India?", "Export enquiries are handled with the maker's export licence or through a partner exporter, with GI-tag paperwork where it applies.",
    "क्या आप विदेश भेजते हैं?", "निर्यात की पूछताछ कारीगर के निर्यात लाइसेंस से या किसी साझेदार निर्यातक के ज़रिए पूरी की जाती है, और जहाँ लागू हो वहाँ जीआई टैग के काग़ज़ भी दिए जाते हैं।"],
];

type Form = { name: string; email: string; phone: string; type: string; craft: string; district: string; qty: string; budget: string; message: string };
const EMPTY: Form = { name: "", email: "", phone: "", type: TYPES[0], craft: CRAFTS[0], district: "Varanasi", qty: "", budget: BUDGETS[1], message: "" };

const field = "h-12 w-full rounded-xl border border-white/15 bg-white/5 px-4 text-[16px] text-ivory outline-none placeholder:text-ivory/35 focus:border-zari";

export default function Enquire() {
  const { go } = useStore();
  const { t, lang } = useLang();
  const L = (s: string) => (lang === "hi" ? OPT_HI[s] ?? s : s);
  const [f, setF] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [sent, setSent] = useState<string | null>(null);
  const card = useRef<HTMLDivElement>(null);
  // The form is much taller than the thank-you card, so bring the card into view once it replaces the form.
  useEffect(() => { if (sent) card.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }, [sent]);
  const [open, setOpen] = useState<number | null>(0);
  const [honey, setHoney] = useState("");
  const set = (k: keyof Form) => (e: { target: { value: string } }) => setF((x) => ({ ...x, [k]: e.target.value }));

  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState("");
  // Set when the server can't take enquiries yet: the buyer finishes sending it on WhatsApp or by email.
  const [handoff, setHandoff] = useState<{ href: string; via: "WhatsApp" | "email" } | null>(null);
  const handoffFor = (reference: string) => {
    const text = [`Enquiry ${reference} for ${SITE.name}`, `Type: ${f.type}`, `Craft: ${f.craft}`, `District: ${f.district}`, f.qty ? `Quantity: ${f.qty}` : null, `Budget: ${f.budget}`, "", f.message, "", `${f.name} · ${f.email}${f.phone ? ` · ${f.phone}` : ""}`].filter((l) => l !== null).join("\n");
    const wa = waLink(text);
    if (wa) return { href: wa, via: "WhatsApp" as const };
    return { href: `mailto:${SITE.email}?subject=${encodeURIComponent(`Enquiry ${reference} from ${f.name}`)}&body=${encodeURIComponent(text)}`, via: "email" as const };
  };
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const err: typeof errors = {};
    if (!f.name.trim()) err.name = t("Add your name.", "अपना नाम लिखें।");
    if (!/^\S+@\S+\.\S+$/.test(f.email)) err.email = t("Add an email we can reply to, like name@example.com.", "जवाब के लिए अपना ईमेल लिखें, जैसे name@example.com");
    if (f.phone && !/^[6-9]\d{9}$/.test(f.phone)) err.phone = t("Use a 10-digit Indian mobile number, or leave it blank.", "10 अंकों का भारतीय मोबाइल नंबर लिखें, या इसे ख़ाली छोड़ दें।");
    if (f.message.trim().length < 10) err.message = t("Tell us a little more: what you need, how many, and by when.", "थोड़ा और बताइए: क्या चाहिए, कितना, और कब तक।");
    setErrors(err);
    setFailed("");
    if (Object.keys(err).length) return;
    setSending(true);
    try {
      const r = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: f.type, name: f.name, email: f.email, phone: f.phone, craft: f.craft, district: f.district, quantity: f.qty, budget: f.budget, message: f.message, website: honey }),
      });
      if (r.status === 404 || r.status === 405) { setSent(`IUP-${Math.floor(100000 + Math.random() * 899999)}`); return; } // preview without a server
      const data = await r.json().catch(() => ({}));
      if (data.fallback) { setHandoff(handoffFor(data.reference)); setSent(data.reference); return; }
      if (!r.ok) { setFailed(lang === "hi" ? "कुछ गड़बड़ हुई। कृपया फिर से कोशिश करें।" : data.error || "Something went wrong. Please try again."); return; }
      setSent(data.reference);
    } catch {
      setFailed(t(`We couldn't reach the server. Please try again, or email ${SITE.email}.`, `सर्वर तक नहीं पहुँच पाए। कृपया फिर से कोशिश करें, या ${SITE.email} पर ईमेल करें।`));
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="relative overflow-hidden pb-24 pt-[calc(64px+clamp(40px,6vw,80px))]">
      <div className="pointer-events-none absolute -right-20 top-10 select-none font-display text-[clamp(120px,20vw,300px)] leading-none text-white/[0.03]" aria-hidden="true">पूछताछ</div>
      <div className="relative mx-auto max-w-[1320px] px-4 sm:px-8">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-marigold">{t("Enquire · पूछताछ", "पूछताछ")}</p>
        <h1 className="mt-4 max-w-[13em] font-display text-[clamp(44px,6.5vw,96px)] leading-[0.92]">{lang === "hi" ? <>बताइए आपको क्या चाहिए। <span className="zari-text">बनाने वाले हाथ हम ढूँढेंगे।</span></> : <>Tell us what you're looking for. <span className="zari-text">We'll find the hands.</span></>}</h1>
        <p className="mt-6 max-w-[40em] text-lg text-ivory/70">{t("Bulk orders for a store, a hundred sarees for a wedding, carpets for a hotel, or a gift box for your team. Write to us and we'll match you with the right makers.", "दुकान के लिए थोक ऑर्डर, शादी के लिए सौ साड़ियाँ, होटल के लिए क़ालीन, या अपनी टीम के लिए उपहार। हमें लिखिए, हम आपको सही कारीगरों से मिलाएँगे।")}</p>

        <div className="mt-14 grid items-start gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div ref={card} className="min-w-0 scroll-mt-24 rounded-[28px] border border-white/10 bg-dusk/60 p-6 sm:p-9">
            <AnimatePresence mode="wait">
              {!sent ? (
                <motion.form key="form" onSubmit={submit} noValidate initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -20 }} className="grid gap-6">
                  <fieldset className="grid gap-3">
                    <legend className="mb-3 text-sm text-ivory/75">{t("What is this about?", "किस बारे में है?")}</legend>
                    <div className="flex flex-wrap gap-2">
                      {TYPES.map((ty) => (
                        <button type="button" key={ty} onClick={() => setF((x) => ({ ...x, type: ty }))} aria-pressed={f.type === ty} className={`rounded-full border px-4 py-2 text-sm transition ${f.type === ty ? "border-zari bg-zari font-semibold text-night" : "border-white/15 text-ivory/80 hover:border-white/40"}`}>{L(ty)}</button>
                      ))}
                    </div>
                  </fieldset>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="grid gap-1.5 text-sm text-ivory/75" htmlFor="enq-name">{t("Name", "नाम")}
                      <input id="enq-name" className={field} value={f.name} onChange={set("name")} autoComplete="name" placeholder={t("Your name or company", "आपका नाम या कंपनी")} />
                      {errors.name && <span className="text-sindoor">{errors.name}</span>}
                    </label>
                    <label className="grid gap-1.5 text-sm text-ivory/75" htmlFor="enq-email">{t("Email", "ईमेल")}
                      <input id="enq-email" type="email" className={field} value={f.email} onChange={set("email")} autoComplete="email" placeholder="name@example.com" />
                      {errors.email && <span className="text-sindoor">{errors.email}</span>}
                    </label>
                    <label className="grid gap-1.5 text-sm text-ivory/75" htmlFor="enq-phone">{t("Mobile", "मोबाइल")} <span className="text-ivory/40">{t("(optional)", "(ज़रूरी नहीं)")}</span>
                      <input id="enq-phone" inputMode="numeric" className={field} value={f.phone} onChange={(e) => setF((x) => ({ ...x, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }))} placeholder="98765 43210" />
                      {errors.phone && <span className="text-sindoor">{errors.phone}</span>}
                    </label>
                    <label className="grid gap-1.5 text-sm text-ivory/75" htmlFor="enq-qty">{t("Quantity", "मात्रा")}
                      <input id="enq-qty" className={field} value={f.qty} onChange={set("qty")} placeholder={t("e.g. 50 sarees, 3 carpets", "जैसे 50 साड़ियाँ, 3 क़ालीन")} />
                    </label>
                    <label className="grid gap-1.5 text-sm text-ivory/75" htmlFor="enq-craft">{t("Craft", "शिल्प")}
                      <select id="enq-craft" className={`${field} bg-dusk`} value={f.craft} onChange={set("craft")}>{CRAFTS.map((c) => <option key={c} value={c}>{L(c)}</option>)}</select>
                    </label>
                    <label className="grid gap-1.5 text-sm text-ivory/75" htmlFor="enq-district">{t("Preferred district", "पसंदीदा ज़िला")}
                      <select id="enq-district" className={`${field} bg-dusk`} value={f.district} onChange={set("district")}><option value="Any district">{L("Any district")}</option>{DISTRICTS.map((d) => <option key={d.name} value={d.name}>{lang === "hi" ? d.nameHi : d.name}</option>)}</select>
                    </label>
                  </div>
                  <fieldset>
                    <legend className="mb-3 text-sm text-ivory/75">{t("Budget", "बजट")}</legend>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {BUDGETS.map((b) => (
                        <button type="button" key={b} onClick={() => setF((x) => ({ ...x, budget: b }))} aria-pressed={f.budget === b} className={`rounded-xl border px-3 py-3 text-sm transition ${f.budget === b ? "border-zari bg-zari/15 text-zari" : "border-white/15 text-ivory/80 hover:border-white/40"}`}>{L(b)}</button>
                      ))}
                    </div>
                  </fieldset>
                  <label className="grid gap-1.5 text-sm text-ivory/75" htmlFor="enq-msg">{t("Your enquiry", "आपकी पूछताछ")}
                    <textarea id="enq-msg" rows={5} className={`${field} h-auto py-3`} value={f.message} onChange={set("message")} placeholder={t("e.g. 40 Banarasi katan sarees in pastel shades for a wedding in February, delivered to Pune.", "जैसे फ़रवरी की शादी के लिए हल्के रंगों में 40 बनारसी कतान साड़ियाँ, पुणे में डिलीवरी।")} />
                    {errors.message && <span className="text-sindoor">{errors.message}</span>}
                  </label>
                  <input type="text" name="website" value={honey} onChange={(e) => setHoney(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
                  {failed && <p className="text-sindoor" role="alert">{failed}</p>}
                  <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={sending} className="h-13 rounded-full bg-zari py-3.5 font-semibold text-night disabled:opacity-60 sm:justify-self-start sm:px-10">{sending ? t("Sending…", "भेज रहे हैं…") : t("Send enquiry", "पूछताछ भेजें")}</motion.button>
                </motion.form>
              ) : (
                <motion.div key="sent" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid gap-4 py-6">
                  <motion.div initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 260, damping: 14 }} className="grid h-20 w-20 place-items-center rounded-full bg-zari text-night">
                    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><path d="m5 12 5 5 9-10" /></svg>
                  </motion.div>
                  <h2 className="font-display text-4xl">{handoff ? t("One last step", "बस एक क़दम और") : t(`Thank you, ${f.name.trim().split(" ")[0]}`, `धन्यवाद, ${f.name.trim().split(" ")[0]}`)}</h2>
                  {handoff ? (
                    <>
                      <p className="text-lg text-ivory/75">{t(`Your enquiry is ready. Tap below to send it to us on ${handoff.via}; everything you wrote is already filled in.`, `आपकी पूछताछ तैयार है। इसे ${handoff.via === "WhatsApp" ? "व्हाट्सऐप" : "ईमेल"} पर भेजने के लिए नीचे टैप करें। आपने जो लिखा है, वह पहले से भरा हुआ है।`)}</p>
                      <a href={handoff.href} target="_blank" rel="noopener noreferrer" className={`inline-flex h-12 items-center justify-self-start rounded-full px-7 font-semibold text-night ${handoff.via === "WhatsApp" ? "bg-[#25D366]" : "bg-zari"}`}>{t(`Send on ${handoff.via}`, `${handoff.via === "WhatsApp" ? "व्हाट्सऐप" : "ईमेल"} पर भेजें`)}</a>
                    </>
                  ) : (
                  <p className="text-lg text-ivory/75">{lang === "hi"
                    ? <>हमने <b className="text-ivory">{L(f.craft)}</b> ({L(f.type)}) के बारे में आपकी पूछताछ दर्ज कर ली है और एक कामकाजी दिन के अंदर <b className="text-ivory">{f.email}</b> पर जवाब देंगे।</>
                    : <>We've noted your enquiry about <b className="text-ivory">{f.craft.toLowerCase()}</b> ({f.type.toLowerCase()}) and will reply to <b className="text-ivory">{f.email}</b> within one working day.</>}</p>
                  )}
                  {!handoff && sent && waLink(t(`Namaste! About my enquiry ${sent}`, `नमस्ते! मेरी पूछताछ ${sent} के बारे में`)) && (
                    <a href={waLink(t(`Namaste! About my enquiry ${sent}`, `नमस्ते! मेरी पूछताछ ${sent} के बारे में`))!} target="_blank" rel="noopener noreferrer" className="justify-self-start text-sm font-semibold text-[#25D366] underline-offset-4 hover:underline">{t("Want a quicker answer? Chat with us on WhatsApp", "जल्दी जवाब चाहिए? व्हाट्सऐप पर हमसे बात करें")}</a>
                  )}
                  <p className="font-mono text-sm text-zari">{t("Reference", "संदर्भ संख्या")} {sent}</p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button onClick={() => go("home")} className="h-12 rounded-full bg-zari px-7 font-semibold text-night">{t("Back to the bazaar", "बाज़ार पर लौटें")}</button>
                    <button onClick={() => { setF(EMPTY); setSent(null); setHandoff(null); }} className="h-12 rounded-full border border-white/15 px-7 font-semibold hover:border-zari">{t("Send another", "एक और भेजें")}</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <aside className="min-w-0 grid gap-6 lg:sticky lg:top-24">
            <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-silk/70 to-plum/50 p-7">
              <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-marigold">{t("Buyer support", "ख़रीदार सहायता")}</p>
              <p className="mt-3 font-display text-3xl leading-tight">{t("Talk to a person who knows the looms", "करघों को समझने वाले व्यक्ति से बात करें")}</p>
              <dl className="mt-5 grid gap-3 text-ivory/85">
                <div><dt className="text-xs text-ivory/50">{t("Email", "ईमेल")}</dt><dd className="select-all font-mono">{SITE.email}</dd></div>
                <div><dt className="text-xs text-ivory/50">{t("Hours", "समय")}</dt><dd>{t("Mon to Sat, 10 am to 7 pm IST", "सोमवार से शनिवार, सुबह 10 से शाम 7 बजे")}</dd></div>
                <div><dt className="text-xs text-ivory/50">{t("Languages", "भाषाएँ")}</dt><dd>{t("Hindi, English, Urdu", "हिंदी, अंग्रेज़ी, उर्दू")}</dd></div>
                {SITE.whatsapp && <div><dt className="text-xs text-ivory/50">{t("WhatsApp", "व्हाट्सऐप")}</dt><dd><a className="text-zari hover:underline" href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noopener">{prettyPhone(SITE.whatsapp)}</a></dd></div>}
              </dl>
            </div>
            <div className="rounded-[28px] border border-white/10 p-3">
              {FAQ.map(([q, a, qHi, aHi], i) => (
                <div key={q} className="border-b border-white/10 last:border-0">
                  <button onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i} className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left font-semibold">
                    {t(q, qHi)}
                    <motion.span animate={{ rotate: open === i ? 45 : 0 }} className="text-2xl leading-none text-zari">+</motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {open === i && (
                      <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden px-4 text-ivory/70">
                        <span className="block pb-4">{t(a, aHi)}</span>
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
