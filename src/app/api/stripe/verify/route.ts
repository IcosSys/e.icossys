import { NextResponse } from "next/server";
import { getStripe, getStripeSecretKey } from "@/lib/stripe";

// Endpoint de diagnostic — vérifie l'intégrité complète du pipeline Stripe
export async function GET() {
  const diagnostics: Record<string, string | boolean | object> = {};

  // 1. Vérifier la présence du cookie
  const secretKey = await getStripeSecretKey();
  diagnostics.cookiePresent = !!secretKey;
  diagnostics.keyPrefix = secretKey ? secretKey.slice(0, 7) + "..." : null;
  diagnostics.keySuffix = secretKey ? "..." + secretKey.slice(-4) : null;
  diagnostics.keyType = secretKey?.startsWith("sk_test_")
    ? "TEST"
    : secretKey?.startsWith("sk_live_")
      ? "LIVE"
      : null;

  // 2. Vérifier l'instance Stripe
  const stripe = await getStripe();
  diagnostics.stripeInstanceCreated = !!stripe;

  // 3. Tester un appel API léger (balance)
  if (stripe) {
    try {
      const balance = await stripe.balance.retrieve();
      diagnostics.balanceCall = "OK";
      diagnostics.balance = {
        available: balance.available.map((b) => `${b.amount / 100} ${b.currency.toUpperCase()}`),
        pending: balance.pending.map((b) => `${b.amount / 100} ${b.currency.toUpperCase()}`),
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      diagnostics.balanceCall = `FAILED: ${message}`;
    }

    // 4. Lister les dernières sessions (pour vérifier que le compte a des données)
    try {
      const sessions = await stripe.checkout.sessions.list({ limit: 5 });
      diagnostics.recentSessions = sessions.data.length;
      diagnostics.sessions = sessions.data.map((s) => ({
        id: s.id,
        status: s.status,
        payment_status: s.payment_status,
        amount: s.amount_total,
        created: new Date(s.created * 1000).toISOString(),
      }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      diagnostics.sessionsListCall = `FAILED: ${message}`;
    }
  }

  return NextResponse.json({ diagnostics });
}