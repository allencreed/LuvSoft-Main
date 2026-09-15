import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/session";
import { db } from "@/lib/db";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = await getAdminUser(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const product = await db.product.update({ where: { id }, data: body });
  return NextResponse.json(product);
}
