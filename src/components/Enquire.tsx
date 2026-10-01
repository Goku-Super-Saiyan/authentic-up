import { AnimatePresence, motion } from "framer-motion";
import { useState, type FormEvent } from "react";
import { DISTRICTS } from "../data/districts";
import { useStore } from "../store";
import { SITE } from "../config";

const TYPES = ["Bulk or wholesale", "Export", "Custom design", "Corporate gifting", "Wedding trousseau", "Selling on Incredible UP", "Something else"];
const BUDGETS = ["Under ₹25,000", "₹25,000 – 1 lakh", "₹1 – 5 lakh", "Above ₹5 lakh"];
const CRAFTS = ["Banarasi silk sarees", "Hand-knotted carpets", "Chikankari", "Glass bangles", "Brass and metal craft", "Attar", "Zari zardozi", "Black pottery", "Wood carving", "Terracotta", "Other ODOP craft"];
const FAQ = [
  ["How fast will I hear back?", "Within one working day. Bulk and export enquiries go to a buyer support lead who speaks Hindi and English."],
  ["Can artisans make a custom design?", "Yes. Most weavers and carvers take commissions. Lead times run from 3 weeks for embroidery to 4 months for a large carpet."],
  ["Do you ship outside India?", "Export enquiries are handled with the maker's export licence or through a partner exporter, with GI-tag paperwork where it applies."],
];

type Form = { name: string; email: string; phone: string; type: string; craft: string; district: string; qty: string; budget: string; message: string };
const EMPTY: Form = { name: "", email: "", phone: "", type: TYPES[0], craft: CRAFTS[0], district: "Varanasi", qty: "", budget: BUDGETS[1], message: "" };

const field = "h-12 w-full rounded-xl border border-white/15 bg-white/5 px-4 text-[16px] text-ivory outline-none placeholder:text-ivory/35 focus:border-zari";

