// Craft guide pages for search: one page per famous craft of Uttar Pradesh, plus the ODOP list.
// Built as plain HTML by seo.ts (no JavaScript needed), so every search engine can read them.

export type CraftPage = {
  slug: string;
  name: string; // what people search for
  hindi: string;
  place: string;
  title: string; // <title>, about 60 characters
  description: string; // meta description, about 155 characters
  intro: string[];
  marks: [string, string][]; // what to look for: heading, text
  kinds?: string[];
  gi: string; // the GI registration the craft carries
};

export const CRAFT_PAGES: CraftPage[] = [
  {
    slug: "banarasi-sarees", name: "Banarasi silk sarees", hindi: "बनारसी साड़ी", place: "Varanasi",
    title: "Banarasi Silk Sarees, Handloom from Varanasi Weavers",
    description: "Buy real handloom Banarasi silk sarees direct from weaving families in Varanasi: katan, kadhua, tanchoi, jangla and organza, with zari brocade and GI tag.",
    intro: [
      "A Banarasi saree is woven in and around Varanasi, on handlooms that the same families have worked for generations. The brocade pattern is not printed or embroidered on top: it is woven into the cloth thread by thread, with silk and zari, as the saree grows on the loom.",
      "A plain butidar saree can come off the loom in a couple of weeks. A heavy kadhua piece, where every motif is woven separately by hand, can take a month or more. That time is what you are paying for, and it is why a real handloom Banarasi lasts for generations.",
    ],
    kinds: ["Katan: pure silk warp and weft, the classic wedding Banarasi", "Kadhua: each motif woven individually, the most labour-intensive", "Tanchoi: dense, all-over patterns woven with extra silk weft", "Jangla: rich, spreading floral vines across the body", "Organza (kora): sheer and light, with zari motifs", "Butidar: small motifs scattered across the saree"],
    marks: [
      ["Floats on the back", "Turn the saree over. On a handloom kadhua the back is neat; on a cutwork or fekua saree you will see loose threads cut between motifs. A completely flat, printed-looking back is a warning sign."],
      ["Small irregularities", "Hand weaving leaves tiny variations in the motifs. Perfectly identical motifs across the whole saree usually point to a powerloom."],
      ["The zari", "Real silver or tested zari has a soft sheen and weight. Plastic-based metallic thread is shiny but stiff and light."],
      ["GI tag and handloom mark", "Banarasi brocades and sarees carry a Geographical Indication. Ask for the GI and handloom marks and the weaver's name."],
    ],
    gi: "Banaras Brocades and Sarees",
  },
  {
    slug: "bhadohi-carpets", name: "Bhadohi hand-knotted carpets", hindi: "भदोही क़ालीन", place: "Bhadohi and Mirzapur",
    title: "Bhadohi Hand-Knotted Carpets & Rugs, Direct from Weavers",
    description: "Hand-knotted wool and silk carpets, rugs and durries from Bhadohi and Mirzapur, India's carpet belt. Made to size, direct from the weaving families.",
    intro: [
      "Bhadohi, with neighbouring Mirzapur and Varanasi, is India's carpet belt. Most of the hand-knotted carpets India sends to the world are made in the villages here, on upright looms where weavers tie every knot by hand.",
      "A hand-knotted carpet is built knot by knot and row by row, then washed, clipped and stretched. Depending on size and knot density, one carpet keeps a loom busy for weeks or months. Made well, it lasts for decades and only gets softer with use.",
    ],
    kinds: ["Hand-knotted wool carpets in Persian, Indo-Gabbeh and modern designs", "Wool and silk carpets with a sheen in the pattern", "Flat-woven durries and kilims from Mirzapur and nearby districts", "Made-to-size pieces in your colours"],
    marks: [
      ["Look at the back", "On a hand-knotted carpet the pattern shows clearly on the back, with small irregular knots. A canvas or latex backing means hand-tufted, not hand-knotted."],
      ["Fringe", "On hand-knotted carpets the fringe is the warp itself, running through the carpet. A fringe sewn on separately is a sign of a tufted or machine piece."],
      ["Knot density", "More knots per square inch means finer detail and a longer making time. Ask the weaver for the knot count and the wool used."],
      ["GI tag", "Bhadohi hand-made carpets carry a Geographical Indication covering the carpet belt districts."],
    ],
    gi: "Bhadohi Handmade Carpet",
  },
  {
    slug: "lucknow-chikankari", name: "Lucknow chikankari", hindi: "लखनवी चिकनकारी", place: "Lucknow",
    title: "Lucknow Chikankari Kurtas, Sarees & Suits, Hand Embroidered",
    description: "Hand-embroidered Lucknow chikankari kurtas, sarees, suits and dupattas, made by artisans in and around Lucknow. Shadow work, phanda, murri and jaali.",
    intro: [
      "Chikankari is the white-on-white embroidery of Lucknow, worked by hand on fine cotton, muslin, georgette and chiffon. Thousands of artisans, most of them women working at home in the villages around Lucknow, carry the craft today.",
      "The design is first block-printed on the cloth in a washable colour. The embroiderer follows it stitch by stitch, then the piece is washed so only the needlework remains. A detailed kurta can take weeks of handwork.",
    ],
    kinds: ["Bakhiya: shadow work stitched from the back, glowing through the cloth", "Phanda and murri: tiny knotted stitches that form flowers", "Jaali: threads teased apart into a net, without cutting the cloth", "Kurtas, sarees, suits, dupattas and men's wear"],
    marks: [
      ["The back of the work", "Hand chikankari has small, slightly uneven stitches and knots on the back. Machine work looks identical everywhere, with a continuous thread."],
      ["Leftover outline", "Faint traces of the printed outline are normal on hand pieces before the first wash."],
      ["Fine fabric", "Traditional chikan is worked on light, breathable fabric. Heavy synthetic cloth with chikan-style print is not chikankari."],
      ["GI tag", "Lucknow chikan craft carries a Geographical Indication."],
    ],
    gi: "Lucknow Chikan Craft",
  },
  {
    slug: "moradabad-brass", name: "Moradabad brass and metal craft", hindi: "मुरादाबाद का पीतल", place: "Moradabad",
    title: "Moradabad Brass & Metal Handicrafts, Direct from Artisans",
    description: "Hand-engraved brass and metal craft from Moradabad, the Peetal Nagri: vases, lamps, puja items, trays and decor, direct from artisan workshops.",
    intro: [
      "Moradabad is known across India as Peetal Nagri, the city of brass. Its workshops cast, hammer and engrave brass, copper and other metals into vases, lamps, puja items, trays and decor sold around the world.",
      "The finest pieces are engraved by hand with a hammer and chisel, a craft called nakkashi, and some are finished with coloured enamel. Metal craft is Moradabad's One District One Product.",
    ],
    marks: [
      ["Hand engraving", "Hand-chased lines vary slightly in depth and width. Machine-etched patterns are shallow and perfectly even."],
      ["Weight", "Solid brass is heavy for its size. A light piece may be plated iron or aluminium."],
      ["Ageing", "Real brass darkens with time and polishes back to gold with tamarind or lemon."],
      ["GI tag", "Moradabad metal craft carries a Geographical Indication."],
    ],
    gi: "Moradabad Metal Craft",
  },
  {
    slug: "firozabad-glass", name: "Firozabad glass", hindi: "फ़िरोज़ाबाद का काँच", place: "Firozabad",
    title: "Firozabad Glass Bangles & Glassware, from the City of Glass",
    description: "Glass bangles, glassware, lamps and decor from Firozabad, Uttar Pradesh's city of glass, made in its traditional furnaces and finished by hand.",
    intro: [
      "Firozabad is called Suhag Nagri for the glass bangles it makes for brides across India. Its furnaces also turn out glassware, lamps, chandeliers and decorative pieces.",
      "Bangles are drawn from molten glass, joined, then decorated by hand by families who work from home. Glassware is Firozabad's One District One Product.",
    ],
    marks: [
      ["Hand finish", "Hand-decorated bangles show small differences in painting and stone setting from one to the next."],
      ["Clear joins", "A well-made bangle has a smooth, even join that you can barely feel."],
      ["GI tag", "Firozabad glass carries a Geographical Indication."],
    ],
    gi: "Firozabad Glass",
  },
  {
    slug: "kannauj-attar", name: "Kannauj attar", hindi: "क़न्नौज का इत्र", place: "Kannauj",
    title: "Kannauj Attar, Natural Perfume Oils Distilled the Old Way",
    description: "Natural attar from Kannauj, India's perfume capital: rose, mitti, kewda, khus and more, distilled in copper degs into sandalwood oil.",
    intro: [
      "Kannauj has distilled attar for centuries. Flowers, herbs or baked earth are heated in copper stills called degs, and the fragrant vapour is drawn through bamboo pipes into a bhapka filled with sandalwood oil, which slowly takes on the scent.",
      "Mitti attar, made from baked clay, captures the smell of first rain on dry earth. Attar is alcohol-free and lasts for hours on the skin. Perfume is Kannauj's One District One Product.",
    ],
    kinds: ["Rose (gulab) and ruh gulab", "Mitti, the smell of first rain", "Kewda, khus (vetiver), mogra and hina", "Shamama and other blended attars"],
    marks: [
      ["No alcohol", "A real attar is an oil. It should not smell of spirit or evaporate instantly."],
      ["Base oil", "Traditional attar uses sandalwood oil as its base. Ask what base the maker uses."],
      ["GI tag", "Kannauj perfume carries a Geographical Indication."],
    ],
    gi: "Kannauj Perfume",
  },
  {
    slug: "nizamabad-black-pottery", name: "Nizamabad black pottery", hindi: "निज़ामाबाद की काली मिट्टी", place: "Azamgarh",
    title: "Nizamabad Black Clay Pottery from Azamgarh, Handmade",
    description: "Handmade black clay pottery from Nizamabad, Azamgarh: glossy black vases, plates and decor with etched silvery patterns, direct from potter families.",
    intro: [
      "In Nizamabad, a small town in Azamgarh district, potters make a glossy black pottery found nowhere else. Pieces are shaped on the wheel, coated with a fine clay slip, rubbed with oil and fired in a closed, smoky kiln, which turns them deep black.",
      "Patterns are then etched into the surface and filled with a silvery pigment, so the designs shine against the black. Black pottery is Azamgarh's One District One Product.",
    ],
    marks: [
      ["Even black", "The colour comes from the firing, not paint, so it should not flake or scratch off."],
      ["Hand-etched lines", "Patterns are cut by hand and vary slightly from piece to piece."],
      ["GI tag", "Nizamabad black clay pottery carries a Geographical Indication."],
    ],
    gi: "Nizamabad Black Clay Pottery",
  },
  {
    slug: "saharanpur-wood-carving", name: "Saharanpur wood carving", hindi: "सहारनपुर की नक़्क़ाशी", place: "Saharanpur",
    title: "Saharanpur Wood Carving, Hand-Carved Sheesham Furniture & Decor",
    description: "Hand-carved sheesham wood furniture, boxes and decor from Saharanpur, Uttar Pradesh's wood carving centre, direct from the carvers' workshops.",
    intro: [
      "Saharanpur is Uttar Pradesh's wood carving centre. Its carvers work mostly in sheesham (Indian rosewood), cutting deep floral and geometric patterns into furniture, screens, boxes and decor.",
      "Some pieces are inlaid with brass or bone. Wood craft is Saharanpur's One District One Product.",
    ],
    marks: [
      ["Depth and crispness", "Hand carving has depth and sharp edges, with small tool marks. Moulded or machine-routed patterns look soft and repetitive."],
      ["Solid wood", "Check the edges and back: solid sheesham shows its grain all the way through, not a veneer."],
      ["GI tag", "Saharanpur wood craft carries a Geographical Indication."],
    ],
    gi: "Saharanpur Wood Craft",
  },
];

export const ODOP_INTRO = [
  "One District One Product (ODOP) is a Government of Uttar Pradesh programme, started in 2018, that picks one traditional product or craft for each of the state's 75 districts and helps its makers with training, finance and markets.",
  "The list below is the ODOP product of every district. Tell us what you are looking for, and we will connect you with makers from that district.",
];
