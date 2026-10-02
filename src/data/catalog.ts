import type { ArtKind } from "../art/crafts";

// Catalogue listings. Makers are collectives; each price is confirmed with the maker before payment.
export type PID = number | string;
export type Product = {
  id: PID;
  name: string;
  place: string;
  district: string;
  art: ArtKind;
  seed: number;
  price: number;
  cat: string;
  spec: string;
  tags: ("GI tag" | "ODOP" | "Artisan-direct")[];
  maker: string;
  story: string;
  details: string[];
  // Real product photo, e.g. "products/1.jpg" in public/. Falls back to drawn art when absent.
  photo?: string;
  photos?: string[];
  featured?: boolean;
};

// A product row from the admin page (Supabase), shaped like the built-in listings.
export type ProductRow = {
  id: string; name: string; district: string; place?: string | null; category: string; price_inr: number; stock?: number;
  spec?: string | null; story?: string | null; details?: string[]; tags?: string[]; photos?: string[]; featured?: boolean;
  makers?: { name?: string } | null;
};
const ART_BY_CAT: Record<string, ArtKind> = {
  "Silk & sarees": "saree", "Carpets & dari": "carpet", Embroidery: "chikan", "Glass & metal": "brass", "Clay, stone & wood": "pottery", Attar: "attar",
};
const TAGS = ["GI tag", "ODOP", "Artisan-direct"] as const;
export function fromRow(r: ProductRow): Product {
  const seed = [...r.id].reduce((a, c) => a + c.charCodeAt(0), 0) % 9 + 1;
  return {
    id: r.id, name: r.name, place: r.place || r.district, district: r.district, art: ART_BY_CAT[r.category] ?? "saree", seed,
    price: r.price_inr, cat: r.category, spec: r.spec || "", tags: (r.tags ?? []).filter((t): t is Product["tags"][number] => (TAGS as readonly string[]).includes(t)),
    maker: r.makers?.name || "", story: r.story || "", details: r.details ?? [], photo: r.photos?.[0], photos: r.photos ?? [], featured: !!r.featured,
  };
}

export const CATEGORIES = ["All", "Silk & sarees", "Carpets & dari", "Embroidery", "Glass & metal", "Clay, stone & wood", "Attar"] as const;

