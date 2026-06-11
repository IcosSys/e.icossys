import { NextResponse } from "next/server";
import { getConnectedAccount } from "@/lib/stripe";

export async function GET() {
  const account = getConnectedAccount();

  if (!account) {
    return NextResponse.json({ connected: false });
  }

  return NextResponse.json({
    connected: true,
    stripeAccountId: account.stripeAccountId,
    connectedAt: account.connectedAt,
  });
}