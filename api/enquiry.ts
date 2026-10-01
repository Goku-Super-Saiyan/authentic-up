// Vercel function: POST /api/enquiry
// Saves the enquiry in Supabase and emails it to the team through Resend.
// Needs these environment variables in Vercel (never in the code):
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

  if (env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
    const r = await fetch(`${env.SUPABASE_URL}/rest/v1/enquiries`, {
      method: "POST",
      headers: { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({ reference, ...e, phone: e.phone || null }),
    });
    if (!r.ok) return Response.json({ error: "We couldn't save your enquiry. Please try again or write to us directly." }, { status: 502 });
  }

  if (env.RESEND_API_KEY && env.ENQUIRY_TO && env.ENQUIRY_FROM) {
    const rows = Object.entries(e).filter(([, v]) => v).map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#666">${k}</td><td>${esc(v).replace(/\n/g, "<br>")}</td></tr>`).join("");
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: env.ENQUIRY_FROM, to: [env.ENQUIRY_TO], reply_to: e.email,
        subject: `${reference} · ${e.kind || "Enquiry"} from ${e.name}`,
        html: `<h2>New enquiry ${reference}</h2><table>${rows}</table>`,
      }),
    }).catch(() => undefined); // the enquiry is already saved; a mail hiccup shouldn't fail the buyer
  }

  return Response.json({ ok: true, reference });
}
