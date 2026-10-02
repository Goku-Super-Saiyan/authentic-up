import { AnimatePresence, animate, motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useId, useMemo, useState, type ReactNode } from "react";
import { TONE, type Tone } from "./types";

// ---------- formatting ----------

export const inr = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");
export const short = (n: number) => (n >= 1e7 ? (n / 1e7).toFixed(1) + " Cr" : n >= 1e5 ? (n / 1e5).toFixed(1) + " L" : n >= 1e3 ? (n / 1e3).toFixed(1) + "k" : String(Math.round(n)));
export const date = (s: string) => new Date(s).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
export const dateTime = (s: string) => new Date(s).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
export function ago(s: string) {
  const m = Math.round((Date.now() - new Date(s).getTime()) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.round(h / 24);
  return d < 30 ? `${d} d ago` : date(s);
}
// Counts per day for the last `days` days, oldest first.
export function perDay(dates: string[], days: number, valueOf?: (i: number) => number) {
  const out = new Array(days).fill(0);
  const start = new Date(); start.setHours(0, 0, 0, 0); start.setDate(start.getDate() - days + 1);
  dates.forEach((d, i) => {
    const k = Math.floor((new Date(d).getTime() - start.getTime()) / 86400000);
    if (k >= 0 && k < days) out[k] += valueOf ? valueOf(i) : 1;
  });
  return out;
}
export const waNumber = (p?: string | null) => { const d = (p || "").replace(/\D/g, ""); return d.length === 10 ? "91" + d : d; };

// ---------- icons ----------

const PATHS: Record<string, string> = {
  overview: "M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z",
  inbox: "M3 13h5l2 3h4l2-3h5M5 5h14l2 8v6H3v-6z",
  orders: "M6 7h12l-1 13H7zM9 7a3 3 0 0 1 6 0",
  products: "M12 3 3 7.5v9L12 21l9-4.5v-9zM3 7.5l9 4.5 9-4.5M12 12v9",
  makers: "M12 3a3 3 0 1 1 0 6 3 3 0 0 1 0-6zM5 21v-2a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v2M19 8l2 2-2 2M5 8l-2 2 2 2",
  customers: "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21v-1a6 6 0 0 1 6-6h2a6 6 0 0 1 6 6v1M16 3.5a4 4 0 0 1 0 7M18 14a6 6 0 0 1 4 6v1",
  system: "M3 12h4l3-8 4 16 3-8h4",
  search: "M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14zM21 21l-5-5",
  plus: "M12 5v14M5 12h14",
  x: "M6 6l12 12M18 6 6 18",
  download: "M12 4v11M7 10l5 5 5-5M5 20h14",
  refresh: "M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7",
  mail: "M3 6h18v12H3zM3 7l9 6 9-6",
  phone: "M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2",
  external: "M14 4h6v6M20 4l-9 9M18 14v6H4V6h6",
  logout: "M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10",
  store: "M4 9l1.5-5h13L20 9M4 9v11h16V9M4 9h16M9 20v-6h6v6",
  star: "M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z",
  image: "M4 5h16v14H4zM4 16l5-5 4 4 2-2 5 5M15 9.5a1.5 1.5 0 1 0 0-.01",
  trash: "M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3",
  check: "M5 12l5 5 9-10",
  left: "M15 5l-7 7 7 7",
  right: "M9 5l7 7-7 7",
  menu: "M4 7h16M4 12h16M4 17h16",
  bolt: "M13 3 5 14h6l-1 7 8-11h-6z",
  pin: "M12 21s-7-6.5-7-12a7 7 0 1 1 14 0c0 5.5-7 12-7 12zM12 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5",
  shield: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z",
  rupee: "M7 4h10M7 8h10M7 4c6 0 6 8 0 8h-1l8 8",
};
export function Icon({ name, size = 18, className = "" }: { name: string; size?: number; className?: string }) {
  if (name === "whatsapp")
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm4.5 12.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3Z" /></svg>;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d={PATHS[name] ?? ""} />
    </svg>
  );
}

// ---------- surfaces ----------

