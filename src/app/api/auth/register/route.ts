import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/credentials";
import {
  createSession,
  validateEmail,
  validateName,
  validatePassword,
} from "@/lib/session";

/**
 * Native account registration (email + password).
 * Creates the User (auth0Id null), a Password row, an empty cart, and signs
 * the visitor in. Designed to coexist with Auth0: the two identity paths
 * share the same users table.
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

  const { email, password, name } = (body ?? {}) as Record<string, unknown>;

  const validEmail = validateEmail(email);
  if (!validEmail) {
    return NextResponse.json(
      { error: "Please enter a valid email address" },
      { status: 400 },
    );
  }

  const validPassword = validatePassword(password);
  if (!validPassword) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 },
    );
  }

  const validName = validateName(name);
  if (name !== undefined && name !== "" && !validName) {
    return NextResponse.json(
      { error: "Please enter a shorter name" },
      { status: 400 },
    );
  }

  const existing = await db.user.findUnique({ where: { email: validEmail } });
  if (existing) {
    return NextResponse.json(
      {
        error:
          "An account with this email already exists. Try signing in instead.",
      },
      { status: 409 },
    );
  }

  const user = await db.user.create({
    data: {
      email: validEmail,
      name: validName ?? validEmail.split("@")[0],
      password: {
        create: { hash: await hashPassword(validPassword) },
      },
      cart: { create: {} },
    },
  });

  await createSession(user.id);

  return NextResponse.json({
    user: { email: user.email, name: user.name },
  });
}
