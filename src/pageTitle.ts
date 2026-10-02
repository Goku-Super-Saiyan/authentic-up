import { useEffect } from "react";
import { SITE } from "./config";
import type { Page } from "./store";
import { POLICIES, isPolicy } from "./components/Policy";

// The home title comes from index.html (set at build time in seo.ts); other pages name themselves.
const HOME = typeof document !== "undefined" ? document.title : "";
const NAMES: Partial<Record<Page, string>> = { login: "Sign in", enquire: "Send an enquiry" };

export function usePageTitle(page: Page) {
  useEffect(() => {
    if (page === "admin") return;
    const name = isPolicy(page) ? POLICIES[page].title : NAMES[page];
    document.title = name ? `${name} · ${SITE.name}` : HOME;
  }, [page]);
}
