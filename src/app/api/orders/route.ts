import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";

// --- Types ---

interface AddressData {
  line1: string | null;
  line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
}

interface RawSession {
  shipping_details?: {
    address?: AddressData | null;
    name?: string | null;
    phone?: string | null;
    carrier?: string | null;
    tracking_number?: string | null;
  } | null;
  amount_shipping?: number | null;
  shipping_cost?: {
    amount: number | null;
    shipping_rate?: {
      display_name?: string | null;
    } | null;
  } | null;
  [key: string]: unknown;
}

interface OrderListItem {
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
}

// --- Helpers ---

function fmtAddr(addr: AddressData | null | undefined): {
  line1: string | null; line2: string | null; city: string | null;
  state: string | null; postalCode: string | null; country: string | null;
} | null {
  if (!addr) return null;
  return {
    line1: addr.line1 || null,
    line2: addr.line2 || null,
    city: addr.city || null,
    state: addr.state || null,
    postalCode: addr.postal_code || null,
    country: addr.country || null,
  };
}

function getOrderStatus(session: Stripe.Checkout.Session): string {
  const meta = session.metadata as Record<string, string> | null;
  if (meta?.order_status) return meta.order_status;
  return session.payment_status === "paid" ? "paid" : "pending";
}

function getProductName(session: Stripe.Checkout.Session): string | null {
  const meta = session.metadata as Record<string, string> | null;
  if (meta?.product_name) return meta.product_name;
  return null;
}

// --- GET: list or single ---

export async function GET(req: NextRequest) {
  const stripe = await getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe non configuré." }, { status: 400 });
  }

  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("session_id");
  const list = searchParams.get("list");

  try {
    // --- Single order ---
    if (sessionId) {
      console.log(`[Orders] Détail: ${sessionId}`);
      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ["line_items.data.price.product"],
      });

      const productObj = session.line_items?.data?.[0]?.price?.product;
      const productName =
        getProductName(session) ||
        (productObj && typeof productObj === "object" && "name" in productObj
          ? (productObj as { name: string }).name
          : session.line_items?.data?.[0]?.description || null);

      const raw = session as unknown as RawSession;
      const shippingAddr = raw.shipping_details?.address as AddressData | undefined;
      const billing = session.customer_details?.address;

      // Shipping method name from Stripe
      const shippingMethodName = raw.shipping_cost?.shipping_rate?.display_name || null;
      const shippingAmount = raw.shipping_cost?.amount ?? (session.total_details as any)?.breakdown?.shipping?.amount ?? null;

      // Price breakdown
      const unitPrice = session.metadata?.unit_price ? Number(session.metadata.unit_price) : null;
      const quantity = session.metadata?.quantity ? Number(session.metadata.quantity) : null;
      const trackingNumber = session.metadata?.tracking_number || null;

      return NextResponse.json({
        id: session.id,
        amount: session.amount_total,
        amountSubtotal: session.amount_subtotal ?? null,
        amountShipping: shippingAmount,
        currency: session.currency,
        status: session.status,
        paymentStatus: session.payment_status,
        orderStatus: getOrderStatus(session),
        created: session.created,
        customerEmail: session.customer_details?.email || null,
        customerName: session.customer_details?.name || null,
        customerPhone: session.customer_details?.phone || null,
        shippingName: raw.shipping_details?.name || null,
        shippingAddress: fmtAddr(shippingAddr),
        billingAddress: fmtAddr(billing as AddressData | null),
        shippingMethod: shippingMethodName,
        productName,
        unitPrice,
        quantity,
        trackingNumber,
      });
    }

    // --- Order list ---
    if (list) {
      console.log("[Orders] Liste des commandes.");
      const sessions = await stripe.checkout.sessions.list({
        limit: 50,
        status: "complete",
      });

      const orders: OrderListItem[] = sessions.data.map((s) => {
        const raw = s as unknown as RawSession;
        const addr = raw.shipping_details?.address;
        return {
          id: s.id,
          amount: s.amount_total ?? 0,
          amountSubtotal: s.amount_subtotal ?? null,
          amountShipping: raw.shipping_cost?.amount ?? (s.total_details as any)?.breakdown?.shipping?.amount ?? null,
          currency: s.currency ?? "eur",
          status: s.status ?? "complete",
          customerEmail: s.customer_details?.email || null,
          customerName: s.customer_details?.name || null,
          paymentStatus: s.payment_status,
          orderStatus: getOrderStatus(s),
          created: s.created,
          productName: getProductName(s),
          shippingCity: addr?.city || null,
          shippingCountry: addr?.country || null,
          shippingName: raw.shipping_details?.name || null,
          shippingMethod: raw.shipping_cost?.shipping_rate?.display_name || null,
          trackingNumber: s.metadata?.tracking_number || null,
        };
      });

      console.log(`[Orders] ${orders.length} commande(s).`);
      return NextResponse.json({ orders });
    }

    return NextResponse.json({ error: "Paramètre manquant." }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur Stripe";
    console.error(`[Orders] Erreur: ${message}`);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}