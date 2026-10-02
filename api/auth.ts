import { createHmac } from "node:crypto";

// Vercel function: /api/auth
// Sign up and log in with a one-time code, by email or (once SMS is set up) by mobile number.
//   GET                                              -> { email, phone } which methods are switched on
//   POST { action: "send", intent, email | phone, name?, role? } -> sends a code, returns { ok, digits }
//   POST { action: "verify", email | phone, code, ref?, name?, role? } -> { ok, user, session }
//   POST { action: "refresh", refresh_token }        -> { ok, session } (keeps the admin signed in)
// intent is "signup" or "login": signing up with a known address, or logging in with an unknown one,
// returns code "exists" or "no_account" so the page can switch tabs.
// Email: Supabase Auth makes the code and the account; we send the email through Resend.
// Phone: an SMS service sends and checks the code. MSG91 once DLT registration is done; until then
// Message Central's VerifyNow, which needs no DLT and starts with free trial credits. MSG91 wins if both are set.
// Vercel environment variables: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY, ENQUIRY_FROM,
// optional ENQUIRY_TO and ADMIN_EMAILS (who may open the admin page), MSG91_AUTH_KEY and MSG91_TEMPLATE_ID, or
// MESSAGECENTRAL_CUSTOMER_ID and MESSAGECENTRAL_PASSWORD (phone).

type Body = { action?: string; intent?: string; email?: string; phone?: string; code?: string; ref?: string; name?: string; role?: string; refresh_token?: string; website?: string };
type AuthUser = { id: string; email?: string; user_metadata?: Record<string, unknown> };
type Customer = { id?: string; name?: string | null; role?: string };

const clean = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
const fail = (error: string, status: number, code?: string) => Response.json(code ? { error, code } : { error }, { status });

// Best-effort limits per server instance, to stop the form being used to flood an inbox or guess codes.
const sent = new Map<string, number[]>();
const wrong = new Map<string, number>();
const tooMany = (key: string, max: number, windowMs: number) => (sent.get(key) ?? []).filter((t) => Date.now() - t < windowMs).length >= max;
// Only codes actually sent count, so a "no account, sign up instead" answer doesn't make people wait.
const count = (...keys: string[]) => { for (const k of keys) sent.set(k, [...(sent.get(k) ?? []).filter((t) => Date.now() - t < 600_000), Date.now()]); };

const emailOn = () => { const e = process.env; return !!(e.SUPABASE_URL && e.SUPABASE_SERVICE_ROLE_KEY && e.RESEND_API_KEY && e.ENQUIRY_FROM); };
const msg91 = () => !!(process.env.MSG91_AUTH_KEY && process.env.MSG91_TEMPLATE_ID);
const mc = () => !!(process.env.MESSAGECENTRAL_CUSTOMER_ID && process.env.MESSAGECENTRAL_PASSWORD);
const phoneOn = () => { const e = process.env; return !!(e.SUPABASE_URL && e.SUPABASE_SERVICE_ROLE_KEY && (msg91() || mc())); };
const adminEmails = () =>
  [process.env.ENQUIRY_TO, ...(process.env.ADMIN_EMAILS || "").split(",")]
    .map((x) => (x || "").replace(/^.*</, "").replace(/>.*$/, "").trim().toLowerCase()).filter(Boolean);

