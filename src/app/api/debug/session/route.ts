import { auth0 } from "@/lib/auth0";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth0.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "No session" });
  }

  const auth0Id = session.user.sub;
  let user = await db.user.findUnique({ where: { auth0Id } });

  if (!user) {
    user = await db.user.create({
      data: {
        auth0Id,
        email: session.user.email!,
        name: session.user.name ?? null,
        role: "admin",
      },
    });
  } else if (user.role !== "admin") {
    user = await db.user.update({
      where: { auth0Id },
      data: { role: "admin" },
    });
  }

  // Clean up fake admin
  await db.user.deleteMany({ where: { auth0Id: "manual-admin" } });

  return NextResponse.json({
    message: "Admin setup complete",
    user: { id: user.id, email: user.email, role: user.role },
  });
}
