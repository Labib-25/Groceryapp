import { strict as assert } from "node:assert";
import test from "node:test";
import { optimiseBasket, savingVsSingleStore } from "../lib/optimiser";
import { gbp, packSize, unitPricePence } from "../lib/format";
import { travelCostPence, getStore } from "../lib/stores";
import type { Offer, Product, StoreId, UserPrefs } from "../lib/types";

// ---------- fixtures ----------

const PREFS: UserPrefs = {
  loyaltyCards: [],
  timeValuePerHourPence: 1000,
  maxStores: 2,
  dietTags: [],
};

function offer(
  storeId: StoreId,
  pricePence: number,
  extra: Partial<Offer> = {}
): Offer {
  return {
    storeId,
    productName: `${storeId} item`,
    brand: "Test",
    packSize: 500,
    unit: "g",
    pricePence,
    available: true,
    matchType: "own-brand",
    updatedAt: "2026-07-29T08:00:00Z",
    ...extra,
  };
}

function product(id: string, offers: Offer[]): Product {
  return {
    id,
    name: id,
    category: "Food Cupboard",
    emoji: "🧪",
    tags: [],
    unitBasis: "per 100g",
    offers,
  };
}

// Known travel constants from lib/stores.ts (miles * 2 * 45p):
const TESCO_TRAVEL = travelCostPence(getStore("tesco")); // 108
const ALDI_TRAVEL = travelCostPence(getStore("aldi")); // 198
const WAITROSE_TRAVEL = travelCostPence(getStore("waitrose")); // 396

// ---------- formatting ----------

test("gbp formats pence and pounds", () => {
  assert.equal(gbp(89), "89p");
  assert.equal(gbp(4520), "£45.20");
  assert.equal(gbp(-150), "-£1.50");
  assert.equal(gbp(99, { alwaysPounds: true }), "£0.99");
});

test("packSize renders human sizes", () => {
  assert.equal(packSize(650, "g"), "650g");
  assert.equal(packSize(1500, "g"), "1.5kg");
  assert.equal(packSize(1000, "ml"), "1L");
  assert.equal(packSize(1, "each"), "1 item");
});

test("unitPricePence computes per-100g", () => {
  const o = offer("tesco", 338, { packSize: 650, unit: "g" });
  const up = unitPricePence(o, "per 100g");
  assert.ok(up !== null && Math.abs(up - 52) < 0.01);
});

// ---------- optimiser ----------

test("empty basket returns null", () => {
  assert.equal(optimiseBasket([], [], PREFS), null);
});

test("loyalty price applies only when the card is held", () => {
  const p = product("cola", [
    offer("tesco", 1000, { loyaltyPricePence: 800 }),
    offer("aldi", 950),
  ]);
  const withoutCard = optimiseBasket([{ productId: "cola", qty: 1 }], [p], PREFS);
  const withCard = optimiseBasket([{ productId: "cola", qty: 1 }], [p], {
    ...PREFS,
    loyaltyCards: ["tesco"],
  });
  assert.ok(withoutCard && withCard);
  const tescoPlanNoCard = withoutCard.singleStorePlans.find(
    (s) => s.stores[0] === "tesco"
  )!;
  const tescoPlanCard = withCard.singleStorePlans.find(
    (s) => s.stores[0] === "tesco"
  )!;
  assert.equal(tescoPlanNoCard.productTotalPence, 1000);
  assert.equal(tescoPlanNoCard.loyaltySavingPence, 0);
  assert.equal(tescoPlanCard.productTotalPence, 800);
  assert.equal(tescoPlanCard.loyaltySavingPence, 200);
});

test("does not send you to another store for a tiny saving", () => {
  // Aldi is 25p cheaper on products but costs 90p more in travel than Tesco.
  const a = product("a", [offer("tesco", 500), offer("aldi", 480)]);
  const b = product("b", [offer("tesco", 300), offer("aldi", 295)]);
  const result = optimiseBasket(
    [
      { productId: "a", qty: 1 },
      { productId: "b", qty: 1 },
    ],
    [a, b],
    PREFS
  )!;
  assert.deepEqual(result.cheapest.stores, ["tesco"]);
  assert.equal(result.cheapest.finalPence, 800 + TESCO_TRAVEL);
});

test("splits across stores when the saving genuinely beats travel", () => {
  const a = product("a", [offer("tesco", 500), offer("aldi", 900)]);
  const b = product("b", [offer("tesco", 700), offer("aldi", 300)]);
  const result = optimiseBasket(
    [
      { productId: "a", qty: 1 },
      { productId: "b", qty: 1 },
    ],
    [a, b],
    PREFS
  )!;
  assert.equal(result.cheapest.stores.length, 2);
  assert.equal(
    result.cheapest.finalPence,
    500 + 300 + TESCO_TRAVEL + ALDI_TRAVEL
  );
  // And the saving vs the cheapest single store is reported correctly.
  const bestSingle = result.singleStorePlans[0];
  assert.equal(
    savingVsSingleStore(result, result.cheapest),
    bestSingle.finalPence - result.cheapest.finalPence
  );
});

