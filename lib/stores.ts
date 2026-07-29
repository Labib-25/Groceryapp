import type { Store, StoreId } from "./types";

/**
 * UK supermarket reference data.
 * Travel distances/times are demo estimates (v1 has no real geolocation) and
 * are clearly labelled as estimates in the UI.
 */
export const STORES: Record<StoreId, Store> = {
  tesco: {
    id: "tesco",
    name: "Tesco",
    shortName: "Tesco",
    color: "#00539f",
    loyaltyScheme: "Tesco Clubcard",
    deliveryFeePence: 450,
    minBasketPence: 4000,
    milesAway: 1.2,
    travelMinutes: 7,
  },
  sainsburys: {
    id: "sainsburys",
    name: "Sainsbury's",
    shortName: "Sainsbury's",
    color: "#f06c00",
    loyaltyScheme: "Nectar",
    deliveryFeePence: 400,
    minBasketPence: 4000,
    milesAway: 1.8,
    travelMinutes: 9,
  },
  asda: {
    id: "asda",
    name: "Asda",
    shortName: "Asda",
    color: "#68a51c",
    loyaltyScheme: "Asda Rewards",
    deliveryFeePence: 350,
    minBasketPence: 4000,
    milesAway: 2.6,
    travelMinutes: 12,
  },
  morrisons: {
    id: "morrisons",
    name: "Morrisons",
    shortName: "Morrisons",
    color: "#fdbd11",
    loyaltyScheme: "Morrisons More",
    deliveryFeePence: 400,
    minBasketPence: 2500,
    milesAway: 3.1,
    travelMinutes: 14,
  },
  aldi: {
    id: "aldi",
    name: "Aldi",
    shortName: "Aldi",
    color: "#00a2e0",
    // Aldi has no loyalty pricing scheme and no delivery in most areas.
    milesAway: 2.2,
    travelMinutes: 11,
  },
  lidl: {
    id: "lidl",
    name: "Lidl",
    shortName: "Lidl",
    color: "#0050aa",
    loyaltyScheme: "Lidl Plus",
    milesAway: 2.9,
    travelMinutes: 13,
  },
  waitrose: {
    id: "waitrose",
    name: "Waitrose",
    shortName: "Waitrose",
    color: "#5d7d2b",
    loyaltyScheme: "myWaitrose",
    deliveryFeePence: 300,
    minBasketPence: 6000,
    milesAway: 4.4,
    travelMinutes: 18,
  },
  iceland: {
    id: "iceland",
    name: "Iceland",
    shortName: "Iceland",
    color: "#d61a20",
    loyaltyScheme: "Iceland Bonus Card",
    deliveryFeePence: 0,
    minBasketPence: 4000,
    milesAway: 1.5,
    travelMinutes: 8,
  },
  coop: {
    id: "coop",
    name: "Co-op",
    shortName: "Co-op",
    color: "#00b1e7",
    loyaltyScheme: "Co-op Membership",
    milesAway: 0.6,
    travelMinutes: 4,
  },
};

export const STORE_IDS = Object.keys(STORES) as StoreId[];

export const ALL_STORES: Store[] = STORE_IDS.map((id) => STORES[id]);

export function getStore(id: StoreId): Store {
  return STORES[id];
}

/** Cost of driving per mile (fuel + wear), in pence. Demo assumption. */
export const PENCE_PER_MILE = 45;

/** Extra minutes spent per additional store visited (parking, queueing). */
export const PER_STORE_OVERHEAD_MINUTES = 12;

/** Round-trip travel cost in pence for one store. */
export function travelCostPence(store: Store): number {
  return Math.round(store.milesAway * 2 * PENCE_PER_MILE);
}

/** Round-trip travel time in minutes for one store, including overhead. */
export function travelTimeMinutes(store: Store): number {
  return store.travelMinutes * 2 + PER_STORE_OVERHEAD_MINUTES;
}
