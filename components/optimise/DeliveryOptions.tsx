"use client";

import { Truck } from "lucide-react";
import StoreBadge from "@/components/StoreBadge";
import { gbp } from "@/lib/format";
import { getStore } from "@/lib/stores";
import type { OptimiserResult } from "@/lib/types";

/** Delivery plans that meet a store's minimum online spend, or an honest note. */
export default function DeliveryOptions({
  result,
}: {
  result: OptimiserResult;
}) {
  if (result.deliveryPlans.length === 0) {
    return (
      <p className="rounded-2xl border border-teal-100 bg-white p-4 text-sm leading-relaxed text-slate-600 shadow-sm">
        <Truck className="mr-2 inline h-4 w-4 text-slate-400" aria-hidden />
        No delivery options yet — your basket doesn&rsquo;t meet any
        store&rsquo;s minimum online spend. Add a few more items and delivery
        may become worthwhile.
      </p>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {result.deliveryPlans.map((plan) => {
        const storeId = plan.stores[0];
        const store = getStore(storeId);
        return (
          <div
            key={storeId}
            className="rounded-2xl border border-teal-100 bg-white p-4 shadow-sm transition hover:border-teal-200 hover:shadow-md"
          >
            <div className="flex items-center justify-between gap-2">
              <StoreBadge storeId={storeId} size="md" />
              <Truck className="h-4 w-4 text-slate-400" aria-hidden />
            </div>
            <dl className="mt-3 space-y-1.5 text-sm">
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-slate-500">Delivery fee</dt>
                <dd className="font-medium text-slate-900">
                  {plan.deliveryPence > 0 ? gbp(plan.deliveryPence) : "Free"}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-3 border-t border-teal-50 pt-1.5">
                <dt className="font-semibold text-slate-900">Final cost</dt>
                <dd className="font-display font-bold tracking-tight text-slate-900">
                  {gbp(plan.finalPence)}
                </dd>
              </div>
            </dl>
            {plan.unavailable.length > 0 && (
              <p className="mt-2 text-xs font-medium text-amber-700">
                {plan.unavailable.length} item
                {plan.unavailable.length === 1 ? "" : "s"} not stocked at{" "}
                {store.name}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
