import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

// GET /api/orders?session_id=xxx → détails d'une commande
// GET /api/orders?list=true → liste des dernières commandes
export async function GET(req: NextRequest) {
  const stripe = await getStripe();

  if (!stripe) {
    return NextResponse.json({ error: "Stripe non configuré." }, { status: 400 });
  }

  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("session_id");
  const list = searchParams.get("list");

  try {
    if (sessionId) {
      // Récupérer une session spécifique
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      return NextResponse.json({
        id: session.id,
        amount: session.amount_total,
        currency: session.currency,
        status: session.status,
        customerEmail: session.customer_details?.email || null,
        paymentStatus: session.payment_status,
        created: session.created,
        productName: session.line_items?.data?.[0]?.description || null,
      });
    }

    if (list) {
      // Lister les dernières sessions payées
      const sessions = await stripe.checkout.sessions.list({
        limit: 20,
        status: "complete",
      });

      const orders = sessions.data.map((s) => ({
        id: s.id,
        amount: s.amount_total,
        currency: s.currency,
        customerEmail: s.customer_details?.email || null,
        paymentStatus: s.payment_status,
        created: s.created,
        productName: s.line_items?.data?.[0]?.description || null,
      }));

      return NextResponse.json({ orders });
    }

    return NextResponse.json({ error: "Paramètre manquant." }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur Stripe";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}