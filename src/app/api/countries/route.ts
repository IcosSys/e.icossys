import { NextRequest, NextResponse } from "next/server";
import { getShippingCountries } from "@/lib/countries-config";
import { cookies } from "next/headers";

const COOKIE_NAME = "shipping_countries";

export async function GET() {
  const countries = await getShippingCountries();
  return NextResponse.json({ countries });
}

export async function POST(req: NextRequest) {
  const { countries } = (await req.json()) as { countries: string[] };

  if (!Array.isArray(countries) || countries.length === 0) {
    return NextResponse.json({ error: "Au moins un pays requis." }, { status: 400 });
  }

  try {
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, JSON.stringify(countries), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
    console.log(`[Countries] ${countries.length} pays de livraison configuré(s)`);
    return NextResponse.json({ success: true, countries });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}