import { AnimatePresence, motion } from "framer-motion";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { SITE } from "../config";
import { Emblem } from "../components/Logo";
import { loadAccount, useStore } from "../store";
import { admin, AdminError } from "./api";
import type { Data, Table } from "./types";
import { Btn, Icon, Toast } from "./ui";
import Overview from "./Overview";
import Enquiries from "./Enquiries";
import Orders from "./Orders";
import Products from "./Products";
import Makers from "./Makers";
import Customers from "./Customers";
import System from "./System";

export type Section = "overview" | "enquiries" | "orders" | "products" | "makers" | "customers" | "system";
const NAV: { id: Section; label: string; icon: string }[] = [
  { id: "overview", label: "Overview", icon: "overview" },
  { id: "enquiries", label: "Enquiries", icon: "inbox" },
  { id: "orders", label: "Orders", icon: "orders" },
  { id: "products", label: "Products", icon: "products" },
  { id: "makers", label: "Makers", icon: "makers" },
  { id: "customers", label: "Customers", icon: "customers" },
  { id: "system", label: "System", icon: "system" },
];

type Ctx = {
  data: Data;
  save: <T extends { id?: string }>(table: Table, row: Partial<T> & { id?: string }) => Promise<T | null>;
  remove: (table: Table, id: string) => Promise<boolean>;
  notify: (text: string, bad?: boolean) => void;
  open: (s: Section, focus?: string) => void;
  focus: string | null;
  name: string;
  reload: () => void;
};
const AdminCtx = createContext<Ctx | null>(null);
export const useAdmin = () => useContext(AdminCtx)!;

function Clock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  return (
    <div className="hidden text-right font-mono text-[11px] leading-tight text-mist md:block">
      <p className="text-ivory/85 tabular-nums">{now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "Asia/Kolkata" })} IST</p>
      <p>{now.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", timeZone: "Asia/Kolkata" })}</p>
    </div>
  );
}

function Boot({ text }: { text: string }) {
  const lines = ["Opening secure channel", "Checking admin key", "Reading Supabase tables", text];
  return (
    <div className="grid min-h-[100svh] place-items-center px-6">
      <div className="w-full max-w-[420px]">
        <div className="relative mx-auto h-40 w-32">
          <Emblem className="h-40 w-32" animated />
          <motion.span className="absolute inset-x-0 h-0.5 bg-ganga shadow-[0_0_16px_#49B3C2]" initial={{ top: "0%" }} animate={{ top: ["0%", "100%", "0%"] }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }} />
        </div>
        <div className="mt-8 grid gap-1.5 font-mono text-xs">
          {lines.map((l, i) => (
            <motion.p key={l} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.35 }} className="flex items-center gap-2 text-ivory/70">
              <span className="text-ganga">▸</span>{l}<motion.span className="ml-auto text-zari" animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1, repeat: Infinity }}>{i === lines.length - 1 ? "…" : "ok"}</motion.span>
            </motion.p>
          ))}
        </div>
      </div>
    </div>
  );
}

function Gate({ title, text, action }: { title: string; text: string; action?: React.ReactNode }) {
  return (
    <div className="grid min-h-[100svh] place-items-center px-5">
      <div className="admin-panel relative w-full max-w-[460px] rounded-3xl p-8 text-center" style={{ ["--glow" as string]: "#E7BE63" }}>
        <Emblem className="mx-auto h-28 w-24" animated />
        <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.3em] text-zari">{SITE.name} · Command</p>
        <h1 className="mt-2 font-display text-4xl">{title}</h1>
        <p className="mt-3 text-ivory/65">{text}</p>
        <div className="mt-7 flex flex-wrap justify-center gap-2">{action}</div>
      </div>
    </div>
  );
}

