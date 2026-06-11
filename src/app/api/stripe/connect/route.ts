import { NextRequest, NextResponse } from "next/server";

const CLIENT_ID = process.env.STRIPE_CLIENT_ID;

export async function GET(req: NextRequest) {
  if (!CLIENT_ID) {
    return NextResponse.json(
      { error: "STRIPE_CLIENT_ID non configuré." },
      { status: 500 }
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || req.headers.get("origin") || "https://e-icossys.vercel.app";

  const params = new URLSearchParams({
    response_type: "code",
    client_id: CLIENT_ID,
    scope: "read_write",
    redirect_uri: `${baseUrl}/api/stripe/callback`,
  });

  const stripeAuthUrl = `https://connect.stripe.com/oauth/authorize?${params.toString()}`;

  return NextResponse.redirect(stripeAuthUrl);
}