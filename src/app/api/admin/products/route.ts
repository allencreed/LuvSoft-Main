import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/session";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const admin = await getAdminUser(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const product = await db.product.create({ data: body });
  return NextResponse.json(product);
}
