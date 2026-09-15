/**
 * Creates a REAL Stripe test-mode Checkout Session for the seeded test user's
 * cart — the same code path and parameters as production checkout — and prints
 * the hosted payment URL. Open it in a browser, pay with 4242 4242 4242 4242,
 * and you land on the receipt; the webhook fulfills the order locally.
 *
 *   npx tsx scripts/create-test-checkout.ts
 *
 * (Run scripts/seed-test-user.ts first.)
 */
import "dotenv/config";
import Stripe from "stripe";

const secret = process.env.STRIPE_SECRET_KEY;
if (!secret) {
  console.error("Need STRIPE_SECRET_KEY in .env (test mode: sk_test_...).");
  process.exit(1);
}
if (!secret.startsWith("sk_test_")) {
  console.error(
    `Refusing to run: STRIPE_SECRET_KEY is "${secret.slice(0, 8)}…" — this harness only works in TEST mode.`
  );
  process.exit(1);
}

const stripe = new Stripe(secret, { apiVersion: "2026-06-24.dahlia" });

type PrismaDB = import("../generated/prisma/client").PrismaClient;

async function initDb(): Promise<PrismaDB> {
  const { PrismaPg } = await import("@prisma/adapter-pg");
  const { PrismaClient } = await import("../generated/prisma/client");
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });
}

const TEST_EMAIL = "stripe-test@lovesoftlife.test";
const BASE = process.env.AUTH0_BASE_URL ?? "http://localhost:3001";

async function main() {
  const db = await initDb();
  console.log("\n=== Creating test-mode Checkout Session ===\n");

  const user = await db.user.findUnique({
    where: { email: TEST_EMAIL },
    include: { cart: { include: { items: { include: { product: true } } } } },
  });
  if (!user?.cart || user.cart.items.length === 0) {
    console.error("No test user/cart — run: npx tsx scripts/seed-test-user.ts");
    process.exit(1);
  }

  const cart = user.cart;
  const totalCents = cart.items.reduce(
    (s, i) => s + i.priceCents * i.quantity,
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

  // Same parameters as src/app/api/checkout/route.ts
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
    shipping_address_collection: { allowed_countries: ["US", "CA", "GB", "AU"] },
    phone_number_collection: { enabled: true },
    metadata: { orderId: order.id, userId: user.id },
    success_url: `${BASE}/account/orders/${order.id}?paid=1`,
    cancel_url: `${BASE}/cart?canceled=1`,
  });

  await db.order.update({
    where: { id: order.id },
    data: { stripeSessionId: stripeSession.id },
  });

  console.log(`  order:   ${order.orderNumber} (${order.id})`);
  console.log(`  total:   $${(totalCents / 100).toFixed(2)} (test money)`);
  console.log(`  session: ${stripeSession.id}`);
  console.log("\n  →  OPEN THIS URL TO PAY (test card 4242 4242 4242 4242):\n");
  console.log(`  ${stripeSession.url}`);
  console.log(
    "\nAfter paying, run: npx tsx scripts/verify-test-order.ts " +
      `${order.id}\n`
  );

  await db.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
