import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { PRODUCTS } from "./data/catalog";

type Store = {
  bag: Map<number, number>;
  add: (id: number) => void;
  setQty: (id: number, qty: number) => void;
  wish: Set<number>;
  toggleWish: (id: number) => void;
  bagOpen: boolean;
  setBagOpen: (v: boolean) => void;
  quick: number | null;
  setQuick: (id: number | null) => void;
  filter: string;
  setFilter: (f: string) => void;
  toast: string | null;
  say: (msg: string) => void;
  page: Page;
  go: (p: Page) => void;
  user: string | null;
  setUser: (name: string | null) => void;
};

export type Page = "home" | "login" | "enquire" | "privacy" | "terms" | "shipping" | "returns";
const PAGES: Page[] = ["login", "enquire", "privacy", "terms", "shipping", "returns"];
const pageFromHash = (): Page => {
  const h = window.location.hash.replace("#", "") as Page;
  return PAGES.includes(h) ? h : "home";
};

const Ctx = createContext<Store | null>(null);
const KEY = "iup-bag-v2";
export const ACCOUNT_KEY = "iup-account";
export type Account = { id: string; email: string; phone?: string; name: string; role: "shopper" | "artisan"; admin?: boolean; session?: { access_token?: string; refresh_token?: string; expires_at?: number } };
export function loadAccount(): Account | null {
  try { return JSON.parse(localStorage.getItem(ACCOUNT_KEY) || "null"); } catch { return null; }
}

function loadBag() {
  try {
    const rows = JSON.parse(localStorage.getItem(KEY) || "[]") as [number, number][];
    return new Map(rows.filter(([id]) => PRODUCTS.some((p) => p.id === id)));
  } catch {
    return new Map<number, number>();
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [bag, setBag] = useState<Map<number, number>>(loadBag);
  const [wish, setWish] = useState<Set<number>>(new Set());
  const [bagOpen, setBagOpen] = useState(false);
  const [quick, setQuick] = useState<number | null>(null);
  const [filter, setFilter] = useState("All");
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const [page, setPage] = useState<Page>(pageFromHash);
  const [user, setUserState] = useState<string | null>(() => loadAccount()?.name.split(" ")[0] ?? null);
  const setUser = useCallback((name: string | null) => {
    setUserState(name);
    if (!name) try { localStorage.removeItem(ACCOUNT_KEY); } catch { /* storage unavailable */ }
  }, []);

  useEffect(() => {
    const onHash = () => setPage(pageFromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const go = useCallback((p: Page) => {
    setPage(p);
    try { history.replaceState(null, "", p === "home" ? location.pathname + location.search : `#${p}`); } catch { /* sandboxed */ }
  }, []);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify([...bag])); } catch { /* storage unavailable */ }
  }, [bag]);

  const say = useCallback((msg: string) => {
    setToast(msg);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToast(null), 2600);
  }, []);

  const add = useCallback((id: number) => {
    setBag((b) => new Map(b).set(id, (b.get(id) ?? 0) + 1));
    const p = PRODUCTS.find((x) => x.id === id);
    if (p) say(`Added ${p.name} to your bag`);
  }, [say]);

  const setQty = useCallback((id: number, qty: number) => {
    setBag((b) => { const n = new Map(b); qty > 0 ? n.set(id, qty) : n.delete(id); return n; });
  }, []);

  const toggleWish = useCallback((id: number) => {
    setWish((w) => { const n = new Set(w); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }, []);

  const value = useMemo(
    () => ({ bag, add, setQty, wish, toggleWish, bagOpen, setBagOpen, quick, setQuick, filter, setFilter, toast, say, page, go, user, setUser }),
    [bag, add, setQty, wish, toggleWish, bagOpen, quick, filter, toast, say, page, go, user, setUser],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore must be used inside StoreProvider");
  return s;
}

export const inr = (n: number) => "₹" + n.toLocaleString("en-IN");
type Smooth = { scrollTo: (target: HTMLElement | number, opts?: { offset?: number; immediate?: boolean }) => void };
export const smooth: { lenis: Smooth | null } = { lenis: null };
export const scrollToId = (id: string) => {
  const el = document.getElementById(id);
  if (!el) return;
  if (smooth.lenis) smooth.lenis.scrollTo(el, { offset: -64 });
  else el.scrollIntoView({ behavior: "smooth", block: "start" });
};
export const scrollToTop = () => (smooth.lenis ? smooth.lenis.scrollTo(0) : window.scrollTo({ top: 0, behavior: "smooth" }));
