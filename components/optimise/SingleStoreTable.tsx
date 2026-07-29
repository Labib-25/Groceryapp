"use client";

import { AlertTriangle } from "lucide-react";
import StoreBadge from "@/components/StoreBadge";
import { gbp, minutes } from "@/lib/format";
import type { OptimiserResult } from "@/lib/types";

/**
 * Every single-store option side by side, cheapest first, so the headline
 * recommendations are transparently checkable.
 */
export default function SingleStoreTable({
  result,
}: {
  result: OptimiserResult;
}) {
  const cheapest = result.singleStorePlans[0];

  return (
    <div className="overflow-x-auto rounded-2xl border border-teal-100 bg-white shadow-sm">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <caption className="sr-only">
          Cost of buying the whole list at each single store
        </caption>
        <thead>
          <tr className="border-b border-teal-100 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <th scope="col" className="px-4 py-3">
              Store
            </th>
            <th scope="col" className="px-4 py-3">
              Items found
            </th>
            <th scope="col" className="px-4 py-3 text-right">
              Products
            </th>
            <th scope="col" className="px-4 py-3 text-right">
              Travel est.
            </th>
            <th scope="col" className="px-4 py-3 text-right">
              Final cost
            </th>
          </tr>
        </thead>
        <tbody>
          {result.singleStorePlans.map((plan) => {
            const storeId = plan.stores[0];
            const listSize = plan.allocations.length + plan.unavailable.length;
            const short = plan.allocations.length < listSize;
            const none = plan.allocations.length === 0;
            const isCheapest = plan === cheapest;
            return (
              <tr
                key={storeId}
                className={`border-b border-teal-50 last:border-b-0 ${
                  isCheapest ? "bg-teal-50/70" : none ? "bg-slate-50/60" : "bg-white"
                }`}
              >
                <td className="px-4 py-3">
                  <span className="flex flex-wrap items-center gap-2">
                    <StoreBadge storeId={storeId} />
                    {isCheapest && (
                      <span className="rounded-full bg-teal-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                        Cheapest
                      </span>
                    )}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {none ? (
                    <span className="text-slate-500">
                      None of your items stocked
                    </span>
                  ) : short ? (
                    <span className="inline-flex items-center gap-1.5 font-semibold text-amber-700">
                      <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
                      {plan.allocations.length} of {listSize}
                    </span>
                  ) : (
                    <span className="text-slate-600">
                      {plan.allocations.length} of {listSize}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right text-slate-700">
                  {none ? <span aria-label="not applicable">—</span> : gbp(plan.productTotalPence)}
                </td>
                <td className="px-4 py-3 text-right text-slate-700">
                  {none ? (
                    <span aria-label="not applicable">—</span>
                  ) : (
                    <>
                      {gbp(plan.travelPence)}{" "}
                      <span className="text-xs text-slate-400">
                        ({minutes(plan.travelMinutes)})
                      </span>
                    </>
                  )}
                </td>
                <td className="px-4 py-3 text-right font-display font-bold tracking-tight text-slate-900">
                  {none ? <span aria-label="not applicable">—</span> : gbp(plan.finalPence)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
