import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireStorefrontUser } from "@/lib/session";
import { stripe } from "@/lib/stripe";
import { fulfillStripeCheckout } from "@/lib/fulfillment";
import { formatPrice } from "@/lib/utils";

// Session-dependent: must render per-request, never prerendered.
export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ paid?: string }>;
};

export default async function OrderDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { paid } = await searchParams;

  const user = await requireStorefrontUser(`/account/orders/${id}`);

  let order = await db.order.findUnique({
    where: { id },
    include: { items: { include: { product: true } } },
  });

  if (!order || order.userId !== user.id) notFound();

  // Reconciliation: the buyer just returned from Stripe but the webhook
  // hasn't landed yet. Fulfill directly from the Checkout Session — the
  // shared routine is idempotent, so this is safe even if the webhook
  // arrives mid-flight.
  const sessionId = order.stripeSessionId;
  if (paid === "1" && order.status === "pending" && sessionId) {
    try {
      const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);
      await fulfillStripeCheckout(checkoutSession);
      order = await db.order.findUnique({
        where: { id },
        include: { items: { include: { product: true } } },
      });
    } catch (err) {
      console.error("[order-reconciliation] failed:", err);
    }
  }

  if (!order) notFound();

  const isReceipt =
    paid === "1" || ["paid", "shipped", "delivered"].includes(order.status);
  const hasShipping = Boolean(order.shippingName || order.shippingAddress);

  return (
    <div className="mx-auto px-6 py-16" style={{ maxWidth: 720 }}>
      {isReceipt ? (
        <div className="mb-12 border-b border-hairline pb-10 text-center">
          <p className="eyebrow text-gold-deep">Order {order.orderNumber}</p>
          <h1 className="mt-4 font-display text-[40px] leading-[1.05] text-ink sm:text-[52px]">
            Thank you<span className="italic"> — order confirmed</span>
          </h1>
          <p className="mx-auto mt-4 max-w-md text-[15px] leading-[1.7] text-ink-muted-80">
            Your payment has been received and your order is being prepared. This
            page is your receipt — the full details are saved to your account.
          </p>
        </div>
      ) : (
        <div className="mb-8">
          <h1 className="text-[22px] sm:text-[24px] lg:text-[28px] font-normal leading-[1.14] text-ink mb-1">
            Order {order.orderNumber}
          </h1>
          <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs capitalize text-muted-foreground">
            {order.status}
          </span>
          <p className="text-sm text-muted-foreground mt-2">
            Placed on {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>
      )}

      <div className="space-y-4">
        {order.items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 rounded-[18px] border border-hairline bg-white p-4"
          >
            <div className="h-16 w-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
              {item.product.images && (
                <img
                  src={item.product.images}
                  alt={item.product.name}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[17px] font-normal text-ink">{item.product.name}</p>
              <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
              <p className="text-sm text-muted-foreground">
                {formatPrice(item.priceCents)} each
              </p>
            </div>
            <p className="text-[17px] font-normal text-ink">
              {formatPrice(item.priceCents * item.quantity)}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 border-t border-hairline pt-6">
        <div className="flex justify-between text-[17px] font-normal text-ink">
          <span>Total</span>
          <span>{formatPrice(order.totalCents)}</span>
        </div>
        {isReceipt && (
          <div className="mt-2 flex justify-between text-sm text-muted-foreground">
            <span>Payment</span>
            <span className="capitalize">
              {order.status === "pending" ? "Processing…" : `Paid — ${new Date(order.paidAt ?? order.createdAt).toLocaleDateString()}`}
            </span>
          </div>
        )}
      </div>

      {hasShipping && (
        <section className="mt-10 border-t border-hairline pt-6">
          <h2 className="eyebrow text-ink-muted-48">Shipping to</h2>
          <address className="mt-3 not-italic text-[14px] leading-[1.7] text-ink-muted-80">
            {order.shippingName}
            <br />
            {order.shippingAddress}
            <br />
            {order.shippingCity}
            {order.shippingCity && order.shippingState ? ", " : ""}
            {order.shippingState} {order.shippingZip}
            <br />
            {order.shippingCountry}
          </address>
        </section>
      )}

      <div className="mt-12 text-center">
        <Link
          href="/products"
          className="inline-block text-[11px] font-semibold uppercase tracking-[0.22em] text-ink underline underline-offset-4 transition-colors hover:text-gold-deep"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
