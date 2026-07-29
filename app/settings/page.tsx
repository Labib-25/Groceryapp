"use client";

import {
  AlertTriangle,
  BadgePercent,
  Database,
  MapPin,
  Route,
  Timer,
} from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import ClearListCard from "@/components/settings/ClearListCard";
import DietTagChips from "@/components/settings/DietTagChips";
import LoyaltyCardGrid from "@/components/settings/LoyaltyCardGrid";
import SegmentedControl from "@/components/settings/SegmentedControl";
import { useAppState } from "@/lib/app-state";
import { catalogueUpdatedAt, getProducts, storeCount } from "@/lib/catalog";
import { gbp } from "@/lib/format";

const TIME_VALUE_OPTIONS = [500, 1000, 1500, 2000].map((pence) => ({
  value: pence,
  label: gbp(pence),
  srSuffix: "per hour",
}));

const MAX_STORE_OPTIONS = [1, 2, 3, 4].map((n) => ({
  value: n,
  label: `${n} ${n === 1 ? "store" : "stores"}`,
}));

const CARD = "rounded-2xl border border-teal-100 bg-white p-6 shadow-sm";

function SettingsSkeleton() {
  return (
    <div aria-busy="true" className="space-y-12">
      <p className="sr-only" role="status">
        Loading your settings…
      </p>
      {[0, 1, 2].map((i) => (
        <div key={i} aria-hidden className="animate-pulse space-y-4">
          <div className="h-8 w-64 rounded-lg bg-slate-100" />
          <div className="h-40 rounded-2xl border border-teal-100 bg-slate-50" />
        </div>
      ))}
    </div>
  );
}

