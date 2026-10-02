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
  // In rupees. Left out until the maker confirms a real price; the shop then shows "Price on request".
  price?: number;
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
  // Hindi text for the listing. Products added on the admin page show their English text in Hindi mode too.
  hi?: { name: string; place: string; spec: string; maker: string; story: string; details: string[] };
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
    price: r.price_inr > 0 ? r.price_inr : undefined, cat: r.category, spec: r.spec || "", tags: (r.tags ?? []).filter((t): t is Product["tags"][number] => (TAGS as readonly string[]).includes(t)),
    maker: r.makers?.name || "", story: r.story || "", details: r.details ?? [], photo: r.photos?.[0], photos: r.photos ?? [], featured: !!r.featured,
  };
}

export const CATEGORIES = ["All", "Silk & sarees", "Carpets & dari", "Embroidery", "Glass & metal", "Clay, stone & wood", "Attar"] as const;
export const CATEGORY_HI: Record<string, string> = {
  All: "सभी", "Silk & sarees": "सिल्क और साड़ियाँ", "Carpets & dari": "क़ालीन और दरी", Embroidery: "कढ़ाई",
  "Glass & metal": "काँच और धातु", "Clay, stone & wood": "मिट्टी, पत्थर और लकड़ी", Attar: "इत्र",
};
export const TAG_HI: Record<string, string> = { "GI tag": "जीआई टैग", ODOP: "ओडीओपी", "Artisan-direct": "सीधे कारीगर से" };

// The listing's text in the chosen language.
export const productText = (p: Product, lang: "en" | "hi") => {
  const h = lang === "hi" ? p.hi : undefined;
  return {
    name: h?.name ?? p.name, place: h?.place ?? p.place, spec: h?.spec ?? p.spec, maker: h?.maker ?? p.maker,
    story: h?.story ?? p.story, details: h?.details ?? p.details,
    tags: p.tags.map((t) => (lang === "hi" ? TAG_HI[t] ?? t : t)), cat: lang === "hi" ? CATEGORY_HI[p.cat] ?? p.cat : p.cat,
  };
};

