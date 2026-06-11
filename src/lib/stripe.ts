import Stripe from "stripe";

const COOKIE_NAME = "stripe_secret_key";

// Retourne la clé depuis le cookie (serveur uniquement)
export async function getStripeSecretKey(): Promise<string | null> {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value || null;
}

// Retourne le statut sans la clé (jamais exposée au client)
export async function getStripeStatus(): Promise<{ connected: boolean; lastFour?: string }> {
  const key = await getStripeSecretKey();
  if (!key) return { connected: false };
  return {
    connected: true,
    lastFour: key.slice(-4),
  };
}

// Instance Stripe avec la clé du commerçant (serveur uniquement)
let _stripe: Stripe | null = null;

export async function getStripe(): Promise<Stripe | null> {
  const secretKey = await getStripeSecretKey();
  if (!secretKey) return null;
  if (!_stripe) {
    _stripe = new Stripe(secretKey, { typescript: true });
  }
  return _stripe;
}