export function Panel({ title, eyebrow, actions, children, className = "", glow }: { title?: ReactNode; eyebrow?: string; actions?: ReactNode; children: ReactNode; className?: string; glow?: Tone }) {
  return (
    <section className={`admin-panel relative rounded-2xl p-5 sm:p-6 ${className}`} style={glow ? { ["--glow" as string]: TONE[glow] } : undefined}>
      {(title || eyebrow || actions) && (
        <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            {eyebrow && <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-mist/80">{eyebrow}</p>}
            {title && <h3 className="mt-1 font-display text-2xl leading-tight">{title}</h3>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </header>
      )}
      {children}
    </section>
  );
}

export function Chip({ tone, children, dot = true }: { tone: Tone; children: ReactNode; dot?: boolean }) {
  const c = TONE[tone];
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 font-mono text-[10.5px] uppercase tracking-wider" style={{ color: c, borderColor: c + "55", background: c + "14" }}>
      {dot && <span className="h-1.5 w-1.5 rounded-full" style={{ background: c, boxShadow: `0 0 8px ${c}` }} />}
      {children}
    </span>
  );
}

export function Btn({ children, onClick, tone = "ghost", icon, disabled, type = "button", className = "", title }: { children?: ReactNode; onClick?: () => void; tone?: "ghost" | "gold" | "danger"; icon?: string; disabled?: boolean; type?: "button" | "submit"; className?: string; title?: string }) {
  const cls = tone === "gold" ? "bg-zari text-night hover:brightness-110 shadow-[0_0_24px_-6px_rgba(231,190,99,.7)]" : tone === "danger" ? "border border-sindoor/50 text-sindoor hover:bg-sindoor/10" : "border border-white/12 text-ivory/85 hover:border-zari/60 hover:text-ivory";
  return (
    <button type={type} onClick={onClick} disabled={disabled} title={title} className={`inline-flex h-10 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition disabled:opacity-50 ${cls} ${className}`}>
      {icon && <Icon name={icon} size={16} />}{children}
    </button>
  );
}

export const inputCls = "h-11 w-full rounded-xl border border-white/12 bg-night/60 px-3.5 text-[15px] text-ivory outline-none transition placeholder:text-ivory/30 focus:border-zari focus:shadow-[0_0_0_3px_rgba(231,190,99,.15)]";
export function Field({ label, children, hint, className = "" }: { label: string; children: ReactNode; hint?: string; className?: string }) {
  return (
    <label className={`grid gap-1.5 ${className}`}>
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-mist">{label}</span>
      {children}
      {hint && <span className="text-xs text-ivory/45">{hint}</span>}
    </label>
  );
}

export function Search({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="relative min-w-0 flex-1 sm:max-w-[320px]">
      <Icon name="search" size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-mist" />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={placeholder} className={`${inputCls} h-10 rounded-full pl-10`} />
    </div>
  );
}

export function Filters<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { v: T; label: string; count?: number }[] }) {
  return (
    <div className="no-scrollbar -mx-1 flex max-w-full gap-1.5 overflow-x-auto px-1 sm:flex-wrap" role="group">
      {options.map((o) => (
        <button key={o.v} onClick={() => onChange(o.v)} aria-pressed={value === o.v} className={`h-9 shrink-0 rounded-full border px-3.5 text-[13px] font-medium transition ${value === o.v ? "border-zari bg-zari/15 text-zari" : "border-white/10 text-ivory/65 hover:text-ivory"}`}>
          {o.label}{o.count !== undefined && <span className="ml-1.5 font-mono text-[11px] opacity-70">{o.count}</span>}
        </button>
      ))}
    </div>
  );
}

