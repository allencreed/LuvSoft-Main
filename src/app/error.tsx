"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-canvas">
      <div className="mx-auto w-full px-6 py-24 text-center" style={{ maxWidth: 640 }}>
        <p className="eyebrow text-gold-deep">Something went wrong</p>
        <h1 className="mt-5 text-[36px] leading-[1.08] text-ink sm:text-[46px]">
          A quiet <span className="italic">misstep</span>
        </h1>
        <p className="mx-auto mt-6 max-w-sm text-[16px] leading-relaxed text-ink-muted-48">
          An unexpected error interrupted this page. It has been noted — please try again.
        </p>
        <button
          onClick={reset}
          className="mt-10 inline-flex items-center justify-center rounded-full bg-ink px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-foreground transition-all hover:opacity-90 active:scale-[0.97]"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
