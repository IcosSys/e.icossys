import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";

const COOKIE_OPTIONS = {
  httpOnly: true as const,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 jours — les notifs sont éphémères
};

interface WebhookNotification {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  customerEmail: string | null;
  customerName: string | null;
  productName: string | null;
  timestamp: number;
  read: boolean;
}

// Lire les notifications existantes depuis le cookie
function getStoredNotifications(req: NextRequest): WebhookNotification[] {
  const raw = req.cookies.get("admin_notifications")?.value;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.slice(0, 100);
  } catch {}
  return [];
}

// Sauvegarder les notifications dans un cookie (set via response)
function setNotificationCookie(res: NextResponse, notifs: WebhookNotification[]) {
  try {
    res.cookies.set("admin_notifications", JSON.stringify(notifs), COOKIE_OPTIONS);
  } catch {
    // Si le cookie est trop gros, on ne fait rien (Next.js a une limite ~4KB par cookie)
    console.warn("[Webhook] Impossible de sauvegarder les notifications (cookie trop volumineux).");
  }
}

export async function POST(req: NextRequest) {
  const stripe = await getStripe();

  if (!stripe) {
    console.error("[Webhook] Stripe non configuré.");
    return NextResponse.json({ error: "Stripe non configuré." }, { status: 400 });
  }

  // Lire le secret webhook depuis le cookie
  const webhookSecret = req.cookies.get("stripe_webhook_secret")?.value
    || process.env.STRIPE_WEBHOOK_SECRET
    || null;

  if (!webhookSecret) {
    console.error("[Webhook] Aucun secret webhook configuré.");
    return NextResponse.json({ error: "Webhook non configuré." }, { status: 400 });
  }

  // Stripe webhook nécessite le body brut pour la vérification de signature
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    console.error("[Webhook] En-tête stripe-signature manquant.");
    return NextResponse.json({ error: "Signature manquante." }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur de vérification";
    console.error(`[Webhook] Échec de la vérification de signature : ${message}`);
    return NextResponse.json({ error: `Erreur de vérification : ${message}` }, { status: 400 });
  }

  // Traiter les événements
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    console.log(`[Webhook] checkout.session.completed — ${session.id}`);

    try {
      const existingNotifs = getStoredNotifications(req);
      // Éviter les doublons
      if (existingNotifs.some(n => n.orderId === session.id)) {
        console.log(`[Webhook] Notification déjà existante pour ${session.id}, ignorée.`);
        return NextResponse.json({ received: true, duplicate: true });
      }

      const newNotif: WebhookNotification = {
        id: `wh_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        orderId: session.id,
        amount: session.amount_total || 0,
        currency: session.currency || "eur",
        customerEmail: session.customer_details?.email || session.customer_email || null,
        customerName: session.customer_details?.name || null,
        productName: session.metadata?.product_name || null,
        timestamp: Date.now(),
        read: false,
      };

      const updated = [newNotif, ...existingNotifs].slice(0, 50);

      const res = NextResponse.json({ received: true, notification: newNotif });
      setNotificationCookie(res, updated);

      console.log(`[Webhook] Notification stockée pour ${session.id} — ${session.customer_details?.email || "?"} — ${(newNotif.amount / 100).toFixed(2)} ${newNotif.currency.toUpperCase()}`);
      return res;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur";
      console.error(`[Webhook] Erreur lors du traitement : ${message}`);
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  // Événement non géré — répondre 200 pour éviter les retries Stripe
  console.log(`[Webhook] Événement non géré : ${event.type}`);
  return NextResponse.json({ received: true, unhandled: true, type: event.type });
}