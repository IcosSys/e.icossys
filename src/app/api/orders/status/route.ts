import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

const VALID_STATUSES = ["paid", "processing", "shipped", "delivered", "cancelled"] as const;

const STATUS_LABELS: Record<string, string> = {
  paid: "Payé",
  processing: "En préparation",
  shipped: "Expédié",
  delivered: "Livré",
  cancelled: "Annulé",
};

export async function POST(req: NextRequest) {
  const stripe = await getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe non configuré." }, { status: 400 });
  }

  const { sessionId, status } = await req.json();

  if (!sessionId || !status) {
    return NextResponse.json({ error: "sessionId et status requis." }, { status: 400 });
  }

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({
      error: `Statut invalide. Valeurs: ${VALID_STATUSES.join(", ")}`,
    }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.update(sessionId, {
      metadata: { order_status: status },
    });

    console.log(`[Orders] Statut ${sessionId} → ${status} (${STATUS_LABELS[status]})`);

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      status,
      label: STATUS_LABELS[status],
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