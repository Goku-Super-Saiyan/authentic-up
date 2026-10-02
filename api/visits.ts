// Vercel function: the visitor counter in the footer.
//   GET  /api/visits -> { total }               the count so far
//   POST /api/visits -> { total }               counts this visitor, then returns the count
// The browser only POSTs once a day, so each visitor counts at most once a day. Needs
// visitor-counter.sql run in Supabase; until then { total: null } and the footer hides the line.

const BOTS = /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|lighthouse|headless/i;
const seen = new Map<string, number>(); // ip -> last counted, per warm instance

export function GET(): Promise<Response> {
  return total(false, "public, s-maxage=60, stale-while-revalidate=600");
}

export function POST(req: Request): Promise<Response> {
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim();
  const now = Date.now();
  let add = !BOTS.test(req.headers.get("user-agent") || "");
  if (add && ip) {
    if (now - (seen.get(ip) ?? 0) < 6 * 3600000) add = false;
    else seen.set(ip, now);
    if (seen.size > 5000) seen.clear();
  }
  return total(add, "no-store");
}

async function total(add: boolean, cache: string): Promise<Response> {
  const env = process.env;
  const headers = { "Cache-Control": cache };
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return Response.json({ total: null }, { headers });
  const r = await fetch(`${supabaseBase()}/rest/v1/rpc/count_visit`, {
    method: "POST",
    headers: { ...supabaseHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ add_one: add }),
  }).catch(() => null);
  if (!r?.ok) {
    if (r) console.error("visit count failed", r.status, (await r.text()).slice(0, 200));
    return Response.json({ total: null }, { headers: { "Cache-Control": "no-store" } });
  }
  const n = Number(await r.json());
  return Response.json({ total: Number.isFinite(n) ? n : null }, { headers });
}

const supabaseBase = () => (process.env.SUPABASE_URL || "").trim().replace(/\/+$/, "");
function supabaseHeaders(): Record<string, string> {
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  // Legacy service_role keys are JWTs and go in Authorization too; new sb_secret_ keys go in apikey only.
  return key.startsWith("eyJ") ? { apikey: key, Authorization: `Bearer ${key}` } : { apikey: key };
}
