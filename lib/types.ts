// Core domain types for BasketWise.
// All monetary values are integer pence to avoid floating-point drift.

export type StoreId =
  | "tesco"
  | "sainsburys"
  | "asda"
  | "morrisons"
  | "aldi"
  | "lidl"
  | "waitrose"
  | "iceland"
  | "coop";

export type Unit = "g" | "ml" | "each" | "wash";

export type Category =
  | "Fruit & Veg"
  | "Meat & Fish"
  | "Dairy & Eggs"
  | "Bakery"
  | "Food Cupboard"
  | "Frozen"
  | "Drinks"
  | "Snacks"
  | "Household"
  | "Toiletries"
  | "Baby"
  | "Pet";

export type MatchType =
  | "exact" // identical branded product
  | "own-brand" // direct own-brand equivalent
  | "budget" // cheaper alternative
  | "premium" // higher-quality alternative
  | "similar"; // similar but not directly comparable

export type DietTag =
  | "vegan"
  | "vegetarian"
  | "gluten-free"
  | "dairy-free"
  | "organic"
  | "high-protein"
  | "low-sugar"
  | "halal"
  | "kosher";

export interface Promo {
  label: string; // e.g. "Clubcard Price", "2 for £3.50", "Save £1"
  endsAt: string; // ISO date the promotion expires
}

/** A store-specific listing of a canonical product. */
export interface Offer {
  storeId: StoreId;
  productName: string; // the store's own product name
  brand: string;
  packSize: number; // amount in `unit` terms (e.g. 650 for 650g)
  unit: Unit;
  pricePence: number; // regular shelf price
  loyaltyPricePence?: number; // price with the store's loyalty scheme
  wasPricePence?: number; // previous price, when recently changed
  promo?: Promo;
  available: boolean;
  matchType: MatchType;
  updatedAt: string; // ISO timestamp the price was last checked
}

export interface PriceHistoryPoint {
  month: string; // e.g. "2025-08"
  pricePence: number; // typical price that month (cheapest store)
}

export interface Product {
  id: string;
  name: string; // canonical shopping-list name, e.g. "Chicken breast fillets"
  category: Category;
  emoji: string; // used for product art tiles
  tags: DietTag[];
  /** Which unit basis to show comparisons in, e.g. "per 100g" */
  unitBasis: "per 100g" | "per litre" | "per item" | "per wash";
  offers: Offer[];
  priceHistory?: PriceHistoryPoint[];
}

export interface Store {
  id: StoreId;
  name: string;
  shortName: string;
  color: string; // brand accent used for badges
  loyaltyScheme?: string; // e.g. "Tesco Clubcard"
  deliveryFeePence?: number; // typical delivery charge
  minBasketPence?: number; // minimum online basket
  /**
   * URL of the store's online-shop search with a `{query}` placeholder.
   * Used to hand the basket off to the retailer's own site for checkout
   * and delivery booking. Absent = no online shop (in-store only).
   */
  searchUrlPattern?: string;
  /** Demo travel model (no real geolocation in v1). */
  milesAway: number;
  travelMinutes: number; // one-way drive estimate
}

export interface BasketItem {
  productId: string;
  qty: number;
}

export interface UserPrefs {
  loyaltyCards: StoreId[]; // stores whose loyalty scheme the user holds
  timeValuePerHourPence: number; // what an hour is worth to the user
  maxStores: number; // cap for the "practical" plan
  postcode?: string;
  dietTags: DietTag[];
}

// ---------------- Optimiser output ----------------

export interface ItemAllocation {
  productId: string;
  qty: number;
  storeId: StoreId;
  offer: Offer;
  /** Total pence for qty at this store, loyalty applied when held. */
  linePricePence: number;
  usedLoyalty: boolean;
}

export type PlanKind = "single" | "split" | "delivery";

export interface BasketPlan {
  kind: PlanKind;
  label: string;
  stores: StoreId[];
  allocations: ItemAllocation[];
  /** Product IDs that could not be fulfilled by this plan. */
  unavailable: string[];
  productTotalPence: number;
  travelPence: number;
  travelMinutes: number;
  deliveryPence: number;
  /** productTotal + travel + delivery — the true cost of money spent. */
  finalPence: number;
  /** finalPence + the value of time spent, used for ranking convenience. */
  realCostPence: number;
  loyaltySavingPence: number;
}

export interface OptimiserResult {
  /** Lowest final cost (products + travel), any number of stores — consolidated so extra stops must pay for themselves. */
  cheapest: BasketPlan;
  /** Best value within the user's store cap (default 2), ranked by real cost including time. */
  practical: BasketPlan;
  /** Best single-store or delivery option, ranked by real cost including time. */
  convenient: BasketPlan;
  /** Every single-store plan, sorted cheapest first, for the comparison table. */
  singleStorePlans: BasketPlan[];
  /** Delivery plans for stores that deliver and meet the minimum basket. */
  deliveryPlans: BasketPlan[];
}
