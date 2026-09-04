import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/ProductCard";

export const metadata: Metadata = {
  title: "The Collection — Love Soft Life",
  description: "Browse our collection of premium, considered essentials",
  openGraph: {
    title: "The Collection — Love Soft Life",
    description: "Browse our collection of premium, considered essentials",
    type: "website",
    siteName: "Love Soft Life",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Collection — Love Soft Life",
    description: "Browse our collection of premium, considered essentials",
  },
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>;
}) {
  const params = await searchParams;
  const where: Record<string, unknown> = {};
  if (params.category) {
    where.category = { slug: params.category };
  }
  if (params.search) {
    where.name = { contains: params.search };
  }

  const [products, categories] = await Promise.all([
    db.product.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: "asc" },
    }),
    db.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  const activeCategory = params.category ?? null;

  return (
    <div>
      {/* Heading */}
      <section className="border-b border-hairline bg-canvas-parchment py-20 text-center sm:py-24">
        <div className="mx-auto w-full px-6" style={{ maxWidth: 980 }}>
          <p className="eyebrow text-gold-deep">Love Soft Life</p>
          <h1 className="mt-4 text-[44px] leading-[1.04] text-ink sm:text-[58px]">
            The <span className="italic">Collection</span>
          </h1>
          <p className="mx-auto mt-5 max-w-md text-[16px] leading-relaxed text-ink-muted-48">
            Fewer, better things — each piece chosen for its hand, its weight, and the way it will soften with age.
          </p>
        </div>
      </section>

      {/* Filter tabs */}
      <div className="sticky top-[72px] z-30 border-b border-hairline bg-canvas/95 backdrop-blur-md">
        <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div
            className="mx-auto flex w-max items-center gap-7 px-6 py-4 sm:gap-10"
            style={{ maxWidth: 980 }}
          >
          <Link
            href="/products"
            className={`relative whitespace-nowrap pb-1 text-[11px] font-medium uppercase tracking-[0.2em] transition-colors ${
              !activeCategory ? "text-ink" : "text-ink-muted-48 hover:text-ink"
            }`}
          >
            All
            <span
              className={`absolute -bottom-px left-0 h-px bg-gold transition-all duration-300 ${
                !activeCategory ? "w-full" : "w-0"
              }`}
            />
          </Link>
          {categories.map((cat) => {
            const active = activeCategory === cat.slug;
            return (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className={`relative whitespace-nowrap pb-1 text-[11px] font-medium uppercase tracking-[0.2em] transition-colors ${
                  active ? "text-ink" : "text-ink-muted-48 hover:text-ink"
                }`}
              >
                {cat.name}
                <span
                  className={`absolute -bottom-px left-0 h-px bg-gold transition-all duration-300 ${
                    active ? "w-full" : "w-0"
                  }`}
                />
              </Link>
            );
          })}
          </div>
        </div>
      </div>

      {/* Grid */}
      <section className="bg-canvas py-16 sm:py-20">
        <div className="mx-auto w-full px-6 sm:px-8" style={{ maxWidth: 1200 }}>
          <p className="mb-10 text-[11px] font-medium uppercase tracking-[0.2em] text-ink-muted-48">
            {products.length} {products.length === 1 ? "piece" : "pieces"}
          </p>

          {products.length === 0 ? (
            <div className="py-24 text-center">
              <p className="font-display text-[30px] italic text-ink-muted-48">
                Nothing here yet — the next season is being finished by hand.
              </p>
              <Link
                href="/products"
                className="mt-6 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink underline underline-offset-4"
              >
                View all pieces
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 sm:gap-y-16 lg:grid-cols-3">
              {products.map((p) => (
                <ProductCard key={p.id} product={{ ...p, images: p.images ?? null }} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