export async function GET(): Promise<Response> {
  return Response.json({ email: emailOn(), phone: phoneOn() }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: Request): Promise<Response> {
  let b: Body;
  try { b = await req.json(); } catch { return fail("Send JSON", 400); }
  if (b.website) return Response.json({ ok: true, digits: 6 }); // honeypot field filled in by bots
  if (b.action === "refresh") return refresh(clean(b.refresh_token, 2000));

  const byPhone = !!b.phone;
  if (byPhone ? !phoneOn() : !emailOn())
    return fail(byPhone ? "Mobile sign-in isn't switched on yet. Please use your email." : "Sign-in isn't switched on yet. Please message us on WhatsApp for now.", 503);

  const email = clean(b.email, 160).toLowerCase();
  const phone = "91" + clean(b.phone, 20).replace(/\D/g, "").slice(-10);
  if (byPhone ? !/^91[6-9]\d{9}$/.test(phone) : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return fail(byPhone ? "Enter a 10-digit Indian mobile number." : "Enter a valid email address.", 422);
  const who = byPhone ? phone : email;
  const name = clean(b.name, 120);
  const role = b.role === "artisan" ? "artisan" : "shopper";
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim();

  if (b.action === "send") {
    const signup = b.intent === "signup";
    if (signup && !name) return fail("Tell us your name.", 422);
    if (tooMany(`w:${who}`, 1, 30_000)) return fail("We just sent a code. Please wait a few seconds before asking for another.", 429);
    if (tooMany(`w10:${who}`, 5, 600_000) || (ip && tooMany(`ip:${ip}`, 10, 600_000)))
      return fail("Too many codes requested. Please try again in a few minutes.", 429);
    const res = await (byPhone ? sendSms(phone, signup) : sendEmail(email, name, role, signup));
    if (res.ok) count(`w:${who}`, `w10:${who}`, ...(ip ? [`ip:${ip}`] : []));
    return res;
  }

  if (b.action === "verify") {
    const code = clean(b.code, 10).replace(/\D/g, "");
    if (code.length < 4) return fail("Enter the full code.", 422);
    if ((wrong.get(who) ?? 0) >= 5) return fail("Too many wrong codes. Ask for a new code.", 429);
    const res = byPhone ? await verifySms(phone, code, clean(b.ref, 40), name, role) : await verifyEmail(email, code, name, role);
    if (!res) {
      wrong.set(who, (wrong.get(who) ?? 0) + 1);
      return fail("That code didn't match or has expired. Check it or ask for a new code.", 401);
    }
    wrong.delete(who);
    return Response.json({ ok: true, ...res });
  }

  return fail("Unknown action", 400);
}

// ---------- email ----------

async function sendEmail(email: string, name: string, role: string, signup: boolean): Promise<Response> {
  let link = await generateLink(email);
  const missing = link.status === 404 || /not.?found/i.test(link.text);
  if (missing && !signup) return fail("We couldn't find an account with this email. Sign up instead, it takes a minute.", 404, "no_account");
  if (!missing && link.ok && signup) return fail("You already have an account with this email. Log in instead.", 409, "exists");
  if (missing) {
    const r = await sb("/auth/v1/admin/users", "POST", { email, email_confirm: true, user_metadata: { name, role } });
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

  const env = process.env;
  const first = name.split(" ")[0];
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: env.ENQUIRY_FROM, to: [email],
      subject: `${otp} is your ${signup ? "sign-up" : "login"} code`,
      text: `Your code is ${otp}. It works once, for the next hour.\n\nIf you didn't ask for it, you can ignore this email.`,
      html: `<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;color:#24104A">
<p>Namaste${first ? " " + esc(first) : ""},</p>
<p>${signup ? "Welcome! Your sign-up code is" : "Your login code is"}</p>
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

async function verifyEmail(email: string, code: string, name: string, role: string) {
  // A code can belong to a new account or a returning one, so try each kind Supabase uses.
  let session: { access_token?: string; refresh_token?: string; expires_at?: number; user?: AuthUser } | null = null;
  for (const type of ["email", "magiclink", "signup"]) {
    const r = await sb("/auth/v1/verify", "POST", { type, email, token: code });
    if (r.ok) { session = await r.json(); break; }
    if (r.status >= 500) console.error("auth verify failed", type, r.status, (await r.text()).slice(0, 300));
  }
  if (!session?.access_token || !session.user) return null;

  const meta = session.user.user_metadata ?? {};
  const shownName = name || (typeof meta.name === "string" && meta.name) || email.split("@")[0];
  const shownRole = name ? role : meta.role === "artisan" ? "artisan" : "shopper";
  if (name && (name !== meta.name || role !== meta.role)) {
    const r = await sb(`/auth/v1/admin/users/${session.user.id}`, "PUT", { user_metadata: { ...meta, name, role } }).catch(() => null);
    if (!r?.ok) console.error("auth name update failed", r?.status);
  }
  await saveCustomer({ auth_id: session.user.id, email, name: shownName, role: shownRole }, "email");
  return {
    user: { id: session.user.id, email, name: shownName, role: shownRole, admin: adminEmails().includes(email) },
    session: { access_token: session.access_token, refresh_token: session.refresh_token, expires_at: session.expires_at },
  };
}

async function generateLink(email: string) {
  const r = await sb("/auth/v1/admin/generate_link", "POST", { type: "magiclink", email });
  const text = await r.text();
  let json: unknown = null;
  try { json = JSON.parse(text); } catch { /* not JSON */ }
  return { ok: r.ok, status: r.status, text, json };
}

async function refresh(token: string): Promise<Response> {
  if (!token || !emailOn()) return fail("Please log in again.", 401);
  const r = await sb("/auth/v1/token?grant_type=refresh_token", "POST", { refresh_token: token });
  if (!r.ok) return fail("Please log in again.", 401);
  const s = await r.json();
  return Response.json({ ok: true, session: { access_token: s.access_token, refresh_token: s.refresh_token, expires_at: s.expires_at } });
}

// ---------- phone (MSG91, or Message Central until DLT is done) ----------

async function sendSms(phone: string, signup: boolean): Promise<Response> {
  const known = await findCustomer("phone", phone);
  if (known === null) return fail("We couldn't check your number right now. Please try again in a minute.", 502);
  if (!known.id && !signup) return fail("We couldn't find an account with this number. Sign up instead, it takes a minute.", 404, "no_account");
  if (known.id && signup) return fail("You already have an account with this number. Log in instead.", 409, "exists");
  const sentOk = (ref = "") => { wrong.delete(phone); return Response.json({ ok: true, digits: 6, ...(ref && { ref }) }); };
  const failed = (r: Response | null, j: unknown) => {
    console.error("auth sms failed", r?.status, JSON.stringify(j).slice(0, 300));
    return fail("We couldn't send the SMS right now. Please try again, or use your email.", 502);
  };
  const env = process.env;
  if (msg91()) {
    const q = new URLSearchParams({ template_id: env.MSG91_TEMPLATE_ID!, mobile: phone, otp_length: "6", otp_expiry: "10" });
    const r = await fetch(`https://control.msg91.com/api/v5/otp?${q}`, {
      method: "POST", headers: { authkey: env.MSG91_AUTH_KEY!, "Content-Type": "application/json" }, body: "{}",
    }).catch(() => null);
    const j = r ? await r.json().catch(() => ({})) : {};
    return r?.ok && j.type === "success" ? sentOk() : failed(r, j);
  }
  // Message Central gives back a verification id; the page hands it back with the code.
  const token = await mcToken();
  const q = new URLSearchParams({ countryCode: "91", customerId: env.MESSAGECENTRAL_CUSTOMER_ID!, flowType: "SMS", mobileNumber: phone.slice(2), otpLength: "6" });
  const r = token ? await fetch(`https://cpaas.messagecentral.com/verification/v3/send?${q}`, { method: "POST", headers: { authToken: token } }).catch(() => null) : null;
  const j = r ? await r.json().catch(() => ({})) : {};
  const id = String(j?.data?.verificationId ?? "");
  return r?.ok && /^\d+$/.test(id) ? sentOk(`${id}.${sign(id + phone)}`) : failed(r, j);
}

