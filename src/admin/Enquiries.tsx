import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { SITE } from "../config";
import { useAdmin } from "./Admin";
import { downloadCsv } from "./api";
import { ENQUIRY_STATUS, type Enquiry, type EnquiryStatus } from "./types";
import { ago, Btn, Chip, dateTime, Drawer, Empty, Field, Filters, Icon, inputCls, Panel, Search, waNumber } from "./ui";

type F = "all" | EnquiryStatus;

export default function Enquiries() {
  const { data, save, notify, focus } = useAdmin();
  const [f, setF] = useState<F>("all");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  useEffect(() => { if (focus && data.enquiries.some((e) => e.id === focus)) setOpenId(focus); }, [focus, data.enquiries]);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return data.enquiries.filter((e) => (f === "all" || e.status === f) && (!s || [e.name, e.email, e.phone, e.reference, e.kind, e.craft, e.district, e.message].join(" ").toLowerCase().includes(s)));
  }, [data.enquiries, f, q]);
  const cur = data.enquiries.find((e) => e.id === openId) ?? null;

  return (
    <div className="grid gap-5">
      <Panel>
        <div className="flex flex-wrap items-center gap-3">
          <Search value={q} onChange={setQ} placeholder="Search name, email, craft, reference…" />
          <Filters<F> value={f} onChange={setF} options={[
            { v: "all", label: "All", count: data.enquiries.length },
            ...(Object.keys(ENQUIRY_STATUS) as EnquiryStatus[]).map((s) => ({ v: s, label: ENQUIRY_STATUS[s].label, count: data.enquiries.filter((e) => e.status === s).length })),
          ]} />
          <Btn icon="download" className="ml-auto" onClick={() => downloadCsv("enquiries", list)} disabled={!list.length}>CSV</Btn>
        </div>
      </Panel>

      {!data.enquiries.length ? (
        <Empty icon="inbox" title="No enquiries yet">Enquiries from the website's Enquire page land here, and also arrive at {SITE.email}.</Empty>
      ) : !list.length ? (
        <Empty icon="search" title="Nothing matches">Try another word or filter.</Empty>
      ) : (
        <div className="grid gap-2.5">
          {list.map((e, i) => (
            <motion.button key={e.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 12) * 0.03 }} onClick={() => setOpenId(e.id)}
              className={`admin-panel group relative grid w-full gap-3 rounded-2xl p-4 text-left transition hover:-translate-y-0.5 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,2fr)_auto] sm:items-center sm:p-5 ${e.status === "new" ? "" : "opacity-90"}`}
              style={{ ["--glow" as string]: e.status === "new" ? "#F0445A" : "#B7A8CF" }}>
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/12 bg-gradient-to-br from-plum to-night font-display text-lg text-zari">{e.name.slice(0, 1).toUpperCase()}</span>
                <div className="min-w-0">
                  <p className="truncate font-semibold">{e.name}{e.status === "new" && <span className="ml-2 inline-block h-2 w-2 rounded-full bg-sindoor shadow-[0_0_8px_#F0445A]" />}</p>
                  <p className="truncate font-mono text-[11px] text-mist">{e.reference} · {ago(e.created_at)}</p>
                </div>
              </div>
              <div className="min-w-0">
                <p className="text-sm text-zari">{e.kind}{e.craft ? ` · ${e.craft}` : ""}{e.district ? ` · ${e.district}` : ""}</p>
                <p className="mt-0.5 line-clamp-2 text-sm text-ivory/65">{e.message}</p>
              </div>
              <div className="flex items-center gap-3 sm:justify-end">
                <Chip tone={ENQUIRY_STATUS[e.status]?.tone ?? "mist"}>{ENQUIRY_STATUS[e.status]?.label ?? e.status}</Chip>
                <Icon name="right" size={16} className="text-mist transition group-hover:translate-x-0.5 group-hover:text-zari" />
              </div>
            </motion.button>
          ))}
        </div>
      )}

      <Detail e={cur} onClose={() => setOpenId(null)} onSave={async (row) => { const r = await save<Enquiry>("enquiries", row); if (r) notify("Enquiry updated"); }} />
    </div>
  );
}

