import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY n'est pas configuré.");
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      typescript: true,
    });
  }
  return _stripe;
}

// --- Stockage du compte connecté ---
// En attendant la base de données, le compte Stripe connecté
// est stocké dans un fichier JSON local.
// TODO: migrer vers Prisma/PostgreSQL quand la DB sera en place.

import { readFileSync, writeFileSync, existsSync, mkdirSync, unlinkSync } from "fs";
import { join } from "path";

const STORE_DIR = join(process.cwd(), "data");
const STORE_FILE = join(STORE_DIR, "stripe-connected.json");

interface ConnectedAccount {
  stripeAccountId: string;
  connectedAt: string;
}

function ensureStoreDir() {
  if (!existsSync(STORE_DIR)) {
    mkdirSync(STORE_DIR, { recursive: true });
  }
}

export function getConnectedAccount(): ConnectedAccount | null {
  try {
    if (!existsSync(STORE_FILE)) return null;
    const raw = readFileSync(STORE_FILE, "utf-8");
    return JSON.parse(raw) as ConnectedAccount;
  } catch {
    return null;
  }
}

export function setConnectedAccount(accountId: string): ConnectedAccount {
  ensureStoreDir();
  const data: ConnectedAccount = {
    stripeAccountId: accountId,
    connectedAt: new Date().toISOString(),
  };
  writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), "utf-8");
  return data;
}

export function removeConnectedAccount(): void {
  try {
    if (existsSync(STORE_FILE)) {
      unlinkSync(STORE_FILE);
    }
  } catch {
    // silencieux
  }
}