async function verifySms(phone: string, code: string, ref: string, name: string, role: string) {
  if (msg91()) {
    const q = new URLSearchParams({ otp: code, mobile: phone });
    const r = await fetch(`https://control.msg91.com/api/v5/otp/verify?${q}`, { headers: { authkey: process.env.MSG91_AUTH_KEY! } }).catch(() => null);
    const j = r ? await r.json().catch(() => ({})) : {};
    if (!r?.ok || j.type !== "success") return null;
  } else {
    // The id is signed together with the number it was sent to, so nobody can reuse someone else's code.
    const [id, sig] = ref.split(".");
    if (!/^\d+$/.test(id || "") || sig !== sign(id + phone)) return null;
    const token = await mcToken();
    const q = new URLSearchParams({ customerId: process.env.MESSAGECENTRAL_CUSTOMER_ID!, verificationId: id, code });
    const r = token ? await fetch(`https://cpaas.messagecentral.com/verification/v3/validateOtp?${q}`, { headers: { authToken: token } }).catch(() => null) : null;
    const j = r ? await r.json().catch(() => ({})) : {};
    const num = String(j?.data?.mobileNumber ?? "").replace(/\D/g, "");
    if (!r?.ok || j?.data?.verificationStatus !== "VERIFICATION_COMPLETED" || (num && !num.endsWith(phone.slice(2)))) return null;
  }
  const known = (await findCustomer("phone", phone)) ?? {};
  const shownName = name || known.name || "Friend";
  const shownRole = name ? role : known.role === "artisan" ? "artisan" : "shopper";
  const id = await saveCustomer({ phone, name: shownName, role: shownRole }, "phone");
  return { user: { id: id || known.id || phone, phone: "+" + phone, email: "", name: shownName, role: shownRole, admin: false }, session: null };
}