export function Drawer({ open, onClose, title, eyebrow, children, footer, wide }: { open: boolean; onClose: () => void; title: ReactNode; eyebrow?: string; children: ReactNode; footer?: ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div key="s" className="fixed inset-0 z-[80] bg-night/70 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.aside key="d" role="dialog" aria-modal="true" data-lenis-prevent initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 320, damping: 36 }}
            className={`fixed inset-y-0 right-0 z-[81] flex w-full flex-col border-l border-white/10 bg-[#120827]/95 shadow-[-30px_0_80px_-20px_rgba(0,0,0,.7)] backdrop-blur-xl ${wide ? "sm:max-w-[760px]" : "sm:max-w-[560px]"}`}>
            <header className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-7">
              <div className="min-w-0">
                {eyebrow && <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-zari">{eyebrow}</p>}
                <h3 className="mt-1 truncate font-display text-[26px] leading-tight">{title}</h3>
              </div>
              <button onClick={onClose} aria-label="Close" className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/12 hover:border-zari"><Icon name="x" size={16} /></button>
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-7">{children}</div>
            {footer && <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-white/10 px-5 py-4 sm:px-7">{footer}</footer>}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export function Empty({ icon, title, children }: { icon: string; title: string; children?: ReactNode }) {
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-white/12 px-6 py-14 text-center">
      <div className="relative grid h-16 w-16 place-items-center rounded-2xl border border-zari/30 bg-zari/5 text-zari">
        <Icon name={icon} size={26} />
        <span className="absolute inset-0 animate-ping rounded-2xl border border-zari/20 [animation-duration:3s]" />
      </div>
      <p className="mt-5 font-display text-2xl">{title}</p>
      {children && <div className="mt-2 max-w-[34em] text-sm text-ivory/60">{children}</div>}
    </div>
  );
}

// ---------- data display ----------

export function CountUp({ value, format = (n: number) => Math.round(n).toLocaleString("en-IN") }: { value: number; format?: (n: number) => string }) {
  const mv = useMotionValue(0);
  const text = useTransform(mv, format);
  useEffect(() => { const c = animate(mv, value, { duration: 1.2, ease: [0.16, 1, 0.3, 1] }); return () => c.stop(); }, [mv, value]);
  return <motion.span>{text}</motion.span>;
}

export function Sparkline({ values, color, height = 36 }: { values: number[]; color: string; height?: number }) {
  const id = useId();
  const w = 120, h = height, max = Math.max(1, ...values);
  const pts = values.map((v, i) => [(i / Math.max(1, values.length - 1)) * w, h - 3 - (v / max) * (h - 6)]);
  let line = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i]; const mx = ((x0 + x1) / 2).toFixed(1); line += ` C${mx} ${y0.toFixed(1)} ${mx} ${y1.toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`; }
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-9 w-full" aria-hidden="true">
      <defs><linearGradient id={id} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={color} stopOpacity=".35" /><stop offset="1" stopColor={color} stopOpacity="0" /></linearGradient></defs>
      <path d={`${line}L${w} ${h}L0 ${h}Z`} fill={`url(#${id})`} />
      <motion.path d={line} fill="none" stroke={color} strokeWidth="1.6" vectorEffect="non-scaling-stroke" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2 }} />
    </svg>
  );
}

export function Stat({ label, value, format, spark, tone, delta, icon, sub }: { label: string; value: number; format?: (n: number) => string; spark: number[]; tone: Tone; delta?: number; icon: string; sub?: string }) {
  const c = TONE[tone];
  return (
    <div className="admin-panel group relative overflow-hidden rounded-2xl p-4 sm:p-5" style={{ ["--glow" as string]: c }}>
      <div className="flex items-center justify-between gap-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-mist">{label}</p>
        <span className="grid h-8 w-8 place-items-center rounded-lg border" style={{ color: c, borderColor: c + "44", background: c + "12" }}><Icon name={icon} size={15} /></span>
      </div>
      <p className="mt-3 font-display text-[34px] leading-none tabular-nums sm:text-[40px]"><CountUp value={value} format={format} /></p>
      <div className="mt-1 flex h-5 items-center gap-2 text-xs">
        {delta !== undefined && delta !== 0 && <span style={{ color: delta > 0 ? TONE.jade : TONE.sindoor }}>{delta > 0 ? "▲" : "▼"} {Math.abs(delta)}</span>}
        {sub && <span className="truncate text-ivory/50">{sub}</span>}
      </div>
      <div className="-mx-1 mt-2"><Sparkline values={spark} color={c} /></div>
    </div>
  );
}

