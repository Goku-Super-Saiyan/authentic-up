// Vercel function: POST /api/admin, the admin dashboard's only door to the database.
// Every call must carry "Authorization: Bearer <access token>" from an email login whose address is
// ENQUIRY_TO or listed in ADMIN_EMAILS (comma separated). The service key never leaves the server.
//   { action: "load" }                          -> every table the dashboard shows
//   { action: "health" }                        -> which services are connected
//   { action: "save", table, row }              -> insert (no id) or update (with id); returns the row
//   { action: "delete", table, id }             -> deletes; a product that was ordered is hidden instead
//   { action: "upload", name, type, data }      -> stores a base64 image in the "products" bucket, returns its URL

type Body = { action?: string; table?: string; row?: Record<string, unknown>; id?: string; name?: string; type?: string; data?: string };

const TABLES: Record<string, string[]> = {
  enquiries: ["status", "notes"],
  orders: ["name", "phone", "email", "address", "pincode", "total_inr", "status", "payment_ref", "notes", "items"],
  products: ["slug", "name", "maker_id", "district", "place", "category", "price_inr", "stock", "spec", "story", "details", "tags", "photos", "active", "featured"],
  makers: ["name", "district", "craft", "phone", "email", "gi_tag", "verified"],
  customers: ["name", "role"],
};
const LOAD = ["enquiries", "orders", "products", "makers", "customers"];

const fail = (error: string, status: number) => Response.json({ error }, { status });
const adminEmails = () =>
  [process.env.ENQUIRY_TO, ...(process.env.ADMIN_EMAILS || "").split(",")]
    .map((x) => (x || "").replace(/^.*</, "").replace(/>.*$/, "").trim().toLowerCase()).filter(Boolean);

