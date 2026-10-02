import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { fromRow, PRODUCTS, type PID, type Product, type ProductRow } from "./data/catalog";
import { useLang } from "./i18n";

type Store = {
  products: Product[];
  bag: Map<PID, number>;
  add: (id: PID) => void;
  setQty: (id: PID, qty: number) => void;
  wish: Set<PID>;
  toggleWish: (id: PID) => void;
  bagOpen: boolean;
  setBagOpen: (v: boolean) => void;
  quick: PID | null;
  setQuick: (id: PID | null) => void;
  filter: string;
  setFilter: (f: string) => void;
  toast: string | null;
  say: (msg: string) => void;
  page: Page;
  go: (p: Page) => void;
  user: string | null;
  setUser: (name: string | null) => void;
};

export type Page = "home" | "login" | "enquire" | "admin" | "privacy" | "terms" | "shipping" | "returns";
const PAGES: Page[] = ["login", "enquire", "admin", "privacy", "terms", "shipping", "returns"];
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
    const rows = JSON.parse(localStorage.getItem(KEY) || "[]") as [PID, number][];
    return new Map(rows.filter(([id, q]) => (typeof id === "number" || typeof id === "string") && q > 0));
  } catch {
    return new Map<PID, number>();
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const { lang } = useLang();
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [bag, setBag] = useState<Map<PID, number>>(loadBag);
  const [wish, setWish] = useState<Set<PID>>(new Set());
  const [bagOpen, setBagOpen] = useState(false);
  const [quick, setQuick] = useState<PID | null>(null);
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

  // Products added on the admin page replace the built-in pieces as soon as the first one is live.
  useEffect(() => {
    fetch("/api/products").then((r) => (r.ok ? r.json() : [])).then((rows: ProductRow[]) => {
      if (!Array.isArray(rows) || !rows.length) return;
      const live = rows.map(fromRow).sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
      setProducts(live);
      setBag((b) => new Map([...b].filter(([id]) => live.some((p) => p.id === id))));
    }).catch(() => { /* keep the built-in pieces */ });
  }, []);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify([...bag])); } catch { /* storage unavailable */ }
  }, [bag]);

  const say = useCallback((msg: string) => {
    setToast(msg);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToast(null), 2600);
  }, []);

  const add = useCallback((id: PID) => {
    setBag((b) => new Map(b).set(id, (b.get(id) ?? 0) + 1));
    const p = products.find((x) => x.id === id);
    if (p) say(lang === "hi" ? `${p.hi?.name ?? p.name} बैग में डाल दिया` : `Added ${p.name} to your bag`);
  }, [say, products, lang]);

  const setQty = useCallback((id: PID, qty: number) => {
    setBag((b) => { const n = new Map(b); qty > 0 ? n.set(id, qty) : n.delete(id); return n; });
  }, []);

  const toggleWish = useCallback((id: PID) => {
    setWish((w) => { const n = new Set(w); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }, []);

  const value = useMemo(
    () => ({ products, bag, add, setQty, wish, toggleWish, bagOpen, setBagOpen, quick, setQuick, filter, setFilter, toast, say, page, go, user, setUser }),
    [products, bag, add, setQty, wish, toggleWish, bagOpen, quick, filter, toast, say, page, go, user, setUser],
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
// Straight to the top with no visible scroll, for the floating home button.
export const jumpToTop = () => (smooth.lenis ? smooth.lenis.scrollTo(0, { immediate: true }) : window.scrollTo({ top: 0, behavior: "instant" }));
