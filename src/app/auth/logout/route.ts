import { NextResponse } from "next/server";

/**
 * Fallback only: /auth/logout is normally served by the proxy (native
 * sessions) or the Auth0 middleware (Auth0 sessions). If neither matched —
 * e.g. a signed-out visitor hits the URL directly — send them home.
 */
export function GET(req: Request) {
  return NextResponse.redirect(new URL("/", req.url));
}
