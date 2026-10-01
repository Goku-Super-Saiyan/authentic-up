import { motion, useScroll, useTransform } from "framer-motion";
import { useMemo, useRef } from "react";
import { rng } from "../art/crafts";
import { scrollToId } from "../store";
import Magnetic from "./Magnetic";
import { BRAND } from "../brand/brand";

// Dusk over the Varanasi ghats, drawn as layered SVG silhouettes.
const W = 1600, SUN_X = 1120;

type Sky = { path: string; windows: [number, number, number, number][]; flags: [number, number][] };

function skyline(seed: number, base: number, minH: number, maxH: number, lit: boolean): Sky {
  const R = rng(seed);
  let d = "";
  const windows: Sky["windows"] = [], flags: Sky["flags"] = [];
  const rect = (x: number, y: number, w: number, h: number) => { d += `M${x} ${y}h${w}v${h}h${-w}Z`; };
  const dome = (cx: number, y: number, r: number) => { d += `M${cx - r} ${y}A${r} ${r} 0 0 1 ${cx + r} ${y}Z`; };
  for (let x = -30; x < W + 30;) {
    const w = 46 + R() * 80, h = minH + R() * (maxH - minH), t = R(), top = base - h;
    if (t < 0.3) {
      rect(x, top, w, h);
      for (let p = x + 4; p < x + w - 8; p += 14) rect(p, top - 6, 7, 6);
    } else if (t < 0.55) {
      const bh = h * 0.45, sw = w * 0.78, sx = x + (w - sw) / 2, cx = x + w / 2, bt = base - bh, sh = h * 0.75;
      rect(x, bt, w, bh);
      d += `M${sx} ${bt}C${sx} ${bt - sh * 0.55} ${cx - sw * 0.14} ${bt - sh * 0.92} ${cx} ${bt - sh}C${cx + sw * 0.14} ${bt - sh * 0.92} ${sx + sw} ${bt - sh * 0.55} ${sx + sw} ${bt}Z`;
      d += `M${cx - 7} ${bt - sh + 2}a7 4 0 1 0 14 0a7 4 0 1 0 -14 0Z`;
      rect(cx - 1, bt - sh - 26, 2, 26);
      flags.push([cx + 1, bt - sh - 26]);
    } else if (t < 0.72) {
      const bh = h * 0.6, r = w * 0.38, cx = x + w / 2;
      rect(x, base - bh, w, bh);
      dome(cx, base - bh, r);
      rect(cx - 1.5, base - bh - r - 14, 3, 14);
    } else if (t < 0.85) {
      const bh = h * 0.55, cx = x + w / 2, pw = w * 0.7, px = x + (w - pw) / 2, ph = h * 0.22, pt = base - bh;
      rect(x, pt, w, bh);
      for (let i = 0; i < 4; i++) rect(px + (i * (pw - 4)) / 3, pt - ph, 4, ph);
      rect(px - 4, pt - ph - 4, pw + 8, 5);
      dome(cx, pt - ph - 4, pw * 0.45);
    } else {
      rect(x, top, w, h);
      rect(x + w * 0.2, top + h * 0.3, w * 0.6, 10);
      dome(x + w / 2, top, w * 0.18);
    }
    if (lit) {
      const rows = Math.floor((h * 0.5) / 22);
      for (let r = 0; r < rows; r++) for (let c = x + 8; c < x + w - 14; c += 18) if (R() < 0.22) windows.push([c, base - 18 - r * 22, 6, 9]);
    }
    x += w + R() * 8;
  }
  return { path: d, windows, flags };
}

