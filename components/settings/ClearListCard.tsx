"use client";

import { useState } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { useAppState } from "@/lib/app-state";

/**
 * Danger-zone card: clears the shopping list, with an explicit confirm step
 * so a stray click never wipes anyone's weekly shop.
 */
export default function ClearListCard() {
  const { basketCount, clearBasket } = useAppState();
  const [confirming, setConfirming] = useState(false);
  const [cleared, setCleared] = useState(false);

  const itemsLabel = `${basketCount} ${basketCount === 1 ? "item" : "items"}`;

  const handleClear = () => {
    clearBasket();
    setConfirming(false);
    setCleared(true);
  };

  return (
    <div className="rounded-2xl border border-red-200 bg-red-50/40 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-xl">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-red-900">
            <Trash2 className="h-4 w-4 text-red-600" aria-hidden />
            Clear my shopping list
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-red-800/80">
            {basketCount > 0
              ? `Removes all ${itemsLabel} from your list on this device. Your loyalty cards and preferences stay put.`
              : "Your shopping list is already empty. Loyalty cards and preferences are never touched by this."}
          </p>
        </div>

        {!confirming && (
          <button
            type="button"
            onClick={() => {
              setCleared(false);
              setConfirming(true);
            }}
            disabled={basketCount === 0}
            className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:cursor-not-allowed disabled:bg-red-300"
          >
            Clear my shopping list
          </button>
        )}
      </div>

      {confirming && (
        <div
          role="alertdialog"
          aria-label="Confirm clearing your shopping list"
          className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-red-200 bg-white p-4"
        >
          <AlertTriangle className="h-5 w-5 shrink-0 text-red-600" aria-hidden />
          <p className="text-sm font-medium text-slate-900">
            Delete {itemsLabel} for good? This can&rsquo;t be undone.
          </p>
          <div className="ml-auto flex gap-2">
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
            >
              Keep my list
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
            >
              Yes, clear it
            </button>
          </div>
        </div>
      )}

      <p
        role="status"
        aria-live="polite"
        className={`text-sm font-medium text-teal-700 ${cleared ? "mt-3" : ""}`}
      >
        {cleared ? "Done — your shopping list has been cleared." : ""}
      </p>
    </div>
  );
}
