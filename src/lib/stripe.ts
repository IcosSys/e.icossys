import Stripe from "stripe";
import { cookies } from "next/headers";

const COOKIE_NAME = "stripe_secret_key";

// Retourne la clé depuis le cookie (serveur uniquement)
export function getStripeSecretKey(): string | null {
  const cookieStore = cookies();
  return cookieStore.get(COOKIE_NAME)?.value || null;
}

// Retourne le statut sans la clé (jamais exposée au client)
export function getStripeStatus(): { connected: boolean; lastFour?: string } {
  const key = getStripeSecretKey();
  if (!key) return { connected: false };
  return {
    connected: true,
    lastFour: key.slice(-4),
  };
}

// Instance Stripe avec la clé du commerçant (serveur uniquement)
let _stripe: Stripe | null = null;

export function getStripe(): Stripe | null {
  const secretKey = getStripeSecretKey();
  if (!secretKey) return null;
  if (!_stripe) {
    _stripe = new Stripe(secretKey, { typescript: true });
  }
  return _stripe;
}