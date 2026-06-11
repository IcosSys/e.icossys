import { NextRequest, NextResponse } from "next/server";
import { getShippingConfig, DEFAULT_SHIPPING_OPTIONS, ShippingOption } from "@/lib/shipping";
import { cookies } from "next/headers";

export async function GET() {
  const options = await getShippingConfig();
  return NextResponse.json({ options });
}

export async function POST(req: NextRequest) {
  const { options } = (await req.json()) as { options: ShippingOption[] };

  if (!Array.isArray(options) || options.length === 0) {
    return NextResponse.json({ error: "Au moins une option requise." }, { status: 400 });
  }

  for (const opt of options) {
    if (!opt.id || !opt.name || typeof opt.price !== "number" || typeof opt.active !== "boolean") {
      return NextResponse.json({ error: `Option "${opt.id || "?"}" invalide.` }, { status: 400 });
    }
    if (opt.minDays < 1 || opt.maxDays < opt.minDays) {
      return NextResponse.json({ error: `Délais invalides pour "${opt.name}".` }, { status: 400 });
    }
  }

  try {
    const cookieStore = await cookies();
    cookieStore.set("shipping_config", JSON.stringify(options), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
    console.log(`[Shipping] Config sauvegardée : ${options.filter(o => o.active).length} mode(s) actif(s)`);
    return NextResponse.json({ success: true, options });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}