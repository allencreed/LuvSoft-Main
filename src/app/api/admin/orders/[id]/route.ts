import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/session";
import { db } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = await getAdminUser(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { status } = await req.json();
  const order = await db.order.update({ where: { id }, data: { status } });
  return NextResponse.json(order);
}
