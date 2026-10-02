// Business details shown on the site. Set these as VITE_ variables in Vercel (see .env.example);
// the fallbacks are used when a variable isn't set.
import { BRAND } from "./brand/brand";

const env = import.meta.env;

export const SITE = {
  name: env.VITE_BUSINESS_NAME || BRAND.name,
  email: env.VITE_CONTACT_EMAIL || `hello@${BRAND.domain}`,
  // Digits only, with country code, e.g. 919876543210
  whatsapp: (env.VITE_WHATSAPP || "").replace(/\D/g, ""),
  phone: (env.VITE_PHONE || env.VITE_WHATSAPP || "").replace(/[^\d+]/g, ""),
  address: env.VITE_BUSINESS_ADDRESS || "Varanasi, Uttar Pradesh, India",
  grievanceOfficer: env.VITE_GRIEVANCE_OFFICER || "",
};

export const waLink = (text: string) => SITE.whatsapp ? `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}` : null;
export const telLink = () => (SITE.phone ? `tel:${SITE.phone.startsWith("+") ? SITE.phone : "+" + SITE.phone}` : null);

// "+919953777899" -> "+91 99537 77899", for showing the number to people.
export const prettyPhone = (n: string) => {
  const d = n.replace(/\D/g, "");
  return d.length === 12 && d.startsWith("91") ? `+91 ${d.slice(2, 7)} ${d.slice(7)}` : n.startsWith("+") ? n : "+" + n;
};
