import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { getActiveShippingOptions } from "@/lib/shipping";
import { getShippingCountries } from "@/lib/countries-config";

interface LineItemInput {
  productName: string;
  price: number;
  quantity: number;
  productId?: string;
}

const VALID_LOCALES = ["fr", "en"];

export async function POST(req: NextRequest) {
  const stripe = await getStripe();

  if (!stripe) {
    console.error("[Checkout] Stripe non configuré.");
    return NextResponse.json(
      { error: "Stripe n'est pas configuré. Connectez votre clé Stripe dans l'administration." },
      { status: 400 }
    );
  }

  const body = await req.json();
  let locale = typeof body.locale === "string" && VALID_LOCALES.includes(body.locale) ? body.locale : "fr";

  // Support deux formats : ancien (produit unique) et nouveau (panier multi-produits)
  let lineItems: LineItemInput[];

  if (body.items && Array.isArray(body.items) && body.items.length > 0) {
    lineItems = body.items;
  } else if (body.productName && body.price && body.quantity) {
    lineItems = [{ productName: body.productName, price: body.price, quantity: body.quantity }];
  } else {
    return NextResponse.json({ error: "Données manquantes." }, { status: 400 });
  }

  // Validation : données requises + quantités bornées + prix positifs
  for (const item of lineItems) {
    if (!item.productName || !item.price || !item.quantity) {
      return NextResponse.json({ error: "Données produit manquantes." }, { status: 400 });
    }
    if (typeof item.price !== "number" || item.price <= 0) {
      return NextResponse.json({ error: "Prix invalide." }, { status: 400 });
    }
    if (typeof item.quantity !== "number" || item.quantity < 1 || item.quantity > 100) {
      return NextResponse.json({ error: "Quantité invalide (1-100)." }, { status: 400 });
    }
  }

  // C-01 : Valider les prix côté serveur — récupérer le vrai prix depuis les produits stockés
  const { getProducts } = await import("@/lib/server-products");
  const serverProducts = await getProducts();
  for (const item of lineItems) {
    if (item.productId) {
      const serverProduct = serverProducts.find((p: { id: string; price: number; active: boolean }) => p.id === item.productId);
      if (!serverProduct || !serverProduct.active) {
        return NextResponse.json({ error: "Produit invalide ou inactif." }, { status: 400 });
      }
      // Forcer le prix serveur — empêche toute manipulation client
      item.price = serverProduct.price;
    }
  }

  const totalQty = lineItems.reduce((s, i) => s + i.quantity, 0);
  const totalAmount = lineItems.reduce((s, i) => s + i.price * i.quantity, 0);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || req.headers.get("origin") || "https://e-icossys.vercel.app";

  // Modes de livraison actifs depuis la config admin
  const activeShipping = await getActiveShippingOptions();

  const itemNames = lineItems.map(i => i.productName).join(", ");
  console.log(`[Checkout] ${itemNames} — ${(totalAmount / 100).toFixed(2)} EUR (${totalQty} article${totalQty > 1 ? "s" : ""}) — ${activeShipping.length} mode(s) livraison`);

  try {
    const params: Parameters<typeof stripe.checkout.sessions.create>[0] = {
      mode: "payment",
      locale: locale === "en" ? "en" : "fr",
      line_items: lineItems.map(item => ({
        price_data: {
          currency: "eur",
          unit_amount: item.price,
          product_data: { name: item.productName },
        },
        quantity: item.quantity,
      })),
      customer_creation: "always",
      billing_address_collection: "required",
      phone_number_collection: { enabled: true },
      shipping_address_collection: {
        allowed_countries: (await getShippingCountries()) as any,
      },
      success_url: `${baseUrl}/${locale || "fr"}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/${locale || "fr"}/cancel`,
      metadata: {
        source: "e-icossys",
        order_status: "paid",
        product_name: lineItems.length === 1 ? lineItems[0].productName : `${lineItems.length} articles`,
        unit_price: String(lineItems[0].price),
        quantity: String(totalQty),
        // Stocker tous les items en JSON pour référence
        cart_items: JSON.stringify(lineItems),
      },
      custom_text: {
        submit: {
          message: locale === "en"
            ? "You will receive a confirmation email with your order tracking."
            : "Vous recevrez un email de confirmation avec le suivi de votre commande.",
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
    const message = err instanceof Error ? err.message : "Erreur";
    console.error(`[Checkout] Échec: ${message}`);
    return NextResponse.json({ error: "Erreur lors du traitement du paiement." }, { status: 500 });
  }
}