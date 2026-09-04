import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const user = await db.user.create({
    data: {
      auth0Id: "manual-admin",
      email: "allencreed@gmail.com",
      name: "Allen",
      role: "admin",
    },
  });
  console.log("Created admin user:", user.id);
  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
