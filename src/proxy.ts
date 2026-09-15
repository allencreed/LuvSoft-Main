import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import {
  deleteSessionByCookieValue,
  getCurrentUserFromCookie,
} from "@/lib/session";

const SDK_ROUTES = new Set(["/auth/login", "/auth/callback", "/auth/logout"]);

export async function proxy(request: Request) {
  const url = new URL(request.url);
  const cookieHeader = request.headers.get("cookie") ?? "";

  // Native (email + password) accounts never touch the Auth0 SDK — skip its
  // middleware entirely for them so sign-in works even while the Auth0
  // tenant is unconfigured.
  const cookieValue = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("lsl_session="))
    ?.slice("lsl_session=".length);

  const nativeUser = await getCurrentUserFromCookie(cookieValue);

  if (nativeUser) {
    // Serve the native sign-out directly (the Auth0 middleware owns
    // /auth/logout otherwise, and native users bypass it here).
    if (url.pathname === "/auth/logout") {
      await deleteSessionByCookieValue(cookieValue);
      const res = NextResponse.redirect(new URL("/?signedout=1", url));
      res.cookies.set("lsl_session", "", { path: "/", maxAge: 0 });
      return res;
    }

    return NextResponse.next();
  }

  // Signed-out visitor on an SDK-owned route: while the Auth0 tenant is
  // unconfigured, its middleware would 500 on these paths before the app's
  // own pages could render. Let the app handle them instead:
  //   /auth/login    → branded sign-in / create-account page
  //   /auth/logout   → app fallback (just goes home)
  //   /auth/callback → branded "couldn't complete sign-in" page
  // Visitors with a real Auth0 session cookie still flow through the SDK.
  const hasAuth0Session = cookieHeader.includes("appSession");
  if (SDK_ROUTES.has(url.pathname) && !hasAuth0Session) {
    if (url.pathname === "/auth/callback") {
      return NextResponse.redirect(
        new URL("/auth/error?reason=callback_failed", url),
      );
    }
    return NextResponse.next();
  }

  const res = await auth0.middleware(request);

  // When the Auth0 SDK cannot start a flow — unreachable tenant, bad config,
  // or a failed callback handshake — its middleware returns a bare-text 500.
  // Replace that with a redirect to our branded error page, preserving the
  // route the visitor was trying to reach.
  const contentType = res.headers.get("content-type") ?? "";
  if (res.status === 500 && contentType.includes("text/plain")) {
    const attempted = url.pathname + url.search;

    if (url.pathname === "/auth/callback") {
      return NextResponse.redirect(
        new URL(`/auth/error?reason=callback_failed`, url),
      );
    }

    return NextResponse.redirect(
      new URL(
        `/auth/error?reason=start_failed&from=${encodeURIComponent(attempted)}`,
        url,
      ),
    );
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"],
};