export async function POST(req: Request): Promise<Response> {
  const env = process.env;
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return fail("The database isn't connected yet.", 503);

  // Who is asking? Supabase checks the login token for us.
  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token) return fail("Please log in.", 401);
  const me = await sb("/auth/v1/user", "GET", undefined, { Authorization: `Bearer ${token}` }).catch(() => null);
  if (!me?.ok) return fail("Your login has expired. Please log in again.", 401);
  const email = String(((await me.json()) as { email?: string }).email || "").toLowerCase();
  if (!adminEmails().includes(email)) return fail("This account doesn't have admin access.", 403);

  let b: Body;
  try { b = await req.json(); } catch { return fail("Send JSON", 400); }

  if (b.action === "load") {
    const out: Record<string, unknown> = { me: email };
    const missing: string[] = [];
    await Promise.all(LOAD.map(async (t) => {
      const r = await sb(`/rest/v1/${t}?select=*&order=created_at.desc&limit=2000`, "GET").catch(() => null);
      if (r?.ok) out[t] = await r.json();
      else { out[t] = []; missing.push(t); if (r) console.error("admin load failed", t, r.status, (await r.text()).slice(0, 200)); }
    }));
    return Response.json({ ...out, missing }, { headers: { "Cache-Control": "no-store" } });
  }

  if (b.action === "health") {
    const check = async (path: string) => {
      const r = await sb(path, "GET").catch(() => null);
      return r?.ok ? "ok" : r ? `error ${r.status}` : "unreachable";
    };
    const [db, customers, storage] = await Promise.all([
      check("/rest/v1/products?select=id&limit=1"),
      check("/rest/v1/customers?select=id&limit=1"),
      check("/storage/v1/bucket/products"),
    ]);
    return Response.json({
      database: db, customers_table: customers, photo_storage: storage,
      email: env.RESEND_API_KEY && env.ENQUIRY_FROM ? "ok" : "missing",
      enquiry_inbox: env.ENQUIRY_TO || "missing",
      sms: env.MSG91_AUTH_KEY && env.MSG91_TEMPLATE_ID ? "ok" : "missing",
      payments: env.RAZORPAY_KEY_ID ? "ok" : "missing",
      admins: adminEmails(),
    });
  }

  if (b.action === "save" || b.action === "delete") {
    const t = b.table || "";
    const allowed = TABLES[t];
    if (!allowed) return fail("Unknown table", 400);
    const id = String(b.action === "delete" ? b.id : b.row?.id ?? "");
    if (id && !/^[0-9a-f-]{36}$/i.test(id)) return fail("Bad id", 400);

    if (b.action === "delete") {
      if (!id) return fail("Missing id", 400);
      const r = await sb(`/rest/v1/${t}?id=eq.${id}`, "DELETE");
      if (r.ok) return Response.json({ ok: true });
      // A product that is part of an order can't be removed, so take it off the store instead.
      if (t === "products" && r.status === 409) {
        const h = await sb(`/rest/v1/products?id=eq.${id}`, "PATCH", { active: false });
        if (h.ok) return Response.json({ ok: true, hidden: true });
      }
      return fail(`Couldn't delete: ${(await r.text()).slice(0, 160)}`, 502);
    }

    const row: Record<string, unknown> = {};
    for (const k of allowed) if (b.row && k in b.row) row[k] = b.row[k];
    if (t === "products") row.updated_at = new Date().toISOString();
    const r = id
      ? await sb(`/rest/v1/${t}?id=eq.${id}`, "PATCH", row, { Prefer: "return=representation" })
      : await sb(`/rest/v1/${t}`, "POST", row, { Prefer: "return=representation" });
    if (!r.ok) {
      const text = (await r.text()).slice(0, 300);
      console.error("admin save failed", t, r.status, text);
      return fail(/duplicate key/.test(text) ? "Something with the same name already exists." : `Couldn't save: ${text}`, 502);
    }
    return Response.json({ ok: true, row: ((await r.json()) as unknown[])[0] });
  }

  if (b.action === "upload") {
    const type = String(b.type || "");
    if (!/^image\/(jpeg|png|webp)$/.test(type)) return fail("Upload a JPG, PNG or WebP photo.", 422);
    const bytes = Buffer.from(String(b.data || ""), "base64");
    if (!bytes.length || bytes.length > 3_000_000) return fail("Photos must be under 3 MB.", 422);
    const base = String(b.name || "photo").toLowerCase().replace(/\.[a-z0-9]+$/, "").replace(/[^a-z0-9]+/g, "-").slice(0, 40) || "photo";
    const path = `${new Date().toISOString().slice(0, 7)}/${base}-${crypto.randomUUID().slice(0, 8)}.${type.split("/")[1].replace("jpeg", "jpg")}`;
    const r = await fetch(`${supabaseBase()}/storage/v1/object/products/${path}`, {
      method: "POST",
      headers: { ...supabaseHeaders(), "Content-Type": type, "x-upsert": "true", "Cache-Control": "31536000" },
      body: bytes,
    });
    if (!r.ok) {
      const text = (await r.text()).slice(0, 300);
      console.error("admin upload failed", r.status, text);
      return fail(/bucket not found/i.test(text) ? "The photo bucket is missing. Run schema.sql in Supabase." : "Couldn't upload the photo. Please try again.", 502);
    }
    return Response.json({ ok: true, url: `${supabaseBase()}/storage/v1/object/public/products/${path}` });
  }

  return fail("Unknown action", 400);
}

const supabaseBase = () => (process.env.SUPABASE_URL || "").trim().replace(/\/+$/, "");
function supabaseHeaders(): Record<string, string> {
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  // Legacy service_role keys are JWTs and go in Authorization too; new sb_secret_ keys go in apikey only.
  return key.startsWith("eyJ") ? { apikey: key, Authorization: `Bearer ${key}` } : { apikey: key };
}
function sb(path: string, method: string, body?: unknown, extra: Record<string, string> = {}) {
  return fetch(`${supabaseBase()}${path}`, {
    method,
    headers: { ...supabaseHeaders(), "Content-Type": "application/json", ...extra },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}