export const PRODUCTS: Product[] = [
  {
    id: 1, name: "Kadhua Buta Katan Silk Saree", place: "Madanpura, Varanasi", district: "Varanasi", art: "saree", seed: 3,
    cat: "Silk & sarees", spec: "Pure katan · real zari · 21 days on loom", tags: ["GI tag", "ODOP"],
    maker: "Madanpura Weavers Collective",
    story: "Every buta is woven in by hand with a separate shuttle, so the back of the saree is as clean as the front. That is what kadhua means.",
    details: ["Pure mulberry katan silk", "Silver zari with gold polish", "6.3 m with blouse piece", "Dry clean only"],
    hi: { name: "कढ़ुआ बूटा कतान सिल्क साड़ी", place: "मदनपुरा, वाराणसी", spec: "शुद्ध कतान · असली ज़री · करघे पर 21 दिन", maker: "मदनपुरा बुनकर समूह",
      story: "हर बूटा अलग ढरकी से हाथ से बुना जाता है, इसलिए साड़ी का उल्टा हिस्सा भी सीधे जितना ही साफ़ होता है। कढ़ुआ का यही मतलब है।",
      details: ["शुद्ध मलबरी कतान सिल्क", "सोने की पॉलिश वाली चाँदी की ज़री", "ब्लाउज़ पीस के साथ 6.3 मीटर", "केवल ड्राई क्लीन"] },
  },
  {
    id: 2, name: "Hand-knotted Wool Carpet, 5 × 8 ft", place: "Bhadohi", district: "Bhadohi", art: "carpet", seed: 4,
    cat: "Carpets & dari", spec: "150 knots / sq in · 4 months to knot", tags: ["GI tag", "ODOP"],
    maker: "Gyanpur Knotters Cooperative",
    story: "Two knotters sit side by side at the loom, tying close to six lakh knots by hand before the carpet is washed, clipped and stretched in the sun.",
    details: ["New Zealand wool on cotton warp", "Vegetable and azo-free dyes", "Medallion design, 150 KPSI", "Pile height 8 mm"],
    hi: { name: "हाथ से बुना ऊनी क़ालीन, 5 × 8 फ़ुट", place: "भदोही", spec: "150 गाँठें प्रति वर्ग इंच · बुनने में 4 महीने", maker: "ज्ञानपुर बुनकर सहकारी समिति",
      story: "दो कारीगर करघे पर साथ बैठकर हाथ से लगभग छह लाख गाँठें बाँधते हैं। उसके बाद क़ालीन को धोया, कतरा और धूप में ताना जाता है।",
      details: ["सूती ताने पर न्यूज़ीलैंड ऊन", "वनस्पति और एज़ो-मुक्त रंग", "मेडेलियन डिज़ाइन, 150 KPSI", "रोएँ की ऊँचाई 8 मिमी"] },
  },
  {
    id: 3, name: "Chikankari Georgette Kurta", place: "Chowk, Lucknow", district: "Lucknow", art: "chikan", seed: 5,
    cat: "Embroidery", spec: "Hand-stitched tepchi & phanda work", tags: ["GI tag", "ODOP"],
    maker: "Chowk Chikan Women's Group",
    story: "The pattern is block-printed in washable indigo, then stitched in white thread by women working from home in the lanes of old Lucknow.",
    details: ["Pure georgette, mint", "Tepchi, phanda and murri stitches", "Sizes S to XXL", "Gentle hand wash"],
    hi: { name: "चिकनकारी जॉर्जेट कुर्ता", place: "चौक, लखनऊ", spec: "हाथ से की गई टेपची और फंदा कढ़ाई", maker: "चौक चिकन महिला समूह",
      story: "पहले धुल जाने वाली नील से डिज़ाइन छापा जाता है, फिर पुराने लखनऊ की गलियों में घर से काम करने वाली महिलाएँ सफ़ेद धागे से उस पर कढ़ाई करती हैं।",
      details: ["शुद्ध जॉर्जेट, पुदीना रंग", "टेपची, फंदा और मुर्री टाँके", "साइज़ S से XXL", "हल्के हाथ से धोएँ"] },
  },
  {
    id: 4, name: "Kaanch Bangles, set of 24", place: "Firozabad", district: "Firozabad", art: "bangles", seed: 6,
    cat: "Glass & metal", spec: "Hand-pulled glass · size 2.6", tags: ["ODOP"],
    maker: "Suhag Nagar Glass Works",
    story: "Molten glass is pulled into a spiral coil over a furnace, cut ring by ring and joined in a flame. Firozabad makes most of India's glass bangles.",
    details: ["12 colours, 2 of each", "Gold-dust finish", "Sizes 2.2 to 2.10", "Packed in a cloth roll"],
    hi: { name: "काँच की चूड़ियाँ, 24 का सेट", place: "फ़िरोज़ाबाद", spec: "हाथ से खींचा काँच · साइज़ 2.6", maker: "सुहाग नगर ग्लास वर्क्स",
      story: "भट्ठी पर पिघले काँच को खींचकर घुमावदार लच्छा बनाया जाता है, फिर एक-एक छल्ला काटकर लौ में जोड़ा जाता है। भारत की ज़्यादातर काँच की चूड़ियाँ फ़िरोज़ाबाद में बनती हैं।",
      details: ["12 रंग, हर रंग की 2", "सुनहरी चमक वाली फ़िनिश", "साइज़ 2.2 से 2.10", "कपड़े के रोल में पैक"] },
  },
  {
    id: 5, name: "Nakkashi Brass Wall Plate, 14 in", place: "Moradabad", district: "Moradabad", art: "brass", seed: 8,
    cat: "Glass & metal", spec: "Hand-engraved · 1.2 kg brass", tags: ["GI tag", "ODOP"],
    maker: "Peetal Nagri Engravers",
    story: "Moradabad is called Peetal Nagri, the brass city. Each petal on this plate is cut freehand with a chisel and a small hammer.",
    details: ["Solid brass, 1.2 kg", "Lacquered against tarnish", "Wall hook included", "Wipe with a dry cloth"],
    hi: { name: "नक्काशीदार पीतल की वॉल प्लेट, 14 इंच", place: "मुरादाबाद", spec: "हाथ से नक्काशी · 1.2 किलो पीतल", maker: "पीतल नगरी नक्काश",
      story: "मुरादाबाद को पीतल नगरी कहते हैं। इस प्लेट की हर पंखुड़ी छेनी और छोटी हथौड़ी से, बिना साँचे के, हाथ से उकेरी गई है।",
      details: ["ठोस पीतल, 1.2 किलो", "कालापन रोकने के लिए लैकर", "दीवार का हुक साथ में", "सूखे कपड़े से पोंछें"] },
  },
  {
    id: 6, name: "Ruh Gulab Attar, 10 ml", place: "Kannauj", district: "Kannauj", art: "attar", seed: 9,
    cat: "Attar", spec: "Deg-bhapka distilled · alcohol-free", tags: ["GI tag", "ODOP"],
    maker: "Kannauj Deg Distillers",
    story: "Fresh Kannauj roses are distilled in copper degs over a wood fire, and the vapour is caught in sandalwood oil. The method has barely changed in centuries.",
    details: ["Rose in sandalwood base", "Alcohol-free", "Cut-glass bottle with dipper", "Lasts 8 to 10 hours"],
    hi: { name: "रूह गुलाब इत्र, 10 मिली", place: "कन्नौज", spec: "डेग-भपका से खींचा · बिना अल्कोहल", maker: "कन्नौज डेग इत्र कारीगर",
      story: "कन्नौज के ताज़े गुलाबों को लकड़ी की आँच पर ताँबे की डेगों में पकाया जाता है, और उनकी भाप को चंदन के तेल में समेटा जाता है। यह तरीक़ा सदियों से लगभग वैसा ही है।",
      details: ["चंदन के तेल में गुलाब", "बिना अल्कोहल", "डिपर वाली कट-ग्लास शीशी", "8 से 10 घंटे तक महकता है"] },
  },
  {
    id: 7, name: "Black Pottery Vase", place: "Nizamabad, Azamgarh", district: "Azamgarh", art: "pottery", seed: 10,
    cat: "Clay, stone & wood", spec: "Kabiz clay · silver etching · 9 in", tags: ["GI tag", "ODOP"],
    maker: "Nizamabad Potters' Lane",
    story: "The pots are smoked in a sealed kiln to turn them jet black, then etched and filled with a silvery metal paste that shines against the black.",
    details: ["Hand-thrown local clay", "Smoke-fired black finish", "9 in tall", "Decorative use"],
    hi: { name: "काली मिट्टी का फूलदान", place: "निज़ामाबाद, आज़मगढ़", spec: "काबिज़ मिट्टी · चाँदी जैसी नक्काशी · 9 इंच", maker: "निज़ामाबाद कुम्हार गली",
      story: "बर्तनों को बंद भट्ठी में धुएँ से पकाकर गहरा काला किया जाता है, फिर उन पर नक्काशी करके चाँदी जैसा लेप भरा जाता है जो काले रंग पर चमकता है।",
      details: ["चाक पर बना, स्थानीय मिट्टी", "धुएँ में पकी काली फ़िनिश", "9 इंच ऊँचा", "सजावट के लिए"] },
  },
  {
    id: 8, name: "Parchinkari Marble Coasters, set of 4", place: "Agra", district: "Agra", art: "inlay", seed: 11,
    cat: "Clay, stone & wood", spec: "Makrana marble · stone inlay", tags: ["Artisan-direct"],
    maker: "Taj Ganj Inlay Workshop",
    story: "The same inlay craft as the Taj Mahal. Slivers of lapis, carnelian and malachite are cut on a hand-turned wheel and set into carved marble.",
    details: ["Makrana marble", "Semi-precious stone inlay", "4 in octagons", "Felt-backed"],
    hi: { name: "पच्चीकारी संगमरमर कोस्टर, 4 का सेट", place: "आगरा", spec: "मकराना संगमरमर · पत्थर की जड़ाई", maker: "ताजगंज जड़ाई कारख़ाना",
      story: "वही जड़ाई कला जो ताजमहल में है। लाजवर्द, अक़ीक़ और मैलाकाइट के बारीक टुकड़े हाथ से घुमाए पहिए पर काटे जाते हैं और तराशे हुए संगमरमर में जड़े जाते हैं।",
      details: ["मकराना संगमरमर", "क़ीमती पत्थरों की जड़ाई", "4 इंच के अष्टकोण", "नीचे फ़ेल्ट लगा"] },
  },
  {
    id: 9, name: "Sheesham Jali Jewellery Box", place: "Saharanpur", district: "Saharanpur", art: "wood", seed: 12,
    cat: "Clay, stone & wood", spec: "Hand-carved sheesham · brass hinges", tags: ["GI tag", "ODOP"],
    maker: "Saharanpur Woodcarvers Guild",
    story: "Saharanpur carvers cut jali lattices so fine that light falls through them in patterns. This box takes one carver about four days.",
    details: ["Seasoned sheesham wood", "Velvet-lined", "8 × 5 × 3 in", "Brass hinges and clasp"],
    hi: { name: "शीशम जाली ज्वेलरी बॉक्स", place: "सहारनपुर", spec: "हाथ से तराशा शीशम · पीतल के कब्ज़े", maker: "सहारनपुर काष्ठ शिल्पी संघ",
      story: "सहारनपुर के कारीगर इतनी बारीक जाली काटते हैं कि उससे छनकर आती रोशनी नक़्श बनाती है। इस बॉक्स को एक कारीगर लगभग चार दिन में बनाता है।",
      details: ["पकी हुई शीशम लकड़ी", "अंदर मख़मल की परत", "8 × 5 × 3 इंच", "पीतल के कब्ज़े और कुंडी"] },
  },
  {
    id: 10, name: "Zardozi Velvet Potli", place: "Bareilly", district: "Bareilly", art: "zardozi", seed: 13,
    cat: "Embroidery", spec: "Gold dabka & sequin work", tags: ["ODOP"],
    maker: "Bareilly Zardoz Karkhana",
    story: "Zardozi workers sit around a wooden adda frame, couching coiled gold dabka and sequins onto velvet one stitch at a time.",
    details: ["Silk velvet, midnight blue", "Dabka, nakshi and sequins", "Drawstring with tassels", "9 × 7 in"],
    hi: { name: "ज़रदोज़ी मख़मली पोटली", place: "बरेली", spec: "सुनहरा दबका और सितारा काम", maker: "बरेली ज़रदोज़ कारख़ाना",
      story: "ज़रदोज़ी कारीगर लकड़ी के अड्डे के चारों ओर बैठकर सुनहरा दबका और सितारे एक-एक टाँके से मख़मल पर टाँकते हैं।",
      details: ["सिल्क मख़मल, गहरा नीला", "दबका, नक्शी और सितारे", "फुँदनों वाली डोरी", "9 × 7 इंच"] },
  },
  {
    id: 11, name: "Cotton Dari, 4 × 6 ft", place: "Mirzapur", district: "Mirzapur", art: "dari", seed: 14,
    cat: "Carpets & dari", spec: "Panja-woven · reversible", tags: ["GI tag", "ODOP"],
    maker: "Mirzapur Dari Weavers",
    story: "Woven on a vertical loom and beaten tight with a metal panja comb, so it lies flat for decades and looks the same on both sides.",
    details: ["Heavy cotton", "Reversible", "Machine washable", "4 × 6 ft"],
    hi: { name: "सूती दरी, 4 × 6 फ़ुट", place: "मिर्ज़ापुर", spec: "पंजे से बुनी · दोनों तरफ़ इस्तेमाल", maker: "मिर्ज़ापुर दरी बुनकर",
      story: "खड़े करघे पर बुनी और लोहे के पंजे से कसकर ठोकी गई, इसलिए यह दशकों तक सपाट रहती है और दोनों तरफ़ से एक जैसी दिखती है।",
      details: ["मोटा सूती धागा", "दोनों तरफ़ इस्तेमाल करें", "मशीन में धो सकते हैं", "4 × 6 फ़ुट"] },
  },
  {
    id: 12, name: "Terracotta Horse, 12 in", place: "Aurangabad village, Gorakhpur", district: "Gorakhpur", art: "terracotta", seed: 15,
    cat: "Clay, stone & wood", spec: "Village clay · kiln-fired", tags: ["GI tag", "ODOP"],
    maker: "Aurangabad Terracotta Families",
    story: "Long-necked horses like this one are offered at village shrines. Each piece is shaped by hand, coated in red clay slip and fired in an open kiln.",
    details: ["Hand-shaped local clay", "Natural red slip", "12 in tall", "Indoor use"],
    hi: { name: "टेराकोटा घोड़ा, 12 इंच", place: "औरंगाबाद गाँव, गोरखपुर", spec: "गाँव की मिट्टी · भट्ठी में पका", maker: "औरंगाबाद टेराकोटा परिवार",
      story: "ऐसे लंबी गर्दन वाले घोड़े गाँव के देवस्थानों पर चढ़ाए जाते हैं। हर घोड़ा हाथ से गढ़ा जाता है, लाल मिट्टी के घोल से रँगा जाता है और खुली भट्ठी में पकाया जाता है।",
      details: ["हाथ से गढ़ी स्थानीय मिट्टी", "प्राकृतिक लाल रंगत", "12 इंच ऊँचा", "घर के अंदर रखने के लिए"] },
  },
];

