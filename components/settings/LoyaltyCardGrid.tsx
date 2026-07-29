"use client";

import { Check } from "lucide-react";
import { useAppState } from "@/lib/app-state";
import { ALL_STORES } from "@/lib/stores";

const LOYALTY_STORES = ALL_STORES.filter((store) => store.loyaltyScheme);

/**
 * Toggle grid for every supermarket loyalty scheme BasketWise knows about.
 * Wired to prefs.loyaltyCards — active schemes change prices across the app.
 */
export default function LoyaltyCardGrid() {
  const { prefs, toggleLoyaltyCard } = useAppState();

  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {LOYALTY_STORES.map((store) => {
        const active = prefs.loyaltyCards.includes(store.id);
        return (
          <li key={store.id}>
            <button
              type="button"
              aria-pressed={active}
              onClick={() => toggleLoyaltyCard(store.id)}
              className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 ${
                active
                  ? "border-teal-300 bg-teal-50/70 shadow-sm"
                  : "border-slate-200 bg-white hover:border-teal-200 hover:bg-teal-50/40"
              }`}
            >
              <span
                aria-hidden
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: store.color }}
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-slate-900">
                  {store.name}
                </span>
                <span className="block truncate text-xs text-slate-500">
                  {store.loyaltyScheme}
                </span>
              </span>
              {active ? (
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-600 text-white">
                  <Check className="h-4 w-4" aria-hidden strokeWidth={3} />
                </span>
              ) : (
                <span
                  aria-hidden
                  className="h-6 w-6 shrink-0 rounded-full border-2 border-slate-200"
                />
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
