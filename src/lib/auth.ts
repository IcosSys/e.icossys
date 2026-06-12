import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const COOKIE_NAME = "admin_session";

function getSecret(): Uint8Array {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "fallback-change-me";
  return new TextEncoder().encode(secret);
}

export async function createAdminSession(): Promise<string> {
  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(getSecret());
  return token;
}

export async function verifyAdminSession(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, getSecret());
    return true;
  } catch {
    return false;
  }
}

export async function getSessionToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value;
}

const COOKIE_OPTIONS = {
  httpOnly: true as const,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/" as const,
  maxAge: 60 * 60 * 24, // 24h
};

export { COOKIE_NAME, COOKIE_OPTIONS };

/**
 * Call at the top of any admin API route handler.
 * Returns a 401 NextResponse if not authenticated, or null if authorized.
 */
export async function requireAdmin(req?: Request): Promise<NextResponse | null> {
  // Also check Origin for CSRF on non-GET requests
  if (req && req.method !== "GET" && req.method !== "HEAD") {
    const origin = req.headers.get("origin");
    const allowedOrigins = [
      process.env.NEXT_PUBLIC_BASE_URL,
      "https://e-icossys.vercel.app",
    ].filter(Boolean);
    if (origin && allowedOrigins.length > 0 && !allowedOrigins.some(o => o === origin)) {
      return NextResponse.json({ error: "Origin non autorisé." }, { status: 403 });
    }
  }

  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const valid = await verifyAdminSession(token);
  if (!valid) {
    return NextResponse.json({ error: "Session expirée." }, { status: 401 });
  }

  return null; // authorized
}