const sign = (v: string) => createHmac("sha256", process.env.SUPABASE_SERVICE_ROLE_KEY || "").update(v).digest("base64url").slice(0, 22);

let mcCache: { token: string; at: number } | null = null;
async function mcToken(): Promise<string | null> {
  if (mcCache && Date.now() - mcCache.at < 20 * 60_000) return mcCache.token;
  const e = process.env;
  const q = new URLSearchParams({ customerId: e.MESSAGECENTRAL_CUSTOMER_ID!, key: Buffer.from(e.MESSAGECENTRAL_PASSWORD!).toString("base64"), scope: "NEW", country: "91" });
  const r = await fetch(`https://cpaas.messagecentral.com/auth/v1/authentication/token?${q}`, { headers: { accept: "*/*" } }).catch(() => null);
  const j = r ? await r.json().catch(() => ({})) : {};
  if (!r?.ok || !j.token) { console.error("messagecentral token failed", r?.status, JSON.stringify(j).slice(0, 200)); return null; }
  mcCache = { token: j.token, at: Date.now() };
  return j.token;
}

// ---------- customers table (shown on the admin page) ----------

// Returns {} when not found, null when the lookup itself failed.
async function findCustomer(field: "phone" | "email", value: string): Promise<Customer | null> {
  const r = await sb(`/rest/v1/customers?select=id,name,role&${field}=eq.${encodeURIComponent(value)}&limit=1`, "GET").catch(() => null);
  if (!r?.ok) { console.error("customer lookup failed", r?.status); return null; }
  return ((await r.json()) as Customer[])[0] ?? {};
}

async function saveCustomer(row: Record<string, string>, key: "email" | "phone"): Promise<string | null> {
  const r = await sb(`/rest/v1/customers?on_conflict=${key}`, "POST", { ...row, last_login_at: new Date().toISOString() },
    { Prefer: "resolution=merge-duplicates,return=representation" }).catch(() => null);
  if (!r?.ok) { console.error("customer save failed", r?.status, r ? (await r.text()).slice(0, 200) : ""); return null; }
  return ((await r.json()) as Customer[])[0]?.id ?? null;
}

// ---------- Supabase ----------

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
