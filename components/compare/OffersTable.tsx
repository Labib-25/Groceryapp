"use client";

import MatchBadge from "@/components/MatchBadge";
import PriceTag from "@/components/PriceTag";
import StoreBadge from "@/components/StoreBadge";
import { effectivePricePence } from "@/lib/catalog";
import {
  checkedLabel,
  gbp,
  packSize,
  percentOff,
  unitPriceLabel,
} from "@/lib/format";
import { getStore } from "@/lib/stores";
import type { Offer, Product, StoreId } from "@/lib/types";

function endsLabel(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

/**
 * Every store's offer for one product: sorted by effective price, unavailable
 * rows greyed at the bottom, cheapest available row highlighted in teal.
 */
export default function OffersTable({
  product,
  loyaltyCards,
}: {
  product: Product;
  loyaltyCards: StoreId[];
}) {
  const sorted = [...product.offers].sort((a, b) => {
    if (a.available !== b.available) return a.available ? -1 : 1;
    return (
      effectivePricePence(a, loyaltyCards).pence -
      effectivePricePence(b, loyaltyCards).pence
    );
  });
  const cheapest = sorted.find((o) => o.available);

  return (
    <div className="overflow-x-auto rounded-2xl border border-teal-100 bg-white shadow-sm">
      <table className="w-full min-w-[900px] border-separate border-spacing-0 text-sm">
        <thead>
          <tr className="text-left text-xs font-semibold uppercase tracking-widest text-teal-600">
            <th scope="col" className="px-4 py-3">
              Store
            </th>
            <th scope="col" className="px-4 py-3">
              Product
            </th>
            <th scope="col" className="px-4 py-3">
              Match
            </th>
            <th scope="col" className="px-4 py-3 text-right">
              Price
            </th>
            <th scope="col" className="px-4 py-3">
              Unit price
            </th>
            <th scope="col" className="px-4 py-3">
              Promo
            </th>
            <th scope="col" className="px-4 py-3">
              Checked
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((offer) => (
            <OfferRow
              key={offer.storeId}
              offer={offer}
              product={product}
              loyaltyCards={loyaltyCards}
              isCheapest={offer === cheapest}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OfferRow({
  offer,
  product,
  loyaltyCards,
  isCheapest,
}: {
  offer: Offer;
  product: Product;
  loyaltyCards: StoreId[];
  isCheapest: boolean;
}) {
  const store = getStore(offer.storeId);
  const effective = effectivePricePence(offer, loyaltyCards);
  const unitLabel = unitPriceLabel(offer, product.unitBasis, effective.pence);
  const cellBorder = "border-t border-slate-100";

  const rowClass = isCheapest
    ? "bg-teal-50/60 ring-2 ring-inset ring-teal-400"
    : offer.available
      ? ""
      : "bg-red-50/40 text-slate-400";

  return (
    <tr className={`align-top ${rowClass}`}>
      <td className={`px-4 py-3 ${cellBorder}`}>
        <div className="flex flex-col items-start gap-1.5">
          <StoreBadge storeId={offer.storeId} />
          {isCheapest && (
            <span className="inline-flex items-center rounded-full bg-teal-600 px-2 py-0.5 text-[11px] font-semibold text-white">
              Cheapest
            </span>
          )}
        </div>
      </td>
      <td className={`px-4 py-3 ${cellBorder}`}>
        <p
          className={`font-medium ${
            offer.available ? "text-slate-900" : "text-slate-400"
          }`}
        >
          {offer.productName}
        </p>
        <p className={offer.available ? "text-xs text-slate-500" : "text-xs"}>
          {offer.brand} · {packSize(offer.packSize, offer.unit)}
        </p>
      </td>
      <td className={`px-4 py-3 ${cellBorder}`}>
        <MatchBadge matchType={offer.matchType} />
      </td>
      <td className={`px-4 py-3 text-right ${cellBorder}`}>
        {offer.available ? (
          <PriceTag
            pricePence={offer.pricePence}
            loyaltyPricePence={offer.loyaltyPricePence}
            loyaltyScheme={store.loyaltyScheme}
            userHasCard={loyaltyCards.includes(offer.storeId)}
            size="sm"
          />
        ) : (
          <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700">
            Out of stock
          </span>
        )}
      </td>
      <td className={`px-4 py-3 ${cellBorder}`}>
        {unitLabel ? (
          <span className={offer.available ? "text-slate-600" : ""}>
            {unitLabel}
          </span>
        ) : (
          <span aria-hidden>—</span>
        )}
      </td>
      <td className={`px-4 py-3 ${cellBorder}`}>
        {offer.promo ? (
          <div>
            <p
              className={`font-medium ${
                offer.available ? "text-teal-700" : ""
              }`}
            >
              {offer.promo.label}
            </p>
            <p className="text-xs text-slate-400">
              ends {endsLabel(offer.promo.endsAt)}
            </p>
          </div>
        ) : offer.wasPricePence !== undefined &&
          offer.wasPricePence > effective.pence ? (
          <div>
            <p className={offer.available ? "text-slate-600" : ""}>
              Was{" "}
              <span className="line-through">{gbp(offer.wasPricePence)}</span>
            </p>
            <p
              className={`text-xs font-semibold ${
                offer.available ? "text-amber-700" : ""
              }`}
            >
              {percentOff(effective.pence, offer.wasPricePence)}% off
            </p>
          </div>
        ) : (
          <span aria-hidden>—</span>
        )}
      </td>
      <td
        className={`whitespace-nowrap px-4 py-3 text-xs ${
          offer.available ? "text-slate-400" : ""
        } ${cellBorder}`}
      >
        {checkedLabel(offer.updatedAt)}
      </td>
    </tr>
  );
}
