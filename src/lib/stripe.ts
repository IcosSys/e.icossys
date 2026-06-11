import Stripe from "stripe";

export type StripeMode = "test" | "live";

const COOKIE_MODE = "stripe_mode";
const COOKIE_TEST_KEY = "stripe_test_key";
const COOKIE_LIVE_KEY = "stripe_live_key";
const LEGACY_COOKIE = "stripe_secret_key"; // ancien cookie à migrer

// --- Lecture cookies ---

async function readCookie(name: string): Promise<string | null> {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  return cookieStore.get(name)?.value || null;
}

// Retourne le mode actif (par défaut "test")
export async function getStripeMode(): Promise<StripeMode> {
  const mode = await readCookie(COOKIE_MODE);
  return mode === "live" ? "live" : "test";
}

// Retourne la clé du mode actif
export async function getStripeSecretKey(): Promise<string | null> {
  // Priorité : nouveaux cookies
  const mode = await getStripeMode();
  const cookieName = mode === "live" ? COOKIE_LIVE_KEY : COOKIE_TEST_KEY;
  const key = await readCookie(cookieName);

  if (key) return key;

  // Fallback : ancien cookie legacy (migration automatique)
  const legacyKey = await readCookie(LEGACY_COOKIE);
  if (legacyKey) {
    console.log(`[Stripe] Migration cookie legacy vers ${mode}`);
    return legacyKey;
  }

  return null;
}

// Retourne la clé d'un mode spécifique (sans l'exposer au client)
export async function getStripeKeyForMode(mode: StripeMode): Promise<string | null> {
  const cookieName = mode === "live" ? COOKIE_LIVE_KEY : COOKIE_TEST_KEY;
  return readCookie(cookieName);
}

// Détecte le mode à partir du préfixe de la clé
export function detectModeFromKey(secretKey: string): StripeMode | null {
  if (secretKey.startsWith("sk_test_")) return "test";
  if (secretKey.startsWith("sk_live_")) return "live";
  return null;
}

// Retourne le statut complet (sans jamais exposer les clés)
export async function getStripeStatus(): Promise<{
  connected: boolean;
  mode: StripeMode;
  testKey: boolean;
  liveKey: boolean;
  lastFour?: string;
  keyType: "test" | "live" | null;
}> {
  const mode = await getStripeMode();
  const testKey = await getStripeKeyForMode("test");
  const liveKey = await getStripeKeyForMode("live");
  const activeKey = mode === "live" ? liveKey : testKey;

  if (!activeKey) {
    return { connected: false, mode, testKey: !!testKey, liveKey: !!liveKey, keyType: null };
  }

  return {
    connected: true,
    mode,
    testKey: !!testKey,
    liveKey: !!liveKey,
    lastFour: activeKey.slice(-4),
    keyType: mode,
  };
}

// --- Cache Stripe par hash de clé ---

const stripeCache: Map<string, Stripe> = new Map();
let cachedKeyHash: string | null = null;

function hashKey(key: string): string {
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
  const mode = await getStripeMode();
  if (!secretKey) {
    console.log(`[Stripe] Aucune clé trouvée (mode: ${mode}).`);
    return null;
  }

  const keyHash = hashKey(secretKey);

  if (cachedKeyHash && cachedKeyHash !== keyHash) {
    console.log("[Stripe] Clé modifiée, invalidation du cache.");
    stripeCache.clear();
  }

  if (!stripeCache.has(keyHash)) {
    console.log(`[Stripe] Instance créée [${mode}] (clé ...${secretKey.slice(-4)}).`);
    stripeCache.set(keyHash, new Stripe(secretKey, { typescript: true }));
    cachedKeyHash = keyHash;
  }

  return stripeCache.get(keyHash)!;
}
