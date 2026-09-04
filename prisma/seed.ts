import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../generated/prisma/client";

const db = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL ?? "file:./dev.db",
  }),
});

type ProductSeed = {
  name: string;
  slug: string;
  description: string;
  priceCents: number;
  categorySlug: string;
  inventory: number;
  featured: boolean;
};

const categories = [
  { slug: "apparel", name: "Apparel", description: "Easy, enduring layers" },
  { slug: "home", name: "Home", description: "Rooms that exhale" },
  { slug: "self-care", name: "Self Care", description: "Small rituals, kept daily" },
  { slug: "accessories", name: "Accessories", description: "Everyday premium essentials" },
  { slug: "travel", name: "Travel", description: "Companions for the road" },
  { slug: "gifts", name: "Gifts", description: "Curated to be given slowly" },
];

const img = (seed: string) => `https://picsum.photos/seed/lsl-${seed}/800/1000`;

const products: ProductSeed[] = [
  {
    name: "Classic Tee",
    slug: "classic-tee",
    description:
      "Cut from a combed cotton jersey with a relaxed, softly structured fit. The tee you reach for first — washed once, kept for years.",
    priceCents: 2999,
    categorySlug: "apparel",
    inventory: 50,
    featured: true,
  },
  {
    name: "Denim Jacket",
    slug: "denim-jacket",
    description:
      "A stonewashed denim jacket built to soften with you — relaxed through the shoulder, finished with matte brass hardware that will age quietly.",
    priceCents: 8999,
    categorySlug: "apparel",
    inventory: 20,
    featured: true,
  },
  {
    name: "Merino Crewneck",
    slug: "merino-crewneck",
    description:
      "Extra-fine merino knit in a featherweight gauge — warm without weight, elegant under a coat or alone against bare skin.",
    priceCents: 7900,
    categorySlug: "apparel",
    inventory: 30,
    featured: false,
  },
  {
    name: "Cashmere Cloud Throw",
    slug: "cashmere-throw",
    description:
      "Woven from Grade-A Mongolian cashmere, this throw is impossibly light and warm. The piece you reach for on slow mornings and long evenings.",
    priceCents: 15900,
    categorySlug: "home",
    inventory: 18,
    featured: true,
  },
  {
    name: "Stonewashed Linen Set",
    slug: "stonewashed-linen-set",
    description:
      "European flax, stonewashed until it drapes like old linen. Breathable in summer, comforting in winter — a bed that gets better with every wash.",
    priceCents: 18900,
    categorySlug: "home",
    inventory: 12,
    featured: false,
  },
  {
    name: "Hand-Poured Soy Candle",
    slug: "soy-candle",
    description:
      "Fig, cedar and a whisper of amber, poured by hand into a reusable stoneware vessel. Burns clean for over sixty hours.",
    priceCents: 3400,
    categorySlug: "home",
    inventory: 40,
    featured: true,
  },
  {
    name: "Bamboo Lounge Robe",
    slug: "bamboo-robe",
    description:
      "Viscose from bamboo in a sandwashed finish — fluid, breathable and gentle against the skin. Wrapped, it feels like a slow exhale.",
    priceCents: 9800,
    categorySlug: "self-care",
    inventory: 25,
    featured: true,
  },
  {
    name: "Mulberry Silk Pillowcase",
    slug: "silk-pillowcase",
    description:
      "22-momme mulberry silk with a hidden zip closure. Kind to hair and skin, and cooler to the touch than any cotton you have slept on.",
    priceCents: 6800,
    categorySlug: "self-care",
    inventory: 35,
    featured: true,
  },
  {
    name: "Silk Scarf",
    slug: "silk-scarf",
    description:
      "Twelve-momme silk twill with hand-rolled edges. Wear it at the neck, in the hair, or tied to the handle of a bag you are learning to let go of.",
    priceCents: 5900,
    categorySlug: "accessories",
    inventory: 22,
    featured: false,
  },
  {
    name: "Italian Leather Journal",
    slug: "leather-journal",
    description:
      "Hand-bound in Florence with vegetable-tanned leather that will patina beautifully. Two hundred pages of paper that takes ink like a compliment.",
    priceCents: 4900,
    categorySlug: "accessories",
    inventory: 28,
    featured: false,
  },
  {
    name: "Packing Cube Set",
    slug: "packing-cube-set",
    description:
      "Three lightweight cubes in water-resistant nylon — small, medium and large. Order in minutes instead of suitcases.",
    priceCents: 4900,
    categorySlug: "travel",
    inventory: 45,
    featured: false,
  },
  {
    name: "The Soft Start Gift Set",
    slug: "soft-start-gift-set",
    description:
      "A candle, a silk pillowcase and a note card in a keepsake linen box. Everything someone needs to begin a softer season.",
    priceCents: 12900,
    categorySlug: "gifts",
    inventory: 15,
    featured: false,
  },
];

async function main() {
  for (const category of categories) {
    await db.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name, description: category.description },
      create: category,
    });
  }

  const categoryIds = new Map<string, string>();
  for (const category of categories) {
    const row = await db.category.findUniqueOrThrow({ where: { slug: category.slug } });
    categoryIds.set(category.slug, row.id);
  }

  await db.product.deleteMany();

  await db.product.createMany({
    data: products.map((product, i) => ({
      name: product.name,
      slug: product.slug,
      description: product.description,
      priceCents: product.priceCents,
      images: img(product.slug),
      categoryId: categoryIds.get(product.categorySlug)!,
      inventory: product.inventory,
      featured: product.featured,
      createdAt: new Date(Date.UTC(2026, 0, 1 + i, 12, 0, 0)),
    })),
  });

  console.log(`Seed complete ✨ ${products.length} products across ${categories.length} categories`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
