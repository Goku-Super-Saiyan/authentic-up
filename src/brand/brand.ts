// One codebase, two storefronts. VITE_BRAND picks which one a build shows:
// unset or "incredible" builds Incredible UP, "authentic" builds Authentic UP (authenticup domain).
type Brand = {
  key: "incredible" | "authentic";
  word: string; // the word before "UP"
  name: string;
  hindi: string; // shown under the emblem, in the wordmark and in the footer
  domain: string; // placeholder email domain until the real contact email is set
  slogan?: string; // the site's slogan: hero, footer and page title
  eyebrow: string; // the small line above the hero title
  heroLine: string; // the line beside "UP" in the hero
  footerLine: string;
};

const BRANDS: Record<Brand["key"], Brand> = {
  incredible: { key: "incredible", word: "Incredible", name: "Incredible UP", hindi: "अतुल्य उत्तर प्रदेश", domain: "incredibleup.example",
    eyebrow: "उत्तर प्रदेश · 75 districts · 75 crafts · one bazaar",
    heroLine: "Banarasi silk, Bhadohi carpets, Lucknow chikan and the One District One Product craft of every district, bought straight from the people who make it.",
    footerLine: "The crafts of Uttar Pradesh, from the people who make them." },
  authentic: { key: "authentic", word: "Authentic", name: "Authentic UP", hindi: "यूपी की प्रामाणिक पहचान", domain: "authenticup.example",
    slogan: "From their hands to your home",
    eyebrow: "One State. 75 Districts. Countless Stories",
    heroLine: "Every Banarasi weave, every Bhadohi knot, every stitch of Lucknow chikan carries a family's story, passed down for generations. Bring one home, and keep that story alive.",
    footerLine: "Every piece is made by hand in Uttar Pradesh and sent to you by the family who made it." },
};

// import.meta.env is undefined when the logo sheet scripts import this under plain Node.
const env = (import.meta as { env?: Record<string, string | undefined> }).env;
const pick = (env?.VITE_BRAND || "incredible").toLowerCase();

export const BRAND: Brand = pick === "authentic" ? BRANDS.authentic : BRANDS.incredible;
export const brandFor = (key: Brand["key"]) => BRANDS[key];
