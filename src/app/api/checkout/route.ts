import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const stripe = await getStripe();

  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe n'est pas configuré. Connectez votre clé Stripe dans l'administration." },
      { status: 400 }
    );
  }

  const { productName, price, quantity } = await req.json();

  if (!productName || !price || !quantity) {
    return NextResponse.json({ error: "Données manquantes." }, { status: 400 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || req.headers.get("origin") || "https://e-icossys.vercel.app";

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
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur Stripe";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}