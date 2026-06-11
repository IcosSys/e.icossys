import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import type { StripeMode } from "@/lib/stripe";

const COOKIE_OPTIONS = {
  httpOnly: true as const,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 365, // 1 an
};

export async function POST(req: NextRequest) {
  const { secretKey } = await req.json();

  if (!secretKey || typeof secretKey !== "string") {
    return NextResponse.json({ error: "Clé Stripe requise." }, { status: 400 });
  }

  const trimmed = secretKey.trim();

  // Auto-détecter le mode depuis le préfixe
  let targetMode: StripeMode;
  if (trimmed.startsWith("sk_test_")) {
    targetMode = "test";
  } else if (trimmed.startsWith("sk_live_")) {
    targetMode = "live";
  } else {
    return NextResponse.json(
      { error: "La clé doit commencer par sk_test_ ou sk_live_" },
      { status: 400 }
    );
  }

  // Vérifier que la clé est valide
  try {
    console.log(`[Stripe Config] Validation clé ${targetMode} ...${trimmed.slice(-4)}`);
    const testStripe = new Stripe(trimmed, { typescript: true });
    await testStripe.balance.retrieve();
    console.log(`[Stripe Config] Clé ${targetMode} ...${trimmed.slice(-4)} validée.`);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Clé invalide";
    console.error(`[Stripe Config] Échec: ${message}`);
    return NextResponse.json({ error: "Clé Stripe invalide ou inactive." }, { status: 400 });
  }

  const cookieName = targetMode === "live" ? "stripe_live_key" : "stripe_test_key";
  const res = NextResponse.json({
    success: true,
    mode: targetMode,
    lastFour: trimmed.slice(-4),
  });

  res.cookies.set(cookieName, trimmed, COOKIE_OPTIONS);

  // Définir le mode automatiquement sur celui de la clé configurée
  res.cookies.set("stripe_mode", targetMode, COOKIE_OPTIONS);

  // Nettoyer l'ancien cookie legacy s'il existe
  if (req.cookies.get("stripe_secret_key")?.value) {
    res.cookies.set("stripe_secret_key", "", { ...COOKIE_OPTIONS, maxAge: 0 });
  }

  console.log(`[Stripe Config] Cookie ${cookieName} défini, mode → ${targetMode}.`);
  return res;
}
