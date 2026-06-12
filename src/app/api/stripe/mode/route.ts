import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

const COOKIE_OPTIONS = {
  httpOnly: true as const,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
};

// POST /api/stripe/mode — basculer entre test et live
export async function POST(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  const { mode } = await req.json();

  if (mode !== "test" && mode !== "live") {
    return NextResponse.json({ error: "Mode invalide. Utilisez 'test' ou 'live'." }, { status: 400 });
  }

  // Vérifier que la clé cible existe
  const cookieName = mode === "live" ? "stripe_live_key" : "stripe_test_key";
  const targetKey = req.cookies.get(cookieName)?.value;

  if (!targetKey) {
    return NextResponse.json(
      { error: `Aucune clé ${mode === "live" ? "live" : "test"} configurée.` },
      { status: 400 }
    );
  }

  console.log(`[Stripe Mode] Basculement vers ${mode} (clé ...${targetKey.slice(-4)}).`);

  const res = NextResponse.json({ success: true, mode });
  res.cookies.set("stripe_mode", mode, COOKIE_OPTIONS);
  return res;
}