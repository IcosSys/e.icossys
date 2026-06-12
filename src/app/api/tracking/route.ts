import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

// AfterShip API v2026-01 (new format)
const AFTERSHIP_API = "https://api.aftership.com/tracking/2026-01";
const AFTERSHIP_KEY = process.env.AFTERSHIP_API_KEY;

// AfterShip slug mapping for French carriers
const CARRIER_SLUGS: Record<string, string> = {
  chronopost: "chronopost",
  colissimo: "colissimo",
  "la poste": "la-poste",
  "lettre suivie": "la-poste",
  "mondial relay": "mondial-relay",
};

function detectSlug(shippingMethod: string | null): string | undefined {
  if (!shippingMethod) return undefined;
  const m = shippingMethod.toLowerCase();
  for (const [key, slug] of Object.entries(CARRIER_SLUGS)) {
    if (m.includes(key)) return slug;
  }
  return undefined; // Let AfterShip auto-detect
}

// AfterShip tag → French label + color
const TAG_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  Pending:            { label: "En attente",         color: "text-gray-700",   bg: "bg-gray-100" },
  InfoReceived:       { label: "Info reçue",         color: "text-amber-700",  bg: "bg-amber-50" },
  InTransit:          { label: "En transit",         color: "text-blue-700",   bg: "bg-blue-50" },
  OutForDelivery:     { label: "En livraison",       color: "text-violet-700", bg: "bg-violet-50" },
  AvailableForPickup: { label: "À récupérer",        color: "text-orange-700", bg: "bg-orange-50" },
  Expired:            { label: "Expiré",             color: "text-gray-500",   bg: "bg-gray-100" },
  Exception:          { label: "Anomalie",           color: "text-red-700",    bg: "bg-red-50" },
  Delivered:          { label: "Livré",              color: "text-emerald-700",bg: "bg-emerald-50" },
};

export interface TrackingCheckpoint {
  time: string;
  location: string;
  tag: string;
  message: string;
}

export interface TrackingResult {
  tag: string;
  status: string;
  label: string;
  color: string;
  bg: string;
  lastUpdate: string;
  originCountry: string | null;
  destinationCountry: string | null;
  checkpoints: TrackingCheckpoint[];
  shipmentWeight: string | null;
  signedBy: string | null;
}

function parseTrackingV2026(tracking: Record<string, unknown>): TrackingResult | null {
  if (!tracking) return null;

  const tag = (tracking.tag as string) || (tracking.subtag as string) || "Pending";
  const cfg = TAG_CONFIG[tag] || TAG_CONFIG.Pending;

  // v2026-01 checkpoint format
  const events = (tracking.events || tracking.checkpoints || []) as Record<string, unknown>[];
  const checkpoints = events.map((cp) => ({
    time: (cp.time as string) || (cp.checkpoint_time as string) || "",
    location: (cp.location as string) || "",
    tag: (cp.tag as string) || (cp.subtag as string) || "",
    message: (cp.message as string) || (cp.status_description as string) || "",
  }));

  return {
    tag,
    status: (tracking.status as string) || tag.toLowerCase(),
    label: cfg.label,
    color: cfg.color,
    bg: cfg.bg,
    lastUpdate: (tracking.updated_at as string) || (tracking.last_updated_at as string) || "",
    originCountry: (tracking.origin_country as string) || (tracking.origin_country_iso3 as string) || null,
    destinationCountry: (tracking.destination_country as string) || (tracking.destination_country_iso3 as string) || null,
    checkpoints,
    shipmentWeight: (tracking.shipment_weight as string) || (tracking.weight as string) || null,
    signedBy: (tracking.signed_by as string) || null,
  };
}