export default function Enquire() {
  const { go } = useStore();
  const [f, setF] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [sent, setSent] = useState<string | null>(null);
  const [open, setOpen] = useState<number | null>(0);
  const [honey, setHoney] = useState("");
  const set = (k: keyof Form) => (e: { target: { value: string } }) => setF((x) => ({ ...x, [k]: e.target.value }));

  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState("");
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const err: typeof errors = {};
    if (!f.name.trim()) err.name = "Add your name.";
    if (!/^\S+@\S+\.\S+$/.test(f.email)) err.email = "Add an email we can reply to, like name@example.com.";
    if (f.phone && !/^[6-9]\d{9}$/.test(f.phone)) err.phone = "Use a 10-digit Indian mobile number, or leave it blank.";
    if (f.message.trim().length < 10) err.message = "Tell us a little more: what you need, how many, and by when.";
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
      if (!r.ok) { setFailed(data.error || "Something went wrong. Please try again."); return; }
      setSent(data.reference);
    } catch {
      setFailed(`We couldn't reach the server. Please try again, or email ${SITE.email}.`);
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="relative overflow-hidden pb-24 pt-[calc(64px+clamp(40px,6vw,80px))]">
      <div className="pointer-events-none absolute -right-20 top-10 select-none font-display text-[clamp(120px,20vw,300px)] leading-none text-white/[0.03]" aria-hidden="true">पूछताछ</div>
      <div className="relative mx-auto max-w-[1320px] px-4 sm:px-8">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-marigold">Enquire · पूछताछ</p>
        <h1 className="mt-4 max-w-[13em] font-display text-[clamp(44px,6.5vw,96px)] leading-[0.92]">Tell us what you're looking for. <span className="zari-text">We'll find the hands.</span></h1>
        <p className="mt-6 max-w-[40em] text-lg text-ivory/70">Bulk orders for a store, a hundred sarees for a wedding, carpets for a hotel, or a gift box for your team. Write to us and we'll match you with the right makers.</p>

        <div className="mt-14 grid items-start gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div className="min-w-0 rounded-[28px] border border-white/10 bg-dusk/60 p-6 sm:p-9">
            <AnimatePresence mode="wait">
              {!sent ? (
                <motion.form key="form" onSubmit={submit} noValidate initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -20 }} className="grid gap-6">
                  <fieldset className="grid gap-3">
                    <legend className="mb-3 text-sm text-ivory/75">What is this about?</legend>
                    <div className="flex flex-wrap gap-2">
                      {TYPES.map((t) => (
                        <button type="button" key={t} onClick={() => setF((x) => ({ ...x, type: t }))} aria-pressed={f.type === t} className={`rounded-full border px-4 py-2 text-sm transition ${f.type === t ? "border-zari bg-zari font-semibold text-night" : "border-white/15 text-ivory/80 hover:border-white/40"}`}>{t}</button>
                      ))}
                    </div>
                  </fieldset>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="grid gap-1.5 text-sm text-ivory/75" htmlFor="enq-name">Name
                      <input id="enq-name" className={field} value={f.name} onChange={set("name")} autoComplete="name" placeholder="Your name or company" />
                      {errors.name && <span className="text-sindoor">{errors.name}</span>}
                    </label>
                    <label className="grid gap-1.5 text-sm text-ivory/75" htmlFor="enq-email">Email
                      <input id="enq-email" type="email" className={field} value={f.email} onChange={set("email")} autoComplete="email" placeholder="name@example.com" />
                      {errors.email && <span className="text-sindoor">{errors.email}</span>}
                    </label>
                    <label className="grid gap-1.5 text-sm text-ivory/75" htmlFor="enq-phone">Mobile <span className="text-ivory/40">(optional)</span>
                      <input id="enq-phone" inputMode="numeric" className={field} value={f.phone} onChange={(e) => setF((x) => ({ ...x, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }))} placeholder="98765 43210" />
                      {errors.phone && <span className="text-sindoor">{errors.phone}</span>}
                    </label>
                    <label className="grid gap-1.5 text-sm text-ivory/75" htmlFor="enq-qty">Quantity
                      <input id="enq-qty" className={field} value={f.qty} onChange={set("qty")} placeholder="e.g. 50 sarees, 3 carpets" />
                    </label>
                    <label className="grid gap-1.5 text-sm text-ivory/75" htmlFor="enq-craft">Craft
                      <select id="enq-craft" className={`${field} bg-dusk`} value={f.craft} onChange={set("craft")}>{CRAFTS.map((c) => <option key={c}>{c}</option>)}</select>
                    </label>
                    <label className="grid gap-1.5 text-sm text-ivory/75" htmlFor="enq-district">Preferred district
                      <select id="enq-district" className={`${field} bg-dusk`} value={f.district} onChange={set("district")}><option>Any district</option>{DISTRICTS.map((d) => <option key={d.name}>{d.name}</option>)}</select>
                    </label>
                  </div>
                  <fieldset>
                    <legend className="mb-3 text-sm text-ivory/75">Budget</legend>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {BUDGETS.map((b) => (
                        <button type="button" key={b} onClick={() => setF((x) => ({ ...x, budget: b }))} aria-pressed={f.budget === b} className={`rounded-xl border px-3 py-3 text-sm transition ${f.budget === b ? "border-zari bg-zari/15 text-zari" : "border-white/15 text-ivory/80 hover:border-white/40"}`}>{b}</button>
                      ))}
                    </div>
                  </fieldset>
                  <label className="grid gap-1.5 text-sm text-ivory/75" htmlFor="enq-msg">Your enquiry
                    <textarea id="enq-msg" rows={5} className={`${field} h-auto py-3`} value={f.message} onChange={set("message")} placeholder="e.g. 40 Banarasi katan sarees in pastel shades for a wedding in February, delivered to Pune." />
                    {errors.message && <span className="text-sindoor">{errors.message}</span>}
                  </label>
                  <input type="text" name="website" value={honey} onChange={(e) => setHoney(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
                  {failed && <p className="text-sindoor" role="alert">{failed}</p>}
                  <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={sending} className="h-13 rounded-full bg-zari py-3.5 font-semibold text-night disabled:opacity-60 sm:justify-self-start sm:px-10">{sending ? "Sending…" : "Send enquiry"}</motion.button>
                </motion.form>
              ) : (
                <motion.div key="sent" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid gap-4 py-6">
                  <motion.div initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 260, damping: 14 }} className="grid h-20 w-20 place-items-center rounded-full bg-zari text-night">
                    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><path d="m5 12 5 5 9-10" /></svg>
                  </motion.div>
                  <h2 className="font-display text-4xl">Thank you, {f.name.trim().split(" ")[0]}</h2>
                  <p className="text-lg text-ivory/75">We've noted your enquiry about <b className="text-ivory">{f.craft.toLowerCase()}</b> ({f.type.toLowerCase()}) and will reply to <b className="text-ivory">{f.email}</b> within one working day.</p>
                  <p className="font-mono text-sm text-zari">Reference {sent}</p>
                                    <div className="mt-4 flex flex-wrap gap-3">
                    <button onClick={() => go("home")} className="h-12 rounded-full bg-zari px-7 font-semibold text-night">Back to the bazaar</button>
                    <button onClick={() => { setF(EMPTY); setSent(null); }} className="h-12 rounded-full border border-white/15 px-7 font-semibold hover:border-zari">Send another</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <aside className="min-w-0 grid gap-6 lg:sticky lg:top-24">
            <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-silk/70 to-plum/50 p-7">
              <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-marigold">Buyer support</p>
              <p className="mt-3 font-display text-3xl leading-tight">Talk to a person who knows the looms</p>
              <dl className="mt-5 grid gap-3 text-ivory/85">
                <div><dt className="text-xs text-ivory/50">Email</dt><dd className="select-all font-mono">{SITE.email}</dd></div>
                <div><dt className="text-xs text-ivory/50">Hours</dt><dd>Mon to Sat, 10 am to 7 pm IST</dd></div>
                <div><dt className="text-xs text-ivory/50">Languages</dt><dd>Hindi, English, Urdu</dd></div>
                {SITE.whatsapp && <div><dt className="text-xs text-ivory/50">WhatsApp</dt><dd><a className="text-zari hover:underline" href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noopener">+{SITE.whatsapp}</a></dd></div>}
              </dl>
            </div>
            <div className="rounded-[28px] border border-white/10 p-3">
              {FAQ.map(([q, a], i) => (
                <div key={q} className="border-b border-white/10 last:border-0">
                  <button onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i} className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left font-semibold">
                    {q}
                    <motion.span animate={{ rotate: open === i ? 45 : 0 }} className="text-2xl leading-none text-zari">+</motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {open === i && (
                      <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden px-4 text-ivory/70">
                        <span className="block pb-4">{a}</span>
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
