// Search and sharing setup, applied at build time for whichever storefront VITE_BRAND picks.
// Adds the page description, social preview tags and structured data to index.html, a readable
// copy of the page for crawlers that don't run JavaScript, and robots.txt and sitemap.xml.
import type { Plugin } from "vite";
import { brandFor } from "./src/brand/brand";
import { DISTRICTS } from "./src/data/districts";

type Env = Record<string, string | undefined>;

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Only authenticup.in is indexed. Incredible UP shares the same pages, and two copies would
// split the ranking, so its build asks search engines to skip it unless VITE_SITE_URL is set.
const SITES = {
  authentic: {
    url: "https://www.authenticup.in",
    title: "Authentic UP: Banarasi Sarees, Bhadohi Carpets & Handicrafts of Uttar Pradesh",
    index: true,
  },
  incredible: {
    url: "https://incredible-up.vercel.app",
    title: "Incredible UP: Banarasi Sarees, Bhadohi Carpets & Handicrafts of Uttar Pradesh",
    index: false,
  },
};

const DESCRIPTION =
  "Handmade crafts of Uttar Pradesh, direct from the artisans: Banarasi silk sarees, Bhadohi carpets, Lucknow chikankari and One District One Product (ODOP) crafts from all 75 districts.";

const CRAFTS: [string, string][] = [
  ["Banarasi silk sarees", "woven on handlooms in Varanasi, with real zari"],
  ["Bhadohi and Mirzapur carpets", "hand-knotted in India's carpet belt"],
  ["Lucknow chikankari", "fine shadow-work embroidery from Lucknow"],
  ["Moradabad brass and metal craft", "engraved and hammered by hand"],
  ["Firozabad glass", "bangles and glassware from the city of glass"],
  ["Kannauj attar", "natural perfume distilled the old way"],
  ["Azamgarh black pottery", "the silver-etched clay of Nizamabad"],
  ["Saharanpur wood carving", "carved sheesham furniture and decor"],
];

