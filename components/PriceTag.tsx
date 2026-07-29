import { gbp } from "@/lib/format";

/**
 * Price display that keeps regular / loyalty / your-price honest:
 * shows the regular price, and the loyalty price separately labelled.
 */
export default function PriceTag({
  pricePence,
  loyaltyPricePence,
  loyaltyScheme,
  userHasCard,
  size = "md",
}: {
  pricePence: number;
  loyaltyPricePence?: number;
  loyaltyScheme?: string;
  userHasCard?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const hasLoyalty = loyaltyPricePence !== undefined && loyaltyScheme;
  const yourPence = hasLoyalty && userHasCard ? loyaltyPricePence : pricePence;
  const priceClass =
    size === "lg" ? "text-2xl" : size === "md" ? "text-lg" : "text-base";

  return (
    <div className="flex flex-col items-end gap-0.5">
      <span className={`font-display font-bold tracking-tight text-slate-900 ${priceClass}`}>
        {gbp(yourPence)}
      </span>
      {hasLoyalty && (
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
            userHasCard
              ? "bg-teal-600 text-white"
              : "bg-amber-100 text-amber-800"
          }`}
        >
          {userHasCard
            ? `${loyaltyScheme} price applied`
            : `${gbp(loyaltyPricePence)} with ${loyaltyScheme}`}
        </span>
      )}
      {hasLoyalty && userHasCard && (
        <span className="text-[11px] text-slate-400 line-through">
          {gbp(pricePence)} without card
        </span>
      )}
    </div>
  );
}
