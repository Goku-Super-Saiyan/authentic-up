import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useAdmin } from "./Admin";
import { downloadCsv } from "./api";
import { ago, Btn, Chip, date, Drawer, Empty, Filters, Icon, inr, Panel, perDay, rolling, Search, Sparkline, waNumber } from "./ui";
import { ORDER_STATUS, TONE, type Customer } from "./types";

type F = "all" | "shopper" | "artisan";

export default function Customers() {
  const { data, focus, open } = useAdmin();
  const [q, setQ] = useState("");
  const [f, setF] = useState<F>("all");
  const [cur, setCur] = useState<Customer | null>(null);
  useEffect(() => { const c = data.customers.find((x) => x.id === focus); if (c) setCur(c); }, [focus, data.customers]);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return data.customers.filter((c) => (f === "all" || c.role === f) && (!s || [c.name, c.email, c.phone].join(" ").toLowerCase().includes(s)));
  }, [data.customers, f, q]);
  const ordersOf = (c: Customer) => data.orders.filter((o) => o.customer_id === c.id || (c.email && o.email === c.email));
  const enqOf = (c: Customer) => data.enquiries.filter((e) => c.email && e.email.toLowerCase() === c.email.toLowerCase());
  const signups = rolling(perDay(data.customers.map((c) => c.created_at), 36)).slice(-30);
  const active7 = data.customers.filter((c) => Date.now() - new Date(c.last_login_at).getTime() < 7 * 86400000).length;

  if (data.missing.includes("customers"))
    return <Empty icon="customers" title="One setup step first">Run <b>admin-setup.sql</b> once in Supabase (SQL Editor → New query → paste → Run). Then everyone who signs up on the website shows here.</Empty>;

  return (
    <div className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-3">
        <Panel eyebrow="Total" glow="ganga"><p className="font-display text-4xl">{data.customers.length}</p><div className="mt-2"><Sparkline values={signups} color={TONE.ganga} /></div><p className="text-xs text-mist">sign-ups per week, last 30 days</p></Panel>
        <Panel eyebrow="Active this week" glow="jade"><p className="font-display text-4xl">{active7}</p><p className="mt-2 text-sm text-ivory/60">logged in during the last 7 days</p></Panel>
        <Panel eyebrow="Buyers · Makers" glow="marigold">
          <p className="font-display text-4xl">{data.customers.filter((c) => c.role === "shopper").length} <span className="text-ivory/30">/</span> {data.customers.filter((c) => c.role === "artisan").length}</p>
          <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-white/5">
            <span style={{ width: `${(data.customers.filter((c) => c.role === "shopper").length / Math.max(1, data.customers.length)) * 100}%`, background: TONE.ganga }} />
            <span className="flex-1" style={{ background: TONE.marigold }} />
          </div>
        </Panel>
      </div>

      <Panel>
        <div className="flex flex-wrap items-center gap-3">
          <Search value={q} onChange={setQ} placeholder="Search name, email, phone…" />
          <Filters<F> value={f} onChange={setF} options={[
            { v: "all", label: "All", count: data.customers.length },
            { v: "shopper", label: "Buyers", count: data.customers.filter((c) => c.role === "shopper").length },
            { v: "artisan", label: "Makers", count: data.customers.filter((c) => c.role === "artisan").length },
          ]} />
          <Btn icon="download" className="ml-auto" onClick={() => downloadCsv("customers", list)} disabled={!list.length}>CSV</Btn>
        </div>
      </Panel>

      {!data.customers.length ? (
        <Empty icon="customers" title="No sign-ups yet">When people create an account on the website's login page, they appear here with when they joined and last logged in.</Empty>
      ) : (
        <div className="admin-panel relative overflow-hidden rounded-2xl">
          <div className="hidden grid-cols-[1.6fr_1.6fr_0.8fr_0.9fr_0.9fr] gap-4 border-b border-white/[0.07] px-5 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-mist md:grid">
            <span>Name</span><span>Contact</span><span>Type</span><span>Joined</span><span>Last seen</span>
          </div>
          {list.map((c, i) => (
            <motion.button key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: Math.min(i, 15) * 0.02 }} onClick={() => setCur(c)}
              className="grid w-full gap-1 border-b border-white/[0.05] px-5 py-3.5 text-left last:border-0 hover:bg-white/[0.03] md:grid-cols-[1.6fr_1.6fr_0.8fr_0.9fr_0.9fr] md:items-center md:gap-4">
              <span className="flex min-w-0 items-center gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-ganga/30 to-plum font-semibold">{(c.name || c.email || "?").slice(0, 1).toUpperCase()}</span><span className="truncate font-semibold">{c.name || "—"}</span></span>
              <span className="truncate text-sm text-ivory/65">{c.email || (c.phone ? "+" + c.phone : "—")}</span>
              <span><Chip tone={c.role === "artisan" ? "marigold" : "ganga"}>{c.role === "artisan" ? "Maker" : "Buyer"}</Chip></span>
              <span className="text-sm text-ivory/60">{date(c.created_at)}</span>
              <span className="text-sm text-ivory/60">{ago(c.last_login_at)}</span>
            </motion.button>
          ))}
        </div>
      )}

      <Drawer open={!!cur} onClose={() => setCur(null)} eyebrow={cur ? `Joined ${date(cur.created_at)}` : ""} title={cur?.name || cur?.email || ""}>
        {cur && (
          <div className="grid gap-6">
            <div className="flex flex-wrap gap-2">
              <Chip tone={cur.role === "artisan" ? "marigold" : "ganga"}>{cur.role === "artisan" ? "Maker account" : "Buyer account"}</Chip>
              <Chip tone="mist" dot={false}>Last seen {ago(cur.last_login_at)}</Chip>
            </div>
            <div className="flex flex-wrap gap-2">
              {cur.phone && <a href={`https://wa.me/${waNumber(cur.phone)}`} target="_blank" rel="noopener" className="inline-flex h-10 items-center gap-2 rounded-full bg-[#25D366] px-4 text-sm font-semibold text-white"><Icon name="whatsapp" size={16} />WhatsApp</a>}
              {cur.email && <a href={`mailto:${cur.email}`} className="inline-flex h-10 items-center gap-2 rounded-full border border-white/12 px-4 text-sm font-semibold hover:border-zari"><Icon name="mail" size={16} />{cur.email}</a>}
            </div>
            <div>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-mist">Orders</p>
              {ordersOf(cur).length ? (
                <ul className="grid gap-1.5">{ordersOf(cur).map((o) => (
                  <li key={o.id}><button onClick={() => open("orders", o.id)} className="flex w-full items-center gap-3 rounded-xl border border-white/[0.07] px-4 py-2.5 text-left text-sm hover:border-zari/40">
                    <span className="font-mono text-zari">{o.reference}</span><Chip tone={ORDER_STATUS[o.status].tone}>{ORDER_STATUS[o.status].label}</Chip><span className="ml-auto tabular-nums">{inr(o.total_inr)}</span>
                  </button></li>
                ))}</ul>
              ) : <p className="text-sm text-ivory/50">No orders yet.</p>}
            </div>
            <div>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-mist">Enquiries</p>
              {enqOf(cur).length ? (
                <ul className="grid gap-1.5">{enqOf(cur).map((e) => (
                  <li key={e.id}><button onClick={() => open("enquiries", e.id)} className="flex w-full items-center gap-3 rounded-xl border border-white/[0.07] px-4 py-2.5 text-left text-sm hover:border-zari/40">
                    <span className="font-mono text-zari">{e.reference}</span><span className="truncate text-ivory/70">{e.kind}</span><span className="ml-auto text-xs text-mist">{ago(e.created_at)}</span>
                  </button></li>
                ))}</ul>
              ) : <p className="text-sm text-ivory/50">No enquiries.</p>}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