// Stacked daily columns with a glowing 7-day trend line and a hover readout.
export function AreaChart({ series, labels }: { series: { name: string; color: string; values: number[] }[]; labels: string[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const uid = useId().replace(/:/g, "");
  const w = 720, h = 220, pad = 8, base = h - 24;
  const n = labels.length;
  const totals = labels.map((_, i) => series.reduce((a, s) => a + (s.values[i] ?? 0), 0));
  const trend = totals.map((_, i) => { const win = totals.slice(Math.max(0, i - 6), i + 1); return win.reduce((a, v) => a + v, 0) / win.length; });
  const max = Math.max(1, ...totals);
  const slot = (w - pad * 2) / n, bw = Math.max(3, slot * 0.56);
  const x = (i: number) => pad + slot * i + slot / 2;
  const y = (v: number) => base - (v / max) * (base - 20);
  const line = useMemo(() => {
    const pts = trend.map((v, i) => [x(i), y(v)]);
    let d = `M${pts[0][0]} ${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i]; const mx = (x0 + x1) / 2; d += ` C${mx} ${y0} ${mx} ${y1} ${x1} ${y1}`; }
    return d;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trend.join(","), max]);
  return (
    <div className="relative">
      <svg viewBox={`0 0 ${w} ${h}`} className="h-[220px] w-full" preserveAspectRatio="none" onMouseLeave={() => setHover(null)}
        onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); const i = Math.floor(((e.clientX - r.left) / r.width * w - pad) / slot); setHover(Math.max(0, Math.min(n - 1, i))); }}>
        <defs>
          {series.map((s, k) => <linearGradient key={k} id={`${uid}c${k}`} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={s.color} stopOpacity=".95" /><stop offset="1" stopColor={s.color} stopOpacity=".45" /></linearGradient>)}
        </defs>
        {[0.25, 0.5, 0.75, 1].map((f) => <line key={f} x1={pad} x2={w - pad} y1={y(max * f)} y2={y(max * f)} stroke="rgba(255,255,255,.06)" strokeDasharray="2 6" />)}
        {labels.map((_, i) => <rect key={i} x={x(i) - bw / 2} y={20} width={bw} height={base - 20} rx={bw / 2} fill={hover === i ? "rgba(231,190,99,.08)" : "rgba(255,255,255,.025)"} />)}
        {labels.map((_, i) => {
          let acc = 0;
          return series.map((s, k) => {
            const v = s.values[i] ?? 0;
            if (!v) return null;
            const y0 = y(acc), y1 = y(acc + v); acc += v;
            return <motion.rect key={`${i}-${k}`} x={x(i) - bw / 2} width={bw} rx={Math.min(3, bw / 2)} fill={`url(#${uid}c${k})`} initial={{ y: base, height: 0 }} animate={{ y: y1 + 1, height: Math.max(2, y0 - y1 - 1) }} transition={{ duration: 0.8, delay: i * 0.015 }} />;
          });
        })}
        <line x1={pad} x2={w - pad} y1={base} y2={base} stroke="rgba(255,255,255,.12)" />
        <motion.path d={line} fill="none" stroke="#FFF4E2" strokeOpacity=".7" strokeWidth="1.5" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.6 }} />
        {labels.map((l, i) => (i % Math.ceil(n / 6) === 0 || i === n - 1) && <text key={i} x={x(i)} y={h - 6} textAnchor="middle" fontSize="10" fill="rgba(255,244,226,.4)" fontFamily="IBM Plex Mono, monospace">{l}</text>)}
      </svg>
      {hover !== null && (
        <div className="pointer-events-none absolute top-0 rounded-xl border border-white/10 bg-night/90 px-3 py-2 text-xs backdrop-blur" style={{ left: `clamp(0px, calc(${(x(hover) / w) * 100}% - 70px), calc(100% - 150px))` }}>
          <p className="font-mono text-[10px] uppercase tracking-widest text-mist">{labels[hover]}</p>
          {series.map((s) => <p key={s.name} className="mt-0.5 flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ background: s.color }} />{s.name} <b className="ml-auto pl-3 tabular-nums">{s.values[hover]}</b></p>)}
        </div>
      )}
    </div>
  );
}

// Rolling sums smooth out days with nothing happening, for sparklines.
export const rolling = (v: number[], k = 7) => v.map((_, i) => v.slice(Math.max(0, i - k + 1), i + 1).reduce((a, x) => a + x, 0));

// Circular gauge used for health and completion scores.
export function Ring({ value, color, size = 120, label }: { value: number; color: string; size?: number; label?: ReactNode }) {
  const r = size / 2 - 8, c = 2 * Math.PI * r;
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="6" />
        <circle cx={size / 2} cy={size / 2} r={r - 10} fill="none" stroke="rgba(255,255,255,.05)" strokeWidth="1" strokeDasharray="2 4" />
        <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" strokeDasharray={c}
          initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c * (1 - Math.max(0, Math.min(1, value))) }} transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }} style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{label}</div>
    </div>
  );
}

export function Toast({ msg }: { msg: { text: string; bad?: boolean } | null }) {
  return (
    <AnimatePresence>
      {msg && (
        <motion.div key={msg.text} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} role="status"
          className={`fixed bottom-6 left-1/2 z-[90] -translate-x-1/2 rounded-full border px-5 py-2.5 text-sm shadow-xl backdrop-blur ${msg.bad ? "border-sindoor/50 bg-sindoor/15 text-ivory" : "border-zari/40 bg-night/90 text-ivory"}`}>
          {msg.text}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
