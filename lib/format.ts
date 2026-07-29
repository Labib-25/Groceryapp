import type { Offer, Unit } from "./types";

/** Format integer pence as GBP, e.g. 4520 -> "£45.20", 89 -> "89p". */
export function gbp(pence: number, opts?: { alwaysPounds?: boolean }): string {
  const negative = pence < 0;
  const abs = Math.abs(Math.round(pence));
  if (abs < 100 && !opts?.alwaysPounds) {
    return `${negative ? "-" : ""}${abs}p`;
  }
  return `${negative ? "-" : ""}£${(abs / 100).toFixed(2)}`;
}

/** Format pack size, e.g. (650, "g") -> "650g", (1000, "ml") -> "1L". */
export function packSize(size: number, unit: Unit): string {
  if (unit === "g") {
    return size >= 1000 ? `${trimZeros(size / 1000)}kg` : `${size}g`;
  }
  if (unit === "ml") {
    return size >= 1000 ? `${trimZeros(size / 1000)}L` : `${size}ml`;
  }
  if (unit === "wash") return `${size} washes`;
  return size === 1 ? "1 item" : `${size} pack`;
}

function trimZeros(n: number): string {
  return n.toFixed(2).replace(/\.?0+$/, "");
}

/**
 * Unit price in pence for an offer on the given basis.
 * "per 100g" and "per litre" convert from g/ml; "per item"/"per wash" divide by pack.
 */
export function unitPricePence(
  offer: Offer,
  basis: "per 100g" | "per litre" | "per item" | "per wash",
  effectivePence?: number
): number | null {
  const price = effectivePence ?? offer.pricePence;
  if (offer.packSize <= 0) return null;
  switch (basis) {
    case "per 100g":
      if (offer.unit !== "g") return null;
      return (price / offer.packSize) * 100;
    case "per litre":
      if (offer.unit !== "ml") return null;
      return (price / offer.packSize) * 1000;
    case "per item":
      if (offer.unit !== "each") return null;
      return price / offer.packSize;
    case "per wash":
      if (offer.unit !== "wash") return null;
      return price / offer.packSize;
  }
}

/** Human unit price, e.g. "62p per 100g". */
export function unitPriceLabel(
  offer: Offer,
  basis: "per 100g" | "per litre" | "per item" | "per wash",
  effectivePence?: number
): string | null {
  const up = unitPricePence(offer, basis, effectivePence);
  if (up === null) return null;
  return `${gbp(up)} ${basis}`;
}

/** "35 min" / "1 hr 10 min" */
export function minutes(mins: number): string {
  const m = Math.round(mins);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rest = m % 60;
  return rest === 0 ? `${h} hr` : `${h} hr ${rest} min`;
}

/** Relative "checked" label from an ISO timestamp against a fixed demo now. */
export function checkedLabel(iso: string): string {
  const date = new Date(iso);
  return `Checked ${date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  })}`;
}

/** Percentage saved, e.g. (450, 550) -> 18 */
export function percentOff(pricePence: number, wasPence: number): number {
  if (wasPence <= 0) return 0;
  return Math.round(((wasPence - pricePence) / wasPence) * 100);
}
