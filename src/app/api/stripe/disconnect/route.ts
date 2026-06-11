import { NextResponse } from "next/server";
import { removeStripeKey } from "@/lib/stripe";

export async function POST() {
  removeStripeKey();
  return NextResponse.json({ success: true });
}