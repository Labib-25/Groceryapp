"use client";

import { Check, Minus, Plus } from "lucide-react";
import { useAppState } from "@/lib/app-state";

/** Add-to-list control: turns into a quantity stepper once added. */
export default function AddToListButton({
  productId,
  compact = false,
}: {
  productId: string;
  compact?: boolean;
}) {
  const { basket, addToBasket, setQty, hydrated } = useAppState();
  const item = basket.find((i) => i.productId === productId);

  if (!hydrated) {
    return (
      <span
        aria-hidden
        className="inline-flex h-9 w-24 animate-pulse rounded-full bg-teal-50"
      />
    );
  }

  if (!item) {
    return (
      <button
        type="button"
        onClick={() => addToBasket(productId)}
        className={`inline-flex items-center gap-1.5 rounded-full bg-teal-600 font-semibold text-white transition-colors hover:bg-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 ${
          compact ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm"
        }`}
      >
        <Plus className="h-4 w-4" aria-hidden />
        Add to list
      </button>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-teal-200 bg-teal-50 p-1">
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => setQty(productId, item.qty - 1)}
        className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-teal-700 shadow-sm hover:bg-teal-100"
      >
        <Minus className="h-3.5 w-3.5" aria-hidden />
      </button>
      <span className="inline-flex min-w-8 items-center justify-center gap-1 text-sm font-bold text-teal-800">
        <Check className="h-3.5 w-3.5" aria-hidden />
        {item.qty}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => setQty(productId, item.qty + 1)}
        className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-teal-700 shadow-sm hover:bg-teal-100"
      >
        <Plus className="h-3.5 w-3.5" aria-hidden />
      </button>
    </span>
  );
}
