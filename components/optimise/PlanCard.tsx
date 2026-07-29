"use client";

import { AlertTriangle, ArrowDown, BadgePercent } from "lucide-react";
import StoreBadge from "@/components/StoreBadge";
import { gbp, minutes } from "@/lib/format";
import { savingVsSingleStore } from "@/lib/optimiser";
import type { BasketPlan, OptimiserResult, UserPrefs } from "@/lib/types";
import {
  PLAN_TITLES,
  productNames,
  samePlan,
  type PlanKey,
} from "./plan-utils";

const RIBBONS: Record<PlanKey, { label: string; className: string }> = {
  cheapest: { label: "Best price", className: "bg-teal-600 text-white" },
  practical: {
    label: "Best value for effort",
    className: "bg-teal-50 text-teal-800",
  },
  convenient: {
    label: "Least effort — one stop or delivery",
    className: "bg-cyan-50 text-cyan-800",
  },
};

/** One of the three headline recommendation cards. */
export default function PlanCard({
  planKey,
  plan,
  result,
  prefs,
  sameAs,
  selected,
  onSelect,
}: {
  planKey: PlanKey;
  plan: BasketPlan;
  result: OptimiserResult;
  prefs: UserPrefs;
  /** e.g. "Same as Cheapest" when this slot resolves to another card's plan. */
  sameAs?: string;
  selected: boolean;
  onSelect: () => void;
}) {
  const ribbon = RIBBONS[planKey];
  const saving = savingVsSingleStore(result, plan);
  const baseline = result.singleStorePlans[0];
  const isBaseline = baseline !== undefined && samePlan(plan, baseline);
  const unavailableNames = productNames(plan.unavailable);

  return (
    <article
      className={`flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md ${
        selected
          ? "border-teal-400 ring-2 ring-teal-500/40"
          : "border-teal-100 hover:border-teal-200"
      } ${planKey === "cheapest" ? "glow-teal" : ""}`}
    >
      <p
        className={`px-5 py-2 text-xs font-semibold uppercase tracking-widest ${ribbon.className}`}
      >
        {ribbon.label}
      </p>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-xl font-bold tracking-tight text-slate-900">
              {PLAN_TITLES[planKey]}
            </h3>
            {sameAs && (
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                {sameAs}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-600">{plan.label}</p>
          {planKey === "practical" && (
            <p className="mt-0.5 text-xs text-slate-400">
              Capped at your max of {prefs.maxStores} store
              {prefs.maxStores === 1 ? "" : "s"}
            </p>
          )}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {plan.stores.map((sid) => (
              <StoreBadge key={sid} storeId={sid} />
            ))}
          </div>
        </div>

        <dl className="space-y-1.5 border-t border-teal-50 pt-4 text-sm">
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-slate-500">Products</dt>
            <dd className="font-medium text-slate-900">
              {gbp(plan.productTotalPence)}
            </dd>
          </div>
          {plan.kind !== "delivery" && (
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-slate-500">Travel est.</dt>
              <dd className="font-medium text-slate-900">
                {gbp(plan.travelPence)}{" "}
                <span className="text-xs font-normal text-slate-400">
                  ({minutes(plan.travelMinutes)})
                </span>
              </dd>
            </div>
          )}
          {plan.deliveryPence > 0 && (
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-slate-500">Delivery</dt>
              <dd className="font-medium text-slate-900">
                {gbp(plan.deliveryPence)}
              </dd>
            </div>
          )}
          {plan.kind === "delivery" && plan.deliveryPence === 0 && (
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-slate-500">Delivery</dt>
              <dd className="font-medium text-teal-700">Free</dd>
            </div>
          )}
          <div className="flex items-baseline justify-between gap-3 border-t border-teal-50 pt-1.5">
            <dt className="font-semibold text-slate-900">Final cost</dt>
            <dd className="font-display text-lg font-bold tracking-tight text-slate-900">
              {gbp(plan.finalPence)}
            </dd>
          </div>
        </dl>

        {plan.loyaltySavingPence > 0 && (
          <p className="inline-flex items-center gap-1.5 rounded-xl bg-teal-50 px-3 py-2 text-xs font-semibold text-teal-800">
            <BadgePercent className="h-3.5 w-3.5 shrink-0" aria-hidden />
            Loyalty savings {gbp(plan.loyaltySavingPence)} included
          </p>
        )}

        <p className="text-sm text-slate-600">
          {isBaseline ? (
            <>
              This <em>is</em> the cheapest single store — the baseline the
              other savings are measured against, so the saving here is{" "}
              <strong className="font-semibold text-slate-900">
                {gbp(0, { alwaysPounds: true })}
              </strong>
              .
            </>
          ) : (
            <>
              Real saving vs cheapest single store:{" "}
              <strong
                className={`font-semibold ${
                  saving > 0 ? "text-teal-700" : "text-slate-900"
                }`}
              >
                {gbp(saving, { alwaysPounds: true })}
              </strong>
            </>
          )}
        </p>

        <p className="text-xs leading-relaxed text-slate-400">
          With your time at {gbp(prefs.timeValuePerHourPence)}/hr, the real
          cost of this plan is {gbp(plan.realCostPence)}.
        </p>

        {unavailableNames.length > 0 && (
          <p className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-800">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            <span>
              Not available on this plan:{" "}
              <span className="font-semibold">
                {unavailableNames.join(", ")}
              </span>
            </span>
          </p>
        )}

        <div className="mt-auto pt-1">
          <button
            type="button"
            onClick={onSelect}
            aria-pressed={selected}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 ${
              selected
                ? "bg-teal-600 text-white hover:bg-teal-700"
                : "border border-teal-200 text-teal-800 hover:bg-teal-50"
            }`}
          >
            {selected ? "Shopping list shown below" : "View shopping list"}
            <ArrowDown className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
    </article>
  );
}
