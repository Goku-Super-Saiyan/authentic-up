import { motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { Arch } from "./CraftJourney";
import CraftCanvas from "./CraftCanvas";

const STEPS = [
  { day: "01", term: "Naksha", text: "The design is drawn on graph paper. Every square is one thread, so a single buta can take a whole day to plot." },
  { day: "03", term: "Pattas", text: "The pattern is punched into a chain of jacquard cards that tell the loom which threads to lift on every pass." },
  { day: "05", term: "Tana", text: "Thousands of silk warp threads are stretched along the lane, twisted by hand and tied onto the loom one by one." },
  { day: "07–20", term: "Bunai", text: "Two weavers throw the shuttle and slip in real zari by hand for every motif. A good day is a few inches." },
  { day: "21", term: "Utaar", text: "The saree is cut from the loom, checked against the light thread by thread, and folded in tissue for you." },
];

// The page scrolls normally here. Only the saree column stays in view while the days pass by.
export default function LoomStory() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.7", "end 0.6"] });
  const [step, setStep] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => setStep(Math.max(0, Math.min(STEPS.length - 1, Math.floor(v * STEPS.length)))));
  const unwoven = useTransform(scrollYProgress, [0, 1], ["100%", "0%"]);

  return (
    <section ref={ref} className="relative bg-gradient-to-b from-night via-silk/30 to-night py-[clamp(72px,10vw,130px)]" aria-label="How a Banarasi saree is made">
      <div className="mx-auto grid max-w-[1320px] gap-10 px-4 sm:px-8 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)] md:gap-16">
        <div className="md:sticky md:top-24 md:self-start">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-marigold">One saree, start to finish</p>
          <h2 className="mt-3 font-display text-[clamp(34px,4.4vw,64px)] leading-[0.95]">21 days on a <span className="zari-text">Varanasi loom</span></h2>
          <Arch className="mx-auto mt-8 h-[min(48svh,420px)] w-[min(66vw,300px)] md:h-[min(56svh,500px)] md:w-full md:max-w-[380px]">
            <CraftCanvas art="saree" seed={41} label="A Banarasi saree being woven" />
            <motion.div style={{ height: unwoven }} className="absolute inset-x-0 bottom-0 bg-[#1A0820]">
              <div className="absolute inset-0 opacity-70" style={{ backgroundImage: "repeating-linear-gradient(90deg, rgba(231,190,99,.55) 0 1px, transparent 1px 7px)" }} />
              <motion.div className="absolute -top-[3px] left-0 h-[6px] w-1/3 rounded-full bg-zari shadow-[0_0_18px_#E7BE63]" animate={{ x: ["0%", "200%", "0%"] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }} />
            </motion.div>
          </Arch>
          <p className="mt-5 text-center font-mono text-xs uppercase tracking-widest text-ivory/50">Day {STEPS[step].day} · {STEPS[step].term}</p>
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
                <span className="font-mono text-xs uppercase tracking-widest text-ivory/50">Day</span>
                <span className={`font-display text-[clamp(52px,6vw,90px)] leading-none transition-colors duration-500 ${i === step ? "zari-text" : "text-ivory/35"}`}>{s.day}</span>
              </p>
              <p className="mt-2 font-display text-3xl">{s.term}</p>
              <p className="mt-2 max-w-[30em] text-lg text-ivory/75">{s.text}</p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
