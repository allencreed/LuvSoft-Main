import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const users = await db.user.findMany({ select: { id: true, auth0Id: true, email: true, role: true } });
  console.log("Users:", JSON.stringify(users, null, 2));
  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
