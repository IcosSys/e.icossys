import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

const COOKIE_OPTIONS = {
  httpOnly: true as const,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 0,
};

export async function POST(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  const res = NextResponse.json({ success: true });
  // Supprimer les deux clés + le mode + l'ancien cookie legacy
  res.cookies.set("stripe_test_key", "", COOKIE_OPTIONS);
  res.cookies.set("stripe_live_key", "", COOKIE_OPTIONS);
  res.cookies.set("stripe_mode", "", COOKIE_OPTIONS);
  res.cookies.set("stripe_secret_key", "", COOKIE_OPTIONS);
  return res;
}