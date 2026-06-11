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
            unit_amount: price,
            product_data: {
              name: productName,
            },
          },
          quantity,
        },
      ],
      // Collecte client
      customer_creation: "always",
      billing_address_collection: "required",
      phone_number_collection: {
        enabled: true,
      },
      // Livraison — shipping_options est OBLIGATOIRE pour que Stripe affiche
      // le formulaire d'adresse de livraison
      shipping_address_collection: {
        allowed_countries: ["FR", "BE", "CH", "LU", "MC", "DE", "IT", "ES", "NL", "AT", "PT"],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: { amount: 0, currency: "eur" },
            display_name: "Livraison standard",
            delivery_estimate: {
              minimum: { unit: "business_day", value: 3 },
              maximum: { unit: "business_day", value: 7 },
            },
          },
        },
      ],
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cancel`,
      metadata: {
        source: "e-icossys",
        order_status: "paid",
      },
      custom_text: {
        submit: {
          message: "Vous recevrez un email de confirmation avec le suivi de votre commande.",
        },
      },
    });

    console.log(`[Checkout] Session créée: ${session.id} → ${session.url}`);
    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur Stripe";
    console.error(`[Checkout] Échec: ${message}`);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}