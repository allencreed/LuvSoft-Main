import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { fulfillStripeCheckout } from "@/lib/fulfillment";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const result = await fulfillStripeCheckout(event.data.object);
    if (result.outcome === "skipped") {
      // Log but don't fail — a 500 would trigger Stripe retries for a
      // session we can never fulfill.
      console.error("[stripe-webhook] skipped:", result.reason);
    }
    // "duplicate" is the happy idempotency path — acknowledge silently.
  }

  return NextResponse.json({ received: true });
}
