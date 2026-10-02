import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { SITE } from "../config";
import { useAdmin } from "./Admin";
import { admin } from "./api";
import { TONE } from "./types";
import { Btn, Chip, Icon, Panel, Ring } from "./ui";

type Health = Record<string, string | string[]>;

const SERVICES: { key: string; label: string; what: string; icon: string; fix: string }[] = [
  { key: "database", label: "Database", what: "Products, enquiries and orders in Supabase", icon: "products", fix: "Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel." },
  { key: "customers_table", label: "Customer list", what: "Sign-ups and saved orders", icon: "customers", fix: "Run admin-setup.sql once in the Supabase SQL Editor." },
  { key: "photo_storage", label: "Photo storage", what: "Product photos you upload", icon: "image", fix: "Run schema.sql in Supabase. It creates the “products” photo bucket." },
  { key: "email", label: "Email", what: "Login codes and enquiry emails, through Resend", icon: "mail", fix: "Add RESEND_API_KEY and ENQUIRY_FROM in Vercel." },
  { key: "sms", label: "Mobile login", what: "SMS codes, through Message Central or MSG91", icon: "phone", fix: "Add the Message Central keys in Vercel (see phone-login-setup.md)." },
  { key: "payments", label: "Online payments", what: "Card and UPI checkout through Razorpay", icon: "rupee", fix: "Comes later, after Razorpay KYC. Orders are confirmed on WhatsApp until then." },
];

export default function System() {
  const { data, open } = useAdmin();
  const [h, setH] = useState<Health | null>(null);
  const [err, setErr] = useState("");
  const check = () => { setH(null); setErr(""); admin<Health>("health").then(setH).catch((e) => setErr(e.message)); };
  useEffect(check, []);

  const ok = h ? SERVICES.filter((s) => h[s.key] === "ok").length : 0;
  const rows: [string, number, string][] = [
    ["Products", data.products.length, "products"], ["Makers", data.makers.length, "makers"], ["Enquiries", data.enquiries.length, "enquiries"],
    ["Orders", data.orders.length, "orders"], ["Customers", data.customers.length, "customers"],
  ];

  return (
    <div className="grid gap-5">
      <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
        <Panel eyebrow="Systems" title="Health" glow="jade" actions={<Btn icon="refresh" onClick={check}>Re-check</Btn>}>
          <div className="grid place-items-center py-2">
            <Ring value={h ? ok / SERVICES.length : 0} color={ok === SERVICES.length ? TONE.jade : TONE.zari} size={168}
              label={<div><p className="font-display text-5xl leading-none">{h ? ok : "…"}<span className="text-2xl text-ivory/40">/{SERVICES.length}</span></p><p className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.2em] text-mist">connected</p></div>} />
          </div>
          {err && <p className="mt-3 text-sm text-sindoor">{err}</p>}
          <div className="mt-4 grid gap-2 border-t border-white/[0.07] pt-4 text-sm">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-mist">Admins</p>
            {((h?.admins as string[]) ?? [data.me]).map((a) => <p key={a} className="flex items-center gap-2 truncate"><Icon name="shield" size={14} className="text-zari" />{a}</p>)}
            <p className="text-xs text-ivory/45">Add more by listing emails, comma separated, in ADMIN_EMAILS on Vercel.</p>
          </div>
        </Panel>

        <div className="grid gap-3 sm:grid-cols-2">
          {SERVICES.map((s, i) => {
            const v = h?.[s.key];
            const good = v === "ok";
            const later = s.key === "payments" && !good;
            const tone = !h ? "mist" : good ? "jade" : later ? "mist" : "marigold";
            return (
              <motion.div key={s.key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="admin-panel relative rounded-2xl p-5" style={{ ["--glow" as string]: TONE[tone] }}>
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border" style={{ color: TONE[tone], borderColor: TONE[tone] + "44", background: TONE[tone] + "12" }}><Icon name={s.icon} /></span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold">{s.label}</p>
                      <Chip tone={tone}>{!h ? "checking" : good ? "online" : later ? "later" : "needs setup"}</Chip>
                    </div>
                    <p className="mt-1 text-sm text-ivory/60">{s.what}</p>
                    {h && !good && <p className="mt-2 text-xs text-marigold/90">{s.fix}{typeof v === "string" && v.startsWith("error") ? ` (${v})` : ""}</p>}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel eyebrow="Data" title="What's stored" glow="ganga">
          <ul className="grid gap-2">
            {rows.map(([l, n, s]) => (
              <li key={l}>
                <button onClick={() => open(s as never)} className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-white/[0.03]">
                  <span className="text-ivory/80">{l}</span>
                  <span className="mx-2 h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                  <span className="font-display text-2xl tabular-nums">{n}</span>
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-ivory/45">Each list has a CSV button to download a copy for Excel or Google Sheets.</p>
        </Panel>

        <Panel eyebrow="Shortcuts" title="Your services" glow="zari">
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              ["Supabase", "Database and logins", "https://supabase.com/dashboard/project/xwxlkbrmapfeympifhvh"],
              ["Vercel", "Hosting and settings", "https://vercel.com/dashboard"],
              ["Resend", "Email sending", "https://resend.com/emails"],
              ["Message Central", "Mobile login codes", "https://www.messagecentral.com/"],
              ["Live store", SITE.email.split("@")[1] || "Website", "/"],
              ["Enquiry inbox", SITE.email, `mailto:${SITE.email}`],
            ].map(([t, s, href]) => (
              <a key={t} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener" className="group flex items-center gap-3 rounded-xl border border-white/[0.07] px-4 py-3 transition hover:border-zari/40">
                <span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{t}</span><span className="block truncate text-xs text-ivory/50">{s}</span></span>
                <Icon name="external" size={15} className="text-mist group-hover:text-zari" />
              </a>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
