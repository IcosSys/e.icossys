import Stripe from "stripe";
import { readFileSync, writeFileSync, existsSync, mkdirSync, unlinkSync } from "fs";
import { join } from "path";

const STORE_DIR = join(process.cwd(), "data");
const STORE_FILE = join(STORE_DIR, "stripe-config.json");

interface StripeConfig {
  secretKey: string;
  configuredAt: string;
}

function ensureStoreDir() {
  if (!existsSync(STORE_DIR)) {
    mkdirSync(STORE_DIR, { recursive: true });
  }
}

// Retourne la config sans la clé secrète (jamais exposée au client)
export function getStripeStatus(): { connected: boolean; configuredAt?: string; lastFour?: string } {
  try {
    if (!existsSync(STORE_FILE)) return { connected: false };
    const raw = readFileSync(STORE_FILE, "utf-8");
    const config = JSON.parse(raw) as StripeConfig;
    return {
      connected: true,
      configuredAt: config.configuredAt,
      lastFour: config.secretKey.slice(-4),
    };
  } catch {
    return { connected: false };
  }
}

// Retourne la clé complète (serveur uniquement, pour créer des sessions)
export function getStripeSecretKey(): string | null {
  try {
    if (!existsSync(STORE_FILE)) return null;
    const raw = readFileSync(STORE_FILE, "utf-8");
    const config = JSON.parse(raw) as StripeConfig;
    return config.secretKey;
  } catch {
    return null;
  }
}

// Sauvegarde la clé du commerçant
export function saveStripeKey(secretKey: string): { configuredAt: string; lastFour: string } {
  ensureStoreDir();
  const config: StripeConfig = {
    secretKey,
    configuredAt: new Date().toISOString(),
  };
  writeFileSync(STORE_FILE, JSON.stringify(config, null, 2), "utf-8");
  return {
    configuredAt: config.configuredAt,
    lastFour: secretKey.slice(-4),
  };
}

// Supprime la clé
export function removeStripeKey(): void {
  try {
    if (existsSync(STORE_FILE)) {
      unlinkSync(STORE_FILE);
    }
  } catch {
    // silencieux
  }
}

// Instance Stripe avec la clé du commerçant (lazy, serveur uniquement)
let _stripe: Stripe | null = null;

export function getStripe(): Stripe | null {
  const secretKey = getStripeSecretKey();
  if (!secretKey) return null;
  if (!_stripe) {
    _stripe = new Stripe(secretKey, { typescript: true });
  }
  return _stripe;
}