export const PRODUCTS: Product[] = [
  {
    id: 1, name: "Kadhua Buta Katan Silk Saree", place: "Madanpura, Varanasi", district: "Varanasi", art: "saree", seed: 3,
    price: 18500, cat: "Silk & sarees", spec: "Pure katan · real zari · 21 days on loom", tags: ["GI tag", "ODOP"],
    maker: "Madanpura Weavers Collective",
    story: "Every buta is woven in by hand with a separate shuttle, so the back of the saree is as clean as the front. That is what kadhua means.",
    details: ["Pure mulberry katan silk", "Silver zari with gold polish", "6.3 m with blouse piece", "Dry clean only"],
  },
  {
    id: 2, name: "Hand-knotted Wool Carpet, 5 × 8 ft", place: "Bhadohi", district: "Bhadohi", art: "carpet", seed: 4,
    price: 42000, cat: "Carpets & dari", spec: "150 knots / sq in · 4 months to knot", tags: ["GI tag", "ODOP"],
    maker: "Gyanpur Knotters Cooperative",
    story: "Two knotters sit side by side at the loom, tying close to six lakh knots by hand before the carpet is washed, clipped and stretched in the sun.",
    details: ["New Zealand wool on cotton warp", "Vegetable and azo-free dyes", "Medallion design, 150 KPSI", "Pile height 8 mm"],
  },
  {
    id: 3, name: "Chikankari Georgette Kurta", place: "Chowk, Lucknow", district: "Lucknow", art: "chikan", seed: 5,
    price: 3450, cat: "Embroidery", spec: "Hand-stitched tepchi & phanda work", tags: ["GI tag", "ODOP"],
    maker: "Chowk Chikan Women's Group",
    story: "The pattern is block-printed in washable indigo, then stitched in white thread by women working from home in the lanes of old Lucknow.",
    details: ["Pure georgette, mint", "Tepchi, phanda and murri stitches", "Sizes S to XXL", "Gentle hand wash"],
  },
  {
    id: 4, name: "Kaanch Bangles, set of 24", place: "Firozabad", district: "Firozabad", art: "bangles", seed: 6,
    price: 480, cat: "Glass & metal", spec: "Hand-pulled glass · size 2.6", tags: ["ODOP"],
    maker: "Suhag Nagar Glass Works",
    story: "Molten glass is pulled into a spiral coil over a furnace, cut ring by ring and joined in a flame. Firozabad makes most of India's glass bangles.",
    details: ["12 colours, 2 of each", "Gold-dust finish", "Sizes 2.2 to 2.10", "Packed in a cloth roll"],
  },
  {
    id: 5, name: "Nakkashi Brass Wall Plate, 14 in", place: "Moradabad", district: "Moradabad", art: "brass", seed: 8,
    price: 2650, cat: "Glass & metal", spec: "Hand-engraved · 1.2 kg brass", tags: ["GI tag", "ODOP"],
    maker: "Peetal Nagri Engravers",
    story: "Moradabad is called Peetal Nagri, the brass city. Each petal on this plate is cut freehand with a chisel and a small hammer.",
    details: ["Solid brass, 1.2 kg", "Lacquered against tarnish", "Wall hook included", "Wipe with a dry cloth"],
  },
  {
    id: 6, name: "Ruh Gulab Attar, 10 ml", place: "Kannauj", district: "Kannauj", art: "attar", seed: 9,
    price: 1900, cat: "Attar", spec: "Deg-bhapka distilled · alcohol-free", tags: ["GI tag", "ODOP"],
    maker: "Kannauj Deg Distillers",
    story: "Fresh Kannauj roses are distilled in copper degs over a wood fire, and the vapour is caught in sandalwood oil. The method has barely changed in centuries.",
    details: ["Rose in sandalwood base", "Alcohol-free", "Cut-glass bottle with dipper", "Lasts 8 to 10 hours"],
  },
  {
    id: 7, name: "Black Pottery Vase", place: "Nizamabad, Azamgarh", district: "Azamgarh", art: "pottery", seed: 10,
    price: 1250, cat: "Clay, stone & wood", spec: "Kabiz clay · silver etching · 9 in", tags: ["GI tag", "ODOP"],
    maker: "Nizamabad Potters' Lane",
    story: "The pots are smoked in a sealed kiln to turn them jet black, then etched and filled with a silvery metal paste that shines against the black.",
    details: ["Hand-thrown local clay", "Smoke-fired black finish", "9 in tall", "Decorative use"],
  },
  {
    id: 8, name: "Parchinkari Marble Coasters, set of 4", place: "Agra", district: "Agra", art: "inlay", seed: 11,
    price: 2200, cat: "Clay, stone & wood", spec: "Makrana marble · stone inlay", tags: ["Artisan-direct"],
    maker: "Taj Ganj Inlay Workshop",
    story: "The same inlay craft as the Taj Mahal. Slivers of lapis, carnelian and malachite are cut on a hand-turned wheel and set into carved marble.",
    details: ["Makrana marble", "Semi-precious stone inlay", "4 in octagons", "Felt-backed"],
  },
  {
    id: 9, name: "Sheesham Jali Jewellery Box", place: "Saharanpur", district: "Saharanpur", art: "wood", seed: 12,
    price: 1800, cat: "Clay, stone & wood", spec: "Hand-carved sheesham · brass hinges", tags: ["GI tag", "ODOP"],
    maker: "Saharanpur Woodcarvers Guild",
    story: "Saharanpur carvers cut jali lattices so fine that light falls through them in patterns. This box takes one carver about four days.",
    details: ["Seasoned sheesham wood", "Velvet-lined", "8 × 5 × 3 in", "Brass hinges and clasp"],
  },
  {
    id: 10, name: "Zardozi Velvet Potli", place: "Bareilly", district: "Bareilly", art: "zardozi", seed: 13,
    price: 1450, cat: "Embroidery", spec: "Gold dabka & sequin work", tags: ["ODOP"],
    maker: "Bareilly Zardoz Karkhana",
    story: "Zardozi workers sit around a wooden adda frame, couching coiled gold dabka and sequins onto velvet one stitch at a time.",
    details: ["Silk velvet, midnight blue", "Dabka, nakshi and sequins", "Drawstring with tassels", "9 × 7 in"],
  },
  {
    id: 11, name: "Cotton Dari, 4 × 6 ft", place: "Mirzapur", district: "Mirzapur", art: "dari", seed: 14,
    price: 6800, cat: "Carpets & dari", spec: "Panja-woven · reversible", tags: ["GI tag", "ODOP"],
    maker: "Mirzapur Dari Weavers",
    story: "Woven on a vertical loom and beaten tight with a metal panja comb, so it lies flat for decades and looks the same on both sides.",
    details: ["Heavy cotton", "Reversible", "Machine washable", "4 × 6 ft"],
  },
  {
    id: 12, name: "Terracotta Horse, 12 in", place: "Aurangabad village, Gorakhpur", district: "Gorakhpur", art: "terracotta", seed: 15,
    price: 950, cat: "Clay, stone & wood", spec: "Village clay · kiln-fired", tags: ["GI tag", "ODOP"],
    maker: "Aurangabad Terracotta Families",
    story: "Long-necked horses like this one are offered at village shrines. Each piece is shaped by hand, coated in red clay slip and fired in an open kiln.",
    details: ["Hand-shaped local clay", "Natural red slip", "12 in tall", "Indoor use"],
  },
];

