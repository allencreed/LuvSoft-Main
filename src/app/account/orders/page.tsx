import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { formatPrice } from "@/lib/utils";

// Session-dependent: must render per-request, never prerendered.
export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const user = await requireUser("/account/orders");

  const orders = await db.order.findMany({
    where: { userId: user.id },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });

  const statusColors: Record<string, string> = {
    pending: "text-yellow-800 bg-yellow-50",
    paid: "text-green-800 bg-green-50",
    shipped: "text-blue-800 bg-blue-50",
    delivered: "text-gray-800 bg-gray-50",
    cancelled: "text-red-800 bg-red-50",
  };

  return (
    <div className="mx-auto px-6 py-16" style={{ maxWidth: 720 }}>
      <h1 className="text-[24px] sm:text-[28px] lg:text-[34px] font-normal leading-[1.47] tracking-[-0.374px] text-ink mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <p className="text-muted-foreground">No orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="block rounded-[18px] border border-hairline bg-white p-5 hover:bg-canvas-parchment transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[17px] font-normal text-ink">{order.orderNumber}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs capitalize ${statusColors[order.status] || "bg-muted text-muted-foreground"}`}>
                    {order.status}
                  </span>
                  <p className="text-[17px] font-normal text-ink mt-1">{formatPrice(order.totalCents)}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
