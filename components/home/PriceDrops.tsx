import Link from "next/link";
import { Tag } from "lucide-react";
import { topDeals } from "@/lib/catalog";
import { getStore } from "@/lib/stores";
import { checkedLabel, gbp, packSize } from "@/lib/format";
import ProductTile from "@/components/ProductTile";
import SectionHeading from "@/components/SectionHeading";
import StoreBadge from "@/components/StoreBadge";
import { shortDate } from "./dates";

const DEALS = topDeals(8);

/** "Biggest price drops": genuine reductions against the previous shelf price. */
export default function PriceDrops() {
  return (
    <section className="border-y border-teal-100 bg-gradient-to-b from-white to-teal-50/40">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <SectionHeading
          eyebrow="Deals radar"
          title="Biggest price drops"
          description="Genuine reductions against the price each store was charging before — ranked by percentage off, with the promotion and its end date shown where one applies."
        />

        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {DEALS.map(({ product, offer, percent }) => {
            const nowPence = offer.loyaltyPricePence ?? offer.pricePence;
            const viaLoyalty = offer.loyaltyPricePence !== undefined;
            const scheme = getStore(offer.storeId).loyaltyScheme;
            return (
              <li key={`${product.id}-${offer.storeId}`} className="h-full">
                <article className="flex h-full flex-col rounded-2xl border border-teal-100 bg-white p-4 shadow-sm transition hover:border-teal-200 hover:shadow-md">
                  <div className="flex items-start justify-between gap-3">
                    <ProductTile product={product} size="md" />
                    <span className="inline-flex items-center rounded-full bg-amber-400 px-2.5 py-1 text-xs font-bold text-amber-950">
                      {percent}% off
                    </span>
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
                      {gbp(nowPence)}
                    </span>
                    {offer.wasPricePence !== undefined && (
                      <span className="text-sm text-slate-400 line-through">
                        was {gbp(offer.wasPricePence)}
                      </span>
                    )}
                  </div>
                  {viaLoyalty && (
                    <p className="mt-1">
                      <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                        with {scheme ?? "loyalty card"}
                      </span>
                    </p>
                  )}

                  {offer.promo && (
                    <p className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-medium text-amber-700">
                      <Tag className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      {offer.promo.label} · ends {shortDate(offer.promo.endsAt)}
                    </p>
                  )}

                  <div className="mt-auto flex items-center justify-between gap-2 pt-4">
                    <StoreBadge storeId={offer.storeId} />
                    <span className="text-[11px] text-slate-400">
                      {checkedLabel(offer.updatedAt)}
                    </span>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
