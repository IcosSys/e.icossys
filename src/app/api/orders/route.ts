import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

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

      const productName =
        session.line_items?.data?.[0]?.price?.product &&
        typeof session.line_items.data[0].price.product === "object"
          ? session.line_items.data[0].price.product.name
          : session.line_items?.data?.[0]?.description || null;

      return NextResponse.json({
        id: session.id,
        amount: session.amount_total,
        currency: session.currency,
        status: session.status,
        customerEmail: session.customer_details?.email || null,
        paymentStatus: session.payment_status,
        created: session.created,
        productName,
      });
    }

    if (list) {
      console.log("[Orders] Liste des dernières commandes.");
      const sessions = await stripe.checkout.sessions.list({
        limit: 20,
        status: "complete",
        expand: ["line_items.data.price.product"],
      });

      const orders = sessions.data.map((s) => {
        const productName =
          s.line_items?.data?.[0]?.price?.product &&
          typeof s.line_items.data[0].price.product === "object"
            ? s.line_items.data[0].price.product.name
            : s.line_items?.data?.[0]?.description || null;

        return {
          id: s.id,
          amount: s.amount_total,
          currency: s.currency,
          customerEmail: s.customer_details?.email || null,
          paymentStatus: s.payment_status,
          created: s.created,
          productName,
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