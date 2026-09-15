"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, ShoppingBag, X } from "lucide-react";

type User = { name?: string; email?: string } | null;

const navLinks = [
  { label: "The Edit", href: "/#the-edit" },
  { label: "Our Story", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const shopMenu = [
  { label: "All Pieces", caption: "The full collection", href: "/products" },
  { label: "Apparel", caption: "Easy, enduring layers", href: "/products?category=apparel" },
  { label: "Home", caption: "Rooms that exhale", href: "/products?category=home" },
  { label: "Self Care", caption: "Small rituals, kept daily", href: "/products?category=self-care" },
];

export function SiteHeader({ cartCount, user }: { cartCount: number; user: User }) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false); // mobile drawer
  const [shopOpen, setShopOpen] = useState(false); // desktop dropdown
  const shopCloseTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!shopOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setShopOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shopOpen]);

  // Lock background scroll while the mobile drawer is open
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const transparent = isHome && !scrolled && !open;

  const openShop = () => {
    window.clearTimeout(shopCloseTimer.current);
    setShopOpen(true);
  };
  const closeShop = () => {
    shopCloseTimer.current = window.setTimeout(() => setShopOpen(false), 140);
  };

  const linkTone = transparent
    ? "text-white/80 hover:text-white"
    : "text-ink-muted-48 hover:text-ink";

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50">
        {/* Announcement strip — home only, collapses on scroll */}
        {isHome && (
          <div
            className={`overflow-hidden bg-surface-black transition-all duration-500 ${
              scrolled ? "max-h-0 opacity-0" : "max-h-10 opacity-100"
            }`}
          >
            <p className="py-2.5 text-center text-[10px] font-medium uppercase tracking-[0.22em] text-white/75">
              The Autumn Edit has arrived
              <span className="hidden sm:inline">
                <span className="mx-3 text-gold">·</span>
                Complimentary shipping over $150
              </span>
            </p>
          </div>
        )}

        {/* Nav row */}
        <div
          className={`relative transition-colors duration-500 ${
            transparent
              ? "bg-transparent text-white"
              : "border-b border-hairline/70 bg-canvas/95 text-ink backdrop-blur-md"
          }`}
        >
          <div
            className={`relative mx-auto grid grid-cols-[1fr_auto_1fr] items-center px-5 transition-[height] duration-500 sm:px-8 ${
              scrolled ? "h-[60px]" : "h-[72px]"
            }`}
          >
            {/* Left nav (desktop) */}
            <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
              {/* Shop dropdown */}
              <div className="relative" onMouseEnter={openShop} onMouseLeave={closeShop}>
                <button
                  onClick={() => setShopOpen((o) => !o)}
                  aria-expanded={shopOpen}
                  aria-haspopup="true"
                  className={`group relative flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.2em] transition-colors ${linkTone}`}
                >
                  Shop
                  <svg
                    viewBox="0 0 12 12"
                    className={`h-2.5 w-2.5 transition-transform duration-300 ${shopOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M2.5 4.5 6 8l3.5-3.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span
                    className={`absolute -bottom-1.5 left-0 h-px bg-gold transition-all duration-300 ${
                      shopOpen ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  />
                </button>

                {shopOpen && (
                  <div className="animate-in fade-in-0 slide-in-from-top-2 absolute left-0 top-full z-50 w-[340px] duration-200">
                    <div className="mt-3 border border-hairline bg-canvas text-ink shadow-[0_24px_60px_-24px_rgba(32,28,23,0.3)]">
                      <ul className="py-3">
                        {shopMenu.map((item) => (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              onClick={() => setShopOpen(false)}
                              className="group/item flex items-baseline justify-between px-6 py-3.5 transition-colors hover:bg-canvas-parchment"
                            >
                              <span className="font-display text-[22px] leading-none text-ink transition-colors group-hover/item:text-gold-deep">
                                {item.label}
                              </span>
                              <span className="text-[10px] uppercase tracking-[0.18em] text-ink-muted-48">
                                {item.caption}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                      <Link
                        href="/products"
                        onClick={() => setShopOpen(false)}
                        className="group/all flex items-center gap-3 border-t border-hairline px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink transition-colors hover:text-gold-deep"
                      >
                        View all pieces
                        <span className="block h-px w-8 bg-gold transition-all duration-300 group-hover/all:w-14" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`group relative whitespace-nowrap text-[11px] font-medium uppercase tracking-[0.2em] transition-colors ${linkTone}`}
                >
                  {link.label}
                  <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-gold transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
            </nav>

            {/* Wordmark */}
            <Link
              href="/"
              className={`justify-self-center whitespace-nowrap px-2 text-center font-display text-[13px] font-medium uppercase tracking-[0.3em] transition-opacity hover:opacity-70 sm:text-[15px] sm:tracking-[0.32em] ${
                transparent ? "text-white" : "text-ink"
              }`}
            >
              Love Soft Life
            </Link>

            {/* Right actions */}
            <div className="flex items-center justify-self-end gap-6 md:gap-7">
              <Link
                href="/search"
                aria-label="Search products"
                className={`hidden transition-colors sm:block ${linkTone}`}
              >
                <Search className="h-[17px] w-[17px]" strokeWidth={1.5} />
              </Link>

              <Link
                href="/cart"
                aria-label="Cart"
                className={`relative transition-colors ${linkTone}`}
              >
                <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.5} />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-gold px-1 text-[8px] font-semibold tracking-wide text-white">
                    {cartCount}
                  </span>
                )}
              </Link>

              {!user ? (
                <Link
                  href="/auth/login"
                  className={`hidden whitespace-nowrap text-[11px] font-medium uppercase tracking-[0.18em] transition-colors lg:inline-block ${linkTone}`}
                >
                  Sign in
                </Link>
              ) : (
                <Link
                  href="/account/orders"
                  className={`hidden whitespace-nowrap text-[11px] font-medium uppercase tracking-[0.18em] transition-colors lg:inline-block ${linkTone}`}
                >
                  {user.name?.split(" ")[0] ?? "Account"}
                </Link>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setOpen(!open)}
                className={`flex items-center justify-center transition-colors lg:hidden ${
                  transparent ? "text-white" : "text-ink"
                }`}
                aria-label={open ? "Close menu" : "Open menu"}
                aria-expanded={open}
              >
                {open ? (
                  <X className="h-[19px] w-[19px]" strokeWidth={1.5} />
                ) : (
                  <Menu className="h-[19px] w-[19px]" strokeWidth={1.5} />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Offset spacer for pages without a full-bleed hero */}
      {!isHome && <div aria-hidden className="h-[72px]" />}

      {/* Mobile drawer */}
      {open && (
        <div className="animate-in fade-in-0 slide-in-from-top-4 fixed inset-0 top-0 z-40 overflow-y-auto bg-canvas duration-300 lg:hidden">
          <div className="flex min-h-full flex-col justify-between px-8 pb-10 pt-[88px]">
            <nav className="flex flex-col gap-2" aria-label="Mobile">
              {/* Search — the desktop icon is hidden on mobile, so the drawer is the entry point */}
              <Link
                href="/search"
                onClick={() => setOpen(false)}
                className="group flex items-center gap-4 border-b border-hairline py-5"
              >
                <Search className="h-5 w-5 text-gold-deep" strokeWidth={1.5} />
                <span className="font-display text-[34px] leading-none text-ink transition-colors group-hover:text-gold-deep">
                  Search
                </span>
              </Link>
              <Link
                href="/products"
                onClick={() => setOpen(false)}
                className="group border-b border-hairline py-5"
              >
                <span className="block font-display text-[34px] leading-none text-ink transition-colors group-hover:text-gold-deep">
                  Shop
                </span>
                <span className="mt-3 flex gap-5">
                  {shopMenu.slice(1).map((c) => (
                    <span key={c.href} className="text-[10px] uppercase tracking-[0.18em] text-ink-muted-48">
                      {c.label}
                    </span>
                  ))}
                </span>
              </Link>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="group border-b border-hairline py-5"
                >
                  <span className="block font-display text-[34px] leading-none text-ink transition-colors group-hover:text-gold-deep">
                    {link.label}
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