test("consolidates a far store whose saving is smaller than its travel", () => {
  // Waitrose is 10p cheaper on item a but costs £3.96 round-trip.
  const a = product("a", [offer("tesco", 500), offer("waitrose", 490)]);
  const b = product("b", [offer("tesco", 300), offer("waitrose", 310)]);
  const result = optimiseBasket(
    [
      { productId: "a", qty: 1 },
      { productId: "b", qty: 1 },
    ],
    [a, b],
    PREFS
  )!;
  assert.deepEqual(result.cheapest.stores, ["tesco"]);
  assert.equal(result.cheapest.finalPence, 800 + TESCO_TRAVEL);
  assert.ok(result.cheapest.finalPence < 490 + 300 + TESCO_TRAVEL + WAITROSE_TRAVEL);
});

test("cheapest plan never beats itself: final <= best single store", () => {
  const items = [
    product("x", [offer("tesco", 250), offer("aldi", 180), offer("coop", 300)]),
    product("y", [offer("tesco", 420), offer("aldi", 400), offer("coop", 500)]),
    product("z", [offer("tesco", 900), offer("coop", 850)]),
  ];
  const result = optimiseBasket(
    items.map((p) => ({ productId: p.id, qty: 2 })),
    items,
    PREFS
  )!;
  assert.ok(result.cheapest.finalPence <= result.singleStorePlans[0].finalPence);
});

test("practical plan respects the max-stores cap", () => {
  const items = [
    product("a", [offer("tesco", 100), offer("aldi", 500), offer("coop", 500)]),
    product("b", [offer("aldi", 100), offer("tesco", 500), offer("coop", 500)]),
    product("c", [offer("coop", 100), offer("tesco", 500), offer("aldi", 500)]),
  ];
  const result = optimiseBasket(
    items.map((p) => ({ productId: p.id, qty: 1 })),
    items,
    { ...PREFS, maxStores: 2 }
  )!;
  assert.ok(result.practical.stores.length <= 2);
});

test("unavailable products are reported, not silently dropped", () => {
  const a = product("a", [offer("tesco", 500)]);
  const ghost = product("ghost", [offer("aldi", 300, { available: false })]);
  const result = optimiseBasket(
    [
      { productId: "a", qty: 1 },
      { productId: "ghost", qty: 1 },
    ],
    [a, ghost],
    PREFS
  )!;
  assert.ok(result.cheapest.unavailable.includes("ghost"));
  for (const plan of result.singleStorePlans) {
    assert.ok(plan.unavailable.includes("ghost"));
  }
});

test("plans fulfilling more items outrank cheaper but emptier plans", () => {
  // Co-op is cheap but only stocks one of the two items.
  const a = product("a", [offer("coop", 100), offer("tesco", 500)]);
  const b = product("b", [offer("tesco", 500)]);
  const result = optimiseBasket(
    [
      { productId: "a", qty: 1 },
      { productId: "b", qty: 1 },
    ],
    [a, b],
    PREFS
  )!;
  assert.equal(result.convenient.stores[0], "tesco");
  assert.equal(result.convenient.allocations.length, 2);
});

test("delivery plans respect the store's minimum basket", () => {
  const small = product("small", [offer("tesco", 1000)]); // below £40 min
  const smallResult = optimiseBasket(
    [{ productId: "small", qty: 1 }],
    [small],
    PREFS
  )!;
  assert.equal(
    smallResult.deliveryPlans.find((d) => d.stores[0] === "tesco"),
    undefined
  );

  const big = product("big", [offer("tesco", 4500)]); // above £40 min
  const bigResult = optimiseBasket([{ productId: "big", qty: 1 }], [big], PREFS)!;
  const tescoDelivery = bigResult.deliveryPlans.find(
    (d) => d.stores[0] === "tesco"
  )!;
  assert.ok(tescoDelivery);
  assert.equal(tescoDelivery.deliveryPence, 450);
  assert.equal(tescoDelivery.travelPence, 0);
  assert.equal(tescoDelivery.finalPence, 4500 + 450);
});

test("quantities multiply line prices", () => {
  const p = product("multi", [offer("tesco", 250)]);
  const result = optimiseBasket([{ productId: "multi", qty: 4 }], [p], PREFS)!;
  assert.equal(result.singleStorePlans[0].productTotalPence, 1000);
});
