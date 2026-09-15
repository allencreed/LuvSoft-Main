import Link from "next/link";
import { NewsletterForm } from "@/components/NewsletterForm";

const columns = [
  {
    heading: "Shop",
    links: [
      { label: "The Collection", href: "/products" },
      { label: "Apparel", href: "/products?category=apparel" },
      { label: "Home", href: "/products?category=home" },
      { label: "Self Care", href: "/products?category=self-care" },
      { label: "Accessories", href: "/products?category=accessories" },
      { label: "Gifts", href: "/products?category=gifts" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "Our Story", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  {
    heading: "Care",
    links: [
      { label: "Shipping", href: "/shipping" },
      { label: "Returns & Exchanges", href: "/returns" },
      { label: "Size Guide", href: "/size-guide" },
      { label: "Care Guide", href: "/care-guide" },
      { label: "Gift Cards", href: "/gift-cards" },
      { label: "Accessibility", href: "/accessibility" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-surface-black text-white">
      <div className="mx-auto w-full px-6 sm:px-8" style={{ maxWidth: 1200 }}>
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="font-display text-[20px] font-medium tracking-[0.26em] text-white uppercase">
              Love Soft Life
            </Link>
            <p className="mt-4 max-w-[26ch] text-[15px] leading-relaxed text-white/55">
              Quietly luxurious essentials for a softer, slower everyday — made to be kept, not replaced.
            </p>
            <div className="mt-7 max-w-[340px]">
              <h4 className="text-[11px] font-medium uppercase tracking-[0.22em] text-body-muted">Join the list</h4>
              <div className="mt-4">
                <NewsletterForm source="footer" variant="dark" />
              </div>
            </div>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.heading}>
              <h4 className="text-[11px] font-medium uppercase tracking-[0.22em] text-body-muted">{col.heading}</h4>
              <ul className="mt-5 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[15px] text-white/70 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-start justify-between gap-3 border-t border-white/10 py-7 sm:flex-row sm:items-center">
          <p className="text-[12px] tracking-[0.06em] text-white/40">
            © 2026 Love Soft Life — all rights reserved
          </p>
          <p className="font-display text-[15px] italic text-white/40">
            Comfort, considered.
          </p>
        </div>
      </div>
    </footer>
  );
}
