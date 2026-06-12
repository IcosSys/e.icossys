// ─── Shared Admin Types ───────────────────────────────────────────────────

export type StripeMode = "test" | "live";

export interface StripeStatus {
  connected: boolean;
  mode: StripeMode;
  testKey: boolean;
  liveKey: boolean;
  lastFour?: string;
  keyType: "test" | "live" | null;
}

export interface Order {
  id: string;
  amount: number;
  amountSubtotal: number | null;
  amountShipping: number | null;
  currency: string;
  status: string;
  customerEmail: string | null;
  customerName: string | null;
  paymentStatus: string;
  orderStatus: string;
  created: number;
  productName: string | null;
  shippingCity: string | null;
  shippingCountry: string | null;
  shippingName: string | null;
  shippingMethod: string | null;
  trackingNumber: string | null;
  // Live tracking from AfterShip
  trackTag: string | null;
  trackLabel: string | null;
  trackBg: string | null;
  trackColor: string | null;
  trackLastUpdate: string | null;
}

export interface TrackingCheckpoint {
  time: string;
  location: string;
  tag: string;
  message: string;
}

export interface TrackingData {
  tag: string;
  label: string;
  color: string;
  bg: string;
  lastUpdate: string;
  checkpoints: TrackingCheckpoint[];
  signedBy: string | null;
}

export interface OrderDetail extends Order {
  customerPhone: string | null;
  shippingAddress: {
    line1: string | null; line2: string | null; city: string | null;
    state: string | null; postalCode: string | null; country: string | null;
  } | null;
  billingAddress: {
    line1: string | null; line2: string | null; city: string | null;
    state: string | null; postalCode: string | null; country: string | null;
  } | null;
  unitPrice: number | null;
  quantity: number | null;
}

export interface Notification {
  id: string;
  customerName: string | null;
  customerEmail: string | null;
  amount: number;
  currency: string;
  productName: string | null;
  time: number;
  read: boolean;
}

export interface ShippingOpt {
  id: string;
  name: string;
  carrierId?: string;
  price: number;
  currency: string;
  active: boolean;
  minDays: number;
  maxDays: number;
}

export interface AdminProduct {
  id: string;
  name: string;
  price: number;
  description: string;
  mainImage: string;
  images: string[];
  active: boolean;
  createdAt: number;
}

// ─── Constants ─────────────────────────────────────────────────────────────

export const ORDER_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  paid:       { label: "paid",       color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", dot: "bg-emerald-500" },
  processing: { label: "processing", color: "text-blue-700",    bg: "bg-blue-50 border-blue-200",       dot: "bg-blue-500" },
  shipped:    { label: "shipped",    color: "text-violet-700",  bg: "bg-violet-50 border-violet-200",   dot: "bg-violet-500" },
  delivered:  { label: "delivered",  color: "text-gray-700",    bg: "bg-gray-100 border-gray-200",      dot: "bg-gray-500" },
  cancelled:  { label: "cancelled",  color: "text-red-700",     bg: "bg-red-50 border-red-200",         dot: "bg-red-500" },
};

export const STATUS_FLOW = ["paid", "processing", "shipped", "delivered"] as const;

export const ORDERS_PER_PAGE = 10;

export const NOTIF_STORAGE_KEY = "e-icossys-notifications";

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  href: string;
}

export const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "dashboard", icon: "M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z", href: "/admin" },
  { id: "paiement", label: "payment", icon: "M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z", href: "/admin/paiement" },
  { id: "livraison", label: "shipping", icon: "M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12", href: "/admin/livraison" },
  { id: "pays", label: "countries", icon: "M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418", href: "/admin/pays" },
  { id: "produits", label: "products", icon: "M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z", href: "/admin/produits" },
];