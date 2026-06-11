import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";

interface ShippingAddress {
  line1: string | null;
  line2: string | null;
  city: string | null;
  state: string | null;
  postal_code?: string;
  country?: string;
}

interface RawSession {
  shipping_details?: {
    address?: ShippingAddress | null;
  } | null;
  [key: string]: unknown;
}

function extractShipping(session: Stripe.Checkout.Session | RawSession): { city: string | null; country: string | null } {
  const raw = session as RawSession;
  const addr = raw.shipping_details?.address;
  return {
    city: addr?.city || null,
    country: addr?.country || null,
  };
}

function formatAddress(addr: ShippingAddress | null | undefined): {
  line1: string | null;
  line2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
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

// GET /api/orders?session_id=xxx → détails d'une commande
// GET /api/orders?list=true → liste des dernières commandes
export async function GET(req: NextRequest) {
  const stripe = await getStripe();

  if (!stripe) {
    console.error("[Orders] Stripe non configuré — cookie absent.");
    return NextResponse.json({ error: "Stripe non configuré." }, { status: 400 });
  }

  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("session_id");
  const list = searchParams.get("list");

  try {
    if (sessionId) {
      console.log(`[Orders] Récupération session: ${sessionId}`);
      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ["line_items.data.price.product"],
      });

      const productObj = session.line_items?.data?.[0]?.price?.product;
      const productName =
        productObj && typeof productObj === "object" && "name" in productObj
          ? (productObj as { name: string }).name
          : session.line_items?.data?.[0]?.description || null;

      const raw = session as unknown as RawSession;
      const shippingAddr = (raw.shipping_details?.address as ShippingAddress | undefined) ?? null;
      const billing = session.customer_details?.address;

      return NextResponse.json({
        id: session.id,
        amount: session.amount_total,
        currency: session.currency,
        status: session.status,
        paymentStatus: session.payment_status,
        created: session.created,
        customerEmail: session.customer_details?.email || null,
        customerName: session.customer_details?.name || null,
        customerPhone: session.customer_details?.phone || null,
        shippingAddress: formatAddress(shippingAddr),
        billingAddress: formatAddress(billing as ShippingAddress | null),
        productName,
      });
    }

    if (list) {
      console.log("[Orders] Liste des dernières commandes.");
      const sessions = await stripe.checkout.sessions.list({
        limit: 20,
        status: "complete",
      });

      const orders = sessions.data.map((s) => {
        const { city, country } = extractShipping(s);
        return {
          id: s.id,
          amount: s.amount_total,
          currency: s.currency,
          status: s.status,
          customerEmail: s.customer_details?.email || null,
          customerName: s.customer_details?.name || null,
          paymentStatus: s.payment_status,
          created: s.created,
          productName: null,
          shippingCity: city,
          shippingCountry: country,
        };
      });

      console.log(`[Orders] ${orders.length} commande(s) trouvée(s).`);
      return NextResponse.json({ orders });
    }

    return NextResponse.json({ error: "Paramètre manquant." }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur Stripe";
    console.error(`[Orders] Erreur: ${message}`);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
