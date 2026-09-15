"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { NewsletterForm } from "@/components/NewsletterForm";

const DISMISS_KEY = "lsl-newsletter-dismissed";
const SHOW_DELAY_MS = 8_000;
const SCROLL_DEPTH = 0.35;
const SESSION_HOURS = 12;

/**
 * Newsletter prompt modal. Appears once per 12h, after 8 seconds on page
 * or 35% scroll depth (whichever comes first). Dismissal (close, backdrop,
 * Escape, or successful subscribe) is remembered in localStorage.
 */
export function NewsletterModal() {
  const [open, setOpen] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const delayTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Once the modal has shown (or been dismissed), the triggers must never
  // fire again — otherwise every scroll re-opens a closed modal.
  const triggeredRef = useRef(false);

  useEffect(() => {
    let dismissed = false;
    try {
      const raw = localStorage.getItem(DISMISS_KEY);
      if (raw && Date.now() - Number(raw) < SESSION_HOURS * 3600_000) {
        dismissed = true;
      }
    } catch {
      // storage unavailable (private mode etc.) — still show politely once
    }
    if (dismissed) return;

    const trigger = () => {
      if (triggeredRef.current) return;
      triggeredRef.current = true;
      setOpen(true);
    };

    delayTimer.current = setTimeout(trigger, SHOW_DELAY_MS);

    const onScroll = () => {
      if (triggeredRef.current) return;
      const depth =
        window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      if (depth >= SCROLL_DEPTH) trigger();
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      if (delayTimer.current) clearTimeout(delayTimer.current);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  function dismiss() {
    setOpen(false);
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // ignore
    }
  }

  // Escape to close + focus trap is overkill here; Escape close is enough
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="newsletter-modal-title"
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto px-4 py-6"
    >
      <button
        aria-label="Close newsletter prompt"
        onClick={dismiss}
        className="fixed inset-0 cursor-default bg-surface-black/60 backdrop-blur-[2px] animate-in fade-in duration-300"
      />
      <div className="relative my-auto w-full max-w-md rounded-[24px] border border-hairline bg-canvas p-8 text-center shadow-2xl sm:p-10 animate-in fade-in zoom-in-95 duration-300">
        <button
          onClick={dismiss}
          aria-label="Close"
          className="absolute right-3 top-3 rounded-full p-2.5 text-ink-muted-48 transition-colors hover:bg-muted hover:text-ink"
        >
          <X className="h-5 w-5" strokeWidth={1.5} />
        </button>

        {subscribed ? (
          <div className="py-6">
            <p className="eyebrow text-gold-deep">Welcome</p>
            <h2
              id="newsletter-modal-title"
              className="mt-4 font-display text-[32px] leading-[1.1] text-ink"
            >
              You&apos;re <span className="italic">on the list</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xs text-[14px] leading-relaxed text-ink-muted-80">
              Watch your inbox for first looks at new pieces, quiet restocks,
              and notes from the studio.
            </p>
            <button
              onClick={dismiss}
              className="mt-8 inline-flex items-center justify-center rounded-full bg-ink px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-foreground transition-all hover:opacity-90 active:scale-[0.97]"
            >
              Keep Browsing
            </button>
          </div>
        ) : (
          <>
            <p className="eyebrow text-gold-deep">The List</p>
            <h2
              id="newsletter-modal-title"
              className="mt-4 font-display text-[34px] leading-[1.08] text-ink sm:text-[38px]"
            >
              Softness, <span className="italic">first</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xs text-[14px] leading-relaxed text-ink-muted-80">
              Join the list for first access to limited pieces, quiet restocks,
              and a softer kind of inbox.
            </p>
            <div className="mt-7">
              <NewsletterForm
                source="modal"
                variant="light"
                onSubscribed={() => setSubscribed(true)}
              />
            </div>
            <button
              onClick={dismiss}
              className="mt-5 text-[11px] font-medium uppercase tracking-[0.18em] text-ink-muted-48 transition-colors hover:text-ink"
            >
              No thank you
            </button>
          </>
        )}
      </div>
    </div>
  );
}
