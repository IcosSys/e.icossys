import { NextRequest, NextResponse } from "next/server";

const AFTERSHIP_API = "https://api.aftership.com/v4";
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

export interface TrackingSummary {
  tag: string;
  label: string;
  color: string;
  bg: string;
  lastUpdate: string;
}

function parseTracking(data: Record<string, unknown>): TrackingResult | null {
  const tracking = data?.tracking as Record<string, unknown> | undefined;
  if (!tracking) return null;

  const tag = (tracking.tag as string) || "Pending";
  const cfg = TAG_CONFIG[tag] || TAG_CONFIG.Pending;
  const checkpoints = ((tracking.checkpoints || []) as Record<string, unknown>[])
    .map((cp) => ({
      time: (cp.checkpoint_time as string) || "",
      location: (cp.location as string) || "",
      tag: (cp.tag as string) || "",
      message: (cp.message as string) || "",
    }));

  return {
    tag,
    status: (tracking.status as string) || tag.toLowerCase(),
    label: cfg.label,
    color: cfg.color,
    bg: cfg.bg,
    lastUpdate: (tracking.updated_at as string) || "",
    originCountry: (tracking.origin_country as string) || null,
    destinationCountry: (tracking.destination_country as string) || null,
    checkpoints,
    shipmentWeight: (tracking.shipment_weight as string) || null,
    signedBy: (tracking.signed_by as string) || null,
  };
}

// POST /api/tracking — Register a tracking number with AfterShip
export async function POST(req: NextRequest) {
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
      ...(slug && { slug }),
    };

    // Add optional metadata
    if (title) trackingPayload.title = title;
    if (orderId) {
      trackingPayload.custom_fields = { order_id: orderId };
    }

    console.log(`[AfterShip] Enregistrement: ${trackingNumber.trim()}${slug ? ` (${slug})` : " (auto-detect)"}`);

    const res = await fetch(`${AFTERSHIP_API}/trackings`, {
      method: "POST",
      headers: {
        "aftership-api-key": AFTERSHIP_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tracking: trackingPayload }),
    });

    const data = await res.json();

    if (!res.ok || data?.meta?.code !== 201) {
      // If already exists (code 4003), that's fine — just return success
      const code = data?.meta?.code;
      if (code === 4003) {
        console.log(`[AfterShip] Déjà enregistré: ${trackingNumber.trim()}`);
        return NextResponse.json({ success: true, alreadyExists: true });
      }
      const msg = data?.meta?.message || "Erreur AfterShip";
      console.error(`[AfterShip] Erreur: ${msg}`);
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const result = parseTracking(data.data);
    console.log(`[AfterShip] Enregistré: ${trackingNumber.trim()} — ${result?.tag}`);

    return NextResponse.json({
      success: true,
      tracking: result,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur AfterShip";
    console.error(`[AfterShip] Échec: ${message}`);
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
      // Direct lookup with known carrier
      url = `${AFTERSHIP_API}/trackings/${slug}/${encodeURIComponent(trackingNumber.trim())}`;
    } else {
      // Search by tracking number (auto-detect carrier)
      url = `${AFTERSHIP_API}/trackings?tracking_number=${encodeURIComponent(trackingNumber.trim())}`;
    }

    console.log(`[AfterShip] Vérification: ${trackingNumber.trim()}${slug ? ` (${slug})` : " (auto-detect)"}`);

    const res = await fetch(url, {
      headers: {
        "aftership-api-key": AFTERSHIP_KEY,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    if (!res.ok) {
      const msg = data?.meta?.message || "Erreur AfterShip";
      console.error(`[AfterShip] Erreur vérification: ${msg}`);
      return NextResponse.json({ error: msg }, { status: 404 });
    }

    // Handle both single tracking and list response
    const trackingData = data?.data?.tracking
      ? data.data
      : Array.isArray(data?.data?.trackings) && data.data.trackings.length > 0
        ? { tracking: data.data.trackings[0] }
        : null;

    if (!trackingData) {
      return NextResponse.json({ error: "Aucun suivi trouvé pour ce numéro." }, { status: 404 });
    }

    const result = parseTracking(trackingData);
    console.log(`[AfterShip] Statut: ${trackingNumber.trim()} → ${result?.tag}`);

    return NextResponse.json({
      success: true,
      tracking: result,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur AfterShip";
    console.error(`[AfterShip] Échec vérification: ${message}`);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}