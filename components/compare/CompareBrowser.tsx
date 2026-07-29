"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, SearchX, X } from "lucide-react";
import ProductCard from "@/components/compare/ProductCard";
import SectionHeading from "@/components/SectionHeading";
import { useAppState } from "@/lib/app-state";
import {
  CATEGORIES,
  catalogueUpdatedAt,
  effectivePricePence,
  offersByPrice,
  searchProducts,
} from "@/lib/catalog";
import { checkedLabel } from "@/lib/format";
import type { Category, DietTag, Offer, Product } from "@/lib/types";

const DIET_FILTERS: DietTag[] = [
  "vegan",
  "vegetarian",
  "gluten-free",
  "dairy-free",
  "organic",
];

type SortKey = "saving" | "price" | "az";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "saving", label: "Biggest saving" },
  { value: "price", label: "Price: low to high" },
  { value: "az", label: "A–Z" },
];

function tagLabel(tag: DietTag): string {
  return tag.charAt(0).toUpperCase() + tag.slice(1);
}

interface RankedProduct {
  product: Product;
  /** Cheapest effective price in pence; missing when nothing is in stock. */
  cheapestPence?: number;
  /** Gap between the dearest and cheapest store, in pence. */
  gapPence: number;
}

/** Inner client component for /compare — must sit inside <Suspense>. */
export default function CompareBrowser() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { prefs } = useAppState();

  const urlQuery = searchParams.get("q") ?? "";
  const urlCategory = searchParams.get("category") ?? "";
  const category: Category | undefined = CATEGORIES.find(
    (c) => c === urlCategory
  );

  const [query, setQuery] = useState(urlQuery);
  const [dietTags, setDietTags] = useState<DietTag[]>([]);
  const [sort, setSort] = useState<SortKey>("saving");

  // Keep the input in step if the URL changes elsewhere (e.g. header search).
  useEffect(() => {
    setQuery((prev) => (prev.trim() === urlQuery ? prev : urlQuery));
  }, [urlQuery]);

  const syncUrl = useCallback(
    (q: string, cat: string) => {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      if (cat) params.set("category", cat);
      const qs = params.toString();
      router.replace(qs ? `/compare?${qs}` : "/compare", { scroll: false });
    },
    [router]
  );

  const onSearchChange = (value: string) => {
    setQuery(value);
    syncUrl(value, category ?? "");
  };

  const onCategory = (cat: Category | "") => {
    syncUrl(query, cat);
  };

  const toggleTag = (tag: DietTag) => {
    setDietTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const hasFilters =
    query.trim() !== "" || category !== undefined || dietTags.length > 0;

  const clearFilters = () => {
    setQuery("");
    setDietTags([]);
    setSort("saving");
    router.replace("/compare", { scroll: false });
  };

  const results = useMemo<RankedProduct[]>(() => {
    const cards = prefs.loyaltyCards;
    const ranked = searchProducts({
      query,
      category,
      dietTags: dietTags.length > 0 ? dietTags : undefined,
    }).map((product): RankedProduct => {
      const offers = offersByPrice(product, cards);
      const cheapest: Offer | undefined = offers[0];
      const dearest: Offer | undefined = offers[offers.length - 1];
      if (!cheapest || !dearest) return { product, gapPence: 0 };
      const cheapestPence = effectivePricePence(cheapest, cards).pence;
      const dearestPence = effectivePricePence(dearest, cards).pence;
      return { product, cheapestPence, gapPence: dearestPence - cheapestPence };
    });

    return ranked.sort((a, b) => {
      if (sort === "az") return a.product.name.localeCompare(b.product.name);
      if (sort === "price") {
        const ap = a.cheapestPence ?? Number.MAX_SAFE_INTEGER;
        const bp = b.cheapestPence ?? Number.MAX_SAFE_INTEGER;
        return ap - bp || a.product.name.localeCompare(b.product.name);
      }
      return (
        b.gapPence - a.gapPence || a.product.name.localeCompare(b.product.name)
      );
    });
  }, [query, category, dietTags, sort, prefs.loyaltyCards]);

  const chipBase =
    "shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600";
  const chipOn = "border-teal-600 bg-teal-600 text-white";
  const chipOff = "border-teal-200 bg-white text-teal-800 hover:bg-teal-50";

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <SectionHeading
        eyebrow="Compare prices"
        title="Browse the catalogue"
        description={`Every product priced across the big supermarkets, loyalty deals included. ${checkedLabel(
          catalogueUpdatedAt()
        )} — demo data.`}
      />

      {/* Search */}
      <div className="relative max-w-xl">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search milk, bread, nappies…"
          aria-label="Search products"
          className="w-full rounded-full border border-teal-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
        />
      </div>

      {/* Category chips */}
      <div
        className="scroll-thin mt-4 flex gap-2 overflow-x-auto pb-2"
        role="group"
        aria-label="Filter by category"
      >
        <button
          type="button"
          aria-pressed={category === undefined}
          onClick={() => onCategory("")}
          className={`${chipBase} ${category === undefined ? chipOn : chipOff}`}
        >
          All
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            aria-pressed={category === cat}
            onClick={() => onCategory(cat)}
            className={`${chipBase} ${category === cat ? chipOn : chipOff}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Diet filters + sort */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-widest text-teal-600">
          Diet
        </span>
        {DIET_FILTERS.map((tag) => {
          const on = dietTags.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              aria-pressed={on}
              onClick={() => toggleTag(tag)}
              className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 ${
                on ? chipOn : chipOff
              }`}
            >
              {tagLabel(tag)}
            </button>
          );
        })}

        <label className="ml-auto flex items-center gap-2 text-sm text-slate-600">
          <span className="text-xs font-semibold uppercase tracking-widest text-teal-600">
            Sort
          </span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded-full border border-teal-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-800 shadow-sm outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Results header */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-slate-500" aria-live="polite">
          <span className="font-semibold text-slate-900">{results.length}</span>{" "}
          {results.length === 1 ? "product" : "products"}
          {category ? ` in ${category}` : ""}
          {query.trim() ? ` matching “${query.trim()}”` : ""}
        </p>
        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-sm font-semibold text-teal-700 transition-colors hover:text-teal-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
          >
            <X className="h-4 w-4" aria-hidden />
            Clear filters
          </button>
        )}
      </div>

      {/* Results grid / empty state */}
      {results.length > 0 ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map(({ product }) => (
            <ProductCard
              key={product.id}
              product={product}
              loyaltyCards={prefs.loyaltyCards}
            />
          ))}
        </div>
      ) : (
        <div className="mt-8 flex flex-col items-center rounded-2xl border border-teal-100 bg-white px-6 py-14 text-center shadow-sm">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-50 via-white to-cyan-50 border border-teal-100">
            <SearchX className="h-6 w-6 text-teal-600" aria-hidden />
          </span>
          <h2 className="mt-4 font-display text-lg font-bold tracking-tight text-slate-900">
            Nothing matches those filters
          </h2>
          <p className="mt-1 max-w-sm text-sm text-slate-500">
            We couldn&rsquo;t find a product for that combination. Try a
            shorter search, or widen the category and diet filters.
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-5 rounded-full bg-teal-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
