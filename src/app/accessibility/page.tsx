import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accessibility — Love Soft Life",
  description: "Our commitment to an accessible shopping experience for everyone.",
};

export default function AccessibilityPage() {
  return (
    <div className="mx-auto px-6 py-16 sm:py-20" style={{ maxWidth: 720 }}>
      <p className="eyebrow text-gold-deep">For Everyone</p>
      <h1 className="mt-4 text-[40px] leading-[1.06] text-ink sm:text-[52px]">
        Accessibility
      </h1>

      <div className="mt-8 space-y-5 text-[16px] leading-relaxed text-ink-muted-80">
        <p>
          Love Soft Life is committed to making our website usable and enjoyable
          for everyone. We aim to conform to the{" "}
          <span className="text-ink">Web Content Accessibility Guidelines (WCAG) 2.2, Level AA</span>{" "}
          and we treat accessibility as an ongoing practice, not a finish line.
        </p>
        <h2 className="pt-4 text-[17px] font-semibold text-ink">What we do</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Semantic HTML and ARIA labels on all interactive elements</li>
          <li>Full keyboard navigation across menus, carousels, and forms</li>
          <li>Color contrast checked against AA thresholds</li>
          <li>Motion respects the <code className="text-[14px]">prefers-reduced-motion</code> system setting</li>
          <li>Alt text on all meaningful imagery</li>
        </ul>
        <h2 className="pt-4 text-[17px] font-semibold text-ink">Found a barrier?</h2>
        <p>
          If any part of this site is difficult to use, we want to know. Email{" "}
          <a href="mailto:support@lovesoftlife.com" className="text-primary hover:underline">
            support@lovesoftlife.com
          </a>{" "}
          with the page and what happened — we respond within two business days
          and will work with you directly to complete your purchase another way.
        </p>
      </div>
    </div>
  );
}
