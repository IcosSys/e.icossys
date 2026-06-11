import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const stripe = await getStripe();

  if (!stripe) {
    console.error("[Checkout] Stripe non configuré — cookie absent ou invalide.");
    return NextResponse.json(
      { error: "Stripe n'est pas configuré. Connectez votre clé Stripe dans l'administration." },
      { status: 400 }
    );
  }

  const { productName, price, quantity } = await req.json();

  if (!productName || !price || !quantity) {
    console.error("[Checkout] Données manquantes:", { productName, price, quantity });
    return NextResponse.json({ error: "Données manquantes." }, { status: 400 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || req.headers.get("origin") || "https://e-icossys.vercel.app";

  console.log(`[Checkout] Création session: ${productName} — ${(price / 100).toFixed(2)} EUR x${quantity}`);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: price, // en centimes
            product_data: {
              name: productName,
            },
          },
          quantity,
        },
      ],
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cancel`,
      metadata: {
        source: "e-icossys",
      },
    });

    console.log(`[Checkout] Session créée avec succès: ${session.id} → ${session.url}`);
    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur Stripe";
    console.error(`[Checkout] Échec création session: ${message}`);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}