const TITLE = BRAND.word.split("");

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yFar = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const yNear = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const ySun = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const yText = useTransform(scrollYProgress, [0, 1], [0, -160]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const far = useMemo(() => skyline(11, 650, 70, 190, false), []);
  const near = useMemo(() => skyline(5, 676, 60, 150, true), []);
  const stars = useMemo(() => { const R = rng(3); return Array.from({ length: 70 }, () => [R() * W, R() * 330, R() * 1.4 + 0.4, R() * 4] as const); }, []);
  const diyas = useMemo(() => { const R = rng(9); return Array.from({ length: 18 }, () => { const y = 745 + R() * 140; return { x: R() * W, y, s: 0.5 + ((y - 745) / 140) * 0.9, d: 14 + R() * 16, delay: R() * 3 }; }); }, []);
  const glints = useMemo(() => { const R = rng(4); return Array.from({ length: 34 }, (_, i) => { const y = 732 + i * 5; const spread = 30 + i * 4.5; return [SUN_X - spread / 2 + (R() - 0.5) * spread * 0.6, y, 20 + R() * spread * 0.6] as const; }); }, []);

  return (
    <section ref={ref} className="relative isolate h-[min(100svh,940px)] min-h-[700px] overflow-hidden bg-night" aria-label={`Welcome to ${BRAND.name}`}>
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0E0720" />
            <stop offset=".35" stopColor="#24104A" />
            <stop offset=".58" stopColor="#6E2463" />
            <stop offset=".7" stopColor="#C2415A" />
            <stop offset=".76" stopColor="#F2753A" />
            <stop offset=".8" stopColor="#FFB45A" />
          </linearGradient>
          <radialGradient id="sun" cx=".5" cy=".45" r=".6">
            <stop offset="0" stopColor="#FFF1C9" />
            <stop offset=".5" stopColor="#FFB627" />
            <stop offset="1" stopColor="#FF8A1F" />
          </radialGradient>
          <radialGradient id="halo"><stop offset="0" stopColor="#FFB627" stopOpacity=".55" /><stop offset="1" stopColor="#FF8A1F" stopOpacity="0" /></radialGradient>
          <radialGradient id="diyaGlow"><stop offset="0" stopColor="#FFC85A" stopOpacity=".9" /><stop offset="1" stopColor="#FF8A1F" stopOpacity="0" /></radialGradient>
          <linearGradient id="river" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3B1A4E" />
            <stop offset=".3" stopColor="#1A0C33" />
            <stop offset="1" stopColor="#0B0519" />
          </linearGradient>
        </defs>
        <rect width="1600" height="900" fill="url(#sky)" />
        {stars.map(([x, y, r, d], i) => (
          <circle key={i} cx={x} cy={y} r={r} fill="#FFF4E2" style={{ animation: `twinkle ${3 + d}s ease-in-out ${d}s infinite` }} />
        ))}
        <motion.g style={{ y: ySun }}>
          <circle cx={SUN_X} cy="600" r="260" fill="url(#halo)" />
          <motion.circle cx={SUN_X} r="92" fill="url(#sun)" initial={{ cy: 720 }} animate={{ cy: 598 }} transition={{ duration: 2.8, ease: [0.2, 0.7, 0.2, 1] }} />
        </motion.g>
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.path
            key={i}
            d="M0 0q6-7 12 0q6-7 12 0"
            fill="none"
            stroke="#1A0C2E"
            strokeWidth="2"
            initial={{ x: 300 + i * 46, y: 230 + (i % 3) * 22 }}
            animate={{ x: 1700 + i * 46, y: 160 + (i % 2) * 30 }}
            transition={{ duration: 46, repeat: Infinity, ease: "linear", delay: i * 0.8 }}
          />
        ))}
        <motion.g style={{ y: yFar }}>
          <path d={far.path} fill="#3A1850" />
          {far.flags.map(([x, y], i) => <path key={i} d={`M${x} ${y}l16 5l-16 5Z`} fill="#C2415A" />)}
        </motion.g>
        <motion.g style={{ y: yNear }}>
          <path d={near.path} fill="#150A26" />
          {near.flags.map(([x, y], i) => (
            <path key={i} d={`M${x} ${y}l20 6l-20 6Z`} fill="#FF8A1F" style={{ transformOrigin: `${x}px ${y}px`, transformBox: "view-box", animation: `flicker ${2 + (i % 3)}s ease-in-out infinite` }} />
          ))}
          {near.windows.map(([x, y, w, h], i) => (
            <rect key={i} x={x} y={y} width={w} height={h} rx="3" fill="#FFB627" style={{ animation: `flicker ${3 + (i % 5)}s ease-in-out ${(i % 7) * 0.4}s infinite` }} />
          ))}
          <rect x="0" y="676" width="1600" height="56" fill="#1C0E30" />
          {Array.from({ length: 8 }, (_, i) => <rect key={i} x="0" y={680 + i * 7} width="1600" height="1.5" fill="#2E1848" />)}
          <rect x="0" y="732" width="1600" height="200" fill="url(#river)" />
          {glints.map(([x, y, w], i) => (
            <rect key={i} x={x} y={y} width={w} height="1.6" rx="1" fill="#FFC85A" opacity={0.85 - i * 0.02} style={{ animation: `flicker ${1.6 + (i % 4) * 0.5}s ease-in-out ${(i % 5) * 0.3}s infinite` }} />
          ))}
          {[{ x0: 240, y: 790, s: 1, dur: 60 }, { x0: 760, y: 760, s: 0.7, dur: 80 }].map((b, i) => (
            <motion.g key={i} initial={{ x: b.x0 }} animate={{ x: [b.x0, b.x0 + 260, b.x0] }} transition={{ duration: b.dur, repeat: Infinity, ease: "easeInOut" }}>
              <motion.g animate={{ y: [b.y, b.y + 3, b.y] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}>
                <g transform={`scale(${b.s})`}>
                  <path d="M0 0h150q-14 22-75 22T0 0Z" fill="#0A0518" />
                  <path d="M40 0v-30h56v30" fill="none" stroke="#0A0518" strokeWidth="5" />
                  <path d="M34 -30q34 -18 68 0Z" fill="#0A0518" />
                  <path d="M128 0l30 -46" stroke="#0A0518" strokeWidth="3" />
                </g>
              </motion.g>
            </motion.g>
          ))}
          {diyas.map((d, i) => (
            <motion.g key={i} initial={{ x: d.x, y: d.y }} animate={{ x: [d.x, d.x + 50, d.x], y: [d.y, d.y - 4, d.y] }} transition={{ duration: d.d, repeat: Infinity, ease: "easeInOut", delay: d.delay }}>
              <g transform={`scale(${d.s})`}>
                <circle r="26" fill="url(#diyaGlow)" />
                <path d="M-10 2q10 9 20 0Z" fill="#7A3416" />
                <path d="M0 -12q5 7 0 13q-5-6 0-13Z" fill="#FFD27A" style={{ animation: `flicker ${1 + (i % 3) * 0.3}s ease-in-out infinite` }} />
              </g>
            </motion.g>
          ))}
        </motion.g>
      </svg>
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-night" />

      <motion.div style={{ y: yText, opacity: fade }} className="relative z-10 mx-auto flex h-full max-w-[1320px] flex-col justify-start px-4 pt-[clamp(110px,16vh,170px)] sm:px-8">
        <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="font-mono text-[11px] uppercase tracking-[0.18em] text-marigold sm:text-xs sm:tracking-[0.3em]">
          {BRAND.eyebrow}
        </motion.p>
        <div className="mt-4 font-display leading-[0.86] tracking-tight">
          <h1 className="flex overflow-hidden pb-2 text-[clamp(64px,12.5vw,190px)] font-normal">
            {TITLE.map((ch, i) => (
              <motion.span key={i} aria-hidden="true" initial={{ y: "110%" }} animate={{ y: 0 }} transition={{ delay: 0.35 + i * 0.05, duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }} className="inline-block">
                {ch}
              </motion.span>
            ))}
            <span className="sr-only">{BRAND.name}</span>
          </h1>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-8">
            <motion.span aria-hidden="true" initial={{ opacity: 0, scale: 0.8, filter: "blur(12px)" }} animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }} transition={{ delay: 1, duration: 1.1 }} className="zari-text origin-left text-[clamp(84px,17vw,260px)]">
              UP
            </motion.span>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.4 }} className="sm:mb-[0.6em] font-body tracking-normal">
              {BRAND.slogan && (
                <p className="zari-text mb-3 font-display text-[clamp(24px,2.4vw,34px)] leading-tight sm:whitespace-nowrap">{BRAND.slogan}</p>
              )}
              <p className={`${BRAND.slogan ? "max-w-[24em]" : "max-w-[22em]"} text-[clamp(15px,1.5vw,19px)] font-light leading-snug text-ivory/85`}>{BRAND.heroLine}</p>
            </motion.div>
          </div>
        </div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.7 }} className="mt-8 flex flex-wrap gap-3">
          <Magnetic onClick={() => scrollToId("bazaar")} className="h-12 rounded-full bg-zari px-7 font-semibold text-night shadow-[0_10px_40px_-10px_#E7BE63]">
            Enter the bazaar
          </Magnetic>
          <Magnetic onClick={() => scrollToId("map")} className="h-12 rounded-full border border-ivory/30 bg-night/30 px-7 font-semibold backdrop-blur">
            Find your district's craft
          </Magnetic>
        </motion.div>
      </motion.div>
    </section>
  );
}
