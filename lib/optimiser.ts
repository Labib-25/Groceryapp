import { effectivePricePence } from "./catalog";
import { getStore, STORE_IDS, travelCostPence, travelTimeMinutes } from "./stores";
import type {
  BasketItem,
  BasketPlan,
  ItemAllocation,
  OptimiserResult,
  Product,
  StoreId,
  UserPrefs,
} from "./types";

/**
 * The Smart Basket Optimiser.
 *
 * Given a shopping list, it computes:
 *  - every single-store plan (with travel cost and unavailable items),
 *  - delivery plans where the store delivers and the basket meets the minimum,
 *  - a consolidated multi-store split where every extra stop must pay for
 *    itself (so it never sends you to four shops to save £3),
 * and picks three headline recommendations: Cheapest, Practical, Convenient.
 */

interface ResolvedItem {
  product: Product;
  qty: number;
}

function resolveItems(
  items: BasketItem[],
  products: Product[]
): ResolvedItem[] {
  const byId = new Map(products.map((p) => [p.id, p]));
  const out: ResolvedItem[] = [];
  for (const it of items) {
    const p = byId.get(it.productId);
    if (p && it.qty > 0) out.push({ product: p, qty: it.qty });
  }
  return out;
}

/** Best allocation of one item at one store, or null if unavailable there. */
function allocationAt(
  item: ResolvedItem,
  storeId: StoreId,
  loyaltyCards: StoreId[]
): ItemAllocation | null {
  const candidates = item.product.offers.filter(
    (o) => o.storeId === storeId && o.available
  );
  if (candidates.length === 0) return null;
  let best: ItemAllocation | null = null;
  for (const offer of candidates) {
    const { pence, usedLoyalty } = effectivePricePence(offer, loyaltyCards);
    const line = pence * item.qty;
    if (!best || line < best.linePricePence) {
      best = {
        productId: item.product.id,
        qty: item.qty,
        storeId,
        offer,
        linePricePence: line,
        usedLoyalty,
      };
    }
  }
  return best;
}

function loyaltySaving(allocations: ItemAllocation[]): number {
  return allocations.reduce(
    (sum, a) =>
      sum +
      (a.usedLoyalty
        ? (a.offer.pricePence - (a.offer.loyaltyPricePence ?? a.offer.pricePence)) *
          a.qty
        : 0),
    0
  );
}

function buildPlan(
  kind: BasketPlan["kind"],
  label: string,
  storeIds: StoreId[],
  allocations: ItemAllocation[],
  unavailable: string[],
  prefs: UserPrefs,
  opts?: { deliveryPence?: number }
): BasketPlan {
  const productTotal = allocations.reduce((s, a) => s + a.linePricePence, 0);
  const isDelivery = kind === "delivery";
  const travelP = isDelivery
    ? 0
    : storeIds.reduce((s, id) => s + travelCostPence(getStore(id)), 0);
  const travelM = isDelivery
    ? 0
    : storeIds.reduce((s, id) => s + travelTimeMinutes(getStore(id)), 0);
  const deliveryP = opts?.deliveryPence ?? 0;
  const finalP = productTotal + travelP + deliveryP;
  const timeCost = Math.round((travelM / 60) * prefs.timeValuePerHourPence);
  return {
    kind,
    label,
    stores: storeIds,
    allocations,
    unavailable,
    productTotalPence: productTotal,
    travelPence: travelP,
    travelMinutes: travelM,
    deliveryPence: deliveryP,
    finalPence: finalP,
    realCostPence: finalP + timeCost,
    loyaltySavingPence: loyaltySaving(allocations),
  };
}

/** Plan for doing the whole shop at one store. */
function singleStorePlan(
  storeId: StoreId,
  items: ResolvedItem[],
  prefs: UserPrefs
): BasketPlan {
  const allocations: ItemAllocation[] = [];
  const unavailable: string[] = [];
  for (const item of items) {
    const a = allocationAt(item, storeId, prefs.loyaltyCards);
    if (a) allocations.push(a);
    else unavailable.push(item.product.id);
  }
  return buildPlan(
    "single",
    `Everything from ${getStore(storeId).name}`,
    [storeId],
    allocations,
    unavailable,
    prefs
  );
}

function deliveryPlan(
  storeId: StoreId,
  items: ResolvedItem[],
  prefs: UserPrefs
): BasketPlan | null {
  const store = getStore(storeId);
  if (store.deliveryFeePence === undefined) return null;
  const base = singleStorePlan(storeId, items, prefs);
  if (
    store.minBasketPence !== undefined &&
    base.productTotalPence < store.minBasketPence
  ) {
    return null; // basket below the store's minimum online spend
  }
  return buildPlan(
    "delivery",
    `${store.name} delivery`,
    [storeId],
    base.allocations,
    base.unavailable,
    prefs,
    { deliveryPence: store.deliveryFeePence }
  );
}

/**
 * Consolidated split: start from each item's cheapest store, then repeatedly
 * drop the store whose removal costs less than its round-trip travel cost,
 * moving its items to the next-best remaining store. Optimises final cost
 * (products + travel), so every extra stop must pay for itself.
 */
