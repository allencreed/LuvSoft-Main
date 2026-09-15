import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

/**
 * Native account sessions (email + password users).
 *
 * The cookie holds only a random `selector.token` pair; the database stores
 * a SHA-256 hash of the token, so a database leak cannot be replayed as a
 * valid cookie. Sessions are server-side and revocable.
 */

export const SESSION_COOKIE = "lsl_session";
const SESSION_TTL_DAYS = 30;
const REFRESH_THRESHOLD_MS = 15 * 24 * 60 * 60 * 1000; // slide when < 15 days left

type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  auth0Id: string | null;
};

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function expiryDate(): Date {
  return new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);
}

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_DAYS * 24 * 60 * 60,
  };
}

/**
 * Creates a session row and sets the cookie. Must be called from a
 * route handler / server action (it writes cookies).
 */
export async function createSession(userId: string): Promise<void> {
  const selector = randomBytes(12).toString("base64url");
  const token = randomBytes(32).toString("base64url");

  await db.session.create({
    data: {
      userId,
      tokenHash: hashToken(`${selector}.${token}`),
      expiresAt: expiryDate(),
    },
  });

  const store = await cookies();
  store.set(SESSION_COOKIE, `${selector}.${token}`, cookieOptions());
}

/**
 * Returns the signed-in native user from a raw cookie value (no request-scope
 * dependency — safe in route handlers, server components, AND the proxy),
 * or null. Verifies the token hash, checks expiry, and slides the window
 * forward on active use so returning customers aren't logged out mid-habit.
 */
export async function getCurrentUserFromCookie(
  raw: string | undefined,
): Promise<SessionUser | null> {
  if (!raw || !raw.includes(".")) return null;

  const tokenHash = hashToken(raw);

  const session = await db.session.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!session) return null;

  if (session.expiresAt.getTime() <= Date.now()) {
    await db.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }

  // Sliding expiration: refresh sessions that are still being used.
  const remaining = session.expiresAt.getTime() - Date.now();
  if (remaining < REFRESH_THRESHOLD_MS) {
    await db.session
      .update({ where: { id: session.id }, data: { expiresAt: expiryDate() } })
      .catch(() => {});
  }

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role,
    auth0Id: session.user.auth0Id,
  };
}

/**
 * Returns the signed-in native user, or null (request-scope variant).
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const store = await cookies();
  return getCurrentUserFromCookie(store.get(SESSION_COOKIE)?.value);
}

/** Deletes the current session row and clears the cookie. */
export async function destroySession(): Promise<void> {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE)?.value;

  await deleteSessionByCookieValue(raw);

  store.delete(SESSION_COOKIE);
}

/**
 * Deletes the session row for a raw cookie value without touching the
 * request cookie store — usable from the proxy/middleware context.
 */
export async function deleteSessionByCookieValue(
  raw: string | undefined,
): Promise<void> {
  if (raw && raw.includes(".")) {
    await db.session
      .delete({ where: { tokenHash: hashToken(raw) } })
      .catch(() => {});
  }
}

/**
 * Unified identity for the storefront: returns whichever user is signed in —
 * native (session cookie) or Auth0 (SDK session) — or null.
 *
 * All user-aware server code should use this instead of talking to the Auth0
 * SDK directly, so both account kinds work everywhere.
 */
export async function getCurrentStorefrontUser(req?: Request): Promise<SessionUser | null> {
  const native = await getCurrentUser();
  if (native) return native;

  try {
    const { auth0 } = await import("@/lib/auth0");
    const session = await auth0.getSession(req as never);
    if (!session?.user?.sub) return null;

    const user = await db.user.findUnique({
      where: { auth0Id: session.user.sub },
    });
    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      auth0Id: user.auth0Id,
    };
  } catch {
    // Auth0 not configured (placeholder tenant) — treat as signed out.
    return null;
  }
}

/**
 * Same as getCurrentStorefrontUser but redirects to the login page with a
 * `returnTo` when signed out. Use in pages that must not render signed-out.
 */
export async function requireStorefrontUser(returnTo = "/"): Promise<SessionUser> {
  const user = await getCurrentStorefrontUser();
  if (!user) {
    redirect(`/auth/login?returnTo=${encodeURIComponent(returnTo)}`);
  }
  return user;
}

/**
 * Unified admin gate. Returns the signed-in user when they hold the admin
 * role, otherwise null — works for native AND Auth0 accounts. Admin pages
 * and admin API routes must use this (never a bare Auth0 session check).
 */
export async function getAdminUser(req?: Request): Promise<SessionUser | null> {
  const user = await getCurrentStorefrontUser(req);
  return user?.role === "admin" ? user : null;
}

/**
 * Page-side admin gate: redirects signed-out visitors to login (preserving
 * the destination) and renders nothing for signed-in non-admins — callers
 * decide what a non-admin sees by checking the null return.
 */
export async function requireAdminUser(
  returnTo = "/admin",
): Promise<SessionUser | null> {
  const user = await getCurrentStorefrontUser();
  if (!user) {
    redirect(`/auth/login?returnTo=${encodeURIComponent(returnTo)}`);
  }
  return user.role === "admin" ? user : null;
}

// ---------------------------------------------------------------------------
// Shared validation + best-effort login throttling
// ---------------------------------------------------------------------------

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateEmail(email: unknown): string | null {
  if (typeof email !== "string") return null;
  const normalized = email.trim().toLowerCase();
  if (normalized.length === 0 || normalized.length > 254) return null;
  return EMAIL_RE.test(normalized) ? normalized : null;
}

export function validatePassword(password: unknown): string | null {
  if (typeof password !== "string") return null;
  // Reject ASCII control characters (including NUL) outright.
  if (/[\x00-\x1f\x7f]/.test(password)) return null;
  return password.length >= 8 && password.length <= 200 ? password : null;
}

export function validateName(name: unknown): string | null {
  if (name === undefined || name === null || name === "") return null;
  if (typeof name !== "string") return null;
  const trimmed = name.trim().replace(/\s+/g, " ");
  if (trimmed.length === 0) return null;
  return trimmed.length <= 80 ? trimmed : null;
}

type Attempt = { count: number; firstAt: number };
const attempts = new Map<string, Attempt>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 8;

/** Best-effort per-email login throttle (per server process). */
export function loginThrottleCheck(email: string): boolean {
  const now = Date.now();
  const entry = attempts.get(email);

  if (!entry || now - entry.firstAt > WINDOW_MS) {
    attempts.set(email, { count: 1, firstAt: now });
    return true;
  }

  entry.count += 1;
  return entry.count <= MAX_ATTEMPTS;
}

export function loginThrottleReset(email: string): void {
  attempts.delete(email);
}
