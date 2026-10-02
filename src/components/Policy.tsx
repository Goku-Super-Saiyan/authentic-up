import { SITE, prettyPhone } from "../config";
import type { Page } from "../store";
import { useLang } from "../i18n";

// Draft policy pages. Have them checked by a lawyer or CA before launch; names and contacts come from config.
type Doc = { title: string; hindi: string; sections: [string, string[]][]; sectionsHi: [string, string[]][] };

const grievance = `Grievance officer: ${SITE.grievanceOfficer ? `${SITE.grievanceOfficer}, ` : ""}${SITE.name}, ${SITE.address}. Email ${SITE.email}${SITE.phone ? `, phone ${prettyPhone(SITE.phone)}` : ""}. We acknowledge complaints within 48 hours and resolve them within 30 days, as the Consumer Protection (E-Commerce) Rules, 2020 require.`;
const grievanceHi = `शिकायत अधिकारी: ${SITE.grievanceOfficer ? `${SITE.grievanceOfficer}, ` : ""}${SITE.name}, ${SITE.address}। ईमेल ${SITE.email}${SITE.phone ? `, फ़ोन ${prettyPhone(SITE.phone)}` : ""}। उपभोक्ता संरक्षण (ई-कॉमर्स) नियम, 2020 के अनुसार हम शिकायत 48 घंटे के अंदर स्वीकार करते हैं और 30 दिन के अंदर उसका निपटारा करते हैं।`;

