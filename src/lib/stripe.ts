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

// Cache sécurisé par hash de clé — évite le bug du singleton périmé en serverless
const stripeCache: Map<string, Stripe> = new Map();
let cachedKeyHash: string | null = null;

function hashKey(key: string): string {
  // Hash simple pour comparer les clés sans les stocker en clair
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    const char = key.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return hash.toString();
}

export async function getStripe(): Promise<Stripe | null> {
  const secretKey = await getStripeSecretKey();
  if (!secretKey) {
    console.log("[Stripe] Aucune clé trouvée dans le cookie.");
    return null;
  }

  const keyHash = hashKey(secretKey);

  // Si la clé a changé, on invalide le cache
  if (cachedKeyHash && cachedKeyHash !== keyHash) {
    console.log("[Stripe] Clé modifiée, invalidation du cache.");
    stripeCache.clear();
  }

  if (!stripeCache.has(keyHash)) {
    console.log(`[Stripe] Nouvelle instance Stripe créée (clé ...${secretKey.slice(-4)}).`);
    stripeCache.set(keyHash, new Stripe(secretKey, { typescript: true }));
    cachedKeyHash = keyHash;
  }

  return stripeCache.get(keyHash)!;
}