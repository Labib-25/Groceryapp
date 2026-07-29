"use client";

import Link from "next/link";
import { Scale } from "lucide-react";
import AddToListButton from "@/components/AddToListButton";
import ProductTile from "@/components/ProductTile";
import StoreBadge from "@/components/StoreBadge";
import {
  cheapestByUnitPrice,
  cheapestOffer,
  effectivePricePence,
  storeCount,
} from "@/lib/catalog";
import { checkedLabel, gbp, unitPriceLabel } from "@/lib/format";
import { getStore } from "@/lib/stores";
import type { Product, StoreId } from "@/lib/types";

/**
 * One result card in the /compare grid. The whole card links to the product
 * page via a stretched link; the add-to-list control floats above it.
 */
export default function ProductCard({
  product,
  loyaltyCards,
}: {
  product: Product;
  loyaltyCards: StoreId[];
}) {
  const best = cheapestOffer(product, loyaltyCards);
  const bestByUnit = cheapestByUnitPrice(product, loyaltyCards);
  const stores = storeCount(product);

  const effective = best ? effectivePricePence(best, loyaltyCards) : undefined;
  const winnerStore = best ? getStore(best.storeId) : undefined;
  const unitLabel =
    best && effective
      ? unitPriceLabel(best, product.unitBasis, effective.pence)
      : null;
  const unitTrap =
    best && bestByUnit && bestByUnit.storeId !== best.storeId
      ? getStore(bestByUnit.storeId)
      : undefined;

  return (
    <article className="group relative flex flex-col rounded-2xl border border-teal-100 bg-white p-4 shadow-sm transition hover:border-teal-200 hover:shadow-md">
      <div className="flex items-start gap-3">
        <ProductTile product={product} size="md" />
        <div className="min-w-0 flex-1">
          <Link
            href={`/product/${product.id}`}
            className="font-display font-bold tracking-tight text-slate-900 outline-none transition-colors group-hover:text-teal-700 after:absolute after:inset-0 after:rounded-2xl focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-teal-600"
          >
            {product.name}
          </Link>
          <p className="mt-0.5 text-xs text-slate-500">
            {product.category} · Compared across {stores}{" "}
            {stores === 1 ? "store" : "stores"}
          </p>
        </div>
      </div>

      {best && effective && winnerStore ? (
        <>
          <div className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="font-display text-2xl font-bold tracking-tight text-slate-900">
              {gbp(effective.pence)}
            </span>
            {effective.usedLoyalty && winnerStore.loyaltyScheme && (
              <span className="inline-flex items-center rounded-full bg-teal-600 px-2 py-0.5 text-[11px] font-semibold text-white">
                {winnerStore.loyaltyScheme} price
              </span>
            )}
            {unitLabel && (
              <span className="text-xs text-slate-500">{unitLabel}</span>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between gap-2">
            <StoreBadge storeId={best.storeId} />
            <span className="relative z-10">
              <AddToListButton productId={product.id} compact />
            </span>
          </div>

          {unitTrap && (
            <p className="mt-3 flex items-start gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1.5 text-[11px] font-medium text-amber-800">
              <Scale className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              Best unit price at {unitTrap.name}
            </p>
          )}

          <p className="mt-3 text-[11px] text-slate-400">
            {checkedLabel(best.updatedAt)}
          </p>
        </>
      ) : (
        <p className="mt-3 rounded-lg bg-slate-50 px-2.5 py-2 text-xs text-slate-500">
          Out of stock at every store we track right now.
        </p>
      )}
    </article>
  );
}
