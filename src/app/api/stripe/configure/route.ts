import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const { secretKey } = await req.json();

  if (!secretKey || typeof secretKey !== "string") {
    return NextResponse.json({ error: "Clé Stripe requise." }, { status: 400 });
  }

  if (!secretKey.startsWith("sk_test_") && !secretKey.startsWith("sk_live_")) {
    return NextResponse.json({ error: "La clé doit commencer par sk_test_ ou sk_live_" }, { status: 400 });
  }

  // Vérifier que la clé est valide
  try {
    const testStripe = new Stripe(secretKey, { typescript: true });
    await testStripe.balance.retrieve();
  } catch {
    return NextResponse.json({ error: "Clé Stripe invalide ou inactive." }, { status: 400 });
  }

  // Sauvegarder dans un cookie httpOnly sécurisé
  const res = NextResponse.json({
    success: true,
    lastFour: secretKey.slice(-4),
  });

  res.cookies.set("stripe_secret_key", secretKey, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 an
  });

  return res;
}