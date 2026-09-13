import { auth0 } from "@/lib/auth0";
import { db } from "@/lib/db";
import { SiteHeader } from "./SiteHeader";

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

  return <SiteHeader cartCount={cartCount} user={user ? { name: user.name ?? undefined, email: user.email } : null} />;
}
