import { NextRequest, NextResponse } from "next/server";
import { createAdminSession, COOKIE_OPTIONS } from "@/lib/auth";
import { timingSafeEqual } from "crypto";

// ─── Simple in-memory rate limiter ────────────────────────────────
const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 60 * 1000; // 1 minute

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > MAX_ATTEMPTS;
}

// ─── Timing-safe string comparison ────────────────────────────────
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(Buffer.from(a, "utf-8"), Buffer.from(b, "utf-8"));
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  // Rate limiting by IP
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Trop de tentatives. Réessayez dans 60 secondes." },
      { status: 429 }
    );
  }

  const { email, password } = await req.json();

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    return NextResponse.json(
      { error: "Serveur non configuré." },
      { status: 500 }
    );
  }

  if (!safeEqual(email, adminEmail) || !safeEqual(password, adminPassword)) {
    return NextResponse.json(
      { error: "Identifiants incorrects" },
      { status: 401 }
    );
  }

  // Create signed JWT
  const token = await createAdminSession();

  const res = NextResponse.json({ success: true });
  res.cookies.set("admin_session", token, COOKIE_OPTIONS);

  return res;
}