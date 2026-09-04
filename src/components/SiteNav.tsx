"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Search, ShoppingBag, X } from "lucide-react";

type User = { name?: string; email?: string } | null;

export function SiteNav({ cartCount, user }: { cartCount: number; user: User }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Right-side actions (desktop) */}
      <div className="flex items-center justify-self-end gap-6 md:gap-7">
        <Link
          href="/products"
          aria-label="Search products"
          className="hidden text-ink-muted-48 transition-colors hover:text-ink sm:block"
        >
          <Search className="h-[17px] w-[17px]" strokeWidth={1.5} />
        </Link>

        <Link
          href="/cart"
          aria-label="Cart"
          className="relative text-ink-muted-48 transition-colors hover:text-ink"
        >
          <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.5} />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-2 flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-primary px-1 text-[8px] font-semibold tracking-wide text-primary-foreground">
              {cartCount}
            </span>
          )}
        </Link>

        {!user ? (
          <Link
            href="/auth/login"
            className="hidden text-[11px] font-medium uppercase tracking-[0.18em] text-ink transition-opacity hover:opacity-60 md:inline-block"
          >
            Sign in
          </Link>
        ) : (
          <Link
            href="/account/orders"
            className="hidden text-[11px] font-medium uppercase tracking-[0.18em] text-ink transition-opacity hover:opacity-60 md:inline-block"
          >
            {user.name?.split(" ")[0] ?? "Account"}
          </Link>
        )}

        {/* Mobile menu toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center justify-center text-ink transition-opacity hover:opacity-60 md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X className="h-[19px] w-[19px]" strokeWidth={1.5} /> : <Menu className="h-[19px] w-[19px]" strokeWidth={1.5} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 top-[72px] z-50 overflow-y-auto bg-canvas md:hidden">
          <div className="flex min-h-full flex-col justify-between px-8 py-10">
            <nav className="flex flex-col gap-2" aria-label="Mobile">
              {[
                { label: "Shop", href: "/products", sub: "Browse the collection" },
                { label: "The Edit", href: "/#the-edit", sub: "Featured pieces" },
                { label: "Our Story", href: "/about", sub: "Who we are" },
                { label: "Contact", href: "/contact", sub: "We would love to hear from you" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="group border-b border-hairline py-5"
                >
                  <span className="block font-display text-[34px] leading-none text-ink transition-colors group-hover:text-gold-deep">
                    {item.label}
                  </span>
                  <span className="mt-2 block text-[11px] uppercase tracking-[0.18em] text-ink-muted-48">
                    {item.sub}
                  </span>
                </Link>
              ))}
            </nav>

            <div className="mt-10 flex items-center justify-between">
              <p className="text-[11px] uppercase tracking-[0.18em] text-ink-muted-48">
                {cartCount > 0 ? `${cartCount} item${cartCount === 1 ? "" : "s"} in bag` : "Bag is empty"}
              </p>
              {user ? (
                <Link
                  href="/account/orders"
                  onClick={() => setOpen(false)}
                  className="text-[11px] font-medium uppercase tracking-[0.18em] text-ink underline underline-offset-4"
                >
                  {user.name?.split(" ")[0] ?? "Account"}
                </Link>
              ) : (
                <Link
                  href="/auth/login"
                  onClick={() => setOpen(false)}
                  className="text-[11px] font-medium uppercase tracking-[0.18em] text-ink underline underline-offset-4"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
