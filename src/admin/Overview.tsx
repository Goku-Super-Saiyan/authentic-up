import { motion } from "framer-motion";
import { useMemo } from "react";
import { PRODUCTS } from "../data/catalog";
import { useAdmin } from "./Admin";
import { ENQUIRY_STATUS, ORDER_FLOW, ORDER_STATUS, TONE } from "./types";
import { AreaChart, ago, Btn, Chip, Icon, inr, Panel, perDay, Ring, rolling, short, Stat } from "./ui";

const PAID = new Set(["paid", "packed", "shipped", "delivered"]);

function greeting() {
  const h = Number(new Date().toLocaleString("en-IN", { hour: "numeric", hour12: false, timeZone: "Asia/Kolkata" }));
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

export default function Overview() {
  const { data, open, name: adminName } = useAdmin();
  const { enquiries, orders, products, makers, customers } = data;

  const m = useMemo(() => {
    const day = 86400000, now = Date.now();
    const inLast = (s: string, d: number, from = 0) => { const t = now - new Date(s).getTime(); return t >= from * day && t < d * day; };
    const paid = orders.filter((o) => PAID.has(o.status));
    const live = products.filter((p) => p.active);
    const trend = (dates: string[], val?: (i: number) => number) => rolling(perDay(dates, 20, val)).slice(-14);
    const revenue14 = trend(paid.map((o) => o.created_at), (i) => paid[i].total_inr);
    return {
      newEnq: enquiries.filter((e) => e.status === "new").length,
      enqWeek: enquiries.filter((e) => inLast(e.created_at, 7)).length - enquiries.filter((e) => inLast(e.created_at, 14, 7)).length,
      openOrders: orders.filter((o) => !["delivered", "cancelled"].includes(o.status)).length,
      orderWeek: orders.filter((o) => inLast(o.created_at, 7)).length - orders.filter((o) => inLast(o.created_at, 14, 7)).length,
      revenue: paid.reduce((a, o) => a + o.total_inr, 0),
      revenue14,
      live: live.length,
      lowStock: live.filter((p) => p.stock <= 1).length,
      custWeek: customers.filter((c) => inLast(c.created_at, 7)).length,
      enq14: trend(enquiries.map((e) => e.created_at)),
      ord14: trend(orders.map((o) => o.created_at)),
      cust14: trend(customers.map((c) => c.created_at)),
      enq30: perDay(enquiries.map((e) => e.created_at), 30),
      ord30: perDay(orders.map((o) => o.created_at), 30),
      cust30: perDay(customers.map((c) => c.created_at), 30),
    };
  }, [enquiries, orders, products, customers]);

  const labels30 = useMemo(() => Array.from({ length: 30 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - 29 + i); return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }); }), []);

  const pipeline = ORDER_FLOW.map((s) => ({ s, n: orders.filter((o) => o.status === s).length }));
  const pipeTotal = Math.max(1, pipeline.reduce((a, p) => a + p.n, 0));

  // What buyers ask about most: enquiry crafts plus districts.
  const demand = useMemo(() => {
    const count = new Map<string, number>();
    enquiries.forEach((e) => { const k = (e.craft || e.kind || "Other").trim(); count.set(k, (count.get(k) ?? 0) + 1); });
    return [...count].sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [enquiries]);
  const demandMax = Math.max(1, ...demand.map((d) => d[1]));

  const feed = useMemo(() => [
    ...enquiries.map((e) => ({ t: e.created_at, icon: "inbox", tone: TONE.sindoor, text: <><b>{e.name}</b> sent an enquiry · {e.kind}</>, go: () => open("enquiries", e.id) })),
    ...orders.map((o) => ({ t: o.created_at, icon: "orders", tone: TONE.zari, text: <><b>{o.reference}</b> placed · {inr(o.total_inr)}</>, go: () => open("orders", o.id) })),
    ...customers.map((c) => ({ t: c.created_at, icon: "customers", tone: TONE.ganga, text: <><b>{c.name || c.email || c.phone}</b> signed up{c.role === "artisan" ? " as a maker" : ""}</>, go: () => open("customers", c.id) })),
    ...products.map((p) => ({ t: p.created_at, icon: "products", tone: TONE.jade, text: <><b>{p.name}</b> added to the catalogue</>, go: () => open("products", p.id) })),
  ].sort((a, b) => +new Date(b.t) - +new Date(a.t)).slice(0, 8), [enquiries, orders, customers, products, open]);

  // Launch readiness: what's set up versus still to do.
  const steps = [
    { done: products.some((p) => p.active), label: "Add your first live product", go: () => open("products") },
    { done: products.some((p) => p.photos?.length), label: "Upload real product photos", go: () => open("products") },
    { done: makers.length > 0, label: "Add the makers you work with", go: () => open("makers") },
    { done: !data.missing.includes("customers"), label: "Run admin-setup.sql in Supabase", go: () => open("system") },
    { done: enquiries.some((e) => e.status !== "new"), label: "Answer your first enquiry", go: () => open("enquiries") },
  ];
  const ready = steps.filter((s) => s.done).length / steps.length;
  const name = adminName.split(" ")[0];

  return (
    <div className="grid gap-5">
      {/* hero strip */}
      <div className="admin-panel relative overflow-hidden rounded-3xl p-6 sm:p-8" style={{ ["--glow" as string]: "#E7BE63" }}>
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-zari/10 blur-3xl" />
        <div className="relative flex flex-wrap items-center gap-6">
          <div className="min-w-0 flex-1 basis-[20rem]">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-zari">{greeting()}</p>
            <h2 className="mt-2 font-display text-[clamp(30px,4vw,48px)] leading-[1.02]">Namaste, <span className="zari-text capitalize">{name}</span></h2>
            <p className="mt-2 max-w-[38em] text-ivory/65">
              {m.newEnq ? `${m.newEnq} new ${m.newEnq === 1 ? "enquiry is" : "enquiries are"} waiting` : "No enquiries waiting"}
              {m.openOrders ? ` and ${m.openOrders} ${m.openOrders === 1 ? "order is" : "orders are"} in progress.` : ", and no open orders."}
              {" "}The store is showing {m.live ? `your ${m.live} live ${m.live === 1 ? "product" : "products"}` : `the ${PRODUCTS.length} starter pieces until you add your own`}.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {m.newEnq > 0 && <Btn tone="gold" icon="inbox" onClick={() => open("enquiries")}>Answer enquiries</Btn>}
              <Btn tone={m.newEnq ? "ghost" : "gold"} icon="plus" onClick={() => open("products", "new")}>Add a product</Btn>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Ring value={ready} color={TONE.zari} size={128} label={<div><p className="font-display text-3xl leading-none">{Math.round(ready * 100)}%</p><p className="mt-1 font-mono text-[9px] uppercase tracking-[0.2em] text-mist">launch ready</p></div>} />
          </div>
        </div>
      </div>

      {/* KPI tiles */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <Stat label="New enquiries" value={m.newEnq} spark={m.enq14} tone="sindoor" icon="inbox" delta={m.enqWeek} sub="vs last week" />
        <Stat label="Open orders" value={m.openOrders} spark={m.ord14} tone="zari" icon="orders" delta={m.orderWeek} sub="vs last week" />
        <Stat label="Revenue (paid)" value={m.revenue} format={(n) => "₹" + short(n)} spark={m.revenue14} tone="jade" icon="rupee" sub={`${orders.filter((o) => PAID.has(o.status)).length} paid orders`} />
        <Stat label="Customers" value={customers.length} spark={m.cust14} tone="ganga" icon="customers" delta={m.custWeek} sub="joined this week" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Panel eyebrow="Last 30 days" title="Activity" glow="ganga" actions={
          <div className="flex flex-wrap gap-3 text-xs text-ivory/70">
            {[["Enquiries", TONE.sindoor], ["Orders", TONE.zari], ["Sign-ups", TONE.ganga]].map(([l, c]) => <span key={l} className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: c, boxShadow: `0 0 8px ${c}` }} />{l}</span>)}
          </div>
        }>
          <AreaChart labels={labels30} series={[
            { name: "Enquiries", color: TONE.sindoor, values: m.enq30 },
            { name: "Orders", color: TONE.zari, values: m.ord30 },
            { name: "Sign-ups", color: TONE.ganga, values: m.cust30 },
          ]} />
          <div className="mt-5 grid grid-cols-3 gap-3 border-t border-white/[0.07] pt-5">
            {([["Enquiries", m.enq30, TONE.sindoor], ["Orders", m.ord30, TONE.zari], ["Sign-ups", m.cust30, TONE.ganga]] as [string, number[], string][]).map(([l, v, c]) => (
              <div key={l}>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-mist">{l} · 30 d</p>
                <p className="mt-1 font-display text-3xl" style={{ color: c }}>{v.reduce((a, x) => a + x, 0)}</p>
                <p className="text-xs text-ivory/50">busiest day {Math.max(...v)}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel eyebrow="Right now" title="Live feed" glow="sindoor">
          {feed.length ? (
            <ol className="relative grid gap-1 before:absolute before:bottom-3 before:left-[15px] before:top-3 before:w-px before:bg-gradient-to-b before:from-white/15 before:to-transparent">
              {feed.map((f, i) => (
                <motion.li key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                  <button onClick={f.go} className="relative flex w-full items-start gap-3 rounded-xl px-0 py-2 text-left hover:bg-white/[0.03]">
                    <span className="relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border bg-night" style={{ color: f.tone, borderColor: f.tone + "55" }}><Icon name={f.icon} size={14} /></span>
                    <span className="min-w-0 flex-1 text-sm leading-snug text-ivory/80">{f.text}<span className="mt-0.5 block font-mono text-[10.5px] text-mist">{ago(f.t)}</span></span>
                  </button>
                </motion.li>
              ))}
            </ol>
          ) : <p className="text-sm text-ivory/55">Enquiries, orders and sign-ups will appear here as they happen.</p>}
        </Panel>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Panel eyebrow="Orders" title="Pipeline" glow="zari" actions={<Btn icon="right" onClick={() => open("orders")}>Orders</Btn>}>
          <div className="flex h-3 overflow-hidden rounded-full bg-white/5">
            {pipeline.map((p) => p.n > 0 && <motion.span key={p.s} initial={{ width: 0 }} animate={{ width: `${(p.n / pipeTotal) * 100}%` }} transition={{ duration: 1 }} style={{ background: TONE[ORDER_STATUS[p.s].tone] }} />)}
          </div>
          <ul className="mt-5 grid gap-2.5">
            {pipeline.map((p, i) => (
              <li key={p.s} className="flex items-center gap-3 text-sm">
                <span className="w-5 font-mono text-[10px] text-mist">0{i + 1}</span>
                <Chip tone={ORDER_STATUS[p.s].tone}>{ORDER_STATUS[p.s].label}</Chip>
                <span className="mx-1 h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                <span className="font-display text-xl tabular-nums">{p.n}</span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel eyebrow="Enquiries" title="What buyers want" glow="sindoor">
          {demand.length ? (
            <ul className="grid gap-3.5">
              {demand.map(([k, n]) => (
                <li key={k}>
                  <div className="flex justify-between text-sm"><span className="truncate pr-3 text-ivory/80">{k}</span><span className="font-mono tabular-nums text-mist">{n}</span></div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/5"><motion.div className="h-full rounded-full bg-gradient-to-r from-sindoor to-marigold" initial={{ width: 0 }} animate={{ width: `${(n / demandMax) * 100}%` }} transition={{ duration: 1 }} /></div>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-ivory/55">Once enquiries come in, the crafts people ask about most show here.</p>}
          <div className="mt-5 flex flex-wrap gap-2 border-t border-white/[0.07] pt-4">
            {(Object.keys(ENQUIRY_STATUS) as (keyof typeof ENQUIRY_STATUS)[]).map((s) => <Chip key={s} tone={ENQUIRY_STATUS[s].tone}>{ENQUIRY_STATUS[s].label} {enquiries.filter((e) => e.status === s).length}</Chip>)}
          </div>
        </Panel>

        <Panel eyebrow="Checklist" title="Launch readiness" glow="jade">
          <ul className="grid gap-2">
            {steps.map((s) => (
              <li key={s.label}>
                <button onClick={s.go} className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left text-sm hover:bg-white/[0.03]">
                  <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border ${s.done ? "border-[#5FD39B] bg-[#5FD39B]/15 text-[#5FD39B]" : "border-white/20 text-transparent"}`}><Icon name="check" size={13} /></span>
                  <span className={s.done ? "text-ivory/50 line-through decoration-white/20" : "text-ivory/85"}>{s.label}</span>
                  {!s.done && <Icon name="right" size={14} className="ml-auto text-mist" />}
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/[0.07] pt-4 text-center">
            <div><p className="font-display text-2xl">{m.live}</p><p className="font-mono text-[9px] uppercase tracking-widest text-mist">Live</p></div>
            <div><p className="font-display text-2xl">{makers.length}</p><p className="font-mono text-[9px] uppercase tracking-widest text-mist">Makers</p></div>
            <div><p className="font-display text-2xl" style={{ color: m.lowStock ? TONE.marigold : undefined }}>{m.lowStock}</p><p className="font-mono text-[9px] uppercase tracking-widest text-mist">Low stock</p></div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
