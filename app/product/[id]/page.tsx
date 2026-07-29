"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Scale, SearchX, Store } from "lucide-react";
import AddToListButton from "@/components/AddToListButton";
import ProductTile from "@/components/ProductTile";
import SectionHeading from "@/components/SectionHeading";
import OffersTable from "@/components/compare/OffersTable";
import PriceHistoryChart from "@/components/compare/PriceHistoryChart";
import { useAppState } from "@/lib/app-state";
import {
  cheapestByUnitPrice,
  cheapestOffer,
  effectivePricePence,
  getProduct,
  getProducts,
  storeCount,
} from "@/lib/catalog";
import { gbp, packSize, unitPriceLabel } from "@/lib/format";
import { getStore } from "@/lib/stores";
import type { DietTag, Product, StoreId } from "@/lib/types";

function tagLabel(tag: DietTag): string {
  return tag.charAt(0).toUpperCase() + tag.slice(1);
}

export default function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const product = getProduct(id);

  if (!product) {
    return <ProductNotFound />;
  }
  return <ProductDetail product={product} />;
}

function ProductNotFound() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mx-auto flex max-w-lg flex-col items-center rounded-2xl border border-teal-100 bg-white px-6 py-16 text-center shadow-sm">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50 via-white to-cyan-50">
          <SearchX className="h-7 w-7 text-teal-600" aria-hidden />
        </span>
        <h1 className="mt-5 font-display text-2xl font-bold tracking-tight text-slate-900">
          We can&rsquo;t find that product
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          It may have been removed from the catalogue, or the link might be out
          of date. The full range is still there to browse.
        </p>
        <Link
          href="/compare"
          className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to Compare
        </Link>
      </div>
    </div>
  );
}

function ProductDetail({ product }: { product: Product }) {
  const { prefs } = useAppState();
  const cards = prefs.loyaltyCards;

  const stores = storeCount(product);
  const packBest = cheapestOffer(product, cards);
  const unitBest = cheapestByUnitPrice(product, cards);

  const packEff = packBest ? effectivePricePence(packBest, cards) : undefined;
  const unitEff = unitBest ? effectivePricePence(unitBest, cards) : undefined;

  const showUnitTrap =
    packBest !== undefined &&
    unitBest !== undefined &&
    packEff !== undefined &&
    unitEff !== undefined &&
    packBest.storeId !== unitBest.storeId;

  const siblings = getProducts()
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Link
        href="/compare"
        className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-sm font-semibold text-teal-700 transition-colors hover:text-teal-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to Compare
      </Link>

      {/* Header */}
      <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-start">
        <ProductTile product={product} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-600">
            {product.category}
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {product.name}
          </h1>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
            <Store className="h-4 w-4 text-teal-600" aria-hidden />
            Compared across {stores} {stores === 1 ? "store" : "stores"}
          </p>
          {product.tags.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Diet tags">
              {product.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full border border-teal-200 bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-800"
                >
                  {tagLabel(tag)}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4">
            <AddToListButton productId={product.id} />
          </div>
        </div>
      </div>

      {/* Multipack trap callout */}
      {showUnitTrap && (
        <div className="mt-8 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <Scale className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden />
          <div className="text-sm leading-relaxed text-amber-900">
            <p className="font-semibold">Watch the multipack maths</p>
            <p className="mt-1">
              {getStore(packBest.storeId).name} has the lowest pack price —{" "}
              {gbp(packEff.pence)} for{" "}
              {packSize(packBest.packSize, packBest.unit)}
              {unitPriceLabel(packBest, product.unitBasis, packEff.pence)
                ? ` (${unitPriceLabel(
                    packBest,
                    product.unitBasis,
                    packEff.pence
                  )})`
                : ""}
              . But per unit, {getStore(unitBest.storeId).name} is the better
              buy:{" "}
              {unitPriceLabel(unitBest, product.unitBasis, unitEff.pence) ??
                gbp(unitEff.pence)}{" "}
              for {packSize(unitBest.packSize, unitBest.unit)} at{" "}
              {gbp(unitEff.pence)}. A bigger pack isn&rsquo;t always better
              value.
            </p>
          </div>
        </div>
      )}

      {/* Offers table */}
      <section className="mt-10">
        <SectionHeading
          eyebrow="Price comparison"
          title="Every store, side by side"
          description="Sorted by the price you'd actually pay, loyalty prices labelled — never blended in silently."
        />
        <OffersTable product={product} loyaltyCards={cards} />
      </section>

      {/* Price history */}
      {product.priceHistory && product.priceHistory.length >= 2 && (
        <section className="mt-10">
          <SectionHeading
            eyebrow="Price history"
            title="Cheapest-store price by month"
            description="The typical cheapest price each month across the stores we track — demo data."
          />
          <PriceHistoryChart
            history={product.priceHistory}
            productName={product.name}
          />
        </section>
      )}

      {/* Siblings */}
      {siblings.length > 0 && (
        <section className="mt-10">
          <SectionHeading
            eyebrow="Keep browsing"
            title={`Also in ${product.category}`}
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {siblings.map((sibling) => (
              <SiblingCard
                key={sibling.id}
                product={sibling}
                loyaltyCards={cards}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function SiblingCard({
  product,
  loyaltyCards,
}: {
  product: Product;
  loyaltyCards: StoreId[];
}) {
  const best = cheapestOffer(product, loyaltyCards);
  const eff = best ? effectivePricePence(best, loyaltyCards) : undefined;

  return (
    <Link
      href={`/product/${product.id}`}
      className="group flex items-center gap-3 rounded-2xl border border-teal-100 bg-white p-4 shadow-sm transition hover:border-teal-200 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
    >
      <ProductTile product={product} size="sm" />
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold text-slate-900 transition-colors group-hover:text-teal-700">
          {product.name}
        </span>
        {best && eff ? (
          <span className="block text-xs text-slate-500">
            from {gbp(eff.pence)} at {getStore(best.storeId).shortName}
            {eff.usedLoyalty ? " (loyalty price)" : ""}
          </span>
        ) : (
          <span className="block text-xs text-slate-400">
            Currently out of stock
          </span>
        )}
      </span>
    </Link>
  );
}
