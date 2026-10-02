import { animate, motion, useInView } from "framer-motion";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { DISTRICTS, districtHi } from "../data/districts";
import { useLang } from "../i18n";
import { useStore } from "../store";

function CountUp({ to, prefix = "", suffix = "" }: { to: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useInView(ref, { once: true });
  const [v, setV] = useState(to);
  useEffect(() => {
    if (!seen) return;
    const c = animate(0, to, { duration: 1.6, ease: "easeOut", onUpdate: (x) => setV(Math.round(x)) });
    return () => c.stop();
  }, [seen, to]);
  return <span ref={ref} className="tabular-nums">{prefix}{v.toLocaleString("en-IN")}{suffix}</span>;
}

const STEPS = [
  ["Register your unit", "Sign up with your Udyam or GST number, or your artisan card.",
    "अपनी इकाई पंजीकृत करें", "उद्यम या जीएसटी नंबर, या अपने कारीगर कार्ड से साइन अप करें।"],
  ["List from your phone", "Photos and a few lines in Hindi or English. We help write each piece's story.",
    "फ़ोन से सामान डालें", "तस्वीरें और हिंदी या अंग्रेज़ी में कुछ पंक्तियाँ। हर चीज़ की कहानी लिखने में हम मदद करते हैं।"],
  ["We collect from your door", "Pickup from your karkhana or loom, packed and insured.",
    "हम आपके दरवाज़े से ले जाते हैं", "आपके कारख़ाने या करघे से पिकअप, पैकिंग और बीमा के साथ।"],
  ["Paid to your bank", "Money lands within 7 days of delivery. No listing fee.",
    "पैसा सीधे आपके बैंक में", "डिलीवरी के 7 दिन के अंदर पैसा आ जाता है। कोई लिस्टिंग फ़ीस नहीं।"],
];

export default function Sell() {
  const { say } = useStore();
  const { t, lang } = useLang();
  const [craft, setCraft] = useState("");
  const [district, setDistrict] = useState("Varanasi");
  const submit = (e: FormEvent) => {
    e.preventDefault();
    say(craft.trim()
      ? t(`Thank you. ${district} makers of ${craft.trim()} are on the early list.`, `धन्यवाद। ${districtHi(district)} के ${craft.trim()} कारीगर शुरुआती सूची में जुड़ गए हैं।`)
      : t("Tell us what you make first", "पहले बताइए कि आप क्या बनाते हैं"));
    if (craft.trim()) setCraft("");
  };

  return (
    <section id="sell" className="relative scroll-mt-16 overflow-hidden bg-silk py-[clamp(72px,10vw,140px)]">
      <div className="pointer-events-none absolute inset-0 opacity-[0.12]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #E7BE63 1px, transparent 0)", backgroundSize: "26px 26px" }} />
      <div className="relative mx-auto grid max-w-[1320px] gap-14 px-4 sm:px-8 lg:grid-cols-2">
        <div className="min-w-0">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-marigold">{t("For artisans and ODOP units", "कारीगरों और ओडीओपी इकाइयों के लिए")}</p>
          <h2 className="mt-4 font-display text-[clamp(44px,6vw,88px)] leading-[0.92]">{lang === "hi" ? <>आपका शिल्प।<br />आपका दाम।<br /><span className="zari-text">उस पर आपका नाम।</span></> : <>Your craft.<br />Your price.<br /><span className="zari-text">Your name on it.</span></>}</h2>
          <div className="mt-10 grid grid-cols-3 gap-4 border-t border-white/15 pt-6">
            <div><p className="font-display text-[clamp(30px,4vw,48px)] text-zari"><CountUp to={0} prefix="₹" /></p><p className="text-sm text-ivory/70">{t("listing fee", "लिस्टिंग फ़ीस")}</p></div>
            <div><p className="font-display text-[clamp(30px,4vw,48px)] text-zari"><CountUp to={7} /></p><p className="text-sm text-ivory/70">{t("days to payout", "दिन में भुगतान")}</p></div>
            <div><p className="font-display text-[clamp(30px,4vw,48px)] text-zari"><CountUp to={75} /></p><p className="text-sm text-ivory/70">{t("districts open", "ज़िले खुले हैं")}</p></div>
          </div>
          <form onSubmit={submit} className="mt-10 rounded-[24px] border border-white/15 bg-night/40 p-5 backdrop-blur sm:p-6">
            <p className="font-semibold">{t("Join the first sellers", "पहले विक्रेताओं में शामिल हों")}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_170px_auto]">
              <label className="sr-only" htmlFor="craft">{t("What do you make?", "आप क्या बनाते हैं?")}</label>
              <input id="craft" value={craft} onChange={(e) => setCraft(e.target.value)} placeholder={t("What do you make? e.g. jute wall hangings", "आप क्या बनाते हैं? जैसे जूट की वॉल हैंगिंग")} className="h-12 min-w-0 rounded-full border border-white/15 bg-white/5 px-5 text-ivory outline-none placeholder:text-ivory/40 focus:border-zari" />
              <label className="sr-only" htmlFor="district">{t("District", "ज़िला")}</label>
              <select id="district" value={district} onChange={(e) => setDistrict(e.target.value)} className="h-12 rounded-full border border-white/15 bg-dusk px-4 text-ivory outline-none focus:border-zari">
                {DISTRICTS.map((d) => <option key={d.name} value={d.name}>{lang === "hi" ? d.nameHi : d.name}</option>)}
              </select>
              <motion.button whileTap={{ scale: 0.96 }} type="submit" className="h-12 rounded-full bg-zari px-6 font-semibold text-night">{t("Join", "जुड़ें")}</motion.button>
            </div>
          </form>
        </div>
        <ol className="min-w-0 self-center">
          {STEPS.map(([en, d, hiT, hiD], i) => (
            <motion.li
              key={en}
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ delay: i * 0.12, duration: 0.6 }}
              className="grid grid-cols-[64px_1fr] gap-5 border-t border-white/15 py-7 last:border-b"
            >
              <span className="font-display text-5xl leading-none text-zari">{i + 1}</span>
              <div><p className="text-xl font-semibold">{t(en, hiT)}</p><p className="mt-1 text-ivory/70">{t(d, hiD)}</p></div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
