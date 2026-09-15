"use client";

import { useState } from "react";

export function CartCheckoutButton() {
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    setLoading(true);
    const res = await fetch("/api/checkout", { method: "POST" });
    const data = await res.json();

    if (data.url) {
      window.location.href = data.url;
    } else {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-primary px-[22px] py-[14px] text-[16px] font-light text-white hover:brightness-110 active:scale-[0.96] transition-all disabled:opacity-50 sm:text-[18px]"
    >
      {loading ? "Redirecting..." : "Checkout"}
    </button>
  );
}