export const POLICIES: Record<"privacy" | "terms" | "shipping" | "returns", Doc> = {
  privacy: {
    title: "Privacy policy", hindi: "गोपनीयता नीति",
    sections: [
      ["What we collect", ["Your name, phone number, email and delivery address when you order, enquire or sign up.", "Order details and messages you send us. Basic device and usage data to keep the site working and secure."]],
      ["Why we use it", ["To deliver your order, reply to your enquiry and keep you updated on it.", "To pass the delivery details a maker or courier needs to send your parcel. We never sell your data."]],
      ["Your rights", ["Under the Digital Personal Data Protection Act, 2023 you can ask to see, correct or delete your data, or withdraw consent, by writing to " + SITE.email + "."]],
      ["Storage and security", ["Data is stored with our hosting and database providers, encrypted in transit. We keep order records for as long as tax law requires, and other data only as long as needed."]],
      ["Contact", [grievance]],
    ],
    sectionsHi: [
      ["हम क्या जानकारी लेते हैं", ["ऑर्डर, पूछताछ या साइन अप करते समय आपका नाम, फ़ोन नंबर, ईमेल और डिलीवरी का पता।", "ऑर्डर की जानकारी और आपके भेजे संदेश। साइट को चालू और सुरक्षित रखने के लिए डिवाइस और इस्तेमाल से जुड़ी बुनियादी जानकारी।"]],
      ["हम इसका इस्तेमाल क्यों करते हैं", ["आपका ऑर्डर पहुँचाने, आपकी पूछताछ का जवाब देने और आपको उसकी जानकारी देते रहने के लिए।", "पार्सल भेजने के लिए कारीगर या कूरियर को डिलीवरी की ज़रूरी जानकारी देने के लिए। हम आपकी जानकारी कभी नहीं बेचते।"]],
      ["आपके अधिकार", ["डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम, 2023 के तहत आप " + SITE.email + " पर लिखकर अपनी जानकारी देखने, सुधारने या मिटाने, या अपनी सहमति वापस लेने का अनुरोध कर सकते हैं।"]],
      ["भंडारण और सुरक्षा", ["जानकारी हमारे होस्टिंग और डेटाबेस सेवा प्रदाताओं के पास रखी जाती है और भेजते समय एन्क्रिप्ट रहती है। ऑर्डर का रिकॉर्ड हम उतने समय तक रखते हैं जितना कर क़ानून के तहत ज़रूरी है, और बाक़ी जानकारी केवल ज़रूरत भर।"]],
      ["संपर्क", [grievanceHi]],
    ],
  },
  terms: {
    title: "Terms of use", hindi: "उपयोग की शर्तें",
    sections: [
      ["Who we are", [`${SITE.name} is a marketplace that connects buyers with artisans and makers across Uttar Pradesh. Each listing names its maker.`]],
      ["Listings and prices", ["Handmade pieces vary slightly in colour, size and finish, and that is part of their character. Prices are in Indian rupees and include GST unless stated."]],
      ["Orders", ["An order is confirmed once payment is received or a maker accepts it. If a piece turns out to be unavailable, we refund you in full."]],
      ["Sellers", ["Makers are responsible for the accuracy of their listings, GI-tag claims and the quality of what they send."]],
      ["Disputes", ["These terms follow the laws of India. Courts in Uttar Pradesh have jurisdiction.", grievance]],
    ],
    sectionsHi: [
      ["हम कौन हैं", [`${SITE.name} एक बाज़ार है जो ख़रीदारों को पूरे उत्तर प्रदेश के कारीगरों और निर्माताओं से जोड़ता है। हर चीज़ के साथ उसके बनाने वाले का नाम दिया जाता है।`]],
      ["सामान और दाम", ["हाथ से बनी चीज़ों के रंग, आकार और फ़िनिश में थोड़ा फ़र्क़ हो सकता है, और यही उनकी ख़ासियत है। दाम भारतीय रुपये में हैं और जब तक अलग से न लिखा हो, उनमें जीएसटी शामिल है।"]],
      ["ऑर्डर", ["भुगतान मिलने पर या कारीगर के ऑर्डर स्वीकार करने पर ऑर्डर पक्का होता है। अगर कोई चीज़ उपलब्ध न हो, तो हम पूरा पैसा वापस करते हैं।"]],
      ["विक्रेता", ["अपनी लिस्टिंग की सही जानकारी, जीआई टैग के दावों और भेजे गए सामान की गुणवत्ता की ज़िम्मेदारी कारीगरों की है।"]],
      ["विवाद", ["ये शर्तें भारत के क़ानूनों के अधीन हैं। इनसे जुड़े मामलों में उत्तर प्रदेश की अदालतों का क्षेत्राधिकार है।", grievanceHi]],
    ],
  },
  shipping: {
    title: "Shipping policy", hindi: "शिपिंग नीति",
    sections: [
      ["Where we ship", ["Across India. International shipping is handled case by case through an enquiry."]],
      ["When it leaves", ["Ready pieces ship within 2 to 5 working days. Made-to-order pieces such as sarees and carpets show their making time on the listing."]],
      ["Delivery", ["Most parcels arrive in 3 to 8 working days after dispatch. You get a tracking link by SMS or WhatsApp."]],
      ["Charges", ["Shipping is shown at checkout before you pay."]],
    ],
    sectionsHi: [
      ["हम कहाँ भेजते हैं", ["पूरे भारत में। विदेश भेजने के मामले पूछताछ के ज़रिए अलग-अलग तय किए जाते हैं।"]],
      ["सामान कब निकलता है", ["तैयार चीज़ें 2 से 5 कामकाजी दिनों में भेज दी जाती हैं। ऑर्डर पर बनने वाली चीज़ों, जैसे साड़ियों और क़ालीनों, के बनने का समय उनकी लिस्टिंग पर लिखा होता है।"]],
      ["डिलीवरी", ["ज़्यादातर पार्सल भेजे जाने के 3 से 8 कामकाजी दिनों में पहुँच जाते हैं। आपको SMS या व्हाट्सऐप पर ट्रैकिंग लिंक मिलता है।"]],
      ["शुल्क", ["शिपिंग का ख़र्च भुगतान से पहले चेकआउट पर दिखाया जाता है।"]],
    ],
  },
  returns: {
    title: "Returns and refunds", hindi: "वापसी और धनवापसी",
    sections: [
      ["Returns", ["You can return a piece within 7 days of delivery if it arrives damaged, defective or different from the listing. Send photos to " + SITE.email + " or on WhatsApp."]],
      ["What can't be returned", ["Custom and made-to-order pieces, attar once opened, and items that have been used or altered, unless they arrived damaged."]],
      ["Refunds", ["Once the return is received and checked, we refund to your original payment method within 7 working days."]],
      ["Cancellations", ["You can cancel any order before it ships, for a full refund."]],
    ],
    sectionsHi: [
      ["वापसी", ["अगर कोई चीज़ टूटी, ख़राब या लिस्टिंग से अलग पहुँचे, तो आप डिलीवरी के 7 दिन के अंदर उसे वापस कर सकते हैं। तस्वीरें " + SITE.email + " पर या व्हाट्सऐप पर भेजें।"]],
      ["क्या वापस नहीं होगा", ["आपकी पसंद से या ऑर्डर पर बनी चीज़ें, खुल चुका इत्र, और इस्तेमाल की गई या बदली गई चीज़ें, जब तक वे टूटी हुई न पहुँची हों।"]],
      ["रिफ़ंड", ["वापस आया सामान मिलने और जाँचने के बाद, हम 7 कामकाजी दिनों के अंदर उसी तरीक़े से पैसा लौटाते हैं जिससे आपने भुगतान किया था।"]],
      ["ऑर्डर रद्द करना", ["सामान भेजे जाने से पहले आप कोई भी ऑर्डर रद्द कर सकते हैं, और आपको पूरा पैसा वापस मिलेगा।"]],
    ],
  },
};

export const isPolicy = (p: Page): p is keyof typeof POLICIES => p in POLICIES;

export default function Policy({ which }: { which: keyof typeof POLICIES }) {
  const doc = POLICIES[which];
  const { lang } = useLang();
  const hi = lang === "hi";
  return (
    <section className="mx-auto max-w-[820px] px-4 pb-24 pt-[calc(64px+clamp(40px,6vw,80px))] sm:px-8">
      <p className="text-base font-semibold text-marigold">{hi ? doc.title : doc.hindi}</p>
      <h1 className="mt-4 font-display text-[clamp(40px,6vw,72px)] leading-[0.95]">{hi ? doc.hindi : doc.title}</h1>
      <p className="mt-4 text-sm text-ivory/50">{hi ? "पिछला बदलाव: अक्टूबर 2026। यह हिंदी अनुवाद सुविधा के लिए है; किसी अंतर की स्थिति में अंग्रेज़ी संस्करण मान्य होगा।" : "Last updated October 2026"}</p>
      <div className="mt-10 grid gap-8">
        {(hi ? doc.sectionsHi : doc.sections).map(([h, ps]) => (
          <div key={h}>
            <h2 className="font-display text-2xl text-zari">{h}</h2>
            {ps.map((t) => <p key={t} className="mt-2 leading-relaxed text-ivory/80">{t}</p>)}
          </div>
        ))}
      </div>
    </section>
  );
}
