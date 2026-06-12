import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

const COOKIE_OPTIONS = {
  httpOnly: true as const,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 365, // 1 an
};

// GET : vérifier si le webhook est configuré
export async function GET(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  const secret = req.cookies.get("stripe_webhook_secret")?.value
    || process.env.STRIPE_WEBHOOK_SECRET
    || null;

  return NextResponse.json({
    configured: !!secret,
    // On ne retourne jamais le secret complet, juste les 4 derniers caractères
    hint: secret ? `...${secret.slice(-4)}` : null,
    source: secret && process.env.STRIPE_WEBHOOK_SECRET === secret ? "env" : secret ? "cookie" : null,
  });
}

// POST : sauvegarder le webhook signing secret dans un cookie httpOnly
export async function POST(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  const { secret } = await req.json() as { secret?: string };

  if (!secret || typeof secret !== "string") {
    return NextResponse.json({ error: "Secret webhook requis." }, { status: 400 });
  }

  const trimmed = secret.trim();

  if (!trimmed.startsWith("whsec_")) {
    return NextResponse.json(
      { error: "Le secret doit commencer par whsec_" },
      { status: 400 }
    );
  }

  const res = NextResponse.json({
    success: true,
    hint: `...${trimmed.slice(-4)}`,
  });

  res.cookies.set("stripe_webhook_secret", trimmed, COOKIE_OPTIONS);

  console.log(`[Webhook Config] Secret sauvegardé (Cookie) ...${trimmed.slice(-4)}`);
  return res;
}