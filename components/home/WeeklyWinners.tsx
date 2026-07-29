"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { effectivePricePence, weeklyWins } from "@/lib/catalog";
import { getStore } from "@/lib/stores";
import { checkedLabel, gbp, packSize } from "@/lib/format";
import { useAppState } from "@/lib/app-state";
import AddToListButton from "@/components/AddToListButton";
import ProductTile from "@/components/ProductTile";
import SectionHeading from "@/components/SectionHeading";
import StoreBadge from "@/components/StoreBadge";

/**
 * "This week's winners": the products with the biggest gap between the
 * cheapest store and the runner-up — e.g. cola is cheapest at Tesco this week.
 */
export default function WeeklyWinners() {
  const { prefs, hydrated } = useAppState();
  const wins = useMemo(
    () => weeklyWins(8, prefs.loyaltyCards),
    [prefs.loyaltyCards]
  );

  const description = `The biggest single-item price gaps right now — the “cola is cheapest at Tesco this week” intel. Each winner shows which store to buy it from and what you'd save over the runner-up.${
    hydrated && prefs.loyaltyCards.length > 0
      ? " Prices reflect the loyalty cards you hold."
      : ""
  }`;

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <SectionHeading
        eyebrow="This week's winners"
        title="Where your staples are cheapest this week"
        description={description}
        action={
          <Link
            href="/compare"
            className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 px-4 py-2 text-sm font-semibold text-teal-800 transition-colors hover:bg-teal-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
          >
            Browse all products
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        }
      />

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {wins.map((win) => {
          const { product, offer, runnerUp, savingVsNextPence } = win;
          const eff = effectivePricePence(offer, prefs.loyaltyCards);
          const scheme = getStore(offer.storeId).loyaltyScheme;
          return (
            <li key={product.id} className="h-full">
              <article className="flex h-full flex-col rounded-2xl border border-teal-100 bg-white p-4 shadow-sm transition hover:border-teal-200 hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <ProductTile product={product} size="md" />
                  <StoreBadge storeId={offer.storeId} />
                </div>

                <h3 className="mt-3 font-semibold leading-snug text-slate-900">
                  <Link
                    href={`/product/${product.id}`}
                    className="transition-colors hover:text-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
                  >
                    {product.name}
                  </Link>
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  {offer.brand} · {packSize(offer.packSize, offer.unit)}
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="font-display text-xl font-bold tracking-tight text-slate-900">
                    {gbp(eff.pence)}
                  </span>
                  {eff.usedLoyalty && (
                    <>
                      <span className="inline-flex items-center rounded-full bg-teal-600 px-2 py-0.5 text-[11px] font-semibold text-white">
                        {scheme ?? "Loyalty"} price
                      </span>
                      <span className="text-xs text-slate-400 line-through">
                        {gbp(offer.pricePence)}
                      </span>
                    </>
                  )}
                </div>

                {runnerUp &&
                  (savingVsNextPence > 0 ? (
                    <p className="mt-1.5 text-sm font-semibold text-teal-700">
                      Save {gbp(savingVsNextPence)} vs{" "}
                      {getStore(runnerUp.storeId).name}
                    </p>
                  ) : (
                    <p className="mt-1.5 text-sm font-medium text-slate-500">
                      Price-matched by {getStore(runnerUp.storeId).name}
                    </p>
                  ))}
                <p className="mt-1 text-[11px] text-slate-400">
                  {checkedLabel(offer.updatedAt)}
                </p>

                <div className="mt-auto flex items-center justify-between gap-2 pt-4">
                  <AddToListButton productId={product.id} compact />
                  <Link
                    href={`/product/${product.id}`}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-teal-700 transition-colors hover:text-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
                    aria-label={`View ${product.name} price details`}
                  >
                    Details
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
