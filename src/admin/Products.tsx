import { motion, Reorder } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { CATEGORIES, fromRow, PRODUCTS } from "../data/catalog";
import { DISTRICTS } from "../data/districts";
import ProductArt from "../components/ProductArt";
import { useAdmin } from "./Admin";
import { admin, downloadCsv, shrink } from "./api";
import type { ProductRow } from "./types";
import { Btn, Chip, Drawer, Empty, Field, Filters, Icon, inputCls, inr, Panel, Search } from "./ui";

const CATS = CATEGORIES.filter((c) => c !== "All");
const TAGS = ["GI tag", "ODOP", "Artisan-direct"];
type Draft = Omit<ProductRow, "id" | "created_at" | "slug"> & { id?: string; slug?: string; detailsText: string };
const blank = (): Draft => ({ name: "", maker_id: null, district: "Varanasi", place: "", category: CATS[0], price_inr: 0, stock: 1, spec: "", story: "", details: [], detailsText: "", tags: ["Artisan-direct"], photos: [], active: true, featured: false });
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);

type F = "all" | "live" | "hidden";

export default function Products() {
  const { data, focus, remove } = useAdmin();
  const [q, setQ] = useState("");
  const [f, setF] = useState<F>("all");
  const [cat, setCat] = useState("All");
  const [edit, setEdit] = useState<Draft | null>(null);
  useEffect(() => {
    if (focus === "new") setEdit(blank());
    else { const p = data.products.find((x) => x.id === focus); if (p) setEdit({ ...p, detailsText: (p.details ?? []).join("\n") }); }
  }, [focus]); // eslint-disable-line react-hooks/exhaustive-deps

  const makerName = (id: string | null) => data.makers.find((m) => m.id === id)?.name;
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return data.products.filter((p) => (f === "all" || (f === "live" ? p.active : !p.active)) && (cat === "All" || p.category === cat)
      && (!s || [p.name, p.district, p.place, p.category, makerName(p.maker_id)].join(" ").toLowerCase().includes(s)));
  }, [data.products, data.makers, q, f, cat]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="grid gap-5">
      <Panel>
        <div className="flex flex-wrap items-center gap-3">
          <Search value={q} onChange={setQ} placeholder="Search products, makers, districts…" />
          <Filters<F> value={f} onChange={setF} options={[
            { v: "all", label: "All", count: data.products.length },
            { v: "live", label: "Live", count: data.products.filter((p) => p.active).length },
            { v: "hidden", label: "Hidden", count: data.products.filter((p) => !p.active).length },
          ]} />
          <select value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Category" className={`${inputCls} h-9 w-auto! rounded-full text-sm`}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <div className="ml-auto flex gap-2">
            <Btn icon="download" onClick={() => downloadCsv("products", list)} disabled={!list.length}>CSV</Btn>
            <Btn tone="gold" icon="plus" onClick={() => setEdit(blank())}>New product</Btn>
          </div>
        </div>
      </Panel>

      {!data.products.length ? (
        <Empty icon="products" title="Your catalogue is empty">
          The store is showing its {PRODUCTS.length} starter pieces. As soon as you add your first live product, the store switches to your own products only.
          <div className="mt-5"><Btn tone="gold" icon="plus" onClick={() => setEdit(blank())}>Add your first product</Btn></div>
        </Empty>
      ) : !list.length ? (
        <Empty icon="search" title="Nothing matches">Try another word or filter.</Empty>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {list.map((p, i) => {
            const sp = fromRow({ ...p, makers: { name: makerName(p.maker_id) } });
            return (
              <motion.button key={p.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 12) * 0.04 }}
                onClick={() => setEdit({ ...p, detailsText: (p.details ?? []).join("\n") })}
                className="admin-panel group relative overflow-hidden rounded-2xl text-left" style={{ ["--glow" as string]: p.active ? "#E7BE63" : "#B7A8CF" }}>
                <div className="relative aspect-[4/3] overflow-hidden">
                  <div className={`h-full w-full transition duration-500 group-hover:scale-105 ${p.active ? "" : "grayscale"}`}><ProductArt p={sp} /></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-night via-transparent to-transparent" />
                  <div className="absolute left-3 top-3 flex gap-1.5">
                    <span className="rounded-full bg-night/85 backdrop-blur"><Chip tone={p.active ? "jade" : "mist"}>{p.active ? "Live" : "Hidden"}</Chip></span>
                    {p.featured && <span className="rounded-full bg-night/85 backdrop-blur"><Chip tone="zari" dot={false}>★ Featured</Chip></span>}
                  </div>
                  {!p.photos?.length && <span className="absolute right-3 top-3 rounded-full bg-night/70 px-2 py-0.5 font-mono text-[10px] text-marigold">no photo</span>}
                  <p className="absolute bottom-3 left-4 font-display text-2xl text-ivory drop-shadow">{inr(p.price_inr)}</p>
                </div>
                <div className="p-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-marigold">{p.place || p.district}</p>
                  <p className="mt-1 line-clamp-2 font-semibold leading-snug">{p.name}</p>
                  <div className="mt-3 flex items-center justify-between text-xs text-ivory/55">
                    <span className="truncate">{makerName(p.maker_id) || p.category}</span>
                    <span className={p.stock <= 1 ? "text-marigold" : ""}>{p.stock} in stock</span>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      )}

      <Editor draft={edit} onClose={() => setEdit(null)} onDelete={async (id) => { if (await remove("products", id)) setEdit(null); }} />
    </div>
  );
}

