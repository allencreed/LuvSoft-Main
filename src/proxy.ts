import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";

export async function proxy(request: Request) {
  const res = await auth0.middleware(request);

  // When the Auth0 SDK cannot start a flow — unreachable tenant, bad config,
  // or a failed callback handshake — its middleware returns a bare-text 500.
  // Replace that with a redirect to our branded error page, preserving the
  // route the visitor was trying to reach.
  const contentType = res.headers.get("content-type") ?? "";
  if (res.status === 500 && contentType.includes("text/plain")) {
    const url = new URL(request.url);
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
