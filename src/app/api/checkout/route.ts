import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { getActiveShippingOptions } from "@/lib/shipping";

export async function POST(req: NextRequest) {
  const stripe = await getStripe();

  if (!stripe) {
    console.error("[Checkout] Stripe non configuré.");
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

  // Modes de livraison actifs depuis la config admin
  const activeShipping = await getActiveShippingOptions();

  console.log(`[Checkout] ${productName} — ${(price / 100).toFixed(2)} EUR x${quantity} — ${activeShipping.length} mode(s) livraison`);

  try {
    const params: Parameters<typeof stripe.checkout.sessions.create>[0] = {
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: price,
            product_data: { name: productName },
          },
          quantity,
        },
      ],
      customer_creation: "always",
      billing_address_collection: "required",
      phone_number_collection: { enabled: true },
      shipping_address_collection: {
        allowed_countries: [
          "FR", "BE", "CH", "LU", "MC",
          "DE", "IT", "ES", "NL", "AT", "PT",
          "GB", "IE", "DK", "SE", "FI",
        ],
      },
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cancel`,
      metadata: {
        source: "e-icossys",
        order_status: "paid",
        product_name: productName,
        unit_price: String(price),
        quantity: String(quantity),
      },
      custom_text: {
        submit: {
          message: "Vous recevrez un email de confirmation avec le suivi de votre commande.",
        },
      },
    };

    // Ajouter les modes de livraison uniquement si au moins un est actif
    if (activeShipping.length > 0) {
      params.shipping_options = activeShipping.map((opt) => ({
        shipping_rate_data: {
          type: "fixed_amount" as const,
          fixed_amount: { amount: opt.price, currency: opt.currency },
          display_name: opt.name,
          delivery_estimate: {
            minimum: { unit: "business_day" as const, value: opt.minDays },
            maximum: { unit: "business_day" as const, value: opt.maxDays },
          },
        },
      }));
    }

    const session = await stripe.checkout.sessions.create(params);

    console.log(`[Checkout] Session créée: ${session.id}`);
    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur Stripe";
    console.error(`[Checkout] Échec: ${message}`);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}