export default function SettingsPage() {
  const { prefs, hydrated, setTimeValue, setMaxStores, setPostcode } =
    useAppState();

  const catalogueDate = new Date(catalogueUpdatedAt()).toLocaleDateString(
    "en-GB",
    { day: "numeric", month: "long", year: "numeric" }
  );
  const products = getProducts();
  const comparisons = products.reduce((sum, p) => sum + storeCount(p), 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <div className="mb-10 max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-teal-600">
          Settings
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Make BasketWise yours
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          Loyalty cards, what your time is worth and how far you&rsquo;ll
          travel — the optimiser uses all of it to recommend the right shop for
          you. Everything saves automatically on this device.
        </p>
      </div>

      {!hydrated ? (
        <SettingsSkeleton />
      ) : (
        <div className="space-y-12">
          {/* 1 — Loyalty cards */}
          <section>
            <SectionHeading
              eyebrow="Loyalty"
              title="Your loyalty cards"
              description="Tick the schemes you hold and prices across the app switch to your loyalty price wherever it's cheaper."
            />
            <div className={CARD}>
              <LoyaltyCardGrid />
              <p className="mt-4 flex items-start gap-2 text-sm leading-relaxed text-slate-500">
                <BadgePercent
                  className="mt-0.5 h-4 w-4 shrink-0 text-teal-600"
                  aria-hidden
                />
                <span>
                  Prices across BasketWise automatically use the schemes you
                  hold — and loyalty prices are always labelled, so you can see
                  exactly which price you&rsquo;d pay at the till.
                </span>
              </p>
            </div>
          </section>

          {/* 2 — Time value */}
          <section>
            <SectionHeading
              eyebrow="Time"
              title="What your time is worth"
              description="An extra supermarket stop only makes sense if the saving beats the time it costs you."
            />
            <div className={CARD}>
              <SegmentedControl
                groupLabel="Value of your time per hour"
                options={TIME_VALUE_OPTIONS}
                value={prefs.timeValuePerHourPence}
                onChange={setTimeValue}
              />
              <p className="mt-4 flex items-start gap-2 text-sm leading-relaxed text-slate-500">
                <Timer
                  className="mt-0.5 h-4 w-4 shrink-0 text-teal-600"
                  aria-hidden
                />
                <span>
                  At {gbp(prefs.timeValuePerHourPence)} an hour, the Practical
                  and Convenient recommendations turn estimated travel and
                  in-store time into money. Value your time higher and
                  BasketWise favours fewer stops; value it lower and a bigger
                  saving can justify the extra trip.
                </span>
              </p>
            </div>
          </section>

          {/* 3 — Shopping style */}
          <section>
            <SectionHeading
              eyebrow="Shopping style"
              title="Shopping style"
              description="How many stores you're happy to visit in one shop, and where you're shopping from."
            />
            <div className={CARD}>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Most stores per shop
                </h3>
                <p className="mb-3 mt-1 text-sm text-slate-500">
                  The Practical plan never sends you to more than this many
                  stores; the Cheapest plan may suggest more when the saving
                  pays for the extra travel.
                </p>
                <SegmentedControl
                  groupLabel="Maximum stores per shop"
                  options={MAX_STORE_OPTIONS}
                  value={prefs.maxStores}
                  onChange={setMaxStores}
                />
              </div>

              <div className="mt-6 border-t border-slate-100 pt-6">
                <label
                  htmlFor="postcode"
                  className="block text-sm font-semibold text-slate-900"
                >
                  Your postcode
                </label>
                <input
                  id="postcode"
                  type="text"
                  autoComplete="postal-code"
                  maxLength={8}
                  value={prefs.postcode ?? ""}
                  onChange={(e) => setPostcode(e.target.value.toUpperCase())}
                  placeholder="e.g. SW1A 1AA"
                  aria-describedby="postcode-note"
                  className="mt-2 w-full max-w-xs rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-100"
                />
                <p
                  id="postcode-note"
                  className="mt-3 flex items-start gap-2 text-sm leading-relaxed text-slate-500"
                >
                  <MapPin
                    className="mt-0.5 h-4 w-4 shrink-0 text-teal-600"
                    aria-hidden
                  />
                  <span>
                    v1 uses estimated distances and drive times for every store
                    — they&rsquo;re labelled &ldquo;est.&rdquo; wherever they
                    appear. Real store-level distances from your postcode
                    arrive with live data.
                  </span>
                </p>
              </div>
            </div>
          </section>

          {/* 4 — Dietary preferences */}
          <section>
            <SectionHeading
              eyebrow="Dietary"
              title="Dietary preferences"
              description="Tell us how you eat and the Compare page can filter products to match."
            />
            <div className={CARD}>
              <DietTagChips />
              <p className="mt-4 text-sm leading-relaxed text-slate-500">
                Compare can filter every category by the preferences you pick
                here.
              </p>
              <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <AlertTriangle
                  className="mt-0.5 h-5 w-5 shrink-0 text-amber-600"
                  aria-hidden
                />
                <p className="text-sm leading-relaxed text-amber-900">
                  <strong className="font-semibold">Allergy safety:</strong>{" "}
                  automated dietary data never replaces checking the packaging.
                  Recipes and suppliers change without notice — always read the
                  label before you eat.
                </p>
              </div>
            </div>
          </section>

          {/* 5 — About the data */}
          <section>
            <SectionHeading
              eyebrow="Data"
              title="About the data"
              description="Where BasketWise's prices come from, and what's coming next."
            />
            <div className={CARD}>
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 text-white">
                  <Database className="h-5 w-5" aria-hidden />
                </span>
                <div className="space-y-3 text-sm leading-relaxed text-slate-600">
                  <p>
                    BasketWise currently runs on a realistic demo snapshot of
                    UK supermarket pricing — {products.length} everyday
                    products compared {comparisons} times across nine stores.
                    It behaves like the real thing, but it isn&rsquo;t a live
                    feed, so treat every price as illustrative.
                  </p>
                  <p className="font-medium text-slate-900">
                    Catalogue last updated {catalogueDate}.
                  </p>
                  <p className="flex items-start gap-2">
                    <Route
                      className="mt-0.5 h-4 w-4 shrink-0 text-teal-600"
                      aria-hidden
                    />
                    <span>
                      Next phase: live retailer price feeds and accounts
                      powered by Supabase, so your list and preferences follow
                      you across devices.
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 6 — Danger zone */}
          <section>
            <SectionHeading
              eyebrow="Careful now"
              title="Danger zone"
              description="Actions here can't be undone."
            />
            <ClearListCard />
          </section>
        </div>
      )}
    </div>
  );
}
