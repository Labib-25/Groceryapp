"use client";

import Link from "next/link";
import { CreditCard } from "lucide-react";
import { useAppState } from "@/lib/app-state";
import { gbp } from "@/lib/format";

const TIME_VALUE_OPTIONS = [500, 1000, 2000];

/** Max-stores cap, time-value select, and a loyalty-cards hint. */
export default function OptimiserControls() {
  const { prefs, setMaxStores, setTimeValue } = useAppState();

  const timeOptions = TIME_VALUE_OPTIONS.includes(prefs.timeValuePerHourPence)
    ? TIME_VALUE_OPTIONS
    : [...TIME_VALUE_OPTIONS, prefs.timeValuePerHourPence].sort(
        (a, b) => a - b
      );

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-4 rounded-2xl border border-teal-100 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span
          id="max-stores-label"
          className="text-sm font-medium text-slate-700"
        >
          Max stores
        </span>
        <div
          role="group"
          aria-labelledby="max-stores-label"
          className="inline-flex overflow-hidden rounded-full border border-teal-200"
        >
          {[1, 2, 3, 4].map((n) => (
            <button
              key={n}
              type="button"
              aria-pressed={prefs.maxStores === n}
              onClick={() => setMaxStores(n)}
              className={`px-3.5 py-1.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-teal-600 ${
                prefs.maxStores === n
                  ? "bg-teal-600 text-white"
                  : "bg-white text-teal-800 hover:bg-teal-50"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <label
          htmlFor="time-value"
          className="text-sm font-medium text-slate-700"
        >
          Your time is worth
        </label>
        <select
          id="time-value"
          value={prefs.timeValuePerHourPence}
          onChange={(e) => setTimeValue(Number(e.target.value))}
          className="rounded-full border border-teal-200 bg-white px-3.5 py-1.5 text-sm font-semibold text-teal-800 focus:border-teal-400 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
        >
          {timeOptions.map((p) => (
            <option key={p} value={p}>
              {gbp(p)}/hr
            </option>
          ))}
        </select>
      </div>

      <Link
        href="/settings"
        className="ml-auto inline-flex items-center gap-1.5 text-sm font-medium text-teal-700 transition-colors hover:text-teal-800 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
      >
        <CreditCard className="h-4 w-4" aria-hidden />
        {prefs.loyaltyCards.length} loyalty card
        {prefs.loyaltyCards.length === 1 ? "" : "s"} active
      </Link>
    </div>
  );
}
