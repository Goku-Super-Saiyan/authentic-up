import { animate, motion, useInView } from "framer-motion";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { DISTRICTS } from "../data/districts";
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
  ["Register your unit", "Sign up with your Udyam or GST number, or your artisan card."],
  ["List from your phone", "Photos and a few lines in Hindi or English. We help write each piece's story."],
  ["We collect from your door", "Pickup from your karkhana or loom, packed and insured."],
  ["Paid to your bank", "Money lands within 7 days of delivery. No listing fee."],
];

export default function Sell() {
  const { say } = useStore();
  const [craft, setCraft] = useState("");
  const [district, setDistrict] = useState("Varanasi");
  const submit = (e: FormEvent) => {
    e.preventDefault();
    say(craft.trim() ? `Thank you. ${district} makers of ${craft.trim()} are on the early list.` : "Tell us what you make first");
    if (craft.trim()) setCraft("");
  };

  return (
    <section id="sell" className="relative scroll-mt-16 overflow-hidden bg-silk py-[clamp(72px,10vw,140px)]">
      <div className="pointer-events-none absolute inset-0 opacity-[0.12]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #E7BE63 1px, transparent 0)", backgroundSize: "26px 26px" }} />
      <div className="relative mx-auto grid max-w-[1320px] gap-14 px-4 sm:px-8 lg:grid-cols-2">
        <div className="min-w-0">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-marigold">For artisans and ODOP units</p>
          <h2 className="mt-4 font-display text-[clamp(44px,6vw,88px)] leading-[0.92]">Your craft.<br />Your price.<br /><span className="zari-text">Your name on it.</span></h2>
          <div className="mt-10 grid grid-cols-3 gap-4 border-t border-white/15 pt-6">
            <div><p className="font-display text-[clamp(30px,4vw,48px)] text-zari"><CountUp to={0} prefix="₹" /></p><p className="text-sm text-ivory/70">listing fee</p></div>
            <div><p className="font-display text-[clamp(30px,4vw,48px)] text-zari"><CountUp to={7} /></p><p className="text-sm text-ivory/70">days to payout</p></div>
            <div><p className="font-display text-[clamp(30px,4vw,48px)] text-zari"><CountUp to={75} /></p><p className="text-sm text-ivory/70">districts open</p></div>
          </div>
          <form onSubmit={submit} className="mt-10 rounded-[24px] border border-white/15 bg-night/40 p-5 backdrop-blur sm:p-6">
            <p className="font-semibold">Join the first sellers</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_170px_auto]">
              <label className="sr-only" htmlFor="craft">What do you make?</label>
              <input id="craft" value={craft} onChange={(e) => setCraft(e.target.value)} placeholder="What do you make? e.g. jute wall hangings" className="h-12 min-w-0 rounded-full border border-white/15 bg-white/5 px-5 text-ivory outline-none placeholder:text-ivory/40 focus:border-zari" />
              <label className="sr-only" htmlFor="district">District</label>
              <select id="district" value={district} onChange={(e) => setDistrict(e.target.value)} className="h-12 rounded-full border border-white/15 bg-dusk px-4 text-ivory outline-none focus:border-zari">
                {DISTRICTS.map((d) => <option key={d.name}>{d.name}</option>)}
              </select>
              <motion.button whileTap={{ scale: 0.96 }} type="submit" className="h-12 rounded-full bg-zari px-6 font-semibold text-night">Join</motion.button>
            </div>
          </form>
        </div>
        <ol className="min-w-0 self-center">
          {STEPS.map(([t, d], i) => (
            <motion.li
              key={t}
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ delay: i * 0.12, duration: 0.6 }}
              className="grid grid-cols-[64px_1fr] gap-5 border-t border-white/15 py-7 last:border-b"
            >
              <span className="font-display text-5xl leading-none text-zari">{i + 1}</span>
              <div><p className="text-xl font-semibold">{t}</p><p className="mt-1 text-ivory/70">{d}</p></div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