function Editor({ draft, onClose, onDelete }: { draft: Draft | null; onClose: () => void; onDelete: (id: string) => void }) {
  const { data, save, notify } = useAdmin();
  const [d, setD] = useState<Draft | null>(draft);
  const [uploading, setUploading] = useState(0);
  const [busy, setBusy] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  useEffect(() => { setD(draft); setConfirmDel(false); }, [draft]);
  if (!d) return <Drawer open={false} onClose={onClose} title="">{null}</Drawer>;

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => (x ? { ...x, [k]: v } : x));
  const preview = fromRow({ id: d.id || "preview", name: d.name || "Product name", district: d.district, place: d.place, category: d.category, price_inr: Number(d.price_inr) || 0, spec: d.spec, story: d.story, details: d.detailsText.split("\n").filter(Boolean), tags: d.tags, photos: d.photos, makers: { name: data.makers.find((m) => m.id === d.maker_id)?.name } });

  const addFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const list = [...files].filter((f) => f.type.startsWith("image/")).slice(0, 8);
    setUploading((n) => n + list.length);
    for (const file of list) {
      try {
        const img = await shrink(file);
        const { url } = await admin<{ url: string }>("upload", { name: img.name, type: img.type, data: img.data });
        setD((x) => (x ? { ...x, photos: [...x.photos, url] } : x));
      } catch (e) { notify((e as Error).message || "Upload failed", true); }
      setUploading((n) => n - 1);
    }
  };

  const submit = async () => {
    if (!d.name.trim()) return notify("Give the product a name", true);
    if (!(Number(d.price_inr) > 0)) return notify("Add a price", true);
    setBusy(true);
    const row = {
      id: d.id, name: d.name.trim(), slug: d.slug || `${slugify(d.name)}-${Math.random().toString(36).slice(2, 6)}`,
      maker_id: d.maker_id || null, district: d.district, place: d.place?.trim() || null, category: d.category,
      price_inr: Math.round(Number(d.price_inr)), stock: Math.max(0, Math.round(Number(d.stock) || 0)),
      spec: d.spec?.trim() || null, story: d.story?.trim() || null, details: d.detailsText.split("\n").map((s) => s.trim()).filter(Boolean),
      tags: d.tags, photos: d.photos, active: d.active, featured: !!d.featured,
    };
    const r = await save<ProductRow>("products", row);
    setBusy(false);
    if (r) { notify(d.id ? "Product saved" : d.active ? "Product is live on the store" : "Product saved as hidden"); onClose(); }
  };

  return (
    <Drawer open onClose={onClose} wide eyebrow={d.id ? "Edit product" : "New product"} title={d.name || "Untitled product"}
      footer={<>
        {d.id && (confirmDel
          ? <><span className="mr-auto text-sm text-sindoor">Delete for good?</span><Btn onClick={() => setConfirmDel(false)}>Keep</Btn><Btn tone="danger" icon="trash" onClick={() => onDelete(d.id!)}>Delete</Btn></>
          : <Btn tone="danger" icon="trash" className="mr-auto" onClick={() => setConfirmDel(true)}>Delete</Btn>)}
        {!confirmDel && <Btn tone="gold" icon="check" onClick={submit} disabled={busy || uploading > 0}>{busy ? "Saving…" : uploading ? "Uploading photos…" : d.id ? "Save changes" : "Publish product"}</Btn>}
      </>}>
      <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_220px]">
        <div className="grid gap-5">
          {/* photos */}
          <div>
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-mist">Photos · drag to reorder, the first one is the cover</p>
            <div onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
              className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-3">
              <Reorder.Group axis="x" values={d.photos} onReorder={(v) => set("photos", v)} className="flex flex-wrap gap-2.5">
                {d.photos.map((src, i) => (
                  <Reorder.Item key={src} value={src} className="relative h-24 w-24 cursor-grab overflow-hidden rounded-xl border border-white/15 active:cursor-grabbing">
                    <img src={src} alt="" className="pointer-events-none h-full w-full object-cover" />
                    {i === 0 && <span className="absolute bottom-1 left-1 rounded bg-zari px-1.5 font-mono text-[9px] font-bold text-night">COVER</span>}
                    <button onClick={() => set("photos", d.photos.filter((p) => p !== src))} aria-label="Remove photo" className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-night/80 text-ivory hover:bg-sindoor"><Icon name="x" size={12} /></button>
                  </Reorder.Item>
                ))}
                {Array.from({ length: uploading }, (_, i) => (
                  <div key={`u${i}`} className="relative grid h-24 w-24 place-items-center overflow-hidden rounded-xl border border-ganga/40 bg-ganga/5">
                    <motion.span className="absolute inset-x-0 h-0.5 bg-ganga shadow-[0_0_10px_#49B3C2]" animate={{ top: ["0%", "100%", "0%"] }} transition={{ duration: 1.4, repeat: Infinity }} />
                    <span className="font-mono text-[10px] text-ganga">UPLOADING</span>
                  </div>
                ))}
                <button onClick={() => fileRef.current?.click()} className="grid h-24 w-24 place-items-center rounded-xl border border-white/12 text-mist transition hover:border-zari hover:text-zari">
                  <span className="grid justify-items-center gap-1 text-xs"><Icon name="image" size={22} />Add photos</span>
                </button>
              </Reorder.Group>
              <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
            </div>
            <p className="mt-1.5 text-xs text-ivory/45">Phone photos are fine: they're resized automatically. Daylight, plain background, and one close-up of the work look best.</p>
          </div>

          <Field label="Product name"><input value={d.name} onChange={(e) => set("name", e.target.value)} className={inputCls} placeholder="e.g. Kadhua Buta Katan Silk Saree" /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category"><select value={d.category} onChange={(e) => set("category", e.target.value)} className={inputCls}>{CATS.map((c) => <option key={c}>{c}</option>)}</select></Field>
            <Field label="Maker">
              <select value={d.maker_id ?? ""} onChange={(e) => set("maker_id", e.target.value || null)} className={inputCls}>
                <option value="">Not set</option>
                {data.makers.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </Field>
            <Field label="Price (₹)"><input value={d.price_inr || ""} onChange={(e) => set("price_inr", Number(e.target.value.replace(/\D/g, "")))} inputMode="numeric" className={inputCls} placeholder="18500" /></Field>
            <Field label="In stock"><input value={d.stock} onChange={(e) => set("stock", Number(e.target.value.replace(/\D/g, "")))} inputMode="numeric" className={inputCls} /></Field>
            <Field label="District"><select value={d.district} onChange={(e) => set("district", e.target.value)} className={inputCls}>{DISTRICTS.map((x) => <option key={x.name}>{x.name}</option>)}</select></Field>
            <Field label="Town or mohalla"><input value={d.place ?? ""} onChange={(e) => set("place", e.target.value)} className={inputCls} placeholder="e.g. Madanpura, Varanasi" /></Field>
          </div>
          <Field label="One-line spec" hint="Shown on the product card"><input value={d.spec ?? ""} onChange={(e) => set("spec", e.target.value)} className={inputCls} placeholder="Pure katan · real zari · 21 days on loom" /></Field>
          <Field label="The story"><textarea value={d.story ?? ""} onChange={(e) => set("story", e.target.value)} rows={4} className={`${inputCls} h-auto py-3`} placeholder="How it's made, who makes it, what makes it special" /></Field>
          <Field label="Details" hint="One per line: material, size, care"><textarea value={d.detailsText} onChange={(e) => set("detailsText", e.target.value)} rows={4} className={`${inputCls} h-auto py-3`} placeholder={"Pure mulberry silk\n6.3 m with blouse piece\nDry clean only"} /></Field>

          <div className="flex flex-wrap gap-2">
            {TAGS.map((t) => (
              <button key={t} onClick={() => set("tags", d.tags.includes(t) ? d.tags.filter((x) => x !== t) : [...d.tags, t])} aria-pressed={d.tags.includes(t)}
                className={`h-9 rounded-full border px-3.5 text-sm transition ${d.tags.includes(t) ? "border-zari bg-zari/15 text-zari" : "border-white/12 text-ivory/60"}`}>{d.tags.includes(t) ? "✓ " : ""}{t}</button>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Toggle on={d.active} onChange={(v) => set("active", v)} label="Live on the store" sub="Off keeps it hidden" />
            <Toggle on={!!d.featured} onChange={(v) => set("featured", v)} label="Featured" sub="Shown first in the bazaar" />
          </div>
        </div>

        {/* live preview */}
        <div className="lg:sticky lg:top-0 lg:self-start">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-mist">Store preview</p>
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-dusk">
            <div className="aspect-[4/5]"><ProductArt p={preview} /></div>
            <div className="p-3.5">
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-marigold">{preview.place}</p>
              <p className="mt-1 line-clamp-2 text-sm font-semibold leading-snug">{preview.name}</p>
              <p className="mt-0.5 line-clamp-1 text-[11px] text-ivory/55">{preview.spec}</p>
              <p className="mt-2 font-display text-lg text-zari">{inr(preview.price)}</p>
            </div>
          </div>
        </div>
      </div>
    </Drawer>
  );
}

function Toggle({ on, onChange, label, sub }: { on: boolean; onChange: (v: boolean) => void; label: string; sub: string }) {
  return (
    <button onClick={() => onChange(!on)} role="switch" aria-checked={on} className={`flex items-center gap-3 rounded-2xl border p-3.5 text-left transition ${on ? "border-zari/40 bg-zari/[0.07]" : "border-white/10"}`}>
      <span className={`relative h-6 w-11 shrink-0 rounded-full transition ${on ? "bg-zari" : "bg-white/15"}`}>
        <motion.span layout className="absolute top-0.5 h-5 w-5 rounded-full bg-ivory shadow" style={{ left: on ? 22 : 2 }} />
      </span>
      <span><span className="block text-sm font-semibold">{label}</span><span className="text-xs text-ivory/50">{sub}</span></span>
    </button>
  );
}
