import { NextRequest, NextResponse } from "next/server";
import { getStripe, setConnectedAccount } from "@/lib/stripe";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    const errorDescription = searchParams.get("error_description") || error;
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL || "https://e-icossys.vercel.app"}/admin?stripe_error=${encodeURIComponent(errorDescription)}`
    );
  }

  if (!code) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL || "https://e-icossys.vercel.app"}/admin?stripe_error=missing_code`
    );
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL || "https://e-icossys.vercel.app"}/admin?stripe_error=stripe_not_configured`
    );
  }

  try {
    const stripeInstance = getStripe();
    const response = await stripeInstance.oauth.token({
      grant_type: "authorization_code",
      code,
    });

    const stripeUserId = response.stripe_user_id;

    if (!stripeUserId) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL || "https://e-icossys.vercel.app"}/admin?stripe_error=no_account_id`
      );
    }

    // Sauvegarder le compte connecté
    setConnectedAccount(stripeUserId);

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL || "https://e-icossys.vercel.app"}/admin?stripe_connected=true`
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL || "https://e-icossys.vercel.app"}/admin?stripe_error=${encodeURIComponent(message)}`
    );
  }
}