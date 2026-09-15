import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentStorefrontUser } from "@/lib/session";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const user = await getCurrentStorefrontUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cart = await db.cart.findUnique({
    where: { userId: user.id },
    include: { items: { include: { product: true } } },
  });

  if (!cart || cart.items.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  const totalCents = cart.items.reduce(
    (sum, item) => sum + item.priceCents * item.quantity,
    0
  );

  const order = await db.order.create({
    data: {
      orderNumber: `SO-${Date.now().toString(36).toUpperCase()}`,
      userId: user.id,
      status: "pending",
      totalCents,
      shippingName: "",
      shippingAddress: "",
      shippingCity: "",
      shippingState: "",
      shippingZip: "",
      items: {
        create: cart.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          priceCents: item.priceCents,
        })),
      },
    },
  });

  const baseUrl = process.env.AUTH0_BASE_URL ?? new URL(req.url).origin;

  const stripeSession = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: cart.items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.product.name,
          images: item.product.images ? [item.product.images] : [],
        },
        unit_amount: item.priceCents,
      },
      quantity: item.quantity,
    })),
    // Collect the shipping address on Stripe's hosted page — it's required,
    // and we persist it onto the order when the webhook confirms payment.
    shipping_address_collection: {
      allowed_countries: ["US", "CA", "GB", "AU"],
    },
    phone_number_collection: {
      enabled: true,
    },
    metadata: {
      orderId: order.id,
      userId: user.id,
    },
    success_url: `${baseUrl}/account/orders/${order.id}?paid=1`,
    cancel_url: `${baseUrl}/cart?canceled=1`,
  });

  await db.order.update({
    where: { id: order.id },
    data: { stripeSessionId: stripeSession.id },
  });

  return NextResponse.json({ url: stripeSession.url! });
}