export function seo(env: Env): Plugin {
  const key = (env.VITE_BRAND || "").toLowerCase() === "authentic" ? "authentic" : "incredible";
  const brand = brandFor(key);
  const site = SITES[key];
  const url = (env.VITE_SITE_URL || site.url).replace(/\/$/, "");
  const index = site.index || !!env.VITE_SITE_URL;
  const name = env.VITE_BUSINESS_NAME || brand.name;
  const image = `${url}/og/${key}.jpg`;
  const email = env.VITE_CONTACT_EMAIL;
  const phone = (env.VITE_PHONE || "").replace(/[^\d+]/g, "");
  const address = env.VITE_BUSINESS_ADDRESS || "Varanasi, Uttar Pradesh, India";
  const social = (env.VITE_SOCIAL_LINKS || "").split(",").map((s) => s.trim()).filter(Boolean);
  const shareTitle = brand.slogan ? `${brand.name} · ${brand.slogan}` : site.title;

  const store = {
    "@type": "Store",
    "@id": `${url}/#store`,
    name,
    alternateName: [brand.name, brand.hindi].filter((n) => n !== name),
    description: DESCRIPTION,
    url: `${url}/`,
    logo: `${url}/og/logo-${key}.png`,
    image,
    ...(email && { email }),
    ...(phone && { telephone: phone }),
    address: {
      "@type": "PostalAddress",
      streetAddress: address.split(",")[0].trim(),
      addressLocality: "Varanasi",
      addressRegion: "Uttar Pradesh",
      addressCountry: "IN",
    },
    areaServed: { "@type": "Country", name: "India" },
    currenciesAccepted: "INR",
    knowsAbout: [...CRAFTS.map(([c]) => c), "One District One Product (ODOP)", "GI-tagged crafts of Uttar Pradesh"],
    ...(social.length && { sameAs: social }),
  };
  const website = { "@type": "WebSite", "@id": `${url}/#website`, url: `${url}/`, name: brand.name, inLanguage: "en-IN", publisher: { "@id": `${url}/#store` } };
  const ld = JSON.stringify({ "@context": "https://schema.org", "@graph": [store, website] }).replace(/</g, "\\u003c");

  const meta = [
    `<title>${esc(site.title)}</title>`,
    `<meta name="description" content="${esc(DESCRIPTION)}" />`,
    `<meta name="robots" content="${index ? "index, follow, max-image-preview:large" : "noindex, follow"}" />`,
    `<link rel="canonical" href="${url}/" />`,
    `<meta name="theme-color" content="#0E0720" />`,
    `<link rel="apple-touch-icon" href="/og/logo-${key}.png" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${esc(brand.name)}" />`,
    `<meta property="og:locale" content="en_IN" />`,
    `<meta property="og:url" content="${url}/" />`,
    `<meta property="og:title" content="${esc(shareTitle)}" />`,
    `<meta property="og:description" content="${esc(DESCRIPTION)}" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${esc(`${brand.name}, handmade crafts of Uttar Pradesh`)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(shareTitle)}" />`,
    `<meta name="twitter:description" content="${esc(DESCRIPTION)}" />`,
    `<meta name="twitter:image" content="${image}" />`,
    env.VITE_GOOGLE_SITE_VERIFICATION && `<meta name="google-site-verification" content="${esc(env.VITE_GOOGLE_SITE_VERIFICATION)}" />`,
    env.VITE_BING_SITE_VERIFICATION && `<meta name="msvalidate.01" content="${esc(env.VITE_BING_SITE_VERIFICATION)}" />`,
    `<script type="application/ld+json">${ld}</script>`,
  ];

  // Google Analytics, only when a measurement ID (G-XXXX) is set.
  const ga = env.VITE_GA_ID && /^G-[A-Z0-9]+$/.test(env.VITE_GA_ID) ? env.VITE_GA_ID : "";
  if (ga) meta.push(
    `<script async src="https://www.googletagmanager.com/gtag/js?id=${ga}"></script>`,
    `<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag("js",new Date());gtag("config","${ga}");</script>`,
  );

  // What a crawler without JavaScript reads. React replaces it as soon as the app starts.
  const byCat = (c: string) => DISTRICTS.filter((d) => d.cat === c).map((d) => `<li>${esc(d.name)}: ${esc(d.product)}</li>`).join("");
  const contact = [email && `<a href="mailto:${esc(email)}">${esc(email)}</a>`, phone && `<a href="tel:${phone}">${esc(phone)}</a>`, esc(address)].filter(Boolean).join(" · ");
  const body = `<div class="seo-copy">
      <h1>${esc(brand.name)}${brand.slogan ? `: ${esc(brand.slogan)}` : ""}</h1>
      <p lang="hi">${esc(brand.hindi)}</p>
      <p>${esc(brand.heroLine)}</p>
      <h2>Crafts of Uttar Pradesh</h2>
      <ul>${CRAFTS.map(([c, d]) => `<li><strong>${esc(c)}</strong>, ${esc(d)}</li>`).join("")}</ul>
      <h2>One District One Product: the craft of all 75 districts</h2>
      <h3>Textiles and weaves</h3><ul>${byCat("weave")}</ul>
      <h3>Handicrafts</h3><ul>${byCat("craft")}</ul>
      <h3>Metal, leather and industry</h3><ul>${byCat("make")}</ul>
      <h3>Food and fragrance</h3><ul>${byCat("food")}</ul>
      <h2>Contact</h2>
      <p>${contact}</p>
      <p><a href="#enquire">Send an enquiry</a> · <a href="#privacy">Privacy</a> · <a href="#terms">Terms</a> · <a href="#shipping">Shipping</a> · <a href="#returns">Returns</a></p>
    </div>`;

  const today = new Date().toISOString().slice(0, 10);
  return {
    name: "seo",
    transformIndexHtml: (html) =>
      html
        .replace(/<title>[^<]*<\/title>/, meta.filter(Boolean).join("\n    "))
        .replace('<div id="root"></div>', `<div id="root">${body}</div>`),
    generateBundle() {
      this.emitFile({ type: "asset", fileName: "robots.txt", source: index ? `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${url}/sitemap.xml\n` : "User-agent: *\nAllow: /\n" });
      if (index) this.emitFile({
        type: "asset", fileName: "sitemap.xml",
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n  <url>\n    <loc>${url}/</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n    <image:image><image:loc>${image}</image:loc></image:image>\n  </url>\n</urlset>\n`,
      });
    },
  };
}
