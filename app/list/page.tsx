"use client";

import Link from "next/link";
import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import {
  ArrowRight,
  Scale,
  Search,
  ShoppingBasket,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import AddToListButton from "@/components/AddToListButton";
import ProductTile from "@/components/ProductTile";
import SectionHeading from "@/components/SectionHeading";
import StoreBadge from "@/components/StoreBadge";
import { useAppState } from "@/lib/app-state";
import {
  cheapestOffer,
  effectivePricePence,
  getProduct,
  getProducts,
  searchProducts,
} from "@/lib/catalog";
import { checkedLabel, gbp } from "@/lib/format";
import { optimiseBasket } from "@/lib/optimiser";
import { getStore } from "@/lib/stores";
import type { Product } from "@/lib/types";

/* ------------------------------------------------------------------ */
/* Quick-add search with live, keyboard-accessible suggestions        */
/* ------------------------------------------------------------------ */

function QuickAdd() {
  const { addToBasket, prefs } = useAppState();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const results = useMemo(
    () =>
      query.trim().length > 0 ? searchProducts({ query }).slice(0, 6) : [],
    [query]
  );

  const add = useCallback(
    (product: Product) => {
      addToBasket(product.id);
      setQuery("");
      setOpen(false);
      setActiveIndex(-1);
      inputRef.current?.focus();
    },
    [addToBasket]
  );

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
      return;
    }
    if (results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => (i <= 0 ? results.length - 1 : i - 1));
    } else if (e.key === "Enter" && open) {
      e.preventDefault();
      const pick = results[activeIndex >= 0 ? activeIndex : 0];
      if (pick) add(pick);
    }
  };

  const listboxId = "quick-add-listbox";

  return (
    <div className="relative">
      <label htmlFor="quick-add" className="sr-only">
        Search the catalogue to add an item
      </label>
      <div className="relative">
        <Search
          aria-hidden
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-teal-600"
        />
        <input
          ref={inputRef}
          id="quick-add"
          type="text"
          role="combobox"
          aria-expanded={open && results.length > 0}
          aria-controls={listboxId}
          aria-activedescendant={
            open && activeIndex >= 0 ? `quick-add-option-${activeIndex}` : undefined
          }
          aria-autocomplete="list"
          autoComplete="off"
          placeholder="Quick add: try “milk”, “bananas” or “washing up liquid”…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            // Delay so option mousedown/click can land first.
            window.setTimeout(() => setOpen(false), 120);
          }}
          onKeyDown={onKeyDown}
          className="w-full rounded-full border border-teal-200 bg-white py-3 pl-12 pr-4 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-teal-400 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
        />
      </div>

      {open && results.length > 0 && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label="Product suggestions"
          className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-teal-100 bg-white shadow-lg"
        >
          {results.map((p, i) => {
            const offer = cheapestOffer(p, prefs.loyaltyCards);
            const eff = offer
              ? effectivePricePence(offer, prefs.loyaltyCards)
              : undefined;
            return (
              <li
                key={p.id}
                id={`quick-add-option-${i}`}
                role="option"
                aria-selected={i === activeIndex}
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => add(p)}
                className={`flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm ${
                  i === activeIndex ? "bg-teal-50" : "bg-white"
                }`}
              >
                <ProductTile product={p} size="sm" />
                <span className="min-w-0 flex-1 truncate font-medium text-slate-900">
                  {p.name}
                </span>
                {offer && eff && (
                  <span className="flex shrink-0 items-center gap-2">
                    <span className="font-display font-bold text-slate-900">
                      {gbp(eff.pence)}
                    </span>
                    {eff.usedLoyalty && (
                      <span className="rounded-full bg-teal-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                        loyalty
                      </span>
                    )}
                    <StoreBadge storeId={offer.storeId} />
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* One row of the shopping list                                       */
/* ------------------------------------------------------------------ */

function BasketRow({ productId }: { productId: string }) {
  const { prefs, removeFromBasket } = useAppState();
  const product = getProduct(productId);
  if (!product) return null;

  const offer = cheapestOffer(product, prefs.loyaltyCards);
  const eff = offer ? effectivePricePence(offer, prefs.loyaltyCards) : undefined;

  return (
    <li className="flex flex-wrap items-center gap-3 rounded-2xl border border-teal-100 bg-white p-3 shadow-sm transition hover:border-teal-200 hover:shadow-md sm:flex-nowrap">
      <ProductTile product={product} size="md" />
      <div className="min-w-0 flex-1">
        <Link
          href={`/product/${product.id}`}
          className="font-semibold text-slate-900 transition-colors hover:text-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
        >
          {product.name}
        </Link>
        {offer && eff ? (
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-slate-500">
            <span>
              <span className="font-semibold text-teal-700">{gbp(eff.pence)}</span>{" "}
              at {getStore(offer.storeId).name}
            </span>
            {eff.usedLoyalty && (
              <span className="rounded-full bg-teal-50 px-1.5 py-0.5 text-[10px] font-semibold text-teal-700">
                loyalty price
              </span>
            )}
            <span className="text-xs text-slate-400">
              {checkedLabel(offer.updatedAt)}
            </span>
          </p>
        ) : (
          <p className="mt-0.5 text-sm font-medium text-amber-700">
            Out of stock everywhere right now
          </p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <AddToListButton productId={product.id} compact />
        <button
          type="button"
          aria-label={`Remove ${product.name} from list`}
          onClick={() => removeFromBasket(product.id)}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/* Summary card (sticky on desktop)                                   */
/* ------------------------------------------------------------------ */

function SummaryCard() {
  const { basket, basketCount, prefs, clearBasket } = useAppState();
  const [confirming, setConfirming] = useState(false);

  const result = useMemo(
    () => optimiseBasket(basket, getProducts(), prefs),
    [basket, prefs]
  );
  const cheapestSingle = result?.singleStorePlans[0];
  const splitSaving =
    result && cheapestSingle
      ? cheapestSingle.finalPence - result.cheapest.finalPence
      : 0;

  return (
    <aside className="lg:sticky lg:top-24 lg:self-start">
      <div className="rounded-2xl border border-teal-100 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-widest text-teal-600">
          List summary
        </p>
        <p className="mt-2 text-slate-600">
          <span className="font-display text-3xl font-bold tracking-tight text-slate-900">
            {basketCount}
          </span>{" "}
          item{basketCount === 1 ? "" : "s"} · {basket.length} product
          {basket.length === 1 ? "" : "s"}
        </p>

        {result && cheapestSingle && (
          <dl className="mt-4 space-y-2 border-t border-teal-50 pt-4 text-sm">
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-slate-500">Cheapest single store</dt>
              <dd className="font-semibold text-slate-900">
                {gbp(cheapestSingle.finalPence)}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-slate-500">Smart split</dt>
              <dd className="font-display font-bold text-teal-700">
                {gbp(result.cheapest.finalPence)}
              </dd>
            </div>
            {splitSaving > 0 && (
              <p className="rounded-xl bg-teal-50 px-3 py-2 text-xs font-semibold text-teal-800">
                Splitting smartly could save you {gbp(splitSaving)} on this shop
                — travel included.
              </p>
            )}
          </dl>
        )}

        <Link
          href="/optimise"
          className="glow-teal mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
        >
          <Sparkles className="h-4 w-4" aria-hidden />
          Optimise my basket
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>

        {confirming ? (
          <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3 text-sm">
            <p className="font-semibold text-red-800">Clear the whole list?</p>
            <p className="mt-0.5 text-xs text-red-700">
              This removes every item — there&rsquo;s no undo.
            </p>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  clearBasket();
                  setConfirming(false);
                }}
                className="rounded-full bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
              >
                Yes, clear it
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
              >
                Keep my list
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="mt-4 inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-red-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
          >
            <Trash2 className="h-4 w-4" aria-hidden />
            Clear list
          </button>
        )}
      </div>
    </aside>
  );
}

/* ------------------------------------------------------------------ */
/* Empty state with a one-click sample shop                           */
/* ------------------------------------------------------------------ */

/** Staples for the sample family shop; each entry lists fallback queries. */
const SAMPLE_STAPLES: string[][] = [
  ["semi-skimmed milk", "milk"],
  ["white loaf", "bread", "loaf"],
  ["free range eggs", "eggs"],
  ["chicken breast", "chicken"],
  ["penne pasta", "pasta", "rice"],
  ["bananas"],
  ["corn flakes", "cereal", "porridge oats"],
  ["toilet roll", "toilet paper", "kitchen roll"],
  ["butter"],
  ["baked beans", "beans"],
  ["cheddar", "cheese"],
  ["tea bags", "tea"],
];

function EmptyState() {
  const { addToBasket, basket } = useAppState();

  const addSampleShop = () => {
    const seen = new Set(basket.map((i) => i.productId));
    for (const queries of SAMPLE_STAPLES) {
      for (const q of queries) {
        const match = searchProducts({ query: q })[0];
        if (match) {
          if (!seen.has(match.id)) {
            seen.add(match.id);
            addToBasket(match.id);
          }
          break;
        }
      }
    }
  };

  return (
    <div className="mesh-teal mt-6 rounded-2xl border border-teal-100 p-8 text-center sm:p-12">
      <span
        aria-hidden
        className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-teal-100 bg-white text-teal-600 shadow-sm"
      >
        <ShoppingBasket className="h-8 w-8" />
      </span>
      <h2 className="mt-4 font-display text-2xl font-bold tracking-tight text-slate-900">
        Your list is empty
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-600">
        Add the things you actually buy — milk, bread, the lot — and we&rsquo;ll
        work out the cheapest practical way to buy everything, travel included.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={addSampleShop}
          className="glow-teal inline-flex items-center gap-2 rounded-full bg-teal-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
        >
          <Sparkles className="h-4 w-4" aria-hidden />
          Try a sample family shop
        </button>
        <Link
          href="/compare"
          className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white px-6 py-3 text-sm font-semibold text-teal-800 transition-colors hover:bg-teal-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
        >
          <Scale className="h-4 w-4" aria-hidden />
          Browse &amp; compare prices
        </Link>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                               */
/* ------------------------------------------------------------------ */

function ListSkeleton() {
  return (
    <div aria-hidden className="mt-6 space-y-3">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-20 animate-pulse rounded-2xl border border-teal-100 bg-teal-50/50"
        />
      ))}
    </div>
  );
}

export default function ListPage() {
  const { basket, hydrated } = useAppState();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <SectionHeading
        eyebrow="Your shopping list"
        title="Build your list once"
        description="One list, every supermarket. Add what you need, then let the optimiser find the cheapest practical way to buy the whole lot."
      />

      {!hydrated ? (
        <ListSkeleton />
      ) : basket.length === 0 ? (
        <>
          <div className="max-w-2xl">
            <QuickAdd />
          </div>
          <EmptyState />
        </>
      ) : (
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <QuickAdd />
            <ul className="mt-5 space-y-3">
              {basket.map((item) => (
                <BasketRow key={item.productId} productId={item.productId} />
              ))}
            </ul>
          </div>
          <SummaryCard />
        </div>
      )}
    </div>
  );
}
