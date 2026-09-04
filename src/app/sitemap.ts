import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await db.product.findMany({ select: { slug: true, createdAt: true } });
  const categories = await db.category.findMany({ select: { slug: true } });

  const entries: MetadataRoute.Sitemap = [
    { url: "https://lovesoftlife.com", lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
    { url: "https://lovesoftlife.com/products", lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    ...products.map((p) => ({
      url: `https://lovesoftlife.com/products/${p.slug}`,
      lastModified: p.createdAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...categories.map((c) => ({
      url: `https://lovesoftlife.com/products?category=${c.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
  ];

  return entries;
}
