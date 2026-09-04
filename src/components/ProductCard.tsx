import Link from "next/link";
import { formatPrice } from "@/lib/utils";

type Product = {
  id: string;
  name: string;
  slug: string;
  priceCents: number;
  images: string | null;
  inventory: number;
  featured: boolean;
  category: { name: string };
};

export function ProductCard({ product }: { product: Product }) {
  const inStock = product.inventory > 0;

  return (
    <article className="group flex flex-col">
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-square overflow-hidden bg-surface-pearl"
        aria-label={product.name}
      >
        {product.images ? (
          <img
            src={product.images}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="font-display text-[44px] italic text-hairline">{product.category.name.slice(0, 1)}</span>
          </div>
        )}

        {/* Hover CTA */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden justify-center pb-5 opacity-0 transition-all duration-300 group-hover:opacity-100 md:flex">
          <span
            className={`inline-flex items-center justify-center rounded-full px-7 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] ${
              inStock
                ? "bg-primary-foreground/95 text-ink shadow-[0_2px_16px_rgba(0,0,0,0.18)] backdrop-blur-sm"
                : "bg-black/60 text-white/80 backdrop-blur-sm"
            }`}
          >
            {inStock ? "View Piece" : "Out of Stock"}
          </span>
        </div>
      </Link>

      <div className="flex flex-col pt-5 text-left">
        <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-ink-muted-48">
          {product.category.name}
        </p>
        <Link href={`/products/${product.slug}`}>
          <h3 className="mt-2 font-display text-[22px] leading-[1.15] text-ink transition-colors group-hover:text-gold-deep">
            {product.name}
          </h3>
        </Link>
        <p className="mt-1.5 text-[15px] tracking-[0.01em] text-ink-muted-80">
          {formatPrice(product.priceCents)}
        </p>
      </div>
    </article>
  );
}
