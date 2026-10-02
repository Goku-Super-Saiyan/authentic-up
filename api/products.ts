// Vercel function: GET /api/products, the live catalogue added on the admin page.
// Returns [] until the first product is live, and the store then keeps showing its built-in pieces.

export async function GET(): Promise<Response> {
  const env = process.env;
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return Response.json([]);
  const r = await fetch(`${supabaseBase()}/rest/v1/products?select=*,makers(name)&active=eq.true&order=created_at.desc&limit=500`, { headers: supabaseHeaders() }).catch(() => null);
  if (!r?.ok) {
    if (r) console.error("products load failed", r.status, (await r.text()).slice(0, 200));
    return Response.json([], { headers: { "Cache-Control": "no-store" } });
  }
  return Response.json(await r.json(), { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=600" } });
}

const supabaseBase = () => (process.env.SUPABASE_URL || "").trim().replace(/\/+$/, "");
function supabaseHeaders(): Record<string, string> {
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  // Legacy service_role keys are JWTs and go in Authorization too; new sb_secret_ keys go in apikey only.
  return key.startsWith("eyJ") ? { apikey: key, Authorization: `Bearer ${key}` } : { apikey: key };
}