export default function Admin() {
  const { go, setUser } = useStore();
  const [data, setData] = useState<Data | null>(null);
  const [err, setErr] = useState<AdminError | null>(null);
  const [section, setSection] = useState<Section>(() => (sessionStorage.getItem("admin-section") as Section) || "overview");
  const [focus, setFocus] = useState<string | null>(null);
  const [toast, setToast] = useState<{ text: string; bad?: boolean } | null>(null);
  const [menu, setMenu] = useState(false);
  const acc = loadAccount();

  const load = useCallback(() => {
    setErr(null);
    admin<Data>("load").then(setData).catch((e: AdminError) => setErr(e));
  }, []);
  useEffect(() => { if (acc?.session?.access_token) load(); }, [load]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { try { sessionStorage.setItem("admin-section", section); } catch { /* ignore */ } }, [section]);
  useEffect(() => { document.title = `Admin · ${SITE.name}`; }, []);

  const notify = useCallback((text: string, bad?: boolean) => {
    setToast({ text, bad });
    window.setTimeout(() => setToast((t) => (t?.text === text ? null : t)), 2800);
  }, []);

  const ctx = useMemo<Ctx | null>(() => data && {
    data, notify, focus,
    name: acc?.name || data.me.split("@")[0],
    reload: load,
    open: (s, f) => { setSection(s); setFocus(f ?? null); setMenu(false); window.scrollTo(0, 0); },
    save: async (table, row) => {
      try {
        const res = await admin<{ row: { id: string } }>("save", { table, row });
        setData((d) => {
          if (!d) return d;
          const list = d[table] as { id: string }[];
          const next = list.some((x) => x.id === res.row.id) ? list.map((x) => (x.id === res.row.id ? { ...x, ...res.row } : x)) : [res.row, ...list];
          return { ...d, [table]: next };
        });
        return res.row as never;
      } catch (e) { notify((e as Error).message, true); return null; }
    },
    remove: async (table, id) => {
      try {
        const res = await admin<{ hidden?: boolean }>("delete", { table, id });
        setData((d) => d && ({ ...d, [table]: res.hidden ? (d[table] as { id: string; active?: boolean }[]).map((x) => (x.id === id ? { ...x, active: false } : x)) : (d[table] as { id: string }[]).filter((x) => x.id !== id) }));
        notify(res.hidden ? "It was in an order, so it's hidden from the store instead" : "Deleted");
        return true;
      } catch (e) { notify((e as Error).message, true); return false; }
    },
  }, [data, notify, focus, load, acc?.name]);

  const signOut = () => { setUser(null); go("login"); };

  if (!acc) return <Gate title="Admin sign-in" text="Log in with the admin email to open the dashboard." action={<Btn tone="gold" onClick={() => go("login")} icon="shield">Log in</Btn>} />;
  if (!acc.session?.access_token) return <Gate title="Use your email" text="The dashboard opens with an email login. Log out and log in again with the admin email." action={<><Btn onClick={signOut} icon="logout">Log out</Btn><Btn onClick={() => go("home")} icon="store">Back to store</Btn></>} />;
  if (err) {
    if (err.status === 401) return <Gate title="Login expired" text="For safety, admin logins expire. Please log in again." action={<Btn tone="gold" onClick={signOut} icon="shield">Log in again</Btn>} />;
    if (err.status === 403) return <Gate title="No admin access" text={`${acc.email} isn't an admin. Log in with ${SITE.email} or an email listed in ADMIN_EMAILS on Vercel.`} action={<><Btn onClick={signOut} icon="logout">Switch account</Btn><Btn onClick={() => go("home")} icon="store">Back to store</Btn></>} />;
    return <Gate title="Can't connect" text={err.message} action={<><Btn tone="gold" onClick={load} icon="refresh">Try again</Btn><Btn onClick={() => go("home")} icon="store">Back to store</Btn></>} />;
  }
  if (!data || !ctx) return <Boot text="Building your dashboard" />;

  const badge: Partial<Record<Section, number>> = {
    enquiries: data.enquiries.filter((e) => e.status === "new").length,
    orders: data.orders.filter((o) => o.status === "pending").length,
  };
  const Body = { overview: Overview, enquiries: Enquiries, orders: Orders, products: Products, makers: Makers, customers: Customers, system: System }[section];

  const nav = (
    <nav className="grid gap-1" aria-label="Admin sections">
      {NAV.map((n) => (
        <button key={n.id} onClick={() => ctx.open(n.id)} aria-current={section === n.id ? "page" : undefined}
          className={`relative flex h-11 items-center gap-3 rounded-xl px-3.5 text-[15px] transition ${section === n.id ? "text-ivory" : "text-ivory/55 hover:bg-white/[0.04] hover:text-ivory"}`}>
          {section === n.id && <motion.span layoutId="nav-active" className="absolute inset-0 rounded-xl border border-zari/30 bg-gradient-to-r from-zari/20 to-transparent" transition={{ type: "spring", stiffness: 420, damping: 36 }} />}
          {section === n.id && <motion.span layoutId="nav-bar" className="absolute -left-3 top-2 bottom-2 w-1 rounded-full bg-zari shadow-[0_0_12px_#E7BE63]" />}
          <Icon name={n.icon} className="relative" />
          <span className="relative">{n.label}</span>
          {!!badge[n.id] && <span className="relative ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-sindoor px-1.5 font-mono text-[10px] font-bold text-white shadow-[0_0_10px_#F0445A]">{badge[n.id]}</span>}
        </button>
      ))}
    </nav>
  );

  return (
    <AdminCtx.Provider value={ctx}>
      <div className="relative min-h-[100svh] bg-[radial-gradient(70%_50%_at_80%_-10%,rgba(73,179,194,.12),transparent_60%),radial-gradient(60%_50%_at_0%_0%,rgba(231,190,99,.10),transparent_60%),#0B0519]" data-lenis-prevent>
        <div className="admin-grid" /><div className="admin-scan" />

        {/* sidebar */}
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] flex-col border-r border-white/[0.07] bg-night/50 px-4 py-5 backdrop-blur-xl lg:flex">
          <button onClick={() => ctx.open("overview")} className="flex items-center gap-3 px-2 text-left">
            <Emblem className="h-12 w-10" />
            <span><span className="block font-display text-lg leading-tight">{SITE.name}</span><span className="font-mono text-[9.5px] uppercase tracking-[0.3em] text-zari">Command deck</span></span>
          </button>
          <div className="mt-8">{nav}</div>
          <div className="mt-auto grid gap-2">
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
              <p className="font-mono text-[9.5px] uppercase tracking-[0.25em] text-mist">Signed in</p>
              <p className="mt-1 truncate text-sm">{data.me}</p>
            </div>
            <Btn onClick={() => go("home")} icon="store" className="w-full">View store</Btn>
            <Btn onClick={signOut} icon="logout" className="w-full">Log out</Btn>
          </div>
        </aside>

        {/* mobile menu */}
        <AnimatePresence>
          {menu && (
            <>
              <motion.div className="fixed inset-0 z-50 bg-night/70 backdrop-blur-sm lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMenu(false)} />
              <motion.aside className="fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-white/10 bg-[#120827] px-5 py-5 lg:hidden" initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", stiffness: 320, damping: 34 }}>
                <div className="flex items-center gap-3 px-2"><Emblem className="h-11 w-9" /><span className="font-display text-lg">{SITE.name}</span></div>
                <div className="mt-6">{nav}</div>
                <div className="mt-auto grid gap-2"><p className="truncate px-2 text-xs text-mist">{data.me}</p><Btn onClick={() => go("home")} icon="store">View store</Btn><Btn onClick={signOut} icon="logout">Log out</Btn></div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <div className="relative lg:pl-[248px]">
          <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-white/[0.07] bg-[#0B0519]/75 px-4 backdrop-blur-xl sm:px-8">
            <button onClick={() => setMenu(true)} className="grid h-10 w-10 place-items-center rounded-full border border-white/12 lg:hidden" aria-label="Open menu"><Icon name="menu" /></button>
            <div className="min-w-0">
              <p className="font-mono text-[9.5px] uppercase tracking-[0.3em] text-zari">Command deck</p>
              <h1 className="truncate font-display text-xl leading-tight sm:text-2xl">{NAV.find((n) => n.id === section)!.label}</h1>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <span className="hidden items-center gap-2 rounded-full border border-[#5FD39B]/30 bg-[#5FD39B]/10 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-[#5FD39B] sm:flex">
                <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#5FD39B] opacity-60" /><span className="relative h-2 w-2 rounded-full bg-[#5FD39B]" /></span>Live
              </span>
              <Clock />
              <button onClick={() => { setData(null); load(); }} className="grid h-10 w-10 place-items-center rounded-full border border-white/12 hover:border-zari" aria-label="Refresh data" title="Refresh"><Icon name="refresh" size={16} /></button>
            </div>
          </header>

          {data.missing.length > 0 && (
            <div className="mx-4 mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-marigold/40 bg-marigold/10 px-5 py-4 text-sm sm:mx-8">
              <Icon name="bolt" className="text-marigold" />
              <p className="min-w-0 flex-1">One setup step left: run <b>admin-setup.sql</b> once in Supabase (SQL Editor → New query → paste → Run). Until then {data.missing.join(", ")} can't load.</p>
              <Btn onClick={() => ctx.open("system")} icon="system">Details</Btn>
            </div>
          )}

          <main className="px-4 pb-24 pt-6 sm:px-8">
            <AnimatePresence mode="wait">
              <motion.div key={section} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                <Body />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
        <Toast msg={toast} />
      </div>
    </AdminCtx.Provider>
  );
}
