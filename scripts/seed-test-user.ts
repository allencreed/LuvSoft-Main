/**
 * One-time seed for the manual Stripe checkout test:
 * creates (or resets) a local test user with a 1-item cart.
 *
 *   npx tsx scripts/seed-test-user.ts
 */
import "dotenv/config";

type PrismaDB = import("../generated/prisma/client").PrismaClient;

async function initDb(): Promise<PrismaDB> {
  const { PrismaPg } = await import("@prisma/adapter-pg");
  const { PrismaClient } = await import("../generated/prisma/client");
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });
}

const TEST_EMAIL = "stripe-test@lovesoftlife.test";
const TEST_AUTH0_ID = "auth0|stripe-test-user";

async function main() {
  const db = await initDb();
  console.log("\n=== Seeding Stripe test user ===\n");

  // Reset any previous test user (cascades to cart/items/orders)
  await db.user.deleteMany({ where: { auth0Id: TEST_AUTH0_ID } });

  // Pick a real in-stock product (cheapest, so a test payment is trivial)
  const product = await db.product.findFirst({
    where: { inventory: { gt: 0 } },
    orderBy: { priceCents: "asc" },
  });
  if (!product) throw new Error("No in-stock products found — is the DB seeded?");

  const user = await db.user.create({
    data: {
      email: TEST_EMAIL,
      auth0Id: TEST_AUTH0_ID,
      name: "Stripe Test",
      cart: {
        create: {
          items: {
            create: {
              productId: product.id,
              quantity: 1,
              priceCents: product.priceCents,
            },
          },
        },
      },
    },
  });

  console.log(`  user:  ${user.email} (${user.id})`);
  console.log(`  cart:  1 × ${product.name} @ ${(product.priceCents / 100).toFixed(2)}`);
  console.log("\nNext: npx tsx scripts/create-test-checkout.ts\n");

  await db.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
