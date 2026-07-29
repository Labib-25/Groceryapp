"use client";

import { useState } from "react";
import {
  Check,
  ClipboardList,
  ExternalLink,
  Share2,
  ShoppingCart,
  Store as StoreIcon,
} from "lucide-react";
import StoreBadge from "@/components/StoreBadge";
import { gbp } from "@/lib/format";
import { getStore } from "@/lib/stores";
import type { BasketPlan, ItemAllocation, StoreId } from "@/lib/types";

function searchUrl(pattern: string, query: string): string {
  return pattern.replace("{query}", encodeURIComponent(query));
}

function listText(storeName: string, allocations: ItemAllocation[]): string {
  const lines = allocations.map(
    (a) =>
      `- ${a.qty > 1 ? `${a.qty} × ` : ""}${a.offer.productName} (${gbp(
        a.linePricePence
      )})`
  );
  const total = allocations.reduce((s, a) => s + a.linePricePence, 0);
  return `BasketWise — ${storeName} shopping list\n${lines.join(
    "\n"
  )}\nSubtotal: ${gbp(total)}`;
}

function StoreCheckoutCard({
  storeId,
  allocations,
}: {
  storeId: StoreId;
  allocations: ItemAllocation[];
}) {
  const store = getStore(storeId);
  const [copied, setCopied] = useState(false);
  const subtotal = allocations.reduce((s, a) => s + a.linePricePence, 0);
  const canShare =
    typeof navigator !== "undefined" && typeof navigator.share === "function";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(listText(store.name, allocations));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable (e.g. insecure context) — nothing to do.
    }
  };

  const share = async () => {
    try {
      await navigator.share({
        title: `${store.name} shopping list`,
        text: listText(store.name, allocations),
      });
    } catch {
      // User dismissed the share sheet — fine.
    }
  };

  return (
    <article className="rounded-2xl border border-teal-100 bg-white p-4 shadow-sm transition hover:border-teal-200">
      <header className="flex flex-wrap items-center gap-3">
        <StoreBadge storeId={storeId} size="md" />
        <span className="text-sm text-slate-500">
          {allocations.length} item{allocations.length === 1 ? "" : "s"} ·{" "}
          {gbp(subtotal)}
        </span>
        {store.deliveryFeePence !== undefined ? (
          <span className="ml-auto rounded-full bg-teal-50 px-2.5 py-1 text-[11px] font-semibold text-teal-700">
            Delivers from{" "}
            {store.deliveryFeePence === 0
              ? "free"
              : gbp(store.deliveryFeePence)}
            {store.minBasketPence
              ? ` · ${gbp(store.minBasketPence)} min`
              : ""}
          </span>
        ) : (
          <span className="ml-auto rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
            Collection / in-store
          </span>
        )}
      </header>

      {store.searchUrlPattern ? (
        <>
          <p className="mt-3 text-xs leading-relaxed text-slate-500">
            Tap an item to open it in {store.name}&apos;s online shop, add it
            to your basket there, then book delivery or collection and pay on
            their site.
          </p>
          <ul className="mt-2 divide-y divide-teal-50">
            {allocations.map((a) => (
              <li key={a.productId}>
                <a
                  href={searchUrl(store.searchUrlPattern!, a.offer.productName)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 py-2 text-sm text-slate-700 transition-colors hover:text-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
                >
                  <span className="min-w-0 flex-1 truncate">
                    {a.qty > 1 && (
                      <span className="font-semibold">{a.qty} × </span>
                    )}
                    {a.offer.productName}
                  </span>
                  <span className="text-xs text-slate-400">
                    {gbp(a.linePricePence)}
                  </span>
                  <ExternalLink
                    className="h-3.5 w-3.5 shrink-0 text-slate-300 transition-colors group-hover:text-teal-500"
                    aria-hidden
                  />
                </a>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="mt-3 flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
          <StoreIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          {store.name} has no online shop in the UK — copy the list below and
          shop it in store.
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 px-3 py-1.5 text-xs font-semibold text-teal-800 transition-colors hover:bg-teal-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" aria-hidden /> Copied
            </>
          ) : (
            <>
              <ClipboardList className="h-3.5 w-3.5" aria-hidden /> Copy list
            </>
          )}
        </button>
        {canShare && (
          <button
            type="button"
            onClick={share}
            className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 px-3 py-1.5 text-xs font-semibold text-teal-800 transition-colors hover:bg-teal-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
          >
            <Share2 className="h-3.5 w-3.5" aria-hidden /> Share
          </button>
        )}
      </div>
    </article>
  );
}

/**
 * Hands the chosen plan off to each store's own online shop: item-by-item
 * deep links into the retailer's site where the user checks out and books
 * delivery. True in-app checkout needs retailer partnerships — roadmap.
 */
export default function SendToStore({ plan }: { plan: BasketPlan }) {
  if (plan.stores.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        {plan.stores.map((storeId) => (
          <StoreCheckoutCard
            key={storeId}
            storeId={storeId}
            allocations={plan.allocations.filter((a) => a.storeId === storeId)}
          />
        ))}
      </div>
      <p className="flex items-start gap-2 rounded-2xl border border-teal-100 bg-teal-50/50 p-4 text-xs leading-relaxed text-slate-600">
        <ShoppingCart className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" aria-hidden />
        <span>
          BasketWise hands your list to the store — you check out and book
          delivery on their site with your own account, so their live stock
          and slot availability always apply. One-tap in-app checkout across
          stores needs retailer partnerships and is on the roadmap.
        </span>
      </p>
    </div>
  );
}
