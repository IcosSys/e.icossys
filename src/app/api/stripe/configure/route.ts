import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { saveStripeKey } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const { secretKey } = await req.json();

  if (!secretKey || typeof secretKey !== "string") {
    return NextResponse.json(
      { error: "Clé Stripe requise." },
      { status: 400 }
    );
  }

  if (!secretKey.startsWith("sk_test_") && !secretKey.startsWith("sk_live_")) {
    return NextResponse.json(
      { error: "La clé doit commencer par sk_test_ ou sk_live_" },
      { status: 400 }
    );
  }

  // Vérifier que la clé est valide en faisant un appel Stripe
  try {
    const testStripe = new Stripe(secretKey, { typescript: true });
    await testStripe.balance.retrieve();
  } catch {
    return NextResponse.json(
      { error: "Clé Stripe invalide ou inactive." },
      { status: 400 }
    );
  }

  const result = saveStripeKey(secretKey);

  return NextResponse.json({
    success: true,
    configuredAt: result.configuredAt,
    lastFour: result.lastFour,
  });
}