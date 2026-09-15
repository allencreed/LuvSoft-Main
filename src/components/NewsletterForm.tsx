"use client";

import { useState } from "react";
import { toast } from "sonner";

/**
 * Shared newsletter capture form. Used in the footer (dark) and in the
 * modal (light). Posts to /api/newsletter; onSubscribed lets the modal
 * swap to its thank-you state.
 */
export function NewsletterForm({
  source,
  variant = "dark",
  onSubscribed,
}: {
  source: "footer" | "modal" | "checkout";
  variant?: "dark" | "light";
  onSubscribed?: () => void;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  const dark = variant === "dark";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "loading") return;

    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
      setStatus("error");
      return;
    }

    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value, source }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setStatus("done");
        setEmail("");
        onSubscribed?.();
        if (source !== "modal") {
          toast.success("Welcome to Love Soft Life — you're on the list.");
        }
      } else {
        setStatus("error");
        toast.error(data.error ?? "Could not subscribe — please try again.");
      }
    } catch {
      setStatus("error");
      toast.error("Network error — please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="w-full">
      <div
        className={`flex w-full items-stretch overflow-hidden rounded-full border transition-colors ${
          dark
            ? `border-white/25 bg-white/5 focus-within:border-white/50 ${status === "error" ? "border-red-400/70" : ""}`
            : `border-hairline bg-canvas focus-within:border-ink/40 ${status === "error" ? "border-red-400" : ""}`
        }`}
      >
        <label htmlFor={`newsletter-email-${source}`} className="sr-only">
          Email address
        </label>
        <input
          id={`newsletter-email-${source}`}
          type="email"
          autoComplete="email"
          placeholder="Your email address"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === "error") setStatus("idle");
          }}
          className={`w-full min-w-0 bg-transparent px-5 py-3.5 text-[16px] outline-none sm:text-[14px] ${
            dark ? "text-white placeholder:text-white/40" : "text-ink placeholder:text-ink-muted-48"
          }`}
        />
        <button
          type="submit"
          disabled={status === "loading" || status === "done"}
          className={`shrink-0 whitespace-nowrap px-6 text-[11px] font-semibold uppercase tracking-[0.18em] transition-all active:scale-[0.97] disabled:cursor-not-allowed ${
            dark
              ? "bg-white text-surface-black hover:bg-white/85"
              : "bg-ink text-primary-foreground hover:opacity-90"
          }`}
        >
          {status === "loading" ? "Joining…" : status === "done" ? "Joined" : "Join"}
        </button>
      </div>
    </form>
  );
}
