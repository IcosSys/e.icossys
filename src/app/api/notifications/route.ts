import { NextRequest, NextResponse } from "next/server";

const COOKIE_OPTIONS = {
  httpOnly: true as const,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 jours
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

function getStoredNotifications(raw: string | undefined): WebhookNotification[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.slice(0, 100);
  } catch {}
  return [];
}

// GET : retourner les notifications stockées dans le cookie
export async function GET(req: NextRequest) {
  const raw = req.cookies.get("admin_notifications")?.value;
  const notifs = getStoredNotifications(raw);
  const unread = notifs.filter(n => !n.read).length;
  return NextResponse.json({ notifications: notifs, unreadCount: unread });
}

// POST : marquer des notifications comme lues
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { notificationIds, markAll } = body as { notificationIds?: string[]; markAll?: boolean };

  const raw = req.cookies.get("admin_notifications")?.value;
  let notifs = getStoredNotifications(raw);

  if (markAll) {
    notifs = notifs.map(n => ({ ...n, read: true }));
  } else if (Array.isArray(notificationIds) && notificationIds.length > 0) {
    const idsToMark = new Set(notificationIds);
    notifs = notifs.map(n => idsToMark.has(n.id) ? { ...n, read: true } : n);
  } else {
    return NextResponse.json({ error: "notificationIds ou markAll requis." }, { status: 400 });
  }

  const res = NextResponse.json({ success: true, unreadCount: notifs.filter(n => !n.read).length });
  try {
    res.cookies.set("admin_notifications", JSON.stringify(notifs), COOKIE_OPTIONS);
  } catch {
    console.warn("[Notifications] Cookie trop volumineux, mise à jour partielle.");
  }
  return res;
}