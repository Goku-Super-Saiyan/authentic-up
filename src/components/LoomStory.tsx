import { motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { Arch } from "./CraftJourney";
import CraftCanvas from "./CraftCanvas";
import { useLang } from "../i18n";

const STEPS = [
  { day: "01", term: "Naksha", termHi: "नक्शा", text: "The design is drawn on graph paper. Every square is one thread, so a single buta can take a whole day to plot.",
    textHi: "डिज़ाइन ग्राफ़ पेपर पर बनाया जाता है। हर खाना एक धागा है, इसलिए एक बूटा बनाने में पूरा दिन लग सकता है।" },
  { day: "03", term: "Pattas", termHi: "पत्ते", text: "The pattern is punched into a chain of jacquard cards that tell the loom which threads to lift on every pass.",
    textHi: "डिज़ाइन जैक्वार्ड कार्डों की लड़ी में छेदकर उतारा जाता है, जो करघे को बताते हैं कि हर बार कौन से धागे उठाने हैं।" },
  { day: "05", term: "Tana", termHi: "ताना", text: "Thousands of silk warp threads are stretched along the lane, twisted by hand and tied onto the loom one by one.",
    textHi: "रेशम के हज़ारों ताने के धागे गली में फैलाए जाते हैं, हाथ से बटे जाते हैं और एक-एक करके करघे पर बाँधे जाते हैं।" },
  { day: "07–20", term: "Bunai", termHi: "बुनाई", text: "Two weavers throw the shuttle and slip in real zari by hand for every motif. A good day is a few inches.",
    textHi: "दो बुनकर ढरकी चलाते हैं और हर बूटे में असली ज़री हाथ से डालते हैं। अच्छे दिन में बस कुछ इंच बुनाई होती है।" },
  { day: "21", term: "Utaar", termHi: "उतार", text: "The saree is cut from the loom, checked against the light thread by thread, and folded in tissue for you.",
    textHi: "साड़ी करघे से उतारी जाती है, रोशनी में धागा-धागा जाँची जाती है, और आपके लिए टिश्यू में तह करके रखी जाती है।" },
];

// The page scrolls normally here. Only the saree column stays in view while the days pass by.
export default function LoomStory() {
  const { t, lang } = useLang();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.7", "end 0.6"] });
  const [step, setStep] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => setStep(Math.max(0, Math.min(STEPS.length - 1, Math.floor(v * STEPS.length)))));
  const unwoven = useTransform(scrollYProgress, [0, 1], ["100%", "0%"]);

  return (
    <section ref={ref} className="relative bg-gradient-to-b from-night via-silk/30 to-night py-[clamp(72px,10vw,130px)]" aria-label={t("How a Banarasi saree is made", "बनारसी साड़ी कैसे बनती है")}>
      <div className="mx-auto grid max-w-[1320px] gap-10 px-4 sm:px-8 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)] md:gap-16">
        <div className="md:sticky md:top-24 md:self-start">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-marigold">{t("One saree, start to finish", "एक साड़ी, शुरू से आख़िर तक")}</p>
          <h2 className="mt-3 font-display text-[clamp(34px,4.4vw,64px)] leading-[0.95]">{lang === "hi" ? <><span className="zari-text">वाराणसी के करघे</span> पर 21 दिन</> : <>21 days on a <span className="zari-text">Varanasi loom</span></>}</h2>
          <Arch className="mx-auto mt-8 h-[min(48svh,420px)] w-[min(66vw,300px)] md:h-[min(56svh,500px)] md:w-full md:max-w-[380px]">
            <CraftCanvas art="saree" seed={41} label={t("A Banarasi saree being woven", "बुनी जा रही बनारसी साड़ी")} />
            <motion.div style={{ height: unwoven }} className="absolute inset-x-0 bottom-0 bg-[#1A0820]">
              <div className="absolute inset-0 opacity-70" style={{ backgroundImage: "repeating-linear-gradient(90deg, rgba(231,190,99,.55) 0 1px, transparent 1px 7px)" }} />
              <motion.div className="absolute -top-[3px] left-0 h-[6px] w-1/3 rounded-full bg-zari shadow-[0_0_18px_#E7BE63]" animate={{ x: ["0%", "200%", "0%"] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }} />
            </motion.div>
          </Arch>
          <p className="mt-5 text-center font-mono text-xs uppercase tracking-widest text-ivory/50">{t("Day", "दिन")} {STEPS[step].day} · {t(STEPS[step].term, STEPS[step].termHi)}</p>
        </div>

        <ol className="relative min-w-0 border-l border-white/10 pl-8 md:mt-40">
          {STEPS.map((s, i) => (
            <motion.li
              key={s.term}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-15%" }}
              transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
              className="relative pb-16 last:pb-0"
            >
              <span className={`absolute -left-[41px] top-4 h-4 w-4 rotate-45 border-2 transition-colors duration-500 ${i <= step ? "border-zari bg-zari" : "border-white/30 bg-night"}`} />
              <p className="flex items-baseline gap-3">
                <span className="font-mono text-xs uppercase tracking-widest text-ivory/50">{t("Day", "दिन")}</span>
                <span className={`font-display text-[clamp(52px,6vw,90px)] leading-none transition-colors duration-500 ${i === step ? "zari-text" : "text-ivory/35"}`}>{s.day}</span>
              </p>
              <p className="mt-2 font-display text-3xl">{t(s.term, s.termHi)}</p>
              <p className="mt-2 max-w-[30em] text-lg text-ivory/75">{t(s.text, s.textHi)}</p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
