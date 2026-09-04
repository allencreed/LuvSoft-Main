import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/ProductCard";

export const metadata: Metadata = {
  title: "Love Soft Life — Quiet Luxury Essentials",
  description: "Premium products for a comfortable life. Quietly luxurious essentials for a softer, slower everyday.",
  openGraph: {
    title: "Love Soft Life",
    description: "Premium products for a comfortable life.",
    type: "website",
    siteName: "Love Soft Life",
    url: "https://lovesoftlife.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "Love Soft Life",
    description: "Premium products for a comfortable life.",
  },
};

const promises = [
  "Complimentary shipping over $150",
  "Hand-finished in small batches",
  "30-day effortless returns",
];

const categories = [
  {
    name: "Apparel",
    caption: "Easy, enduring layers",
    slug: "apparel",
    image: "https://picsum.photos/seed/apparel-edit/900/1200",
  },
  {
    name: "Home",
    caption: "Rooms that exhale",
    slug: "home",
    image: "https://picsum.photos/seed/home-edit/900/1200",
  },
  {
    name: "Self Care",
    caption: "Small rituals, kept daily",
    slug: "self-care",
    image: "https://picsum.photos/seed/selfcare-edit/900/1200",
  },
];

export default async function HomePage() {
  const featured = await db.product.findMany({
    where: { featured: true },
    include: { category: true },
    orderBy: { createdAt: "asc" },
    take: 6,
  });

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative flex min-h-[88vh] items-center justify-center overflow-hidden bg-surface-black">
        <img
          src="/images/hero.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: "center 30%" }}
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-black/60" />

        <div className="relative z-10 mx-auto w-full px-6 py-28 text-center" style={{ maxWidth: 900 }}>
          <p className="eyebrow text-white/75">
            <span className="mr-4 inline-block h-px w-8 translate-y-[-3px] bg-gold align-middle" />
            The Autumn Edit · 2026
            <span className="ml-4 inline-block h-px w-8 translate-y-[-3px] bg-gold align-middle" />
          </p>
          <h1 className="mt-8 text-[54px] leading-[1.02] text-white sm:text-[76px] lg:text-[104px]">
            Love Soft Life
          </h1>
          <p className="mx-auto mt-7 max-w-md text-[19px] font-light leading-[1.5] text-white/85 sm:text-[21px]">
            Quietly luxurious essentials for a softer, slower everyday.
          </p>
          <div className="mt-11 flex flex-col items-center justify-center gap-5 sm:flex-row sm:gap-8">
            <Link
              href="/products"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-full bg-primary-foreground px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary transition-all hover:bg-white hover:shadow-[0_2px_24px_rgba(0,0,0,0.25)] active:scale-[0.97] sm:px-10 sm:text-[12px]"
            >
              Shop the Collection
            </Link>
            <Link
              href="/about"
              className="group inline-flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.2em] text-white/90 transition-colors hover:text-white"
            >
              Our Story
              <span className="block h-px w-6 bg-gold transition-all duration-300 group-hover:w-10" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Promise strip ────────────────────────────────── */}
      <section className="border-b border-hairline bg-canvas-parchment">
        <ul className="mx-auto flex w-full max-w-[1200px] flex-col items-center justify-center gap-4 px-6 py-7 sm:flex-row sm:gap-0">
          {promises.map((promise, i) => (
            <li
              key={promise}
              className={`flex items-center text-[11px] font-medium uppercase tracking-[0.18em] text-ink-muted-48 ${
                i > 0 ? "sm:border-l sm:border-hairline sm:px-8" : "sm:pr-8"
              }`}
            >
              <span className="mr-3 hidden h-1.5 w-1.5 rounded-full bg-gold sm:inline-block" />
              {promise}
            </li>
          ))}
        </ul>
      </section>

      {/* ── The Edit ─────────────────────────────────────── */}
      <section id="the-edit" className="scroll-mt-20 bg-canvas py-24 sm:py-32">
        <div className="mx-auto w-full px-6 sm:px-8" style={{ maxWidth: 1200 }}>
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow text-gold-deep">The Edit</p>
            <h2 className="mt-4 text-[40px] leading-[1.06] text-ink sm:text-[52px]">
              Considered comforts, <span className="italic">made to be kept</span>
            </h2>
            <p className="mt-5 text-[17px] leading-relaxed text-ink-muted-48">
              A small, deliberate collection of pieces chosen for how they feel — soft to the touch, quiet in the room, and lasting by design.
            </p>
          </div>

          {featured.length > 0 && (
            <>
              <div className="mt-14 grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 sm:gap-y-16 lg:grid-cols-3">
                {featured.map((p) => (
                  <ProductCard key={p.id} product={{ ...p, images: p.images ?? null }} />
                ))}
              </div>
              <div className="mt-16 text-center">
                <Link
                  href="/products"
                  className="group inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink transition-colors hover:text-gold-deep"
                >
                  View all pieces
                  <span className="block h-px w-8 bg-gold transition-all duration-300 group-hover:w-14" />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── Quote band ───────────────────────────────────── */}
      <section className="border-y border-hairline bg-canvas-parchment py-24 sm:py-32">
        <div className="mx-auto w-full px-6 text-center" style={{ maxWidth: 880 }}>
          <p className="eyebrow text-gold-deep">Our Belief</p>
          <blockquote className="mt-8">
            <p className="font-display text-[34px] leading-[1.25] text-ink sm:text-[46px]">
              “Softness is never a compromise — it is a choice made slowly, <em>on purpose</em>.”
            </p>
            <footer className="mt-8 text-[11px] font-medium uppercase tracking-[0.22em] text-ink-muted-48">
              — The Love Soft Life Studio
            </footer>
          </blockquote>
        </div>
      </section>

      {/* ── Category trio ────────────────────────────────── */}
      <section className="bg-canvas py-24 sm:py-32">
        <div className="mx-auto w-full px-6 sm:px-8" style={{ maxWidth: 1200 }}>
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow text-gold-deep">Wander the Rooms</p>
            <h2 className="mt-4 text-[40px] leading-[1.06] text-ink sm:text-[52px]">
              Where comfort <span className="italic">begins</span>
            </h2>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                className="group relative block aspect-[4/5] overflow-hidden bg-surface-tile-1"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-7 text-left">
                  <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-white/70">{cat.caption}</p>
                  <p className="mt-1.5 font-display text-[30px] leading-none text-white">{cat.name}</p>
                  <span className="mt-4 block h-px w-8 bg-gold transition-all duration-300 group-hover:w-16" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Closing CTA ──────────────────────────────────── */}
      <section className="bg-surface-black py-28 text-center sm:py-36">
        <div className="mx-auto w-full px-6" style={{ maxWidth: 760 }}>
          <p className="eyebrow text-white/60">A quieter kind of luxury</p>
          <h2 className="mt-6 font-display text-[38px] leading-[1.15] text-white sm:text-[54px]">
            Something softer is <span className="italic">on its way.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-md text-[17px] font-light leading-relaxed text-white/70">
            Each piece is made in limited runs and finished by hand — when it is gone, it is gone until the next season.
          </p>
          <Link
            href="/products"
            className="mt-11 inline-flex items-center justify-center rounded-full bg-gold px-10 py-4 text-[12px] font-semibold uppercase tracking-[0.2em] text-white transition-all hover:bg-[#c19a5f] active:scale-[0.97]"
          >
            Explore the Collection
          </Link>
        </div>
      </section>
    </div>
  );
}
