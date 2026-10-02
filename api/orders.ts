// Vercel function: POST /api/orders, saves what was in the bag when the buyer taps "Place order",
// so it shows on the admin page before the order is confirmed on WhatsApp.
//   { reference, items: [{ id, name, place, qty, price }], name?, email?, phone?, customer_id? } -> { ok, reference }

type Item = { id?: unknown; name?: unknown; place?: unknown; qty?: unknown; price?: unknown };
const clean = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(req: Request): Promise<Response> {
  let b: { reference?: string; items?: Item[]; name?: string; email?: string; phone?: string; customer_id?: string; website?: string };
  try { b = await req.json(); } catch { return Response.json({ error: "Send JSON" }, { status: 400 }); }
  // The page makes the reference so it can open WhatsApp straight away; we only check its shape.
  const reference = /^ORD-\d{6}$/.test(String(b.reference)) ? String(b.reference) : "ORD-" + Math.floor(100000 + Math.random() * 900000);
  if (b.website) return Response.json({ ok: true, reference });

  const items = (Array.isArray(b.items) ? b.items : []).slice(0, 50).map((i) => ({
    id: String(i.id ?? "").slice(0, 60), name: clean(i.name, 160), place: clean(i.place, 120),
    qty: Math.max(1, Math.min(99, Math.floor(Number(i.qty) || 1))), price: Math.max(0, Math.floor(Number(i.price) || 0)),
  })).filter((i) => i.name);
  if (!items.length) return Response.json({ error: "Your bag is empty." }, { status: 422 });

  const env = process.env;
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return Response.json({ ok: true, reference, saved: false });
  const customer = clean(b.customer_id, 40);
  const r = await fetch(`${(env.SUPABASE_URL || "").trim().replace(/\/+$/, "")}/rest/v1/orders`, {
    method: "POST",
    headers: { ...supabaseHeaders(), "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify({
      reference, items, total_inr: items.reduce((a, i) => a + i.qty * i.price, 0),
      name: clean(b.name, 120) || "WhatsApp buyer", email: clean(b.email, 160) || null, phone: clean(b.phone, 20) || null,
      customer_id: /^[0-9a-f-]{36}$/i.test(customer) ? customer : null,
    }),
  }).catch(() => null);
  if (!r?.ok) console.error("order save failed", r?.status, r ? (await r.text()).slice(0, 300) : "");
  // The buyer still continues to WhatsApp even if saving failed, so the order is never lost.
  return Response.json({ ok: true, reference, saved: !!r?.ok });
}

function supabaseHeaders(): Record<string, string> {
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  // Legacy service_role keys are JWTs and go in Authorization too; new sb_secret_ keys go in apikey only.
  return key.startsWith("eyJ") ? { apikey: key, Authorization: `Bearer ${key}` } : { apikey: key };
}
