// ─── Carrier Preset System (client-safe) ───────────────────────────────────
// Extracted from shipping.ts — contains no server-side imports (no cookies, no async).

export interface CarrierPreset {
  id: string;              // Unique ID matching ShippingOption.carrierId
  name: string;            // Display name (e.g., "Colissimo Standard")
  description: string;     // Short description
  carrier: string;         // AfterShip carrier slug (e.g., "colissimo")
  trackingUrlTemplate: string; // URL with {number} placeholder
  defaultCountries: string[];   // Country codes this carrier typically serves
  color: string;           // Tailwind color class for badge (e.g., "bg-blue-500")
}

export const CARRIER_PRESETS: CarrierPreset[] = [
  {
    id: "lettre-suivie",
    name: "Lettre Suivie",
    description: "Courrier suivi pour petits colis, France et environs",
    carrier: "la-poste",
    trackingUrlTemplate:
      "https://www.laposte.fr/outils/suivre-vos-envois?code={number}",
    defaultCountries: ["FR", "MC", "AD"],
    color: "bg-amber-500",
  },
  {
    id: "colissimo-standard",
    name: "Colissimo Standard",
    description: "Livraison standard à domicile en Europe",
    carrier: "colissimo",
    trackingUrlTemplate:
      "https://www.laposte.fr/outils/suivre-vos-envois?code={number}",
    defaultCountries: [
      "FR", "BE", "CH", "LU", "MC", "DE", "IT", "ES", "NL", "AT", "PT",
      "GB", "IE", "DK", "SE", "FI", "PL", "CZ", "RO", "HU", "BG", "HR",
      "SI", "SK", "LT", "LV", "EE", "GR", "CY", "MT",
    ],
    color: "bg-blue-500",
  },
  {
    id: "chronopost-express",
    name: "Chronopost Express",
    description: "Livraison express en Europe",
    carrier: "chronopost",
    trackingUrlTemplate:
      "https://www.chronopost.fr/tracking-cargo?listeNumerosLT={number}",
    defaultCountries: [
      "FR", "BE", "CH", "LU", "DE", "IT", "ES", "NL", "AT", "PT",
      "GB", "IE", "DK", "SE", "FI", "PL", "CZ", "RO", "HU", "BG", "HR",
      "SI", "SK", "LT", "LV", "EE", "GR", "CY", "MT",
    ],
    color: "bg-violet-500",
  },
  {
    id: "mondial-relay",
    name: "Mondial Relay",
    description: "Livraison en point relais en Europe de l'Ouest",
    carrier: "mondial-relay",
    trackingUrlTemplate:
      "https://www.mondialrelay.fr/suivi-de-colis/?numero={number}",
    defaultCountries: ["FR", "BE", "LU", "ES", "PT", "DE", "IT", "NL", "AT"],
    color: "bg-emerald-500",
  },
  {
    id: "dhl-express",
    name: "DHL Express",
    description: "Livraison express internationale dans le monde entier",
    carrier: "dhl",
    trackingUrlTemplate:
      "https://www.dhl.com/fr-fr/home/tracking.html?tracking-id={number}",
    defaultCountries: [
      "FR", "BE", "CH", "LU", "MC", "DE", "IT", "ES", "NL", "AT", "PT",
      "GB", "IE", "DK", "SE", "FI", "PL", "CZ", "RO", "HU", "BG", "HR",
      "SI", "SK", "LT", "LV", "EE", "GR", "CY", "MT", "US", "CA", "JP",
      "CN", "KR", "AU", "NZ", "IN", "BR", "MX", "AR", "CL", "CO", "PE",
      "MA", "TN", "DZ", "SN", "CI", "CM", "RE", "RU",
    ],
    color: "bg-red-500",
  },
];

// ─── Helper Functions ──────────────────────────────────────────────────────

export function getCarrierPreset(
  carrierId: string
): CarrierPreset | undefined {
  return CARRIER_PRESETS.find((c) => c.id === carrierId);
}

export function getTrackingUrlForCarrier(
  carrierId: string,
  trackingNumber: string
): string | null {
  const preset = getCarrierPreset(carrierId);
  if (!preset) return null;
  return preset.trackingUrlTemplate.replace(
    "{number}",
    encodeURIComponent(trackingNumber)
  );
}

export function getAllCarrierCountries(carrierIds: string[]): string[] {
  const countrySet = new Set<string>();
  for (const id of carrierIds) {
    const preset = getCarrierPreset(id);
    if (preset) {
      for (const cc of preset.defaultCountries) {
        countrySet.add(cc);
      }
    }
  }
  return Array.from(countrySet);
}

export function getCountriesForCarrier(carrierId: string): string[] {
  const preset = getCarrierPreset(carrierId);
  return preset ? [...preset.defaultCountries] : [];
}