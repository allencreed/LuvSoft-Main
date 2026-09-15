import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/credentials";
import {
  createSession,
  loginThrottleCheck,
  loginThrottleReset,
  validateEmail,
} from "@/lib/session";

/**
 * Native sign-in (email + password). Uses the shared per-email throttle and
 * returns the same "Invalid email or password" for unknown users and wrong
 * passwords so accounts can't be enumerated.
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  const { email, password } = (body ?? {}) as Record<string, unknown>;

  const validEmail = validateEmail(email);
  if (!validEmail) {
    return NextResponse.json(
      { error: "Please enter a valid email address" },
      { status: 400 },
    );
  }

  if (typeof password !== "string" || password.length === 0) {
    return NextResponse.json(
      { error: "Please enter your password" },
      { status: 400 },
    );
  }

  // Best-effort throttling before any database work.
  if (!loginThrottleCheck(validEmail)) {
    return NextResponse.json(
      {
        error: "Too many attempts. Please wait a few minutes and try again.",
      },
      { status: 429 },
    );
  }

  const user = await db.user.findUnique({
    where: { email: validEmail },
    include: { password: true },
  });

  const fail = () =>
    NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 },
    );

  if (!user?.password) {
    // Burn comparable time so timing doesn't reveal whether the email exists.
    await verifyPassword(password, "scrypt$16384$8$1$00$00");
    return fail();
  }

  const ok = await verifyPassword(password, user.password.hash);
  if (!ok) return fail();

  await loginThrottleReset(validEmail);
  await createSession(user.id);

  return NextResponse.json({
    user: { email: user.email, name: user.name },
  });
}
