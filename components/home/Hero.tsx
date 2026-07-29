"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { catalogueUpdatedAt, getProducts } from "@/lib/catalog";
import { ALL_STORES } from "@/lib/stores";
import type { Category } from "@/lib/types";
import { shortDateYear } from "./dates";

const PRODUCT_COUNT = getProducts().length;
const STORE_COUNT = ALL_STORES.length;
const UPDATED = shortDateYear(catalogueUpdatedAt());

const QUICK_CATEGORIES: Category[] = [
  "Fruit & Veg",
  "Dairy & Eggs",
  "Bakery",
  "Drinks",
  "Snacks",
  "Frozen",
  "Household",
];

/** Hero: headline, whole-shop search, category chips and catalogue stats. */
export default function Hero() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/compare?q=${encodeURIComponent(q)}` : "/compare");
  }

  return (
    <section className="mesh-teal border-b border-teal-100">
      <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 sm:py-20">
        <p className="text-xs font-semibold uppercase tracking-widest text-teal-600">
          UK grocery price intelligence
        </p>
        <h1 className="mx-auto mt-3 max-w-3xl font-display text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
          One list. Every supermarket.{" "}
          <span className="bg-gradient-to-r from-teal-600 to-cyan-500 bg-clip-text text-transparent">
            The cheapest way to shop.
          </span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
          Deal-spotting apps find you one cheap item. BasketWise prices your
          whole list at every major UK supermarket — loyalty prices, promotions
          and travel (est.) included — then shows the cheapest practical way to
          complete the entire shop.
        </p>

        <form
          role="search"
          onSubmit={onSubmit}
          className="glow-teal mx-auto mt-8 flex w-full max-w-2xl items-center gap-2 rounded-full border border-teal-100 bg-white p-1.5 pl-4"
        >
          <Search className="h-5 w-5 shrink-0 text-teal-500" aria-hidden />
          <label htmlFor="home-search" className="sr-only">
            Search products to compare prices
          </label>
          <input
            id="home-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Try “semi-skimmed milk” or “washing pods”"
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent py-2.5 text-base text-slate-900 outline-none placeholder:text-slate-400"
          />
          <button
            type="submit"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 sm:px-6"
          >
            <Search className="h-4 w-4" aria-hidden />
            <span className="sm:hidden">Compare</span>
            <span className="hidden sm:inline">Compare prices</span>
          </button>
        </form>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <span className="text-sm text-slate-500">Browse a category:</span>
          {QUICK_CATEGORIES.map((c) => (
            <Link
              key={c}
              href={`/compare?category=${encodeURIComponent(c)}`}
              className="rounded-full border border-teal-200 bg-white/80 px-3.5 py-1.5 text-sm font-medium text-teal-800 transition-colors hover:bg-teal-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
            >
              {c}
            </Link>
          ))}
        </div>

        <dl className="glass mx-auto mt-10 grid max-w-3xl grid-cols-1 divide-y divide-teal-100 rounded-2xl border border-teal-100 shadow-sm sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div className="flex flex-col-reverse gap-0.5 px-6 py-4">
            <dt className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Products tracked
            </dt>
            <dd className="font-display text-2xl font-bold tracking-tight text-slate-900">
              {PRODUCT_COUNT}
            </dd>
          </div>
          <div className="flex flex-col-reverse gap-0.5 px-6 py-4">
            <dt className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Supermarkets compared
            </dt>
            <dd className="font-display text-2xl font-bold tracking-tight text-slate-900">
              {STORE_COUNT}
            </dd>
          </div>
          <div className="flex flex-col-reverse gap-0.5 px-6 py-4">
            <dt className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Prices last updated
            </dt>
            <dd className="font-display text-2xl font-bold tracking-tight text-slate-900">
              {UPDATED || "—"}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
