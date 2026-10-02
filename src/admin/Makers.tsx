import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { DISTRICTS } from "../data/districts";
import { useAdmin } from "./Admin";
import { downloadCsv } from "./api";
import type { Maker } from "./types";
import { Btn, Chip, date, Drawer, Empty, Field, Icon, inputCls, Panel, Search, waNumber } from "./ui";

type Draft = Partial<Maker>;
const blank = (): Draft => ({ name: "", district: "Varanasi", craft: "", phone: "", email: "", gi_tag: false, verified: false });

export default function Makers() {
  const { data, save, remove, notify, focus } = useAdmin();
  const [q, setQ] = useState("");
  const [edit, setEdit] = useState<Draft | null>(null);
  const [confirmDel, setConfirmDel] = useState(false);
  useEffect(() => { const m = data.makers.find((x) => x.id === focus); if (m) setEdit(m); }, [focus]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => setConfirmDel(false), [edit?.id]);

  const count = (id: string) => data.products.filter((p) => p.maker_id === id).length;
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return data.makers.filter((m) => !s || [m.name, m.district, m.craft, m.phone, m.email].join(" ").toLowerCase().includes(s));
  }, [data.makers, q]);
  // Maker sign-ups from the website who aren't on the list yet.
  const pending = data.customers.filter((c) => c.role === "artisan" && !data.makers.some((m) => (c.email && m.email === c.email) || (c.phone && waNumber(m.phone) === c.phone)));
  const districts = new Set(data.makers.map((m) => m.district)).size;

  const submit = async () => {
    if (!edit?.name?.trim() || !edit.craft?.trim()) return notify("Add the maker's name and craft", true);
    const r = await save<Maker>("makers", { ...edit, name: edit.name.trim(), craft: edit.craft.trim(), phone: edit.phone?.trim() || null, email: edit.email?.trim() || null });
    if (r) { notify(edit.id ? "Maker saved" : "Maker added"); setEdit(null); }
  };

  return (
    <div className="grid gap-5">
      <Panel>
        <div className="flex flex-wrap items-center gap-3">
          <Search value={q} onChange={setQ} placeholder="Search makers, crafts, districts…" />
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-mist">{data.makers.length} makers · {districts} districts · {data.makers.filter((m) => m.verified).length} verified</p>
          <div className="ml-auto flex gap-2">
            <Btn icon="download" onClick={() => downloadCsv("makers", list)} disabled={!list.length}>CSV</Btn>
            <Btn tone="gold" icon="plus" onClick={() => setEdit(blank())}>Add maker</Btn>
          </div>
        </div>
      </Panel>

      {pending.length > 0 && (
        <Panel eyebrow="From the website" title={`${pending.length} ${pending.length === 1 ? "maker has" : "makers have"} signed up`} glow="marigold">
          <div className="flex flex-wrap gap-2">
            {pending.map((c) => (
              <button key={c.id} onClick={() => setEdit({ ...blank(), name: c.name ?? "", email: c.email, phone: c.phone })} className="flex items-center gap-2 rounded-full border border-marigold/40 bg-marigold/10 px-3.5 py-2 text-sm hover:bg-marigold/20">
                <Icon name="plus" size={14} />{c.name || c.email || c.phone}
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-ivory/50">Tap one to add them to your makers list. Check their work before marking them verified.</p>
        </Panel>
      )}

      {!data.makers.length ? (
        <Empty icon="makers" title="No makers yet">Add the weavers, knotters and workshops you buy from. Then link each product to its maker so buyers see who made it.</Empty>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((m, i) => (
            <motion.button key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 12) * 0.04 }} onClick={() => setEdit(m)}
              className="admin-panel relative rounded-2xl p-5 text-left transition hover:-translate-y-0.5" style={{ ["--glow" as string]: m.verified ? "#5FD39B" : "#E7BE63" }}>
              <div className="flex items-start gap-4">
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-zari/30 bg-gradient-to-br from-zari/20 to-plum font-display text-2xl text-zari">{m.name.slice(0, 1)}</span>
                <div className="min-w-0">
                  <p className="font-semibold leading-snug">{m.name}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-sm text-ivory/60"><Icon name="pin" size={13} />{m.district}</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-zari">{m.craft}</p>
              <div className="mt-4 flex flex-wrap items-center gap-1.5">
                {m.verified && <Chip tone="jade">Verified</Chip>}
                {m.gi_tag && <Chip tone="zari" dot={false}>GI tag</Chip>}
                <span className="ml-auto font-mono text-[11px] text-mist">{count(m.id)} products</span>
              </div>
            </motion.button>
          ))}
        </div>
      )}

      <Drawer open={!!edit} onClose={() => setEdit(null)} eyebrow={edit?.id ? `Added ${date(edit.created_at!)}` : "New maker"} title={edit?.name || "New maker"}
        footer={edit && <>
          {edit.id && (confirmDel
            ? <><span className="mr-auto text-sm text-sindoor">Delete this maker?</span><Btn onClick={() => setConfirmDel(false)}>Keep</Btn><Btn tone="danger" icon="trash" onClick={async () => { if (await remove("makers", edit.id!)) setEdit(null); }}>Delete</Btn></>
            : <Btn tone="danger" icon="trash" className="mr-auto" onClick={() => setConfirmDel(true)}>Delete</Btn>)}
          {!confirmDel && <Btn tone="gold" icon="check" onClick={submit}>{edit.id ? "Save" : "Add maker"}</Btn>}
        </>}>
        {edit && (
          <div className="grid gap-4">
            <Field label="Name of the maker or unit"><input value={edit.name ?? ""} onChange={(e) => setEdit({ ...edit, name: e.target.value })} className={inputCls} placeholder="e.g. Madanpura Weavers Collective" /></Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Craft"><input value={edit.craft ?? ""} onChange={(e) => setEdit({ ...edit, craft: e.target.value })} className={inputCls} placeholder="Banarasi silk weaving" /></Field>
              <Field label="District"><select value={edit.district} onChange={(e) => setEdit({ ...edit, district: e.target.value })} className={inputCls}>{DISTRICTS.map((d) => <option key={d.name}>{d.name}</option>)}</select></Field>
              <Field label="Phone"><input value={edit.phone ?? ""} onChange={(e) => setEdit({ ...edit, phone: e.target.value })} inputMode="tel" className={inputCls} /></Field>
              <Field label="Email"><input value={edit.email ?? ""} onChange={(e) => setEdit({ ...edit, email: e.target.value })} type="email" className={inputCls} /></Field>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {([["verified", "Verified maker", "You've checked their work"], ["gi_tag", "GI-tag authorised user", "Registered for the craft's GI tag"]] as const).map(([k, l, s]) => (
                <button key={k} onClick={() => setEdit({ ...edit, [k]: !edit[k] })} role="switch" aria-checked={!!edit[k]} className={`flex items-center gap-3 rounded-2xl border p-3.5 text-left transition ${edit[k] ? "border-zari/40 bg-zari/[0.07]" : "border-white/10"}`}>
                  <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-md border ${edit[k] ? "border-zari bg-zari text-night" : "border-white/25 text-transparent"}`}><Icon name="check" size={14} /></span>
                  <span><span className="block text-sm font-semibold">{l}</span><span className="text-xs text-ivory/50">{s}</span></span>
                </button>
              ))}
            </div>
            {edit.phone && <a href={`https://wa.me/${waNumber(edit.phone)}`} target="_blank" rel="noopener" className="inline-flex h-10 w-fit items-center gap-2 rounded-full bg-[#25D366] px-4 text-sm font-semibold text-white"><Icon name="whatsapp" size={16} />WhatsApp</a>}
            {edit.id && count(edit.id) > 0 && (
              <div>
                <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-mist">Their products</p>
                <ul className="grid gap-1.5">{data.products.filter((p) => p.maker_id === edit.id).map((p) => <li key={p.id} className="flex justify-between rounded-xl border border-white/[0.07] px-4 py-2.5 text-sm"><span className="truncate">{p.name}</span><Chip tone={p.active ? "jade" : "mist"}>{p.active ? "Live" : "Hidden"}</Chip></li>)}</ul>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}
