import { redirect } from "next/navigation";
import { auth0 } from "@/lib/auth0";
import { db } from "@/lib/db";

/**
 * Returns the signed-in app user, or redirects to the login page with a
 * `returnTo` path so the visitor lands back here after signing in.
 *
 * Use in any server component that must not render for signed-out visitors
 * (account pages, cart, checkout-adjacent views).
 */
export async function requireUser(returnTo = "/") {
  const session = await auth0.getSession();

  if (!session?.user) {
    redirect(`/auth/login?returnTo=${encodeURIComponent(returnTo)}`);
  }

  const user = await db.user.findUnique({
    where: { auth0Id: session.user.sub },
  });

  if (!user) {
    // Authenticated with Auth0 but no app row yet (post-login Action hasn't
    // provisioned). Send through login again so provisioning can run.
    redirect(`/auth/login?returnTo=${encodeURIComponent(returnTo)}`);
  }

  return user;
}