export type Craft = {
  name: string; hindi: string; district: string; place: string; art: ArtKind; seed: number;
  fact: string; figure: string; figureLabel: string; filter: string;
};

export const ICONS: Craft[] = [
  { name: "Banarasi Silk", hindi: "बनारसी", district: "Varanasi", place: "Varanasi", art: "saree", seed: 21, figure: "21", figureLabel: "days on the loom for one saree", fact: "Silk and real zari, woven on pit looms in Madanpura and Peeli Kothi since the Mughal era.", filter: "Silk & sarees" },
  { name: "Hand-knotted Carpets", hindi: "क़ालीन", district: "Bhadohi", place: "Bhadohi & Mirzapur", art: "carpet", seed: 22, figure: "150", figureLabel: "knots in every square inch", fact: "India's carpet belt. Bhadohi rugs are shipped to homes all over the world.", filter: "Carpets & dari" },
  { name: "Chikankari", hindi: "चिकनकारी", district: "Lucknow", place: "Lucknow", art: "chikan", seed: 23, figure: "32", figureLabel: "named stitches in the craft", fact: "White-on-white shadow embroidery from the courts of Awadh, still stitched by hand in old Lucknow.", filter: "Embroidery" },
  { name: "Kaanch Bangles", hindi: "काँच की चूड़ियाँ", district: "Firozabad", place: "Firozabad", art: "bangles", seed: 24, figure: "1,000°C", figureLabel: "furnaces burning day and night", fact: "The glass city. Most glass bangles worn in India start as a molten coil here.", filter: "Glass & metal" },
  { name: "Brass Nakkashi", hindi: "नक्काशी", district: "Moradabad", place: "Moradabad", art: "brass", seed: 25, figure: "Peetal", figureLabel: "Nagri, the brass city", fact: "Freehand engraving on brass, exported to the world from Moradabad's lanes of metalworkers.", filter: "Glass & metal" },
  { name: "Attar", hindi: "इत्र", district: "Kannauj", place: "Kannauj", art: "attar", seed: 26, figure: "100%", figureLabel: "natural oils, no alcohol", fact: "The perfume capital of India. Even the smell of first rain, mitti attar, is distilled here.", filter: "Attar" },
];
