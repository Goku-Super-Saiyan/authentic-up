// The 75 districts of Uttar Pradesh with their One District One Product (ODOP) item.
// Coordinates are approximate district headquarters, used to place dots on the craft map.

export type OdopCat = "weave" | "craft" | "make" | "food";
export const ODOP_CATS: Record<OdopCat, { label: string; color: string }> = {
  weave: { label: "Textiles & weaves", color: "#F0568C" },
  craft: { label: "Handicrafts", color: "#FFB627" },
  make: { label: "Metal, leather & industry", color: "#7FA7FF" },
  food: { label: "Food & fragrance", color: "#5FD39B" },
};

export type District = { name: string; product: string; cat: OdopCat; lat: number; lon: number };

const raw: [string, string, OdopCat, number, number][] = [
  ["Agra", "Leather products", "make", 27.18, 78.01],
  ["Aligarh", "Locks and hardware", "make", 27.88, 78.08],
  ["Ambedkar Nagar", "Textile products", "weave", 26.43, 82.54],
  ["Amethi", "Moonj products", "craft", 26.15, 81.81],
  ["Amroha", "Musical instruments", "craft", 28.9, 78.47],
  ["Auraiya", "Desi ghee", "food", 26.47, 79.51],
  ["Ayodhya", "Jaggery", "food", 26.79, 82.2],
  ["Azamgarh", "Black pottery", "craft", 26.07, 83.18],
  ["Baghpat", "Home furnishing", "weave", 28.94, 77.22],
  ["Bahraich", "Wheat-stalk handicraft", "craft", 27.57, 81.6],
  ["Ballia", "Bindi", "craft", 25.76, 84.15],
  ["Balrampur", "Pulses", "food", 27.43, 82.18],
  ["Banda", "Shajar stone craft", "craft", 25.48, 80.33],
  ["Barabanki", "Handloom", "weave", 26.93, 81.19],
  ["Bareilly", "Zari zardozi", "weave", 28.37, 79.43],
  ["Basti", "Wood craft", "craft", 26.8, 82.73],
  ["Bhadohi", "Carpets", "weave", 25.4, 82.57],
  ["Bijnor", "Wood craft", "craft", 29.37, 78.14],
  ["Budaun", "Zari zardozi", "weave", 28.04, 79.13],
  ["Bulandshahr", "Khurja ceramics", "craft", 28.41, 77.85],
  ["Chandauli", "Zari zardozi", "weave", 25.27, 83.27],
  ["Chitrakoot", "Wooden toys", "craft", 25.2, 80.9],
  ["Deoria", "Decorative products", "craft", 26.5, 83.78],
  ["Etah", "Ghungroo, bells and brass", "make", 27.56, 78.66],
  ["Etawah", "Textile products", "weave", 26.78, 79.02],
  ["Farrukhabad", "Textile printing", "weave", 27.39, 79.58],
  ["Fatehpur", "Bedsheets", "weave", 25.93, 80.81],
  ["Firozabad", "Glassware", "make", 27.15, 78.4],
  ["Gautam Buddha Nagar", "Readymade garments", "weave", 28.47, 77.51],
  ["Ghaziabad", "Engineering goods", "make", 28.67, 77.45],
  ["Ghazipur", "Jute wall hangings", "craft", 25.58, 83.58],
  ["Gonda", "Pulses", "food", 27.13, 81.96],
  ["Gorakhpur", "Terracotta", "craft", 26.76, 83.37],
  ["Hamirpur", "Footwear", "make", 25.95, 80.15],
  ["Hapur", "Home furnishing", "weave", 28.73, 77.78],
  ["Hardoi", "Handloom", "weave", 27.4, 80.13],
  ["Hathras", "Hing (asafoetida)", "food", 27.6, 78.05],
  ["Jalaun", "Handmade paper", "craft", 26.14, 79.33],
  ["Jaunpur", "Woollen durries", "weave", 25.75, 82.69],
  ["Jhansi", "Soft toys", "craft", 25.45, 78.57],
  ["Kannauj", "Attar and perfume", "food", 27.05, 79.92],
  ["Kanpur Dehat", "Aluminium utensils", "make", 26.43, 79.95],
  ["Kanpur Nagar", "Leather products", "make", 26.45, 80.33],
  ["Kasganj", "Zari zardozi", "weave", 27.81, 78.65],
  ["Kaushambi", "Banana products", "food", 25.53, 81.38],
  ["Kushinagar", "Banana fibre products", "craft", 26.74, 83.89],
  ["Lakhimpur Kheri", "Tharu tribal crafts", "craft", 27.95, 80.78],
  ["Lalitpur", "Zari silk sarees", "weave", 24.69, 78.41],
  ["Lucknow", "Chikankari", "weave", 26.85, 80.95],
  ["Maharajganj", "Furniture", "craft", 27.13, 83.56],
  ["Mahoba", "Gaura stone craft", "craft", 25.29, 79.87],
  ["Mainpuri", "Tarkashi art", "craft", 27.23, 79.02],
  ["Mathura", "Sanitary fittings", "make", 27.49, 77.67],
  ["Mau", "Powerloom textiles", "weave", 25.94, 83.56],
  ["Meerut", "Sports goods", "make", 28.98, 77.71],
  ["Mirzapur", "Carpets and dari", "weave", 25.15, 82.57],
  ["Moradabad", "Metal craft", "make", 28.84, 78.77],
  ["Muzaffarnagar", "Jaggery", "food", 29.47, 77.7],
  ["Pilibhit", "Bansuri (flute)", "craft", 28.63, 79.8],
  ["Pratapgarh", "Amla products", "food", 25.9, 81.94],
  ["Prayagraj", "Moonj products", "craft", 25.44, 81.85],
  ["Raebareli", "Wood work", "craft", 26.23, 81.23],
  ["Rampur", "Applique and patchwork", "weave", 28.8, 79.03],
  ["Saharanpur", "Wood carving", "craft", 29.97, 77.55],
  ["Sambhal", "Horn and bone craft", "craft", 28.58, 78.57],
  ["Sant Kabir Nagar", "Brassware", "make", 26.77, 83.03],
  ["Shahjahanpur", "Carpets", "weave", 27.88, 79.91],
  ["Shamli", "Iron rims and axles", "make", 29.45, 77.31],
  ["Shravasti", "Tribal crafts", "craft", 27.51, 82.05],
  ["Siddharthnagar", "Kala namak rice", "food", 27.29, 83.1],
  ["Sitapur", "Durries", "weave", 27.57, 80.68],
  ["Sonbhadra", "Carpets", "weave", 24.69, 83.07],
  ["Sultanpur", "Moonj products", "craft", 26.26, 82.07],
  ["Unnao", "Zari zardozi", "weave", 26.55, 80.49],
  ["Varanasi", "Banarasi silk sarees", "weave", 25.32, 82.97],
];