function Detail({ e, onClose, onSave }: { e: Enquiry | null; onClose: () => void; onSave: (row: Partial<Enquiry>) => Promise<void> }) {
  const [notes, setNotes] = useState("");
  useEffect(() => setNotes(e?.notes ?? ""), [e?.id, e?.notes]);
  const first = e?.name.split(" ")[0] ?? "";
  const wa = e?.phone ? `https://wa.me/${waNumber(e.phone)}?text=${encodeURIComponent(`Namaste ${first}, this is ${SITE.name} about your enquiry ${e.reference}. `)}` : null;
  const mail = e ? `mailto:${e.email}?subject=${encodeURIComponent(`Your enquiry ${e.reference} · ${SITE.name}`)}&body=${encodeURIComponent(`Namaste ${first},\n\nThank you for your enquiry about ${e.craft || e.kind}.\n\n`)}` : "";

  return (
    <Drawer open={!!e} onClose={onClose} eyebrow={e ? `${e.reference} · ${dateTime(e.created_at)}` : ""} title={e?.name ?? ""} wide
      footer={e && <Btn tone="gold" icon="check" onClick={() => onSave({ id: e.id, notes })}>Save notes</Btn>}>
      {e && (
        <div className="grid gap-6">
          <div className="flex flex-wrap gap-2">
            {wa && <a href={wa} target="_blank" rel="noopener" className="inline-flex h-10 items-center gap-2 rounded-full bg-[#25D366] px-4 text-sm font-semibold text-white"><Icon name="whatsapp" size={16} />WhatsApp</a>}
            <a href={mail} onClick={() => e.status === "new" && onSave({ id: e.id, status: "replied" })} className="inline-flex h-10 items-center gap-2 rounded-full border border-white/12 px-4 text-sm font-semibold hover:border-zari"><Icon name="mail" size={16} />Reply by email</a>
            {e.phone && <a href={`tel:+${waNumber(e.phone)}`} className="inline-flex h-10 items-center gap-2 rounded-full border border-white/12 px-4 text-sm font-semibold hover:border-zari"><Icon name="phone" size={16} />Call</a>}
          </div>

          <div>
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-mist">Status</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(Object.keys(ENQUIRY_STATUS) as EnquiryStatus[]).map((s) => (
                <button key={s} onClick={() => s !== e.status && onSave({ id: e.id, status: s })} aria-pressed={e.status === s}
                  className={`h-10 rounded-xl border text-sm font-semibold transition ${e.status === s ? "border-zari bg-zari/15 text-zari" : "border-white/10 text-ivory/60 hover:text-ivory"}`}>{ENQUIRY_STATUS[s].label}</button>
              ))}
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 text-sm sm:grid-cols-3">
            {([["Type", e.kind], ["Craft", e.craft], ["District", e.district], ["Quantity", e.quantity], ["Budget", e.budget], ["Email", e.email], ["Phone", e.phone]] as [string, string | null][]).filter(([, v]) => v).map(([k, v]) => (
              <div key={k} className="min-w-0"><dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-mist">{k}</dt><dd className="mt-1 [overflow-wrap:anywhere]">{v}</dd></div>
            ))}
          </dl>

          <div>
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-mist">Message</p>
            <p className="whitespace-pre-wrap rounded-2xl border-l-2 border-zari bg-white/[0.03] p-5 leading-relaxed text-ivory/85">{e.message}</p>
          </div>

          <Field label="Private notes" hint="Only you see these. Quotes, follow-up dates, who's handling it.">
            <textarea value={notes} onChange={(x) => setNotes(x.target.value)} rows={4} className={`${inputCls} h-auto py-3`} placeholder="e.g. Sent price list on WhatsApp, follow up Friday" />
          </Field>
        </div>
      )}
    </Drawer>
  );
}
