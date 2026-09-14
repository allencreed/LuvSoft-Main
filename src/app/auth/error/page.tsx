import Link from "next/link";

export const metadata = {
  title: "Sign-in issue — Love Soft Life",
};

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string; from?: string }>;
}) {
  const { reason, from } = await searchParams;

  const isCallback = reason === "callback_failed";
  const loginHref = from
    ? `/auth/login?returnTo=${encodeURIComponent(from)}`
    : "/auth/login";

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-canvas">
      <div className="mx-auto w-full px-6 py-24 text-center" style={{ maxWidth: 640 }}>
        <p className="eyebrow text-gold-deep">{isCallback ? "Sign-in interrupted" : "Something interrupted you"}</p>
        <h1 className="mt-5 text-[42px] leading-[1.06] text-ink sm:text-[54px]">
          We couldn&apos;t {isCallback ? "complete" : "start"} your{" "}
          <span className="italic">sign-in</span>
        </h1>
        <p className="mx-auto mt-6 max-w-sm text-[16px] leading-relaxed text-ink-muted-48">
          {isCallback
            ? "The sign-in handshake with our authentication provider didn't complete. This is usually temporary — trying again normally works."
            : "We couldn't reach our authentication provider to begin the sign-in. This is usually temporary — please try again in a moment."}
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-5 sm:flex-row sm:gap-8">
          <Link
            href={loginHref}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-full bg-ink px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-foreground transition-all hover:opacity-90 active:scale-[0.97]"
          >
            Try Signing In Again
          </Link>
          <Link
            href="/products"
            className="group inline-flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.2em] text-ink transition-colors hover:text-ink/70"
          >
            Keep Browsing
            <span className="block h-px w-6 bg-gold transition-all duration-300 group-hover:w-10" />
          </Link>
        </div>
      </div>
    </div>
  );
}
