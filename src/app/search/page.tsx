import type { Metadata } from "next";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/ProductCard";

export const metadata: Metadata = {
  title: "Search — Love Soft Life",
  description: "Find the piece you are looking for in the Love Soft Life collection.",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  const results = query
    ? await db.product.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" as const } },
            { description: { contains: query, mode: "insensitive" as const } },
          ],
        },
        include: { category: true },
        orderBy: { createdAt: "asc" },
      })
    : [];

  return (
    <div>
      <section className="border-b border-hairline bg-canvas-parchment py-20 text-center sm:py-24">
        <div className="mx-auto w-full px-6" style={{ maxWidth: 760 }}>
          <p className="eyebrow text-gold-deep">The Search</p>
          <h1 className="mt-4 text-[40px] leading-[1.06] text-ink sm:text-[52px]">
            Find your <span className="italic">piece</span>
          </h1>

          <form action="/search" method="GET" className="mx-auto mt-9 flex max-w-md items-center border-b border-hairline pb-3">
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Silk, linen, cashmere…"
              autoComplete="off"
              className="w-full bg-transparent text-[17px] font-light text-ink placeholder:text-ink-muted-48/60 focus:outline-none"
            />
            <button
              type="submit"
              className="ml-4 whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.2em] text-ink transition-colors hover:text-gold-deep"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      <section className="bg-canvas py-16 sm:py-20">
        <div className="mx-auto w-full px-6 sm:px-8" style={{ maxWidth: 1200 }}>
          {query === "" ? (
            <p className="text-center text-[15px] text-ink-muted-48">
              Type above to search the collection — by name, material, or feeling.
            </p>
          ) : results.length === 0 ? (
            <div className="py-16 text-center">
              <p className="font-display text-[26px] italic text-ink-muted-48">
                Nothing found for “{query}”
              </p>
              <a
                href="/products"
                className="mt-6 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink underline underline-offset-4"
              >
                Browse the full collection
              </a>
            </div>
          ) : (
            <>
              <p className="mb-10 text-[11px] font-medium uppercase tracking-[0.2em] text-ink-muted-48">
                {results.length} {results.length === 1 ? "result" : "results"} for “{query}”
              </p>
              <div className="grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 sm:gap-y-16 lg:grid-cols-3">
                {results.map((p) => (
                  <ProductCard key={p.id} product={{ ...p, images: p.images ?? null }} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
