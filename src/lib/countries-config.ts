import { cookies } from "next/headers";

// Re-export for convenience (admin imports from here)
export { ALL_COUNTRIES, type CountryCode } from "./countries";

const COOKIE_NAME = "shipping_countries";

export function getDefaultCountries(): string[] {
  return [
    "FR", "BE", "CH", "LU", "MC",
    "DE", "IT", "ES", "NL", "AT", "PT",
    "GB", "IE", "DK", "SE", "FI",
    "PL", "CZ", "RO", "HU", "BG",
    "HR", "SI", "SK", "LT", "LV", "EE",
    "GR", "CY", "MT",
  ];
}

export async function getShippingCountries(): Promise<string[]> {
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
  return getDefaultCountries();
}