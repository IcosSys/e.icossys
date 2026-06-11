// ─── Shared Admin Utility Functions ─────────────────────────────────────

export function fmtDate(ts: number): string {
  return new Date(ts * 1000).toLocaleDateString("fr-FR", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export function fmtCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: currency.toUpperCase() }).format(amount / 100);
}

export function fmtAddress(addr: { line1: string | null; line2: string | null; city: string | null; state: string | null; postalCode: string | null; country: string | null } | null): string {
  if (!addr) return "Non renseignée";
  return [addr.line1, addr.line2, addr.postalCode, addr.city, addr.state, addr.country].filter(Boolean).join(", ") || "Non renseignée";
}

export function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "À l'instant";
  if (m < 60) return `Il y a ${m}min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `Il y a ${h}h`;
  return `Il y a ${Math.floor(h / 24)}j`;
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 30);
}

// --- Tracking link helpers ---

export function getTrackingUrl(method: string | null, trackingNumber: string): string | null {
  if (!trackingNumber.trim()) return null;
  const m = (method || "").toLowerCase();
  if (m.includes("chronopost")) return `https://www.chronopost.fr/tracking-cargo?listeNumerosLT=${encodeURIComponent(trackingNumber)}`;
  if (m.includes("colissimo") || m.includes("la poste") || m.includes("lettre")) {
    return `https://www.laposte.fr/outils/suivre-vos-envois?code=${encodeURIComponent(trackingNumber)}`;
  }
  // Default: La Poste
  return `https://www.laposte.fr/outils/suivre-vos-envois?code=${encodeURIComponent(trackingNumber)}`;
}

export function detectCarrierLabel(method: string | null): string {
  const m = (method || "").toLowerCase();
  if (m.includes("chronopost")) return "Chronopost";
  if (m.includes("colissimo")) return "Colissimo";
  if (m.includes("lettre")) return "La Poste";
  if (m.includes("mondial")) return "Mondial Relay";
  return "Transporteur";
}