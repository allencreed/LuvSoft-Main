"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

type Mode = "signin" | "register";

const inputClasses =
  "w-full rounded-full border border-hairline bg-canvas px-5 py-3.5 text-[16px] text-ink placeholder:text-ink-muted-48 outline-none transition-colors focus:border-gold sm:text-[15px]";

/**
 * Email + password sign-in / account creation for Love Soft Life.
 * Talks to /api/auth/login and /api/auth/register, then routes back to the
 * `returnTo` destination (or the account page) on success.
 */
export function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/account/orders";

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;

    setBusy(true);
    setError(null);

    const endpoint = mode === "signin" ? "/api/auth/login" : "/api/auth/register";
    const body =
      mode === "signin" ? { email, password } : { email, password, name };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      toast.success(
        mode === "signin" ? "Welcome back" : "Welcome to Love Soft Life",
      );
      // Refresh server components (header shows the signed-in state), then
      // return the visitor to where they were headed.
      router.refresh();
      router.push(returnTo);
    } catch {
      setError("Network error — please try again.");
    } finally {
      setBusy(false);
    }
  }

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
  }

  return (
    <div className="w-full" style={{ maxWidth: 440 }}>
      {/* Mode tabs */}
      <div className="mb-10 flex items-center justify-center gap-10">
        <button
          type="button"
          onClick={() => switchMode("signin")}
          className={`pb-2 text-[12px] font-medium uppercase tracking-[0.2em] transition-colors ${
            mode === "signin"
              ? "text-ink border-b border-gold"
              : "text-ink-muted-48 hover:text-ink"
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => switchMode("register")}
          className={`pb-2 text-[12px] font-medium uppercase tracking-[0.2em] transition-colors ${
            mode === "register"
              ? "text-ink border-b border-gold"
              : "text-ink-muted-48 hover:text-ink"
          }`}
        >
          Create Account
        </button>
      </div>

      <h1 className="text-center text-[32px] leading-[1.1] text-ink sm:text-[38px]">
        {mode === "signin" ? (
          <>
            Welcome <span className="italic">back</span>
          </>
        ) : (
          <>
            Create your <span className="italic">account</span>
          </>
        )}
      </h1>
      <p className="mt-4 text-center text-[14px] leading-relaxed text-ink-muted-48">
        {mode === "signin"
          ? "Sign in to your cart, orders, and order history."
          : "One account for your cart, orders, and early access to new pieces."}
      </p>

      <form onSubmit={submit} className="mt-10 flex flex-col gap-4">
        {mode === "register" && (
          <input
            type="text"
            autoComplete="name"
            placeholder="Full name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
            className={inputClasses}
          />
        )}

        <input
          type="email"
          required
          autoComplete="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClasses}
        />

        <input
          type="password"
          required
          minLength={8}
          autoComplete={mode === "signin" ? "current-password" : "new-password"}
          placeholder={mode === "signin" ? "Password" : "Password (min. 8 characters)"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClasses}
        />

        {error && (
          <p className="rounded-2xl border border-hairline bg-canvas-parchment px-5 py-3 text-[13px] leading-relaxed text-ink">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="mt-2 inline-flex items-center justify-center rounded-full bg-ink px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-foreground transition-all hover:opacity-90 active:scale-[0.97] disabled:opacity-50"
        >
          {busy
            ? "One moment…"
            : mode === "signin"
              ? "Sign In"
              : "Create Account"}
        </button>
      </form>

      <p className="mt-8 text-center text-[13px] text-ink-muted-48">
        {mode === "signin" ? (
          <>
            New to Love Soft Life?{" "}
            <button
              type="button"
              onClick={() => switchMode("register")}
              className="text-ink underline decoration-gold underline-offset-4 hover:opacity-80"
            >
              Create an account
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => switchMode("signin")}
              className="text-ink underline decoration-gold underline-offset-4 hover:opacity-80"
            >
              Sign in
            </button>
          </>
        )}
      </p>

      <p className="mt-10 text-center text-[12px] text-ink-muted-48">
        <Link href="/products" className="hover:text-ink">
          Continue browsing instead
        </Link>
      </p>
    </div>
  );
}
