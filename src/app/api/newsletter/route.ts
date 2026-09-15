import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Naive per-instance cooldown: the same email cannot be (re)subscribed more
// than once every 60s. Enough to blunt automated abuse without a store.
const recent = new Map<string, number>();
const COOLDOWN_MS = 60_000;

export async function POST(req: NextRequest) {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { email, source } = (payload ?? {}) as {
    email?: unknown;
    source?: unknown;
  };

  if (typeof email !== "string" || !EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 }
    );
  }

  const normalized = email.trim().toLowerCase();
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const key = `${ip}:${normalized}`;

  const last = recent.get(key);
  const now = Date.now();
  if (last && now - last < COOLDOWN_MS) {
    return NextResponse.json(
      { error: "Too many attempts — try again in a minute." },
      { status: 429 }
    );
  }
  recent.set(key, now);
  if (recent.size > 5000) {
    // Prevent unbounded growth in long-lived processes
    for (const [k, t] of recent) {
      if (now - t > COOLDOWN_MS) recent.delete(k);
    }
  }

  const allowedSources = ["footer", "modal", "checkout"];
  const src = typeof source === "string" && allowedSources.includes(source) ? source : "footer";

  try {
    await db.newsletterSubscriber.upsert({
      where: { email: normalized },
      update: { isActive: true, source: src },
      create: { email: normalized, source: src },
    });
  } catch (err) {
    console.error("[newsletter] upsert failed:", err);
    return NextResponse.json(
      { error: "Something went wrong — please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
