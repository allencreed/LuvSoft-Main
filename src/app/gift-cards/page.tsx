import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Gift Cards — Love Soft Life",
  description: "Give the softer life — digital gift cards for the Love Soft Life collection.",
};

export default function GiftCardsPage() {
  return (
    <div className="bg-canvas">
      <section className="border-b border-hairline bg-canvas-parchment py-20 text-center sm:py-24">
        <div className="mx-auto w-full px-6" style={{ maxWidth: 720 }}>
          <p className="eyebrow text-gold-deep">The Gift</p>
          <h1 className="mt-4 text-[44px] leading-[1.04] text-ink sm:text-[58px]">
            Give the <span className="italic">soft life</span>
          </h1>
          <p className="mx-auto mt-6 max-w-md text-[16px] leading-relaxed text-ink-muted-48">
            A digital gift card, delivered by email with a personal note —
            never expires, never the wrong size.
          </p>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto w-full px-6 sm:px-8" style={{ maxWidth: 1200 }}>
          <div className="mx-auto max-w-md rounded-[24px] border border-hairline bg-white p-8 text-center shadow-[0_2px_24px_rgba(0,0,0,0.04)] sm:p-10">
            <p className="font-display text-[26px] italic text-ink">Love Soft Life</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.3em] text-ink-muted-48">
              Gift Card
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {[50, 100, 150, 250].map((amount) => (
                <span
                  key={amount}
                  className="rounded-full border border-hairline px-5 py-2.5 text-[13px] tracking-[0.04em] text-ink"
                >
                  ${amount}
                </span>
              ))}
            </div>

            <p className="mt-8 text-[14px] leading-relaxed text-ink-muted-80">
              Choose an amount at checkout after signing in. Gift cards are
              delivered by email within minutes and can be used across the
              entire collection.
            </p>

            <Link
              href="/products"
              className="mt-9 inline-flex items-center justify-center rounded-full bg-ink px-9 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-foreground transition-all hover:opacity-90 active:scale-[0.97]"
            >
              Shop the Collection
            </Link>
          </div>

          <p className="mx-auto mt-10 max-w-md text-center text-[13px] leading-relaxed text-ink-muted-48">
            Questions about gifting? Write to{" "}
            <a href="mailto:support@lovesoftlife.com" className="text-primary hover:underline">
              support@lovesoftlife.com
            </a>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
