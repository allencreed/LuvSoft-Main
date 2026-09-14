import { db } from "@/lib/db";

/**
 * Minimal shape of a Stripe Checkout Session — we only read the fields we need,
 * so this stays decoupled from Stripe's SDK types (which churn between API versions).
 */
export type CheckoutSessionLike = {
  metadata?: { orderId?: string | null; userId?: string | null } | null;
  // Expandable — string when unexpanded, object when expanded
  payment_intent?: string | { id?: string } | null;
  // Current API: shipping lives under collected_information
  collected_information?: {
    shipping_details?: {
      name?: string | null;
      address?: StripeAddress | null;
    } | null;
  } | null;
  // Legacy API location (older events / API versions)
  shipping_details?: {
    name?: string | null;
    address?: StripeAddress | null;
  } | null;
  // Last-resort fallback: the customer's billing address
  customer_details?: {
    name?: string | null;
    address?: StripeAddress | null;
  } | null;
};

type StripeAddress = {
  line1?: string | null;
  line2?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
} | null;

export type FulfillmentResult =
  | { outcome: "fulfilled"; orderId: string }
  | { outcome: "duplicate"; orderId: string }
  | { outcome: "skipped"; reason: string };

function pickAddress(session: CheckoutSessionLike) {
  const shipping =
    session.collected_information?.shipping_details ??
    session.shipping_details ??
    null;

  const address = shipping?.address ?? session.customer_details?.address ?? null;
  const name = shipping?.name ?? session.customer_details?.name ?? "";

  if (!address) return null;

  return {
    shippingName: name || "",
    shippingAddress: [address.line1, address.line2].filter(Boolean).join(", "),
    shippingCity: address.city ?? "",
    shippingState: address.state ?? "",
    shippingZip: address.postal_code ?? "",
    shippingCountry: address.country ?? "US",
  };
}

/**
 * Completes a paid Stripe Checkout session exactly once.
 *
 * Safe to call from both the webhook and the confirmation page's
 * reconciliation path: if the order was already fulfilled (status
 * no longer "pending"), it returns without touching anything.
 */
export async function fulfillStripeCheckout(
  session: CheckoutSessionLike
): Promise<FulfillmentResult> {
  const orderId = session.metadata?.orderId;
  if (!orderId) {
    return { outcome: "skipped", reason: "no orderId in session metadata" };
  }

  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) {
    return { outcome: "skipped", reason: `order ${orderId} not found` };
  }

  // Idempotency guard: Stripe retries webhooks, and the confirmation page
  // may race the webhook. Only the first caller fulfills.
  if (order.status !== "pending") {
    return { outcome: "duplicate", orderId };
  }

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? null;

  const items = await db.orderItem.findMany({ where: { orderId } });
  const shipping = pickAddress(session);

  await db.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: {
        status: "paid",
        paidAt: new Date(),
        ...(paymentIntentId ? { stripePaymentIntent: paymentIntentId } : {}),
        ...(shipping ?? {}),
      },
    });

    for (const item of items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { inventory: { decrement: item.quantity } },
      });
    }

    const userId = session.metadata?.userId ?? order.userId;
    const cart = await tx.cart.findUnique({ where: { userId } });
    if (cart) {
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
  });

  return { outcome: "fulfilled", orderId };
}
