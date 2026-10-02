import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { SITE } from "../config";
import { useAdmin } from "./Admin";
import { downloadCsv } from "./api";
import { ORDER_FLOW, ORDER_STATUS, TONE, type Order, type OrderStatus } from "./types";
import { ago, Btn, Chip, dateTime, Drawer, Empty, Field, Filters, Icon, inputCls, inr, orderTotal, Panel, Search, waNumber } from "./ui";

type F = "all" | "open" | OrderStatus;

export default function Orders() {
  const { data, save, notify, focus } = useAdmin();
  const [f, setF] = useState<F>("open");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  useEffect(() => { if (focus && data.orders.some((o) => o.id === focus)) { setOpenId(focus); setF("all"); } }, [focus, data.orders]);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return data.orders.filter((o) => (f === "all" || (f === "open" ? !["delivered", "cancelled"].includes(o.status) : o.status === f))
      && (!s || [o.reference, o.name, o.phone, o.email, o.address, ...(o.items ?? []).map((i) => i.name)].join(" ").toLowerCase().includes(s)));
  }, [data.orders, f, q]);
  const cur = data.orders.find((o) => o.id === openId) ?? null;
  const value = list.reduce((a, o) => a + o.total_inr, 0);

  return (
    <div className="grid gap-5">
      <Panel>
        <div className="flex flex-wrap items-center gap-3">
          <Search value={q} onChange={setQ} placeholder="Search reference, buyer, item…" />
          <Filters<F> value={f} onChange={setF} options={[
            { v: "open", label: "Open", count: data.orders.filter((o) => !["delivered", "cancelled"].includes(o.status)).length },
            { v: "all", label: "All", count: data.orders.length },
            ...([...ORDER_FLOW, "cancelled"] as OrderStatus[]).map((s) => ({ v: s, label: ORDER_STATUS[s].label, count: data.orders.filter((o) => o.status === s).length })),
          ]} />
          <Btn icon="download" className="ml-auto" onClick={() => downloadCsv("orders", list)} disabled={!list.length}>CSV</Btn>
        </div>
        {list.length > 0 && <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.2em] text-mist">{list.length} orders · {inr(value)} total</p>}
      </Panel>

      {!data.orders.length ? (
        <Empty icon="orders" title="No orders yet">When a buyer taps “Place order” in their bag, the order is saved here and opens on your WhatsApp. Confirm it with them, then move it along the steps.</Empty>
      ) : !list.length ? (
        <Empty icon="search" title="Nothing here">No orders match this filter.</Empty>
      ) : (
        <div className="admin-panel relative overflow-hidden rounded-2xl">
          <div className="hidden grid-cols-[1.1fr_1.4fr_1.6fr_0.9fr_1fr_24px] gap-4 border-b border-white/[0.07] px-5 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-mist md:grid">
            <span>Order</span><span>Buyer</span><span>Items</span><span className="text-right">Total</span><span>Status</span><span />
          </div>
          {list.map((o, i) => {
            const step = ORDER_FLOW.indexOf(o.status);
            return (
              <motion.button key={o.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: Math.min(i, 12) * 0.03 }} onClick={() => setOpenId(o.id)}
                className="group grid w-full gap-2 border-b border-white/[0.05] px-5 py-4 text-left last:border-0 hover:bg-white/[0.03] md:grid-cols-[1.1fr_1.4fr_1.6fr_0.9fr_1fr_24px] md:items-center md:gap-4">
                <div><p className="font-mono text-sm text-zari">{o.reference}</p><p className="text-xs text-mist">{ago(o.created_at)}</p></div>
                <div className="min-w-0"><p className="truncate">{o.name}</p><p className="truncate text-xs text-ivory/50">{o.phone || o.email || "Contact on WhatsApp"}</p></div>
                <p className="line-clamp-2 text-sm text-ivory/70">{(o.items ?? []).map((it) => `${it.name} × ${it.qty}`).join(", ") || "—"}</p>
                <p className="font-display text-xl tabular-nums md:text-right">{orderTotal(o.total_inr)}</p>
                <div className="flex items-center gap-2">
                  <Chip tone={ORDER_STATUS[o.status].tone}>{ORDER_STATUS[o.status].label}</Chip>
                  {step >= 0 && <span className="hidden gap-0.5 lg:flex">{ORDER_FLOW.map((s, k) => <span key={s} className="h-1 w-2.5 rounded-full" style={{ background: k <= step ? TONE[ORDER_STATUS[o.status].tone] : "rgba(255,255,255,.1)" }} />)}</span>}
                </div>
                <Icon name="right" size={16} className="hidden text-mist group-hover:text-zari md:block" />
              </motion.button>
            );
          })}
        </div>
      )}

      <Detail o={cur} onClose={() => setOpenId(null)} onSave={async (row) => { const r = await save<Order>("orders", row); if (r) notify("Order updated"); return !!r; }} />
    </div>
  );
}

