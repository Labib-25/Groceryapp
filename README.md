# BasketWise

**The grocery app that finds the cheapest practical way to complete your whole
shop — not just the cheapest individual products.**

BasketWise compares grocery prices across nine UK supermarkets (Tesco,
Sainsbury's, Asda, Morrisons, Aldi, Lidl, Waitrose, Iceland, Co-op), lets you
build one shopping list, and then answers the question that matters:

> "Where should I do my *entire* shop today, given my list, loyalty cards,
> travel costs and time?"

## Features (v1)

- **Compare** — search 80+ everyday products, see every store's price side by
  side with unit prices (per 100g / per litre), loyalty prices clearly
  labelled, promotions with expiry dates, and match-confidence badges
  (exact / own-brand / budget / premium).
- **This week's winners** — the products with the biggest store-vs-store gaps
  (e.g. "Coca-Cola is cheapest at Tesco this week").
- **My list** — build a shopping list with live suggestions and quantity
  steppers; persisted locally in your browser.
- **Smart Basket Optimiser** — three transparent recommendations:
  - **Cheapest** — the lowest true cost (products + estimated travel), with
    multi-store splits consolidated so an extra stop must pay for itself.
  - **Practical** — the best value within your store cap (default 2),
    accounting for what your time is worth.
  - **Convenient** — the best one-stop or delivery option.
  Every plan shows product total, travel estimate, delivery fees, loyalty
  savings, unavailable items and the *real* saving.
- **Price history** — trend charts with lowest/average context and a
  plain-English "good time to buy?" verdict.
- **Settings** — loyalty cards (Clubcard, Nectar, More, Lidl Plus…), value of
  your time, max stores, dietary preferences.

## Stack

- [Next.js 15](https://nextjs.org) (App Router) + React 19 + TypeScript
- Tailwind CSS v4 — teal & white design system
- lucide-react icons
- Deploys to Vercel with zero configuration

## Getting started

```bash
npm install
npm run dev     # http://localhost:3000
npm test        # optimiser + pricing engine unit tests
npm run build   # production build
```

## Data

v1 ships with a realistic **demo price catalogue** (`lib/data/products.ts`),
clearly labelled in the UI. The data layer is deliberately shaped so a live
feed can replace it without touching the UI:

| Phase | Data source | Storage |
|-------|-------------|---------|
| v1 (now) | Static demo catalogue | Browser localStorage (list + prefs) |
| v2 | Live price ingestion (retailer APIs / feeds) | **Supabase** (Postgres): products, offers, price history |
| v3 | Accounts, receipt scanning, alerts | Supabase Auth + Storage + FSA Food Alerts API |

## Roadmap

Receipt scanning, dietary profiles, meal planning from live prices, pantry
tracking, product-recall alerts (FSA Food Alerts API), voice lists and barcode
scanning — see the product brief.

## Honest-pricing principles

- Loyalty prices are never blended with regular prices unlabelled.
- Unit prices are always shown so multipacks can't mislead.
- Every price shows when it was last checked.
- Travel costs and times are labelled as estimates.
- Substitutions carry match-confidence badges.
