import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { CartCheckoutButton } from "@/components/CartCheckoutButton";
import { CartItemRow } from "@/components/CartItemRow";

export default async function CartPage() {
  const session = await auth0.getSession();
  if (!session?.user) redirect("/auth/login?returnTo=%2Fcart");

  const user = await db.user.findUnique({ where: { auth0Id: session.user.sub } });
  if (!user) redirect("/auth/login?returnTo=%2Fcart");

  const cart = await db.cart.findUnique({
    where: { userId: user.id },
    include: { items: { include: { product: true } } },
  });

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto px-6 py-20 text-center" style={{ maxWidth: 980 }}>
        <h1 className="text-[24px] sm:text-[28px] lg:text-[34px] font-normal leading-[1.47] tracking-[-0.374px] text-ink">Your Cart</h1>
        <p className="mt-3 text-[17px] text-muted-foreground">Your cart is empty.</p>
      </div>
    );
  }

  const total = cart.items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);

  return (
    <div className="mx-auto px-6 py-16" style={{ maxWidth: 720 }}>
      <h1 className="text-[24px] sm:text-[28px] lg:text-[34px] font-normal leading-[1.47] tracking-[-0.374px] text-ink mb-8">Your Cart</h1>
      <div className="space-y-4">
        {cart.items.map((item) => (
          <CartItemRow key={item.id} item={item} />
        ))}
      </div>
      <div className="mt-8 border-t border-hairline pt-6">
        <div className="flex justify-between text-[17px] font-normal">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
        <CartCheckoutButton />
      </div>
    </div>
  );
}
