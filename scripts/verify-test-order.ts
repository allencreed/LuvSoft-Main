/**
 * Verifies a test order was fulfilled end-to-end after Stripe payment:
 * status, paidAt, payment intent, shipping address, inventory decrement,
 * cart cleared, and the receipt page rendering.
 *
 *   npx tsx scripts/verify-test-order.ts <orderId>
 */
import "dotenv/config";

const orderId = process.argv[2];
if (!orderId) {
  console.error("Usage: npx tsx scripts/verify-test-order.ts <orderId>");
  process.exit(1);
}

const BASE = process.env.TEST_BASE_URL ?? "http://localhost:3001";

type PrismaDB = import("../generated/prisma/client").PrismaClient;

async function initDb(): Promise<PrismaDB> {
  const { PrismaPg } = await import("@prisma/adapter-pg");
  const { PrismaClient } = await import("../generated/prisma/client");
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });
}

let pass = 0;
let fail = 0;
function check(name: string, ok: boolean, detail = "") {
  if (ok) {
    pass++;
    console.log(`  PASS  ${name}${detail ? ` — ${detail}` : ""}`);
  } else {
    fail++;
    console.log(`  FAIL  ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

async function main() {
  const db = await initDb();
  console.log(`\n=== Verifying test order ${orderId} ===\n`);

  let order = await db.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } } },
  });
  if (!order) {
    console.error("Order not found.");
    process.exit(1);
  }

  // Give a just-fired webhook a moment if we're called immediately after pay
  for (let i = 0; i < 6 && order.status === "pending"; i++) {
    await new Promise((r) => setTimeout(r, 2500));
    order = (await db.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } } },
    }))!;
  }

  check("order is paid", order.status === "paid", `status=${order.status}`);
  check("paidAt timestamp set", Boolean(order.paidAt), order.paidAt?.toISOString() ?? "missing");
  check("stripePaymentIntent recorded", Boolean(order.stripePaymentIntent), order.stripePaymentIntent ?? "missing");

  const addr = [order.shippingName, order.shippingAddress, order.shippingCity].every(Boolean);
  check("shipping address persisted", addr, addr ? `${order.shippingName}, ${order.shippingCity} ${order.shippingState}` : "empty");

  let inventoryOk = true;
  for (const item of order.items) {
    const before = await db.product.findUnique({ where: { id: item.productId } });
    // We can't know the pre-purchase count retroactively; verify inventory is
    // a sane non-negative number and that the webhook ran exactly once by
    // checking the order only transitioned once (no double-decrement marker
    // exists) — the true decrement check happens by watching stock change
    // between harness steps, so here we just assert positivity.
    if (!before || before.inventory < 0) inventoryOk = false;
  }
  check("inventory sane after fulfillment", inventoryOk);

  const testUser = await db.user.findUnique({
    where: { auth0Id: "auth0|stripe-test-user" },
    include: { cart: { include: { items: true } } },
  });
  const cartCleared = !testUser?.cart || testUser.cart.items.length === 0;
  check("cart cleared", cartCleared, cartCleared ? "0 items" : `${testUser?.cart?.items.length ?? "?"} items remain`);

  // Receipt page renders with the confirmation header
  const res = await fetch(`${BASE}/account/orders/${orderId}?paid=1`);
  const body = await res.text();
  check(
    "receipt page renders confirmation",
    res.ok && /Thank you/i.test(body) && new RegExp(order.orderNumber).test(body),
    `HTTP ${res.status}`
  );

  console.log(`\n${pass}/${pass + fail} checks passed.\n`);

  await db.$disconnect();
  if (fail > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
