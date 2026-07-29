"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Info, ListChecks, Sparkles } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import DeliveryOptions from "@/components/optimise/DeliveryOptions";
import OptimiserControls from "@/components/optimise/OptimiserControls";
import PlanCard from "@/components/optimise/PlanCard";
import PlanStoreLists from "@/components/optimise/PlanStoreLists";
import SendToStore from "@/components/optimise/SendToStore";
import SingleStoreTable from "@/components/optimise/SingleStoreTable";
import {
  PLAN_TITLES,
  samePlan,
  type PlanKey,
} from "@/components/optimise/plan-utils";
import { useAppState } from "@/lib/app-state";
import { catalogueUpdatedAt, getProducts } from "@/lib/catalog";
import { checkedLabel, gbp } from "@/lib/format";
import { optimiseBasket } from "@/lib/optimiser";
import { PENCE_PER_MILE } from "@/lib/stores";

function OptimiseSkeleton() {
  return (
    <div aria-hidden className="mt-6 space-y-6">
      <div className="h-16 animate-pulse rounded-2xl border border-teal-100 bg-teal-50/50" />
      <div className="grid gap-5 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-80 animate-pulse rounded-2xl border border-teal-100 bg-teal-50/50"
          />
        ))}
      </div>
    </div>
  );
}

function EmptyBasket() {
  return (
    <div className="mesh-teal mt-6 rounded-2xl border border-teal-100 p-8 text-center sm:p-12">
      <span
        aria-hidden
        className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-teal-100 bg-white text-teal-600 shadow-sm"
      >
        <Sparkles className="h-8 w-8" />
      </span>
      <h2 className="mt-4 font-display text-2xl font-bold tracking-tight text-slate-900">
        Nothing to optimise yet
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-600">
        The optimiser needs a shopping list to work its magic on. Build yours
        first — it only takes a minute.
      </p>
      <Link
        href="/list"
        className="glow-teal mt-6 inline-flex items-center gap-2 rounded-full bg-teal-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
      >
        <ListChecks className="h-4 w-4" aria-hidden />
        Build my list
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
    </div>
  );
}

export default function OptimisePage() {
  const { basket, prefs, hydrated } = useAppState();
  const [selectedKey, setSelectedKey] = useState<PlanKey>("cheapest");

  const result = useMemo(
    () => optimiseBasket(basket, getProducts(), prefs),
    [basket, prefs]
  );

  const selectPlan = (key: PlanKey) => {
    setSelectedKey(key);
    document
      .getElementById("shopping-lists")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <SectionHeading
          eyebrow="Smart Basket Optimiser"
          title="Crunching your basket…"
        />
        <OptimiseSkeleton />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <SectionHeading
          eyebrow="Smart Basket Optimiser"
          title="The cheapest practical way to do your shop"
          description="One list in, three honest plans out — with travel, delivery and loyalty prices all priced in."
        />
        <EmptyBasket />
      </div>
    );
  }

  const practicalSameAs = samePlan(result.practical, result.cheapest)
    ? "Same as Cheapest"
    : undefined;
  const convenientSameAs = samePlan(result.convenient, result.cheapest)
    ? "Same as Cheapest"
    : samePlan(result.convenient, result.practical)
      ? "Same as Practical"
      : undefined;

  const selectedPlan = result[selectedKey];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <SectionHeading
        eyebrow="Smart Basket Optimiser"
        title="The cheapest practical way to do your shop"
        description="Three honest plans for your whole list — products, travel, delivery and loyalty prices all counted, so an extra stop only happens when it genuinely pays for itself."
      />

      <OptimiserControls />

      <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        <PlanCard
          planKey="cheapest"
          plan={result.cheapest}
          result={result}
          prefs={prefs}
          selected={selectedKey === "cheapest"}
          onSelect={() => selectPlan("cheapest")}
        />
        <PlanCard
          planKey="practical"
          plan={result.practical}
          result={result}
          prefs={prefs}
          sameAs={practicalSameAs}
          selected={selectedKey === "practical"}
          onSelect={() => selectPlan("practical")}
        />
        <PlanCard
          planKey="convenient"
          plan={result.convenient}
          result={result}
          prefs={prefs}
          sameAs={convenientSameAs}
          selected={selectedKey === "convenient"}
          onSelect={() => selectPlan("convenient")}
        />
      </div>

      <section id="shopping-lists" className="mt-12 scroll-mt-24">
        <SectionHeading
          eyebrow="Your route"
          title="Shopping list, store by store"
          description="Exactly what to pick up where for the plan you choose — loyalty prices flagged, nothing blended."
        />
        <div
          role="group"
          aria-label="Choose a plan to view"
          className="mb-4 inline-flex overflow-hidden rounded-full border border-teal-200"
        >
          {(Object.keys(PLAN_TITLES) as PlanKey[]).map((key) => (
            <button
              key={key}
              type="button"
              aria-pressed={selectedKey === key}
              onClick={() => setSelectedKey(key)}
              className={`px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-teal-600 ${
                selectedKey === key
                  ? "bg-teal-600 text-white"
                  : "bg-white text-teal-800 hover:bg-teal-50"
              }`}
            >
              {PLAN_TITLES[key]}
            </button>
          ))}
        </div>
        <PlanStoreLists plan={selectedPlan} />
      </section>

      <section className="mt-12">
        <SectionHeading
          eyebrow="Nearly there"
          title="Check out with the stores"
          description="Send each store's part of your list to its online shop — add the items to your real basket there, book a delivery or collection slot, and pay."
        />
        <SendToStore plan={selectedPlan} />
      </section>

      <section className="mt-12">
        <SectionHeading
          eyebrow="Show your working"
          title="All single-store options"
          description="What the whole list costs at each supermarket once the round trip is priced in — so you can see exactly why we recommend what we do."
        />
        <SingleStoreTable result={result} />
      </section>

      <section className="mt-12">
        <SectionHeading
          eyebrow="Stay in"
          title="Delivery options"
          description="Stores that deliver and whose minimum online spend your basket meets."
        />
        <DeliveryOptions result={result} />
      </section>

      <p className="mt-10 flex items-start gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed text-slate-500">
        <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <span>
          A note on honesty: travel costs and times are estimates based on
          typical local distances and {gbp(PENCE_PER_MILE)} a mile — your
          route will differ. Prices are as last checked per item (
          {checkedLabel(catalogueUpdatedAt())}) and may have changed in store.
        </span>
      </p>
    </div>
  );
}
