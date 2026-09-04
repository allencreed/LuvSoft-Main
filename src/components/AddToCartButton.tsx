"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Minus, Plus } from "lucide-react";

export function AddToCartButton({
  productId,
  disabled,
}: {
  productId: string;
  disabled: boolean;
}) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  async function handleAdd() {
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity }),
    });

    if (!res.ok) {
      if (res.status === 401) {
        router.push(`/auth/login?returnTo=${encodeURIComponent(window.location.pathname)}`);
        return;
      }
      const data = await res.json().catch(() => ({}));
      toast.error(data.error ?? "Could not add to cart");
      return;
    }

    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
    toast.success("Added to cart");
    router.refresh();
  }

  if (disabled) {
    return (
      <span className="inline-flex w-full items-center justify-center rounded-full border border-hairline bg-canvas-parchment px-9 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground cursor-not-allowed sm:w-auto">
        Out of Stock
      </span>
    );
  }

  return (
    <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
      <div className="inline-flex items-center justify-between rounded-full border border-hairline bg-canvas">
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          className="flex h-12 w-12 items-center justify-center text-ink hover:bg-muted rounded-full transition-colors"
        >
          <Minus className="h-3.5 w-3.5" strokeWidth={1.5} />
        </button>
        <span className="w-8 text-center text-[15px] font-normal text-ink tabular-nums select-none">
          {quantity}
        </span>
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.min(99, q + 1))}
          className="flex h-12 w-12 items-center justify-center text-ink hover:bg-muted rounded-full transition-colors"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
        </button>
      </div>
      <button
        onClick={handleAdd}
        className={`inline-flex items-center justify-center rounded-full px-10 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-white transition-all hover:brightness-110 active:scale-[0.97] ${
          justAdded ? "bg-[#4a7a4d]" : "bg-primary"
        }`}
      >
        {justAdded ? "Added!" : "Add to Cart"}
      </button>
    </div>
  );
}
