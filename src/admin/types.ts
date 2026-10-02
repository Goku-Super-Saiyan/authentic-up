// Rows as the admin API returns them from Supabase.
export type Enquiry = {
  id: string; reference: string; kind: string; name: string; email: string; phone: string | null; craft: string | null;
  district: string | null; quantity: string | null; budget: string | null; message: string; status: EnquiryStatus; notes?: string | null; created_at: string;
};
export type EnquiryStatus = "new" | "in_progress" | "replied" | "closed";

export type OrderItem = { id: string | number; name: string; place?: string; qty: number; price: number };
export type Order = {
  id: string; reference: string; name: string; phone: string | null; email: string | null; address: string | null; pincode: string | null;
  total_inr: number; status: OrderStatus; payment_ref: string | null; items?: OrderItem[]; notes?: string | null; customer_id?: string | null; created_at: string;
};
export type OrderStatus = "pending" | "confirmed" | "paid" | "packed" | "shipped" | "delivered" | "cancelled";

export type ProductRow = {
  id: string; slug: string; name: string; maker_id: string | null; district: string; place?: string | null; category: string; price_inr: number; stock: number;
  spec: string | null; story: string | null; details: string[]; tags: string[]; photos: string[]; active: boolean; featured?: boolean; created_at: string; updated_at?: string;
};
export type Maker = { id: string; name: string; district: string; craft: string; phone: string | null; email: string | null; gi_tag: boolean; verified: boolean; created_at: string };
export type Customer = { id: string; auth_id: string | null; name: string | null; email: string | null; phone: string | null; role: "shopper" | "artisan"; created_at: string; last_login_at: string };

export type Data = { me: string; enquiries: Enquiry[]; orders: Order[]; products: ProductRow[]; makers: Maker[]; customers: Customer[]; missing: string[] };
export type Table = "enquiries" | "orders" | "products" | "makers" | "customers";

export const ENQUIRY_STATUS: Record<EnquiryStatus, { label: string; tone: Tone }> = {
  new: { label: "New", tone: "sindoor" }, in_progress: { label: "In progress", tone: "marigold" }, replied: { label: "Replied", tone: "ganga" }, closed: { label: "Closed", tone: "mist" },
};
export const ORDER_FLOW: OrderStatus[] = ["pending", "confirmed", "paid", "packed", "shipped", "delivered"];
export const ORDER_STATUS: Record<OrderStatus, { label: string; tone: Tone }> = {
  pending: { label: "Pending", tone: "sindoor" }, confirmed: { label: "Confirmed", tone: "marigold" }, paid: { label: "Paid", tone: "zari" },
  packed: { label: "Packed", tone: "ganga" }, shipped: { label: "Shipped", tone: "ganga" }, delivered: { label: "Delivered", tone: "jade" }, cancelled: { label: "Cancelled", tone: "mist" },
};
export type Tone = "zari" | "sindoor" | "marigold" | "ganga" | "mist" | "jade";
export const TONE: Record<Tone, string> = { zari: "#E7BE63", sindoor: "#F0445A", marigold: "#FFB627", ganga: "#49B3C2", mist: "#B7A8CF", jade: "#5FD39B" };
