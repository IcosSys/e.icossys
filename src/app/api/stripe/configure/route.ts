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
  const { secretKey, mode } = await req.json();

  if (!secretKey || typeof secretKey !== "string") {
    return NextResponse.json({ error: "Clé Stripe requise." }, { status: 400 });
  }

  // Déterminer le mode demandé
  const targetMode: StripeMode = mode === "live" ? "live" : "test";

  // Vérifier la cohérence clé / mode
  if (targetMode === "test" && !secretKey.startsWith("sk_test_")) {
    return NextResponse.json({ error: "Une clé de test doit commencer par sk_test_" }, { status: 400 });
  }
  if (targetMode === "live" && !secretKey.startsWith("sk_live_")) {
    return NextResponse.json({ error: "Une clé live doit commencer par sk_live_" }, { status: 400 });
  }

  // Vérifier que la clé est valide
  try {
    console.log(`[Stripe Config] Validation clé ${targetMode} ...${secretKey.slice(-4)}`);
    const testStripe = new Stripe(secretKey, { typescript: true });
    await testStripe.balance.retrieve();
    console.log(`[Stripe Config] Clé ${targetMode} ...${secretKey.slice(-4)} validée.`);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Clé invalide";
    console.error(`[Stripe Config] Échec: ${message}`);
    return NextResponse.json({ error: "Clé Stripe invalide ou inactive." }, { status: 400 });
  }

  const cookieName = targetMode === "live" ? "stripe_live_key" : "stripe_test_key";
  const res = NextResponse.json({
    success: true,
    mode: targetMode,
    lastFour: secretKey.slice(-4),
  });

  res.cookies.set(cookieName, secretKey, COOKIE_OPTIONS);

  // Si c'est la première clé configurée, activer ce mode automatiquement
  const existingTest = req.cookies.get("stripe_test_key")?.value;
  const existingLive = req.cookies.get("stripe_live_key")?.value;
  const currentMode = req.cookies.get("stripe_mode")?.value || "test";

  if (
    (targetMode === "test" && !existingLive) ||
    (targetMode === "live" && !existingTest)
  ) {
    res.cookies.set("stripe_mode", targetMode, COOKIE_OPTIONS);
  }

  // Nettoyer l'ancien cookie legacy s'il existe
  if (req.cookies.get("stripe_secret_key")?.value) {
    res.cookies.set("stripe_secret_key", "", { ...COOKIE_OPTIONS, maxAge: 0 });
  }

  console.log(`[Stripe Config] Cookie ${cookieName} défini.`);
  return res;
}