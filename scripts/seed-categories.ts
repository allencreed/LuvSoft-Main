import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const categories = ["Home", "Self Care", "Accessories", "Travel", "Gifts"];

async function main() {
  const existing = await prisma.category.findMany();
  const existingNames = new Set(existing.map((c) => c.name));

  for (const name of categories) {
    if (!existingNames.has(name)) {
      await prisma.category.create({
        data: {
          name,
          slug: name.toLowerCase().replace(/\s+/g, "-"),
        },
      });
      console.log(`Created category: ${name}`);
    } else {
      console.log(`Skipped (exists): ${name}`);
    }
  }

  const all = await prisma.category.findMany();
  console.log("\nAll categories:", all.map((c) => `${c.name} (${c.slug})`).join(", "));
}

main().finally(() => prisma.$disconnect());
