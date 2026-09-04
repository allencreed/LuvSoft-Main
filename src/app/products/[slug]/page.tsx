import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { AddToCartButton } from "@/components/AddToCartButton";
import { ProductCard } from "@/components/ProductCard";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await db.product.findUnique({ where: { slug } });
  if (!product) return {};

  return {
    title: `${product.name} — Love Soft Life`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      type: "website",
      images: product.images ? [{ url: product.images }] : [],
      siteName: "Love Soft Life",
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.description,
      images: product.images ? [product.images] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await db.product.findUnique({
    where: { slug },
    include: { category: true },
  });

  if (!product) notFound();

  const related = await db.product.findMany({
    where: { categoryId: product.categoryId, slug: { not: product.slug } },
    include: { category: true },
    take: 3,
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images ? [product.images] : [],
    sku: product.slug,
    offers: {
      "@type": "Offer",
      price: product.priceCents / 100,
      priceCurrency: "USD",
      availability: product.inventory > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  const inStock = product.inventory > 0;
  const details = [
    { label: "Shipping", value: "Complimentary over $150 — otherwise 5–7 business days" },
    { label: "Returns", value: "Effortless returns within 30 days" },
    { label: "Availability", value: inStock ? `${product.inventory} in stock` : "Sold out until next run" },
  ];

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Product */}
      <section className="bg-canvas py-12 sm:py-16">
        <div className="mx-auto w-full px-6 sm:px-8" style={{ maxWidth: 1200 }}>
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-10 flex flex-wrap items-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] text-ink-muted-48">
            <Link href="/products" className="transition-colors hover:text-ink">
              The Collection
            </Link>
            <span className="text-gold">/</span>
            <Link href={`/products?category=${product.category.slug}`} className="transition-colors hover:text-ink">
              {product.category.name}
            </Link>
            <span className="text-gold">/</span>
            <span className="text-ink">{product.name}</span>
          </nav>

          <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-20">
            {/* Image */}
            <div className="relative">
              <div className="aspect-[4/5] overflow-hidden bg-surface-pearl">
                {product.images ? (
                  <img
                    src={product.images}
                    alt={product.name}
                    width={1024}
                    height={1280}
                    loading="eager"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="font-display text-[72px] italic text-hairline">{product.category.name.slice(0, 1)}</span>
                  </div>
                )}
              </div>
              <p className="mt-3 text-[10px] font-medium uppercase tracking-[0.2em] text-ink-muted-48">
                {product.name} — photographed in natural light
              </p>
            </div>

            {/* Purchase panel */}
            <div className="lg:sticky lg:top-28">
              <p className="eyebrow text-gold-deep">{product.category.name}</p>
              <h1 className="mt-4 text-[42px] leading-[1.05] text-ink sm:text-[54px]">{product.name}</h1>

              <div className="mt-6 flex items-baseline gap-3">
                <p className="text-[22px] tracking-[0.01em] text-ink">{formatPrice(product.priceCents)}</p>
                {!inStock && (
                  <p className="text-[13px] uppercase tracking-[0.14em] text-destructive">Sold out</p>
                )}
              </div>

              <p className="mt-7 max-w-md text-[17px] leading-[1.7] text-ink-muted-80">
                {product.description}
              </p>

              {/* Details */}
              <dl className="mt-9 border-t border-hairline">
                {details.map((row) => (
                  <div key={row.label} className="flex items-baseline justify-between gap-6 border-b border-hairline py-3.5">
                    <dt className="text-[10px] font-medium uppercase tracking-[0.22em] text-ink-muted-48">{row.label}</dt>
                    <dd className="text-right text-[14px] text-ink-muted-80">{row.value}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-10">
                <AddToCartButton productId={product.id} disabled={!inStock} />
              </div>

              <p className="mt-8 max-w-md font-display text-[17px] italic leading-relaxed text-ink-muted-48">
                “Made slowly, kept long — this piece will only soften with you.”
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="border-t border-hairline bg-canvas-parchment py-20 sm:py-24">
          <div className="mx-auto w-full px-6 sm:px-8" style={{ maxWidth: 1200 }}>
            <div className="flex items-end justify-between gap-6">
              <div>
                <p className="eyebrow text-gold-deep">Keep Exploring</p>
                <h2 className="mt-3 font-display text-[36px] leading-none text-ink sm:text-[46px]">
                  You may also <span className="italic">like</span>
                </h2>
              </div>
              <Link
                href="/products"
                className="hidden shrink-0 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink underline underline-offset-4 transition-colors hover:text-gold-deep sm:inline-block"
              >
                View all
              </Link>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <ProductCard key={p.id} product={{ ...p, images: p.images ?? null }} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
