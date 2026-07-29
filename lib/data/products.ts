import type { Product } from "../types";

/**
 * Demo price catalogue. In v1 these are realistic sample prices, clearly
 * labelled as demo data in the UI. A live feed (retailer APIs / ingestion
 * into Supabase) replaces this module in a later phase — keep the shape.
 */
export const PRODUCTS: Product[] = [
  {
    id: "coca-cola-8x330",
    name: "Coca-Cola Original 8 × 330ml",
    category: "Drinks",
    emoji: "🥤",
    tags: ["vegan", "vegetarian", "gluten-free"],
    unitBasis: "per litre",
    offers: [
      {
        storeId: "tesco",
        productName: "Coca-Cola Original Taste 8 x 330ml",
        brand: "Coca-Cola",
        packSize: 2640,
        unit: "ml",
        pricePence: 585,
        loyaltyPricePence: 500,
        promo: { label: "Clubcard Price", endsAt: "2026-08-11" },
        available: true,
        matchType: "exact",
        updatedAt: "2026-07-29T08:30:00Z",
      },
      {
        storeId: "sainsburys",
        productName: "Coca-Cola Original Taste 8 x 330ml",
        brand: "Coca-Cola",
        packSize: 2640,
        unit: "ml",
        pricePence: 600,
        loyaltyPricePence: 550,
        available: true,
        matchType: "exact",
        updatedAt: "2026-07-29T08:30:00Z",
      },
      {
        storeId: "asda",
        productName: "Coca-Cola Original Taste 8 x 330ml",
        brand: "Coca-Cola",
        packSize: 2640,
        unit: "ml",
        pricePence: 574,
        available: true,
        matchType: "exact",
        updatedAt: "2026-07-29T08:30:00Z",
      },
    ],
    priceHistory: [
      { month: "2026-02", pricePence: 550 },
      { month: "2026-03", pricePence: 560 },
      { month: "2026-04", pricePence: 574 },
      { month: "2026-05", pricePence: 585 },
      { month: "2026-06", pricePence: 574 },
      { month: "2026-07", pricePence: 500 },
    ],
  },
];