export const DISTRICTS: District[] = raw.map(([name, product, cat, lat, lon]) => ({ name, product, cat, lat, lon }));

// Districts whose names stay labelled on the map.
export const LANDMARKS = ["Varanasi", "Lucknow", "Agra", "Prayagraj", "Kanpur Nagar", "Bhadohi", "Kannauj", "Firozabad", "Moradabad", "Gorakhpur", "Meerut", "Jhansi", "Saharanpur", "Bareilly", "Mathura"];

// River courses through the state, as [lat, lon] points.
export const RIVERS: { name: string; points: [number, number][] }[] = [
  { name: "Ganga", points: [[29.9, 78.12], [29.37, 78.14], [28.79, 78.1], [28.2, 78.38], [27.6, 79.2], [27.05, 79.92], [26.45, 80.33], [25.95, 80.95], [25.6, 81.4], [25.44, 81.85], [25.2, 82.3], [25.15, 82.57], [25.32, 82.97], [25.5, 83.3], [25.58, 83.58], [25.76, 84.15], [25.72, 84.6]] },
  { name: "Yamuna", points: [[30.3, 77.55], [29.45, 77.18], [28.94, 77.22], [28.55, 77.32], [28.0, 77.55], [27.49, 77.67], [27.18, 78.01], [26.95, 78.6], [26.78, 79.02], [26.45, 79.55], [25.95, 80.15], [25.6, 81.1], [25.44, 81.85]] },
  { name: "Gomti", points: [[28.63, 80.05], [27.95, 80.5], [27.35, 80.7], [26.85, 80.95], [26.5, 81.6], [26.26, 82.07], [25.75, 82.69], [25.5, 83.15]] },
  { name: "Ghaghara", points: [[28.4, 80.95], [27.8, 81.3], [27.3, 81.7], [26.95, 82.1], [26.79, 82.2], [26.6, 82.8], [26.3, 83.5], [25.95, 84.05], [25.75, 84.5]] },
];
