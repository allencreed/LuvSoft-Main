import { NextRequest, NextResponse } from "next/server";
import { destroySession } from "@/lib/session";

/** Signs the native session out: deletes the session row + clears the cookie. */
export async function POST(req: NextRequest) {
  await destroySession();
  return NextResponse.json({ ok: true });
}
