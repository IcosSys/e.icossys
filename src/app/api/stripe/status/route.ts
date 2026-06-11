import { NextResponse } from "next/server";
import { getStripeStatus } from "@/lib/stripe";

export async function GET() {
  const status = await getStripeStatus();
  return NextResponse.json(status);
}