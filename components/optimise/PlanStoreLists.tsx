"use client";

import { ChevronDown } from "lucide-react";
import StoreBadge from "@/components/StoreBadge";
import { getProduct } from "@/lib/catalog";
import { checkedLabel, gbp, packSize } from "@/lib/format";
import { getStore } from "@/lib/stores";
import type { BasketPlan } from "@/lib/types";

/**
 * Expandable per-store shopping lists for the selected plan: exactly what
 * to pick up where, with honest loyalty labelling and line prices.
 */
export default function PlanStoreLists({ plan }: { plan: BasketPlan }) {
  if (plan.stores.length === 0) {
    return (
      <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        This plan has no store visits — nothing on your list could be
        allocated.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {plan.stores.map((storeId, idx) => {
        const store = getStore(storeId);
        const allocations = plan.allocations.filter(
          (a) => a.storeId === storeId
        );
        const subtotal = allocations.reduce(
          (s, a) => s + a.linePricePence,
          0
        );
        return (
          <details
            key={`${plan.label}-${storeId}`}
            open={idx === 0}
            className="group rounded-2xl border border-teal-100 bg-white shadow-sm transition hover:border-teal-200"
          >
            <summary className="flex cursor-pointer list-none flex-wrap items-center gap-3 rounded-2xl px-4 py-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 [&::-webkit-details-marker]:hidden">
              <StoreBadge storeId={storeId} size="md" />
              <span className="text-sm text-slate-500">
                {allocations.length} item{allocations.length === 1 ? "" : "s"}
                {plan.kind === "delivery" ? " · delivered" : ""}
              </span>
              <span className="ml-auto flex items-center gap-2">
                <span className="font-display font-bold tracking-tight text-slate-900">
                  {gbp(subtotal)}
                </span>
                <ChevronDown
                  className="h-4 w-4 text-slate-400 transition-transform group-open:rotate-180"
                  aria-hidden
                />
              </span>
            </summary>

            <ul className="divide-y divide-teal-50 border-t border-teal-50 px-4">
              {allocations.map((a) => {
                const canonical = getProduct(a.productId);
                // Store product names usually already include the brand and
                // pack size — only add what's missing, never duplicate.
                const offerName = a.offer.productName;
                const lower = offerName.toLowerCase();
                const sizeLabel = packSize(a.offer.packSize, a.offer.unit);
                const detail = [
                  lower.includes(a.offer.brand.toLowerCase())
                    ? offerName
                    : `${a.offer.brand} ${offerName}`,
                  lower
                    .replace(/\s+/g, "")
                    .includes(sizeLabel.toLowerCase().replace(/\s+/g, ""))
                    ? null
                    : sizeLabel,
                ]
                  .filter(Boolean)
                  .join(", ");
                return (
                  <li
                    key={a.productId}
                    className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5 text-sm"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-900">
                        {canonical?.name ?? a.offer.productName}
                        {a.qty > 1 && (
                          <span className="ml-1.5 text-slate-500">
                            × {a.qty}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-slate-500">
                        {detail}
                        <span className="ml-1.5 text-slate-400">
                          {checkedLabel(a.offer.updatedAt)}
                        </span>
                      </p>
                    </div>
                    {a.usedLoyalty && (
                      <span className="rounded-full bg-teal-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                        {store.loyaltyScheme ?? "Loyalty"} price
                      </span>
                    )}
                    <span className="font-semibold text-slate-900">
                      {gbp(a.linePricePence)}
                    </span>
                  </li>
                );
              })}
              <li className="flex items-center justify-between py-2.5 text-sm">
                <span className="font-semibold text-slate-900">
                  {store.name} subtotal
                </span>
                <span className="font-display font-bold tracking-tight text-teal-700">
                  {gbp(subtotal)}
                </span>
              </li>
            </ul>
          </details>
        );
      })}
    </div>
  );
}
