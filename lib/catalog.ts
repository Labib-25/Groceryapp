import { PRODUCTS } from "./data/products";
import type { Category, DietTag, Offer, Product, StoreId } from "./types";
import { unitPricePence } from "./format";

export function getProducts(): Product[] {
  return PRODUCTS;
}

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export const CATEGORIES: Category[] = [
  "Fruit & Veg",
  "Meat & Fish",
  "Dairy & Eggs",
  "Bakery",
  "Food Cupboard",
  "Frozen",
  "Drinks",
  "Snacks",
  "Household",
  "Toiletries",
  "Baby",
  "Pet",
];

export interface SearchOptions {
  query?: string;
  category?: Category;
  dietTags?: DietTag[];
}

export function searchProducts(opts: SearchOptions): Product[] {
  const q = opts.query?.trim().toLowerCase();
  return PRODUCTS.filter((p) => {
    if (opts.category && p.category !== opts.category) return false;
    if (opts.dietTags?.length && !opts.dietTags.every((t) => p.tags.includes(t)))
      return false;
    if (q) {
      const hay = [
        p.name,
        p.category,
        ...p.offers.map((o) => `${o.brand} ${o.productName}`),
      ]
        .join(" ")
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

/** Effective price of an offer given the loyalty cards held. */
export function effectivePricePence(
  offer: Offer,
  loyaltyCards: StoreId[]
): { pence: number; usedLoyalty: boolean } {
  if (
    offer.loyaltyPricePence !== undefined &&
    loyaltyCards.includes(offer.storeId)
  ) {
    return { pence: offer.loyaltyPricePence, usedLoyalty: true };
  }
  return { pence: offer.pricePence, usedLoyalty: false };
}

/** Available offers for a product, cheapest effective price first. */
export function offersByPrice(
  product: Product,
  loyaltyCards: StoreId[] = []
): Offer[] {
  return product.offers
    .filter((o) => o.available)
    .slice()
    .sort(
      (a, b) =>
        effectivePricePence(a, loyaltyCards).pence -
        effectivePricePence(b, loyaltyCards).pence
    );
}

/** The winning (cheapest available) offer for a product. */
export function cheapestOffer(
  product: Product,
  loyaltyCards: StoreId[] = []
): Offer | undefined {
  return offersByPrice(product, loyaltyCards)[0];
}

/** Cheapest by unit price rather than pack price (guards multipack traps). */
export function cheapestByUnitPrice(
  product: Product,
  loyaltyCards: StoreId[] = []
): Offer | undefined {
  const priced = product.offers
    .filter((o) => o.available)
    .map((o) => ({
      offer: o,
      up: unitPricePence(
        o,
        product.unitBasis,
        effectivePricePence(o, loyaltyCards).pence
      ),
    }))
    .filter((x): x is { offer: Offer; up: number } => x.up !== null)
    .sort((a, b) => a.up - b.up);
  return priced[0]?.offer;
}

export interface WeeklyWin {
  product: Product;
  offer: Offer;
  /** Pence saved vs the next-cheapest store. */
  savingVsNextPence: number;
  runnerUp?: Offer;
}

/**
 * "This week's winners" feed: products with the biggest gap between the
 * cheapest store and the next cheapest — the headline switch-and-save picks.
 */
export function weeklyWins(limit = 8, loyaltyCards: StoreId[] = []): WeeklyWin[] {
  const wins: WeeklyWin[] = [];
  for (const p of PRODUCTS) {
    const offers = offersByPrice(p, loyaltyCards);
    if (offers.length < 2) continue;
    const [best, next] = offers;
    const bestPence = effectivePricePence(best, loyaltyCards).pence;
    const nextPence = effectivePricePence(next, loyaltyCards).pence;
    wins.push({
      product: p,
      offer: best,
      savingVsNextPence: nextPence - bestPence,
      runnerUp: next,
    });
  }
  return wins
    .sort((a, b) => b.savingVsNextPence - a.savingVsNextPence)
    .slice(0, limit);
}

export interface Deal {
  product: Product;
  offer: Offer;
  savePence: number;
  percent: number;
}

/** Biggest genuine price drops (offers with a wasPrice or promo). */
export function topDeals(limit = 8): Deal[] {
  const deals: Deal[] = [];
  for (const p of PRODUCTS) {
    for (const o of p.offers) {
      if (!o.available || !o.wasPricePence) continue;
      const price = o.loyaltyPricePence ?? o.pricePence;
      const save = o.wasPricePence - price;
      if (save <= 0) continue;
      deals.push({
        product: p,
        offer: o,
        savePence: save,
        percent: Math.round((save / o.wasPricePence) * 100),
      });
    }
  }
  return deals.sort((a, b) => b.percent - a.percent).slice(0, limit);
}

/** Count of stores stocking each product — for "compared across N stores". */
export function storeCount(product: Product): number {
  return new Set(product.offers.filter((o) => o.available).map((o) => o.storeId))
    .size;
}

/** Most recent updatedAt across the whole catalogue, for "last updated" UI. */
export function catalogueUpdatedAt(): string {
  let latest = "";
  for (const p of PRODUCTS)
    for (const o of p.offers) if (o.updatedAt > latest) latest = o.updatedAt;
  return latest;
}
