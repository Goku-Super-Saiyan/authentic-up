// Vercel function: POST /api/enquiry
// Saves the enquiry in Supabase and emails it to the team through Resend.
// Needs these environment variables in Vercel (never in the code). SUPABASE_SERVICE_ROLE_KEY may be the legacy service_role JWT or a new sb_secret_ key:
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY, ENQUIRY_TO, ENQUIRY_FROM

type Body = { kind?: string; name?: string; email?: string; phone?: string; craft?: string; district?: string; quantity?: string; budget?: string; message?: string; website?: string };

const clean = (v: unknown, max = 500) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

export async function POST(req: Request): Promise<Response> {
  let b: Body;
  try { b = await req.json(); } catch { return Response.json({ error: "Send JSON" }, { status: 400 }); }
  if (b.website) return Response.json({ ok: true, reference: "IUP-000000" }); // honeypot field filled in by bots

  const e = {
    kind: clean(b.kind, 60), name: clean(b.name, 120), email: clean(b.email, 160), phone: clean(b.phone, 20),
    craft: clean(b.craft, 80), district: clean(b.district, 60), quantity: clean(b.quantity, 120), budget: clean(b.budget, 40),
    message: clean(b.message, 4000),
  };
  if (!e.name || !/^\S+@\S+\.\S+$/.test(e.email) || e.message.length < 10)
    return Response.json({ error: "Add your name, a valid email and a few words about what you need." }, { status: 422 });

  const reference = "IUP-" + Math.floor(100000 + Math.random() * 900000);
  const env = process.env;

  // Nowhere to save or send it yet: tell the page to hand the enquiry over on WhatsApp or email instead.
  const canSave = !!(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY);
  const canMail = !!(env.RESEND_API_KEY && env.ENQUIRY_TO && env.ENQUIRY_FROM);
  if (!canSave && !canMail) return Response.json({ fallback: true, reference }, { status: 503 });

  let saved = false;
  if (canSave) {
    try {
      const r = await fetch(`${supabaseBase()}/rest/v1/enquiries`, {
        method: "POST",
        headers: { ...supabaseHeaders(), "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify({ reference, ...e, phone: e.phone || null }),
      });
      saved = r.ok;
      if (!r.ok) console.error("enquiry save failed", r.status, (await r.text()).slice(0, 300));
    } catch (err) {
      console.error("enquiry save failed", String(err));
    }
  }

  let mailed = false;
  if (canMail) {
    const rows = Object.entries(e).filter(([, v]) => v).map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#666">${k}</td><td>${esc(v).replace(/\n/g, "<br>")}</td></tr>`).join("");
    try {
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: env.ENQUIRY_FROM, to: [env.ENQUIRY_TO], reply_to: e.email,
          subject: `${reference} · ${e.kind || "Enquiry"} from ${e.name}`,
          html: `<h2>New enquiry ${reference}</h2><table>${rows}</table>${saved ? "" : "<p><b>Not saved in the database</b>, keep this email.</p>"}`,
        }),
      });
      mailed = r.ok;
      if (!r.ok) console.error("enquiry email failed", r.status, (await r.text()).slice(0, 300));
    } catch (err) {
      console.error("enquiry email failed", String(err));
    }
  }

  // Saved or emailed is enough. If both failed, let the buyer send it on WhatsApp or by email instead of losing it.
  if (!saved && !mailed) return Response.json({ fallback: true, reference }, { status: 503 });
  return Response.json({ ok: true, reference });
}

// GET /api/enquiry shows which services are connected, to debug setup from a phone. It never shows a key.
export async function GET(): Promise<Response> {
  const env = process.env;
  const key = env.SUPABASE_SERVICE_ROLE_KEY || "";
  const out: Record<string, unknown> = {
    supabase_url: env.SUPABASE_URL ? (/^https:\/\/[a-z0-9]+\.supabase\.co\/?$/.test(env.SUPABASE_URL) ? "ok" : "should look like https://xxxx.supabase.co") : "missing",
    supabase_key: !key ? "missing" : keyKind(key),
    resend_key: env.RESEND_API_KEY ? (env.RESEND_API_KEY.startsWith("re_") ? "set" : "should start with re_") : "missing",
    enquiry_to: env.ENQUIRY_TO || "missing",
    enquiry_from: env.ENQUIRY_FROM || "missing",
  };
  if (env.SUPABASE_URL && key) {
    try {
      const r = await fetch(`${supabaseBase()}/rest/v1/enquiries?select=id&limit=1`, { headers: supabaseHeaders() });
      out.enquiries_table = r.ok ? "reachable" : `error ${r.status}: ${(await r.text()).slice(0, 200)}`;
    } catch (err) {
      out.enquiries_table = `cannot reach Supabase: ${String(err).slice(0, 120)}`;
    }
  }
  return Response.json(out, { headers: { "Cache-Control": "no-store" } });
}

const supabaseBase = () => (process.env.SUPABASE_URL || "").trim().replace(/\/+$/, "");
function supabaseHeaders(): Record<string, string> {
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  // Legacy service_role keys are JWTs and go in Authorization too; new sb_secret_ keys go in apikey only.
  return key.startsWith("eyJ") ? { apikey: key, Authorization: `Bearer ${key}` } : { apikey: key };
}
function keyKind(key: string): string {
  if (key.startsWith("sb_secret_")) return "secret key (ok)";
  if (key.startsWith("sb_publishable_")) return "publishable key: use the secret key instead";
  if (key.startsWith("eyJ")) {
    try {
      const role = JSON.parse(Buffer.from(key.split(".")[1], "base64url").toString()).role;
      return role === "service_role" ? "service_role key (ok)" : `${role} key: use the service_role or secret key instead`;
    } catch { return "unreadable JWT"; }
  }
  return "unknown key format";
}