// POST /api/tracking — Register a tracking number with AfterShip
export async function POST(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  if (!AFTERSHIP_KEY) {
    return NextResponse.json({ error: "AfterShip non configuré. Ajoutez AFTERSHIP_API_KEY dans vos variables d'environnement." }, { status: 400 });
  }

  const body = await req.json();
  const { trackingNumber, shippingMethod, orderId, title } = body;

  if (!trackingNumber?.trim()) {
    return NextResponse.json({ error: "Numéro de suivi requis." }, { status: 400 });
  }

  const slug = detectSlug(shippingMethod || null);

  try {
    const trackingPayload: Record<string, unknown> = {
      tracking_number: trackingNumber.trim(),
    };
    if (slug) trackingPayload.slug = slug;
    if (title) trackingPayload.title = title;
    if (orderId) trackingPayload.order_id = orderId;

    console.log(`[Tracking] Enregistrement: ${trackingNumber.trim()}${slug ? ` (${slug})` : " (auto-detect)"}`);

    const res = await fetch(`${AFTERSHIP_API}/trackings`, {
      method: "POST",
      headers: {
        "as-api-key": AFTERSHIP_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(trackingPayload),
    });

    const data = await res.json();

    if (!res.ok) {
      const code = data?.meta?.code;
      // Already exists — that's fine
      if (code === 4003 || res.status === 409) {
        console.log(`[Tracking] Déjà enregistré: ${trackingNumber.trim()}`);
        return NextResponse.json({ success: true, alreadyExists: true });
      }
      const msg = data?.meta?.message || "Erreur AfterShip";
      console.error(`[Tracking] Erreur: ${msg} (code: ${code})`);
      // If 403 = plan limitation, return a clear message
      if (res.status === 403) {
        return NextResponse.json({
          error: "L'API AfterShip requiert un plan Pro. Le suivi manuel reste disponible via le lien du transporteur.",
          planRequired: true,
        }, { status: 200 }); // Return 200 so the UI doesn't show a scary error
      }
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const result = parseTrackingV2026((data.data as Record<string, unknown>)?.tracking as Record<string, unknown> || data.data as Record<string, unknown>);
    console.log(`[Tracking] Enregistré: ${trackingNumber.trim()} — ${result?.tag}`);

    return NextResponse.json({ success: true, tracking: result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur réseau";
    console.error(`[Tracking] Échec: ${message}`);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET /api/tracking?tracking_number=XXX&shipping_method=YYY
export async function GET(req: NextRequest) {
  if (!AFTERSHIP_KEY) {
    return NextResponse.json({ error: "AfterShip non configuré." }, { status: 400 });
  }

  const { searchParams } = new URL(req.url);
  const trackingNumber = searchParams.get("tracking_number");
  const shippingMethod = searchParams.get("shipping_method");

  if (!trackingNumber?.trim()) {
    return NextResponse.json({ error: "Numéro de suivi requis." }, { status: 400 });
  }

  const slug = detectSlug(shippingMethod);

  try {
    let url: string;

    if (slug) {
      url = `${AFTERSHIP_API}/trackings/${slug}/${encodeURIComponent(trackingNumber.trim())}`;
    } else {
      url = `${AFTERSHIP_API}/trackings?tracking_number=${encodeURIComponent(trackingNumber.trim())}`;
    }

    console.log(`[Tracking] Vérification: ${trackingNumber.trim()}${slug ? ` (${slug})` : " (auto-detect)"}`);

    const res = await fetch(url, {
      headers: {
        "as-api-key": AFTERSHIP_KEY,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    if (!res.ok) {
      const code = data?.meta?.code;
      // If 403 = plan limitation, return a friendly message
      if (res.status === 403) {
        console.log(`[Tracking] Plan Pro requis pour la vérification live.`);
        return NextResponse.json({
          error: "L'API AfterShip requiert un plan Pro pour le suivi en temps réel. Le lien de suivi du transporteur reste disponible.",
          planRequired: true,
        }, { status: 200 }); // 200 so UI handles gracefully
      }
      const msg = data?.meta?.message || "Aucun suivi trouvé pour ce numéro.";
      console.error(`[Tracking] Erreur vérification: ${msg}`);
      return NextResponse.json({ error: msg }, { status: 404 });
    }

    // Parse response — v2026-01 format
    const rawTracking = (data.data as Record<string, unknown>)?.tracking as Record<string, unknown>
      || (data.data as Record<string, unknown>)
      || null;

    // If list response, take first item
    const listTrackings = (data.data as Record<string, unknown>)?.trackings as Record<string, unknown>[] | undefined;
    const tracking = rawTracking || (listTrackings?.[0] ? listTrackings[0] : null);

    if (!tracking) {
      return NextResponse.json({ error: "Aucun suivi trouvé pour ce numéro." }, { status: 404 });
    }

    const result = parseTrackingV2026(tracking);
    console.log(`[Tracking] Statut: ${trackingNumber.trim()} → ${result?.tag}`);

    return NextResponse.json({ success: true, tracking: result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur réseau";
    console.error(`[Tracking] Échec vérification: ${message}`);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}