function Detail({ o, onClose, onSave }: { o: Order | null; onClose: () => void; onSave: (row: Partial<Order>) => Promise<boolean> }) {
  const [form, setForm] = useState<Partial<Order>>({});
  useEffect(() => { if (o) setForm({ name: o.name, phone: o.phone, email: o.email, address: o.address, pincode: o.pincode, payment_ref: o.payment_ref, notes: o.notes }); }, [o?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!o) return <Drawer open={false} onClose={onClose} title="">{null}</Drawer>;
  const set = (k: keyof Order) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const step = ORDER_FLOW.indexOf(o.status);
  const phone = waNumber(form.phone || o.phone);
  const msg = `Namaste ${o.name.split(" ")[0]}, this is ${SITE.name} about your order ${o.reference}${o.total_inr > 0 ? ` (${inr(o.total_inr)})` : ""}. `;
  const wa = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(msg)}` : null;

  return (
    <Drawer open onClose={onClose} eyebrow={`${o.reference} · ${dateTime(o.created_at)}`} title={orderTotal(o.total_inr)} wide
      footer={<><Btn tone="danger" icon="x" onClick={() => onSave({ id: o.id, status: "cancelled" })} disabled={o.status === "cancelled"}>Cancel order</Btn><Btn tone="gold" icon="check" onClick={() => onSave({ id: o.id, ...form })}>Save details</Btn></>}>
      <div className="grid gap-6">
        {/* stepper */}
        <div>
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-mist">Progress · tap a step to move the order</p>
          <ol className="grid grid-cols-6 gap-1">
            {ORDER_FLOW.map((s, i) => {
              const done = o.status !== "cancelled" && i <= step;
              const c = TONE[ORDER_STATUS[s].tone];
              return (
                <li key={s}>
                  <button onClick={() => s !== o.status && onSave({ id: o.id, status: s })} className="group grid w-full justify-items-center gap-2 text-center">
                    <span className="relative flex w-full items-center">
                      <span className="h-0.5 flex-1" style={{ background: i === 0 ? "transparent" : done ? c : "rgba(255,255,255,.1)" }} />
                      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 text-[11px] font-bold transition group-hover:scale-110 ${done ? "text-night" : "text-mist"}`} style={{ borderColor: done ? c : "rgba(255,255,255,.18)", background: done ? c : "transparent", boxShadow: s === o.status ? `0 0 16px ${c}` : undefined }}>
                        {done ? <Icon name="check" size={13} /> : i + 1}
                      </span>
                      <span className="h-0.5 flex-1" style={{ background: i === ORDER_FLOW.length - 1 ? "transparent" : i < step && o.status !== "cancelled" ? c : "rgba(255,255,255,.1)" }} />
                    </span>
                    <span className={`text-[11px] leading-tight sm:text-xs ${s === o.status ? "text-ivory" : "text-ivory/50"}`}>{ORDER_STATUS[s].label}</span>
                  </button>
                </li>
              );
            })}
          </ol>
          {o.status === "cancelled" && <p className="mt-3"><Chip tone="mist">Cancelled</Chip></p>}
        </div>

        <div className="flex flex-wrap gap-2">
          {wa && <a href={wa} target="_blank" rel="noopener" className="inline-flex h-10 items-center gap-2 rounded-full bg-[#25D366] px-4 text-sm font-semibold text-white"><Icon name="whatsapp" size={16} />WhatsApp buyer</a>}
          {(form.email || o.email) && <a href={`mailto:${form.email || o.email}?subject=${encodeURIComponent(`Your order ${o.reference}`)}`} className="inline-flex h-10 items-center gap-2 rounded-full border border-white/12 px-4 text-sm font-semibold hover:border-zari"><Icon name="mail" size={16} />Email</a>}
        </div>

        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02]">
          {(o.items ?? []).map((it, i) => (
            <div key={i} className="flex items-center gap-4 border-b border-white/[0.05] px-5 py-3.5 last:border-0">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-zari/30 bg-zari/5 font-mono text-xs text-zari">×{it.qty}</span>
              <div className="min-w-0 flex-1"><p className="truncate">{it.name}</p>{it.place && <p className="truncate text-xs text-mist">{it.place}</p>}</div>
              <p className="font-mono text-sm tabular-nums">{it.price ? inr(it.price * it.qty) : "To quote"}</p>
            </div>
          ))}
          <div className="flex justify-between px-5 py-3.5 font-semibold"><span>Total</span><span className="tabular-nums text-zari">{orderTotal(o.total_inr)}</span></div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Buyer name"><input value={form.name ?? ""} onChange={set("name")} className={inputCls} /></Field>
          <Field label="Phone"><input value={form.phone ?? ""} onChange={set("phone")} inputMode="tel" className={inputCls} placeholder="From WhatsApp" /></Field>
          <Field label="Email"><input value={form.email ?? ""} onChange={set("email")} type="email" className={inputCls} /></Field>
          <Field label="Pincode"><input value={form.pincode ?? ""} onChange={set("pincode")} inputMode="numeric" className={inputCls} /></Field>
          <Field label="Delivery address" className="sm:col-span-2"><textarea value={form.address ?? ""} onChange={set("address")} rows={3} className={`${inputCls} h-auto py-3`} /></Field>
          <Field label="Payment reference" hint="UPI or bank transfer ID once paid"><input value={form.payment_ref ?? ""} onChange={set("payment_ref")} className={inputCls} /></Field>
          <Field label="Courier / notes" hint="Tracking number, courier, anything to remember"><input value={form.notes ?? ""} onChange={set("notes")} className={inputCls} /></Field>
        </div>
      </div>
    </Drawer>
  );
}
