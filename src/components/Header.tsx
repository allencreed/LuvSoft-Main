import { db } from "@/lib/db";
import { getCurrentStorefrontUser } from "@/lib/session";
import { SiteHeader } from "./SiteHeader";

export async function Header() {
  const user = await getCurrentStorefrontUser();
  let cartCount = 0;

  if (user) {
    const cart = await db.cart.findUnique({
      where: { userId: user.id },
      include: { items: true },
    });
    cartCount = cart?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0;
  }

  return (
    <SiteHeader
      cartCount={cartCount}
      user={user ? { name: user.name ?? undefined, email: user.email } : null}
    />
  );
}
