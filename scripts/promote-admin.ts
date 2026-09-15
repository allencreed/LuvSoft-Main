/**
 * Promote a user to admin by email:
 *   npx tsx scripts/promote-admin.ts user@example.com
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email) {
    console.error("Usage: npx tsx scripts/promote-admin.ts <email>");
    process.exit(1);
  }

  const user = await db.user.update({
    where: { email },
    data: { role: "admin" },
    select: { email: true, role: true },
  });
  console.log(`✅ ${user.email} is now role=${user.role}`);
  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
