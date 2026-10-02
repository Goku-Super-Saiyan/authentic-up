import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

// English and Hindi for the storefront. Text is written as pairs next to where it is used:
//   const { t } = useLang();  t("Add to bag", "बैग में डालें")
// The choice is remembered on the device. ?lang=hi or ?lang=en in a link picks it too.
// The admin dashboard stays in English.
export type Lang = "en" | "hi";
const KEY = "iup-lang";

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (en: string, hi: string) => string };
const LangCtx = createContext<Ctx>({ lang: "en", setLang: () => {}, t: (en) => en });

function initial(): Lang {
  try {
    const q = new URLSearchParams(location.search).get("lang");
    if (q === "hi" || q === "en") return q;
    const saved = localStorage.getItem(KEY);
    if (saved === "hi" || saved === "en") return saved;
  } catch { /* storage unavailable */ }
  return "en";
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initial);
  useEffect(() => { document.documentElement.lang = lang === "hi" ? "hi" : "en-IN"; }, [lang]);
  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try { localStorage.setItem(KEY, l); } catch { /* storage unavailable */ }
  }, []);
  const t = useCallback((en: string, hi: string) => (lang === "hi" ? hi : en), [lang]);
  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);
  return <LangCtx.Provider value={value}>{children}</LangCtx.Provider>;
}

export const useLang = () => useContext(LangCtx);

// A pair kept in data, e.g. { en: "Naksha", hi: "नक्शा" }.
export type Pair = { en: string; hi: string };
export const pick = (lang: Lang, p: Pair) => (lang === "hi" ? p.hi : p.en);
