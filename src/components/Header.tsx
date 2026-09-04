import Link from "next/link";
import { auth0 } from "@/lib/auth0";
import { db } from "@/lib/db";
import { SiteNav } from "./SiteNav";

const navLinks = [
  { label: "Shop", href: "/products" },
  { label: "The Edit", href: "/#the-edit" },
  { label: "Our Story", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export async function Header() {
  const session = await auth0.getSession();
  let user = null;
  let cartCount = 0;

  if (session?.user) {
    const dbUser = await db.user.findUnique({
      where: { auth0Id: session.user.sub },
    });
    user = dbUser;
    if (dbUser) {
      const cart = await db.cart.findUnique({
        where: { userId: dbUser.id },
        include: { items: true },
      });
      cartCount = cart?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0;
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-hairline/70 bg-canvas/95 text-ink backdrop-blur-md">
      <div className="relative mx-auto grid h-[72px] grid-cols-[1fr_auto_1fr] items-center px-5 sm:px-8">
        {/* Left nav (desktop) */}
        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="group relative text-[11px] font-medium uppercase tracking-[0.2em] text-ink-muted-48 transition-colors hover:text-ink"
            >
              {link.label}
              <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-gold transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        {/* Wordmark */}
        <Link
          href="/"
          className="justify-self-center whitespace-nowrap px-2 text-center font-display text-[13px] font-medium tracking-[0.3em] text-ink uppercase transition-opacity hover:opacity-70 sm:text-[15px] sm:tracking-[0.32em]"
        >
          Love Soft Life
        </Link>

        {/* Right actions */}
        <SiteNav cartCount={cartCount} user={user ? { name: user.name ?? undefined, email: user.email } : null} />
      </div>
    </header>
  );
}
