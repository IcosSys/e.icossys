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
  [key: string]: unknown;
}

interface OrderListItem {
  id: string;
  amount: number;
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
        productObj && typeof productObj === "object" && "name" in productObj
          ? (productObj as { name: string }).name
          : session.line_items?.data?.[0]?.description || null;

      const raw = session as unknown as RawSession;
      const shippingAddr = raw.shipping_details?.address as AddressData | undefined;
      const billing = session.customer_details?.address;

      return NextResponse.json({
        id: session.id,
        amount: session.amount_total,
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
        productName,
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
          currency: s.currency ?? "eur",
          status: s.status ?? "complete",
          customerEmail: s.customer_details?.email || null,
          customerName: s.customer_details?.name || null,
          paymentStatus: s.payment_status,
          orderStatus: getOrderStatus(s),
          created: s.created,
          productName: null,
          shippingCity: addr?.city || null,
          shippingCountry: addr?.country || null,
          shippingName: raw.shipping_details?.name || null,
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