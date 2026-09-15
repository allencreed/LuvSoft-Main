import { NextRequest, NextResponse } from "next/server";
import { getCurrentStorefrontUser } from "@/lib/session";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const user = await getCurrentStorefrontUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orders = await db.order.findMany({
    where: { userId: user.id },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ orders });
}
