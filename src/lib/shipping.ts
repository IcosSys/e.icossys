import { cookies } from "next/headers";

export interface ShippingOption {
  id: string;
  name: string;
  price: number;
  currency: string;
  active: boolean;
  minDays: number;
  maxDays: number;
}

const COOKIE_NAME = "shipping_config";

export const DEFAULT_SHIPPING_OPTIONS: ShippingOption[] = [
  {
    id: "lettre-suivie",
    name: "Lettre Suivie",
    price: 350,
    currency: "eur",
    active: true,
    minDays: 3,
    maxDays: 7,
  },
  {
    id: "colissimo-standard",
    name: "Colissimo Standard",
    price: 590,
    currency: "eur",
    active: true,
    minDays: 2,
    maxDays: 4,
  },
  {
    id: "chronopost-express",
    name: "Chronopost Express",
    price: 1290,
    currency: "eur",
    active: true,
    minDays: 1,
    maxDays: 2,
  },
];

export async function getShippingConfig(): Promise<ShippingOption[]> {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get(COOKIE_NAME)?.value;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // cookie corrompu → defaults
  }
  return DEFAULT_SHIPPING_OPTIONS;
}

export async function getActiveShippingOptions(): Promise<ShippingOption[]> {
  const all = await getShippingConfig();
  return all.filter((o) => o.active);
}