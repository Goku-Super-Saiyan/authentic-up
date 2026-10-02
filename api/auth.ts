// Vercel function: POST /api/auth
// Email sign-in with a one-time code, on Supabase Auth. Supabase makes the code and the account;
// we email the code ourselves through Resend, so no extra email setup is needed in Supabase.
//   { action: "send", email, name?, role? }  -> emails a code, returns { ok, digits }
//   { action: "verify", email, code, name?, role? } -> returns { ok, user, session }
// Uses the same Vercel environment variables as /api/enquiry:
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY, ENQUIRY_FROM

type Body = { action?: string; email?: string; code?: string; name?: string; role?: string; website?: string };
type AuthUser = { id: string; email?: string; user_metadata?: Record<string, unknown> };

const clean = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
const fail = (error: string, status: number) => Response.json({ error }, { status });

// Best-effort limits per server instance, to stop the form being used to flood an inbox or guess codes.
const sent = new Map<string, number[]>();
const wrong = new Map<string, number>();
function tooMany(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const hits = (sent.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= max) return true;
  sent.set(key, [...hits, now]);
  return false;
}

export async function POST(req: Request): Promise<Response> {
  let b: Body;
  try { b = await req.json(); } catch { return fail("Send JSON", 400); }
  if (b.website) return Response.json({ ok: true, digits: 6 }); // honeypot field filled in by bots

  const env = process.env;
  if (!(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY && env.RESEND_API_KEY && env.ENQUIRY_FROM))
    return fail("Sign-in isn't switched on yet. Please message us on WhatsApp for now.", 503);

  const email = clean(b.email, 160).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail("Enter a valid email address.", 422);
  const name = clean(b.name, 120);
  const role = b.role === "artisan" ? "artisan" : "shopper";
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim();

  if (b.action === "send") {
    if (tooMany(`e:${email}`, 1, 30_000)) return fail("We just sent a code. Please wait a few seconds before asking for another.", 429);
    if (tooMany(`e10:${email}`, 5, 600_000) || (ip && tooMany(`ip:${ip}`, 10, 600_000)))
      return fail("Too many codes requested. Please try again in a few minutes.", 429);

    let link = await generateLink(email);
    if (link.status === 404 || /not.?found/i.test(link.text)) {
      // First time here: create the account, then ask for the code again.
      const r = await fetch(`${supabaseBase()}/auth/v1/admin/users`, {
        method: "POST",
        headers: { ...supabaseHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ email, email_confirm: true, user_metadata: { name, role } }),
      });
      if (!r.ok) console.error("auth create user failed", r.status, (await r.text()).slice(0, 300));
      link = await generateLink(email);
    }
    const j = link.json as { email_otp?: unknown; properties?: { email_otp?: unknown } } | null;
    const otp = String(j?.email_otp ?? j?.properties?.email_otp ?? "");
    if (!link.ok || !/^\d{6,10}$/.test(otp)) {
      console.error("auth generate_link failed", link.status, link.text.slice(0, 300));
      return fail("We couldn't create a code right now. Please try again in a minute.", 502);
    }
    wrong.delete(email);

    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: env.ENQUIRY_FROM, to: [email],
        subject: `${otp} is your sign-in code`,
        text: `Your sign-in code is ${otp}. It works once, for the next hour.\n\nIf you didn't ask for it, you can ignore this email.`,
        html: `<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;color:#24104A">
<p>Namaste${name ? " " + esc(name.split(" ")[0]) : ""},</p>
<p>Your sign-in code is</p>
<p style="font-size:34px;letter-spacing:8px;font-weight:bold;margin:8px 0 16px">${otp}</p>
<p>It works once, for the next hour. If you didn't ask for it, you can ignore this email.</p></div>`,
      }),
    }).catch((err) => { console.error("auth email failed", String(err)); return null; });
    if (!r?.ok) {
      if (r) console.error("auth email failed", r.status, (await r.text()).slice(0, 300));
      return fail("We couldn't email your code right now. Please try again in a minute.", 502);
    }
    return Response.json({ ok: true, digits: otp.length });
  }

  if (b.action === "verify") {
    const code = clean(b.code, 10).replace(/\D/g, "");
    if (code.length < 6) return fail("Enter the full code from the email.", 422);
    if ((wrong.get(email) ?? 0) >= 5) return fail("Too many wrong codes. Ask for a new code.", 429);

    // A code can belong to a new account or a returning one, so try each kind Supabase uses.
    let session: { access_token?: string; refresh_token?: string; expires_at?: number; user?: AuthUser } | null = null;
    for (const type of ["email", "magiclink", "signup"]) {
      const r = await fetch(`${supabaseBase()}/auth/v1/verify`, {
        method: "POST",
        headers: { ...supabaseHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ type, email, token: code }),
      });
      if (r.ok) { session = await r.json(); break; }
      if (r.status >= 500) console.error("auth verify failed", type, r.status, (await r.text()).slice(0, 300));
    }
    if (!session?.access_token || !session.user) {
      wrong.set(email, (wrong.get(email) ?? 0) + 1);
      return fail("That code didn't match or has expired. Check the email or ask for a new code.", 401);
    }
    wrong.delete(email);

    const meta = session.user.user_metadata ?? {};
    let shownName = typeof meta.name === "string" && meta.name ? meta.name : "";
    if (name && name !== shownName) {
      shownName = name;
      const r = await fetch(`${supabaseBase()}/auth/v1/admin/users/${session.user.id}`, {
        method: "PUT",
        headers: { ...supabaseHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ user_metadata: { ...meta, name, role } }),
      }).catch(() => null);
      if (!r?.ok) console.error("auth name update failed", r?.status);
    }
    return Response.json({
      ok: true,
      user: { id: session.user.id, email, name: shownName || email.split("@")[0], role: meta.role === "artisan" || role === "artisan" ? "artisan" : "shopper" },
      session: { access_token: session.access_token, refresh_token: session.refresh_token, expires_at: session.expires_at },
    });
  }

  return fail("Unknown action", 400);
}

async function generateLink(email: string) {
  const r = await fetch(`${supabaseBase()}/auth/v1/admin/generate_link`, {
    method: "POST",
    headers: { ...supabaseHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ type: "magiclink", email }),
  });
  const text = await r.text();
  let json: unknown = null;
  try { json = JSON.parse(text); } catch { /* not JSON */ }
  return { ok: r.ok, status: r.status, text, json };
}

const supabaseBase = () => (process.env.SUPABASE_URL || "").trim().replace(/\/+$/, "");
function supabaseHeaders(): Record<string, string> {
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  // Legacy service_role keys are JWTs and go in Authorization too; new sb_secret_ keys go in apikey only.
  return key.startsWith("eyJ") ? { apikey: key, Authorization: `Bearer ${key}` } : { apikey: key };
}
