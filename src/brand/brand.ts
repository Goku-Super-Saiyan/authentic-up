// One codebase, two storefronts. VITE_BRAND picks which one a build shows:
// unset or "incredible" builds Incredible UP, "authentic" builds Authentic UP (authenticup domain).
type Brand = {
  key: "incredible" | "authentic";
  word: string; // the word before "UP"
  name: string;
  hindi: string; // shown under the emblem, in the wordmark and in the footer
  domain: string; // placeholder email domain until the real contact email is set
};

const BRANDS: Record<Brand["key"], Brand> = {
  incredible: { key: "incredible", word: "Incredible", name: "Incredible UP", hindi: "अतुल्य उत्तर प्रदेश", domain: "incredibleup.example" },
  authentic: { key: "authentic", word: "Authentic", name: "Authentic UP", hindi: "प्रामाणिक उत्तर प्रदेश", domain: "authenticup.example" },
};

// import.meta.env is undefined when the logo sheet scripts import this under plain Node.
const env = (import.meta as { env?: Record<string, string | undefined> }).env;
const pick = (env?.VITE_BRAND || "incredible").toLowerCase();

export const BRAND: Brand = pick === "authentic" ? BRANDS.authentic : BRANDS.incredible;
export const brandFor = (key: Brand["key"]) => BRANDS[key];
