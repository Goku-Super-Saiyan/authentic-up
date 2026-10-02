import { SITE, prettyPhone } from "../config";
import type { Page } from "../store";

// Draft policy pages. Have them checked by a lawyer or CA before launch; names and contacts come from config.
type Doc = { title: string; hindi: string; sections: [string, string[]][] };

const grievance = `Grievance officer: ${SITE.grievanceOfficer ? `${SITE.grievanceOfficer}, ` : ""}${SITE.name}, ${SITE.address}. Email ${SITE.email}${SITE.phone ? `, phone ${prettyPhone(SITE.phone)}` : ""}. We acknowledge complaints within 48 hours and resolve them within 30 days, as the Consumer Protection (E-Commerce) Rules, 2020 require.`;

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
  },
  shipping: {
    title: "Shipping policy", hindi: "शिपिंग नीति",
    sections: [
      ["Where we ship", ["Across India. International shipping is handled case by case through an enquiry."]],
      ["When it leaves", ["Ready pieces ship within 2 to 5 working days. Made-to-order pieces such as sarees and carpets show their making time on the listing."]],
      ["Delivery", ["Most parcels arrive in 3 to 8 working days after dispatch. You get a tracking link by SMS or WhatsApp."]],
      ["Charges", ["Shipping is shown at checkout before you pay."]],
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
  },
};

export const isPolicy = (p: Page): p is keyof typeof POLICIES => p in POLICIES;

export default function Policy({ which }: { which: keyof typeof POLICIES }) {
  const doc = POLICIES[which];
  return (
    <section className="mx-auto max-w-[820px] px-4 pb-24 pt-[calc(64px+clamp(40px,6vw,80px))] sm:px-8">
      <p className="text-base font-semibold text-marigold">{doc.hindi}</p>
      <h1 className="mt-4 font-display text-[clamp(40px,6vw,72px)] leading-[0.95]">{doc.title}</h1>
      <p className="mt-4 text-sm text-ivory/50">Last updated October 2026</p>
      <div className="mt-10 grid gap-8">
        {doc.sections.map(([h, ps]) => (
          <div key={h}>
            <h2 className="font-display text-2xl text-zari">{h}</h2>
            {ps.map((t) => <p key={t} className="mt-2 leading-relaxed text-ivory/80">{t}</p>)}
          </div>
        ))}
      </div>
    </section>
  );
}