function consolidatedSplitPlan(
  items: ResolvedItem[],
  prefs: UserPrefs,
  maxStores?: number
): BasketPlan {
  // Per item, the allocation at every store that stocks it.
  const perItem = items.map((item) => {
    const options: ItemAllocation[] = [];
    for (const sid of STORE_IDS) {
      const a = allocationAt(item, sid, prefs.loyaltyCards);
      if (a) options.push(a);
    }
    options.sort((a, b) => a.linePricePence - b.linePricePence);
    return { item, options };
  });

  const fulfillable = perItem.filter((x) => x.options.length > 0);
  const unavailable = perItem
    .filter((x) => x.options.length === 0)
    .map((x) => x.item.product.id);

  if (fulfillable.length === 0) {
    return buildPlan("split", "Smart split", [], [], unavailable, prefs);
  }

  // Start with every item at its globally cheapest store.
  let activeStores = new Set<StoreId>(
    fulfillable.map((x) => x.options[0].storeId)
  );

  const assignmentIn = (stores: Set<StoreId>) =>
    fulfillable.map((x) => x.options.find((o) => stores.has(o.storeId)) ?? null);

  const productTotalIn = (stores: Set<StoreId>) =>
    assignmentIn(stores).reduce((s, a) => s + (a ? a.linePricePence : 0), 0);

  const droppedCount = (stores: Set<StoreId>) =>
    assignmentIn(stores).filter((a) => a === null).length;

  const travelIn = (stores: Set<StoreId>) =>
    [...stores].reduce((s, id) => s + travelCostPence(getStore(id)), 0);

  // Greedily remove stores while removal reduces final cost without
  // orphaning items (items whose only stockist is that store stay put).
  let improved = true;
  while (improved && activeStores.size > 1) {
    improved = false;
    let bestNext: Set<StoreId> | null = null;
    let bestCost = productTotalIn(activeStores) + travelIn(activeStores);
    for (const sid of activeStores) {
      const next = new Set(activeStores);
      next.delete(sid);
      if (droppedCount(next) > droppedCount(activeStores)) continue;
      const cost = productTotalIn(next) + travelIn(next);
      if (cost < bestCost) {
        bestCost = cost;
        bestNext = next;
      }
    }
    if (bestNext) {
      activeStores = bestNext;
      improved = true;
    }
  }

  // Enforce a hard store cap if requested (for the "practical" plan).
  while (maxStores !== undefined && activeStores.size > maxStores) {
    let bestNext: Set<StoreId> | null = null;
    let bestCost = Infinity;
    for (const sid of activeStores) {
      const next = new Set(activeStores);
      next.delete(sid);
      const cost =
        productTotalIn(next) + travelIn(next) + droppedCount(next) * 100000;
      if (cost < bestCost) {
        bestCost = cost;
        bestNext = next;
      }
    }
    if (!bestNext) break;
    activeStores = bestNext;
  }

  const allocations = assignmentIn(activeStores).filter(
    (a): a is ItemAllocation => a !== null
  );
  const dropped = fulfillable
    .filter((x) => !x.options.some((o) => activeStores.has(o.storeId)))
    .map((x) => x.item.product.id);
  const storeList = [...activeStores].sort(
    (a, b) =>
      allocations.filter((x) => x.storeId === b).length -
      allocations.filter((x) => x.storeId === a).length
  );

  return buildPlan(
    "split",
    storeList.length === 1
      ? `Everything from ${getStore(storeList[0]).name}`
      : `Split across ${storeList.map((s) => getStore(s).shortName).join(" + ")}`,
    storeList,
    allocations,
    [...unavailable, ...dropped],
    prefs
  );
}

function fulfilledCount(plan: BasketPlan): number {
  return plan.allocations.length;
}

/** Rank plans: fulfil more items first, then by the given cost field. */
function best(
  plans: BasketPlan[],
  costOf: (p: BasketPlan) => number
): BasketPlan {
  return plans
    .slice()
    .sort(
      (a, b) =>
        fulfilledCount(b) - fulfilledCount(a) || costOf(a) - costOf(b)
    )[0];
}

export function optimiseBasket(
  items: BasketItem[],
  products: Product[],
  prefs: UserPrefs
): OptimiserResult | null {
  const resolved = resolveItems(items, products);
  if (resolved.length === 0) return null;

  const singles = STORE_IDS.map((sid) =>
    singleStorePlan(sid, resolved, prefs)
  ).sort(
    (a, b) => fulfilledCount(b) - fulfilledCount(a) || a.finalPence - b.finalPence
  );

  const deliveries = STORE_IDS.map((sid) => deliveryPlan(sid, resolved, prefs))
    .filter((p): p is BasketPlan => p !== null)
    .sort((a, b) => a.finalPence - b.finalPence);

  const smartSplit = consolidatedSplitPlan(resolved, prefs);
  const cappedSplit = consolidatedSplitPlan(
    resolved,
    prefs,
    Math.max(1, prefs.maxStores)
  );

  // Cheapest: lowest final spend of any option (split usually wins, but a
  // single store or delivery can beat it once travel is priced in).
  const cheapest = best(
    [smartSplit, ...singles, ...deliveries],
    (p) => p.finalPence
  );

  // Practical: within the user's store cap, best real cost including time.
  const practical = best(
    [cappedSplit, ...singles.filter((s) => s.stores.length <= prefs.maxStores)],
    (p) => p.realCostPence
  );

  // Convenient: one stop or delivery, best real cost including time.
  const convenient = best([...singles, ...deliveries], (p) => p.realCostPence);

  return {
    cheapest,
    practical,
    convenient,
    singleStorePlans: singles,
    deliveryPlans: deliveries,
  };
}

/** Product saving vs the plan you'd naively pick (cheapest single store). */
export function savingVsSingleStore(
  result: OptimiserResult,
  plan: BasketPlan
): number {
  const baseline = result.singleStorePlans[0];
  if (!baseline) return 0;
  return baseline.finalPence - plan.finalPence;
}
