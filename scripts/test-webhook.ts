/**
 * E2E test: Stripe webhook fulfillment + idempotency
 *
 * Requires the Next dev server running on localhost:3001 and Stripe
 * test-mode keys in .env (free at dashboard.stripe.com → Developers → API keys).
 *
 * Creates a user, cart, and pending order in the local DB, then fires a
 * signed `checkout.session.completed` event at the webhook. Verifies:
 *   1. 200 + { received: true }
 *   2. order becomes "paid" with paidAt set
 *   3. shipping address persisted from the session
 *   4. inventory decremented once
 *   5. cart cleared
 *   6. duplicate delivery is a no-op (inventory unchanged on second send)
 */
import "dotenv/config";
import Stripe from "stripe";

const BASE = process.env.TEST_BASE_URL ?? "http://localhost:3001";
const secret = process.env.STRIPE_SECRET_KEY;
const whsec = process.env.STRIPE_WEBHOOK_SECRET;

if (!secret || !whsec) {
  console.error("Need STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET in .env (test mode).");
  process.exit(1);
}

const stripe = new Stripe(secret, { apiVersion: "2026-06-24.dahlia" });

type PrismaDB = import("../generated/prisma/client").PrismaClient;
let db: PrismaDB;

async function initDb(): Promise<PrismaDB> {
  const { PrismaPg } = await import("@prisma/adapter-pg");
  const { PrismaClient } = await import("../generated/prisma/client");
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });
}

const TOKEN_PREFIX = `wh-e2e-${Date.now()}`;

async function main() {
  db = await initDb();
  console.log(`\n=== Stripe webhook E2E test → ${BASE} ===\n`);

  // 1. Seed a test user, product, cart, and pending order
  const user = await db.user.create({
    data: {
      email: `${TOKEN_PREFIX}@example.com`,
      auth0Id: `auth0|${TOKEN_PREFIX}`,
      role: "customer",
    },
  });

  const product = await db.product.create({
    data: {
      name: `E2E Test Product ${TOKEN_PREFIX}`,
      slug: `e2e-${TOKEN_PREFIX}`,
      description: "Temporary product created by the webhook E2E test.",
      priceCents: 4900,
      images: "",
      inventory: 10,
      categoryId: (await db.category.findFirstOrThrow()).id,
    },
  });

  const cart = await db.cart.create({
    data: { userId: user.id },
  });
  await db.cartItem.create({
    data: { cartId: cart.id, productId: product.id, quantity: 2, priceCents: 4900 },
  });

  const order = await db.order.create({
    data: {
      orderNumber: `SO-${TOKEN_PREFIX.toUpperCase()}`,
      userId: user.id,
      status: "pending",
      totalCents: 9800,
      shippingName: "",
      shippingAddress: "",
      shippingCity: "",
      shippingState: "",
      shippingZip: "",
      items: {
        create: { productId: product.id, quantity: 2, priceCents: 4900 },
      },
    },
  });

  console.log(`Created order ${order.orderNumber} (${order.id})`);

  // 2. Build a signed checkout.session.completed event with shipping details
  const sessionObject = {
    id: `cs_test_${TOKEN_PREFIX}`,
    object: "checkout.session",
    payment_intent: `pi_test_${TOKEN_PREFIX}`,
    metadata: { orderId: order.id, userId: user.id },
    collected_information: {
      shipping_details: {
        name: "Test Buyer",
        address: {
          line1: "123 Silk Road",
          line2: "Apt 4",
          city: "Portland",
          state: "OR",
          postal_code: "97201",
          country: "US",
        },
      },
    },
  };

  const event = {
    id: `evt_test_${TOKEN_PREFIX}`,
    object: "event",
    type: "checkout.session.completed",
    data: { object: sessionObject },
  };

  const payload = JSON.stringify(event);
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = stripe.webhooks.generateTestHeaderString({
    payload,
    secret: whsec!,
    timestamp,
  });

  // 3. First delivery — must fulfill
  const res1 = await fetch(`${BASE}/api/webhooks/stripe`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "stripe-signature": signature },
    body: payload,
  });
  const body1 = await res1.text();
  console.log(`Delivery 1: HTTP ${res1.status} ${body1}`);
  if (res1.status !== 200) throw new Error("First delivery failed");

  const after1 = await db.order.findUnique({
    where: { id: order.id },
    include: { items: true },
  });
  const inventory1 = await db.product.findUniqueOrThrow({ where: { id: product.id } });
  const cartItems1 = await db.cartItem.findMany({ where: { cartId: cart.id } });

  const checks: [string, boolean][] = [
    ["1. order status → paid", after1?.status === "paid"],
    ["2. paidAt set", after1?.paidAt instanceof Date],
    ["3. payment intent stored", after1?.stripePaymentIntent === sessionObject.payment_intent],
    ["4. shipping name persisted", after1?.shippingName === "Test Buyer"],
    ["5. shipping address persisted", after1?.shippingAddress === "123 Silk Road, Apt 4"],
    ["6. city/state/zip persisted", after1?.shippingCity === "Portland" && after1?.shippingState === "OR" && after1?.shippingZip === "97201"],
    ["7. inventory decremented (10→8)", inventory1.inventory === 8],
    ["8. cart cleared", cartItems1.length === 0],
  ];

  // 4. Second delivery of the same event — must be a no-op
  const res2 = await fetch(`${BASE}/api/webhooks/stripe`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "stripe-signature": signature },
    body: payload,
  });
  console.log(`Delivery 2 (duplicate): HTTP ${res2.status} ${await res2.text()}`);

  const inventory2 = await db.product.findUniqueOrThrow({ where: { id: product.id } });
  checks.push(["9. duplicate ignored (inventory still 8)", inventory2.inventory === 8]);

  // 5. Report + cleanup
  let failed = 0;
  for (const [label, ok] of checks) {
    console.log(`  ${ok ? "✓" : "✗ FAIL"}  ${label}`);
    if (!ok) failed++;
  }

  await db.order.delete({ where: { id: order.id } });
  await db.cart.delete({ where: { id: cart.id } });
  await db.product.delete({ where: { id: product.id } });
  await db.user.delete({ where: { id: user.id } });
  console.log("\n(cleaned up test rows)");

  if (failed > 0) {
    console.error(`\n${failed} check(s) FAILED`);
    process.exit(1);
  }
  console.log("\nAll webhook E2E checks passed ✓");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => db?.$disconnect());
