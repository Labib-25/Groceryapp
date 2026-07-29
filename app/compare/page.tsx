"use client";

import { Suspense } from "react";
import CompareBrowser from "@/components/compare/CompareBrowser";

/** Lightweight skeleton shown while the search-params boundary resolves. */
function CompareFallback() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6" aria-hidden>
      <div className="h-8 w-64 animate-pulse rounded-lg bg-teal-50" />
      <div className="mt-6 h-11 w-full max-w-xl animate-pulse rounded-full bg-teal-50" />
      <div className="mt-4 flex gap-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-9 w-24 animate-pulse rounded-full bg-teal-50"
          />
        ))}
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-44 animate-pulse rounded-2xl border border-teal-100 bg-teal-50/50"
          />
        ))}
      </div>
    </div>
  );
}

/**
 * /compare — thin wrapper so the useSearchParams consumer sits inside
 * a <Suspense> boundary, as Next.js requires.
 */
export default function ComparePage() {
  return (
    <Suspense fallback={<CompareFallback />}>
      <CompareBrowser />
    </Suspense>
  );
}