export type Craft = {
  name: string; hindi: string; district: string; place: string; art: ArtKind; seed: number;
  fact: string; figure: string; figureLabel: string; filter: string;
  hi: { name: string; place: string; figure: string; figureLabel: string; fact: string };
};

export const ICONS: Craft[] = [
  { name: "Banarasi Silk", hindi: "बनारसी", district: "Varanasi", place: "Varanasi", art: "saree", seed: 21, figure: "21", figureLabel: "days on the loom for one saree", fact: "Silk and real zari, woven on pit looms in Madanpura and Peeli Kothi since the Mughal era.", filter: "Silk & sarees",
    hi: { name: "बनारसी सिल्क", place: "वाराणसी", figure: "21", figureLabel: "दिन करघे पर, एक साड़ी के लिए", fact: "सिल्क और असली ज़री, जो मुग़ल काल से मदनपुरा और पीली कोठी के गड्ढा करघों पर बुनी जाती है।" } },
  { name: "Hand-knotted Carpets", hindi: "क़ालीन", district: "Bhadohi", place: "Bhadohi & Mirzapur", art: "carpet", seed: 22, figure: "150", figureLabel: "knots in every square inch", fact: "India's carpet belt. Bhadohi rugs are shipped to homes all over the world.", filter: "Carpets & dari",
    hi: { name: "हाथ से बुने क़ालीन", place: "भदोही और मिर्ज़ापुर", figure: "150", figureLabel: "गाँठें हर वर्ग इंच में", fact: "भारत की क़ालीन पट्टी। भदोही के क़ालीन दुनिया भर के घरों तक पहुँचते हैं।" } },
  { name: "Chikankari", hindi: "चिकनकारी", district: "Lucknow", place: "Lucknow", art: "chikan", seed: 23, figure: "32", figureLabel: "named stitches in the craft", fact: "White-on-white shadow embroidery from the courts of Awadh, still stitched by hand in old Lucknow.", filter: "Embroidery",
    hi: { name: "चिकनकारी", place: "लखनऊ", figure: "32", figureLabel: "नाम वाले टाँके इस कला में", fact: "अवध के दरबारों से आई सफ़ेद पर सफ़ेद छाया-कढ़ाई, जो आज भी पुराने लखनऊ में हाथ से की जाती है।" } },
  { name: "Kaanch Bangles", hindi: "काँच की चूड़ियाँ", district: "Firozabad", place: "Firozabad", art: "bangles", seed: 24, figure: "1,000°C", figureLabel: "furnaces burning day and night", fact: "The glass city. Most glass bangles worn in India start as a molten coil here.", filter: "Glass & metal",
    hi: { name: "काँच की चूड़ियाँ", place: "फ़िरोज़ाबाद", figure: "1,000°C", figureLabel: "पर दिन-रात जलती भट्ठियाँ", fact: "सुहाग नगरी। भारत में पहनी जाने वाली ज़्यादातर काँच की चूड़ियाँ यहीं पिघले काँच के लच्छे से बनना शुरू होती हैं।" } },
  { name: "Brass Nakkashi", hindi: "नक्काशी", district: "Moradabad", place: "Moradabad", art: "brass", seed: 25, figure: "Peetal", figureLabel: "Nagri, the brass city", fact: "Freehand engraving on brass, exported to the world from Moradabad's lanes of metalworkers.", filter: "Glass & metal",
    hi: { name: "पीतल नक्काशी", place: "मुरादाबाद", figure: "पीतल", figureLabel: "नगरी, पीतल का शहर", fact: "पीतल पर हाथ से नक्काशी, जो मुरादाबाद की धातु कारीगरों की गलियों से दुनिया भर में जाती है।" } },
  { name: "Attar", hindi: "इत्र", district: "Kannauj", place: "Kannauj", art: "attar", seed: 26, figure: "100%", figureLabel: "natural oils, no alcohol", fact: "The perfume capital of India. Even the smell of first rain, mitti attar, is distilled here.", filter: "Attar",
    hi: { name: "इत्र", place: "कन्नौज", figure: "100%", figureLabel: "प्राकृतिक तेल, अल्कोहल नहीं", fact: "भारत की इत्र राजधानी। पहली बारिश की ख़ुशबू वाला मिट्टी इत्र भी यहीं बनता है।" } },
];
