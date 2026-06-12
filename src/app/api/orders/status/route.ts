import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { requireAdmin } from "@/lib/auth";

const VALID_STATUSES = ["paid", "processing", "shipped", "delivered", "cancelled"] as const;

const STATUS_LABELS: Record<string, string> = {
  paid: "Payé",
  processing: "En préparation",
  shipped: "Expédié",
  delivered: "Livré",
  cancelled: "Annulé",
};

export async function POST(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  const stripe = await getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe non configuré." }, { status: 400 });
  }

  const { sessionId, status, trackingNumber } = await req.json();

  if (!sessionId || !status) {
    return NextResponse.json({ error: "sessionId et status requis." }, { status: 400 });
  }

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({
      error: `Statut invalide. Valeurs: ${VALID_STATUSES.join(", ")}`,
    }, { status: 400 });
  }

  try {
    // Construire metadata : préserver les clés existantes, ajouter/modifier order_status et tracking_number
    const existing = await stripe.checkout.sessions.retrieve(sessionId);
    const existingMeta = (existing.metadata as Record<string, string>) || {};
    const newMeta: Record<string, string> = { ...existingMeta, order_status: status };
    if (trackingNumber && trackingNumber.trim()) {
      newMeta.tracking_number = trackingNumber.trim();
    }

    const session = await stripe.checkout.sessions.update(sessionId, {
      metadata: newMeta,
    });

    console.log(`[Orders] Statut ${sessionId} → ${status} (${STATUS_LABELS[status]})${trackingNumber ? ` — suivi: ${trackingNumber}` : ""}`);

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      status,
      label: STATUS_LABELS[status],
      trackingNumber: trackingNumber || null,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur Stripe";
    console.error(`[Orders] Échec maj statut: ${message}`);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET /api/orders/status — retourne les statuts disponibles
export async function GET() {
  const statuses = VALID_STATUSES.map((s) => ({
    value: s,
    label: STATUS_LABELS[s],
  }));
  return NextResponse.json({ statuses });
}