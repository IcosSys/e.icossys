import { NextResponse } from "next/server";
import { getStripe, getStripeStatus, getStripeSecretKey } from "@/lib/stripe";

export async function GET() {
  const diagnostics: Record<string, string | boolean | number | object | null> = {};

  const secretKey = await getStripeSecretKey();
  const status = await getStripeStatus();

  diagnostics.mode = status.mode;
  diagnostics.connected = status.connected;
  diagnostics.testKeySet = status.testKey;
  diagnostics.liveKeySet = status.liveKey;
  diagnostics.activeKeyPrefix = secretKey ? secretKey.slice(0, 7) + "..." : null;
  diagnostics.activeKeySuffix = secretKey ? "..." + secretKey.slice(-4) : null;

  const stripe = await getStripe();
  diagnostics.stripeInstanceCreated = !!stripe;

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

    try {
      const sessions = await stripe.checkout.sessions.list({ limit: 5 });
      diagnostics.recentSessionsCount = sessions.data.length;
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