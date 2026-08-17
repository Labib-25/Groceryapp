"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Activity, ChevronDown, Search, TrendingDown } from "lucide-react";
import {
  catalogueUpdatedAt,
  getProducts,
  offersByPrice,
  weeklyWins,
} from "@/lib/catalog";
import { ALL_STORES, getStore } from "@/lib/stores";
import { gbp, packSize } from "@/lib/format";
import type { Category, StoreId } from "@/lib/types";
import { shortDateYear } from "./dates";

const PRODUCT_COUNT = getProducts().length;
const STORE_COUNT = ALL_STORES.length;
const PRICE_POINTS = getProducts().reduce((n, p) => n + p.offers.length, 0);
const UPDATED = shortDateYear(catalogueUpdatedAt());

/** How long each spotlight product stays on screen. */
const ROTATE_MS = 5200;

const QUICK_CATEGORIES: Category[] = [
  "Fruit & Veg",
  "Dairy & Eggs",
  "Bakery",
  "Drinks",
  "Snacks",
  "Frozen",
  "Household",
];

interface SpotlightRow {
  storeId: StoreId;
  pence: number;
  /** Bar width as a percentage of the dearest store shown. */
  width: number;
}

interface Spotlight {
  id: string;
  name: string;
  emoji: string;
  pack: string;
  savePence: number;
  runnerUp?: string;
  rows: SpotlightRow[];
}

/**
 * The products with the widest price gap this week, pre-shaped for the hero's
 * rotating "live price check" card. Derived once at module scope from static
 * catalogue data, so server and client render identical markup.
 */
const SPOTLIGHTS: Spotlight[] = weeklyWins(4).map((win) => {
  const offers = offersByPrice(win.product).slice(0, 4);
  const dearest = Math.max(1, ...offers.map((o) => o.pricePence));
  return {
    id: win.product.id,
    name: win.product.name,
    emoji: win.product.emoji,
    pack: packSize(win.offer.packSize, win.offer.unit),
    savePence: win.savingVsNextPence,
    runnerUp: win.runnerUp ? getStore(win.runnerUp.storeId).name : undefined,
    rows: offers.map((o) => ({
      storeId: o.storeId,
      pence: o.pricePence,
      width: Math.round((o.pricePence / dearest) * 100),
    })),
  };
});

/**
 * False on the server and on the first client render, then true only once we
 * know the viewer hasn't asked for reduced motion. Everything decorative and
 * JS-driven (counters, rotation, parallax) hangs off this.
 */
function useMotionOk(): boolean {
  const [motionOk, setMotionOk] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setMotionOk(!mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return motionOk;
}

/** Counts up to `target` on mount; renders the final value when motion is off. */
function useCountUp(target: number, active: boolean): number {
  const [value, setValue] = useState(target);

  useEffect(() => {
    if (!active) {
      setValue(target);
      return;
    }
    const DURATION = 1500;
    const start = performance.now();
    let raf = requestAnimationFrame(function tick(now: number) {
      const t = Math.min(1, (now - start) / DURATION);
      const eased = 1 - Math.pow(1 - t, 4);
      setValue(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, [target, active]);

  return value;
}

/**
 * Hero: a deep-teal cinematic stage — drifting aurora light, a slow sweeping
 * beam and film grain — with frosted-glass panels floating above it carrying
 * the headline, whole-shop search, category chips and catalogue stats.
 */
export default function Hero() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const stageRef = useRef<HTMLElement>(null);
  const frame = useRef(0);
  const motionOk = useMotionOk();

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const spotlight = SPOTLIGHTS[index];

  const products = useCountUp(PRODUCT_COUNT, motionOk);
  const stores = useCountUp(STORE_COUNT, motionOk);

  // Rotate the spotlight card, pausing while the reader is hovering or tabbing
  // through it so it never moves out from under them.
  useEffect(() => {
    if (!motionOk || paused || SPOTLIGHTS.length < 2) return;
    const id = setInterval(
      () => setIndex((i) => (i + 1) % SPOTLIGHTS.length),
      ROTATE_MS
    );
    return () => clearInterval(id);
  }, [motionOk, paused]);

  // Pointer parallax: publish a -1…1 coordinate the CSS layers read to drift
  // and tilt at different rates, giving the glass real depth.
  const onPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      if (!motionOk || e.pointerType !== "mouse") return;
      const el = stageRef.current;
      if (!el) return;
      const { left, top, width, height } = el.getBoundingClientRect();
      const px = ((e.clientX - left) / width) * 2 - 1;
      const py = ((e.clientY - top) / height) * 2 - 1;
      cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => {
        el.style.setProperty("--hero-px", px.toFixed(3));
        el.style.setProperty("--hero-py", py.toFixed(3));
      });
    },
    [motionOk]
  );

  const onPointerLeave = useCallback(() => {
    const el = stageRef.current;
    if (!el) return;
    cancelAnimationFrame(frame.current);
    el.style.setProperty("--hero-px", "0");
    el.style.setProperty("--hero-py", "0");
  }, []);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/compare?q=${encodeURIComponent(q)}` : "/compare");
  }

  return (
    <section
      ref={stageRef}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className="hero-stage relative isolate overflow-hidden"
    >
      {/* --- the stage: light, grain and depth, all decorative --- */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="hero-parallax-slow absolute inset-0">
          <div className="hero-aurora hero-aurora-a -left-24 top-[-12%] h-[26rem] w-[26rem] bg-teal-400/60 sm:h-[34rem] sm:w-[34rem]" />
          <div className="hero-aurora hero-aurora-b right-[-8%] top-[-18%] h-[24rem] w-[24rem] bg-cyan-400/55 sm:h-[32rem] sm:w-[32rem]" />
          <div className="hero-aurora hero-aurora-c bottom-[-25%] left-1/3 h-[22rem] w-[22rem] bg-emerald-400/45 sm:h-[30rem] sm:w-[30rem]" />
        </div>
        <div className="absolute inset-0 hero-grid" />
        <div className="hero-beam absolute -inset-y-24 left-0 w-1/3" />
        <div className="absolute inset-0 hero-vignette" />
        <div className="absolute inset-0 hero-grain" />
        {/* Dissolve into the white page below */}
        <div className="hero-fade absolute inset-x-0 bottom-0 h-44" />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24 lg:py-28">
        <div className="grid items-center gap-14 lg:grid-cols-[1.1fr_minmax(0,23rem)] lg:gap-12">
          {/* --- headline column --- */}
          <div className="min-w-0 text-center lg:text-left">
            <p className="hero-reveal">
              <span className="hero-glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-teal-100">
                <span className="relative flex h-2 w-2 items-center justify-center">
                  <span className="hero-pulse absolute h-2 w-2 rounded-full bg-teal-300" />
                  <span className="relative h-2 w-2 rounded-full bg-teal-300" />
                </span>
                UK grocery price intelligence
              </span>
            </p>

            <h1
              className="hero-reveal mt-5 font-display text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl"
              style={{ animationDelay: "90ms" }}
            >
              One list. Every supermarket.{" "}
              <span className="hero-sheen">The cheapest way to shop.</span>
            </h1>

            <p
              className="hero-reveal mx-auto mt-6 max-w-2xl text-base leading-relaxed text-teal-50/80 sm:text-lg lg:mx-0"
              style={{ animationDelay: "170ms" }}
            >
              Deal-spotting apps find you one cheap item. BasketWise prices your
              whole list at every major UK supermarket — loyalty prices,
              promotions and travel (est.) included — then shows the cheapest
              practical way to complete the entire shop.
            </p>

            <form
              role="search"
              onSubmit={onSubmit}
              className="hero-glass hero-searchbar hero-reveal mx-auto mt-9 flex w-full max-w-xl items-center gap-2 rounded-full p-1.5 pl-4 lg:mx-0"
              style={{ animationDelay: "250ms" }}
            >
              <Search className="h-5 w-5 shrink-0 text-teal-300" aria-hidden />
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
                // Without this the input's default intrinsic width (~20
                // characters) becomes the row's minimum and pushes the hero
                // wider than a narrow phone.
                size={1}
                className="min-w-0 flex-1 bg-transparent py-2.5 text-base text-white outline-none placeholder:text-teal-100/60"
              />
              <button
                type="submit"
                className="hero-cta inline-flex shrink-0 items-center gap-2 rounded-full bg-gradient-to-r from-teal-300 to-cyan-300 px-4 py-2.5 text-sm font-semibold text-teal-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-200 sm:px-6"
              >
                <Search className="h-4 w-4" aria-hidden />
                <span className="sm:hidden">Compare</span>
                <span className="hidden sm:inline">Compare prices</span>
              </button>
            </form>

            <div
              className="hero-reveal mt-6 flex flex-wrap items-center justify-center gap-2 lg:justify-start"
              style={{ animationDelay: "330ms" }}
            >
              <span className="text-sm text-teal-100/75">
                Browse a category:
              </span>
              {QUICK_CATEGORIES.map((c) => (
                <Link
                  key={c}
                  href={`/compare?category=${encodeURIComponent(c)}`}
                  className="hero-chip rounded-full border border-white/15 bg-white/8 px-3.5 py-1.5 text-sm font-medium text-teal-50 hover:border-teal-300/50 hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-200"
                >
                  {c}
                </Link>
              ))}
            </div>
          </div>

          {/* --- floating glass: live price check --- */}
          <div
            className="hero-reveal relative mx-auto w-full min-w-0 max-w-sm lg:max-w-none"
            style={{ animationDelay: "400ms" }}
          >
            <div
              className="hero-tilt hero-glass relative overflow-hidden rounded-3xl p-5 sm:p-6"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
              onFocusCapture={() => setPaused(true)}
              onBlurCapture={() => setPaused(false)}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-teal-200">
                  <span className="relative flex h-2 w-2 items-center justify-center">
                    <span className="hero-pulse absolute h-2 w-2 rounded-full bg-teal-300" />
                    <span className="relative h-2 w-2 rounded-full bg-teal-300" />
                  </span>
                  Live price check
                </span>
                <span className="inline-flex items-center gap-1.5 text-[11px] text-teal-100/60">
                  <Activity className="h-3.5 w-3.5" aria-hidden />
                  {STORE_COUNT} stores
                </span>
              </div>

              {/* Re-keyed so each product cross-fades in as it arrives */}
              <div key={spotlight.id} className="hero-swap mt-5">
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-2xl"
                  >
                    {spotlight.emoji}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-display text-lg font-bold tracking-tight text-white">
                      {spotlight.name}
                    </span>
                    <span className="block text-xs text-teal-100/60">
                      {spotlight.pack} · cheapest first
                    </span>
                  </span>
                </div>

                <ul className="mt-4 space-y-1.5">
                  {spotlight.rows.map((row, i) => {
                    const store = getStore(row.storeId);
                    const best = i === 0;
                    return (
                      <li
                        key={row.storeId}
                        className={`relative overflow-hidden rounded-xl border px-3 py-2 ${
                          best
                            ? "border-teal-300/45 bg-teal-300/10"
                            : "border-white/10 bg-white/5"
                        }`}
                      >
                        <span
                          aria-hidden
                          className="hero-bar absolute inset-y-0 left-0 bg-gradient-to-r from-white/12 to-transparent"
                          style={{
                            width: `${row.width}%`,
                            animationDelay: `${i * 90}ms`,
                          }}
                        />
                        <span className="relative flex items-center justify-between gap-3">
                          <span className="flex min-w-0 items-center gap-2 text-sm text-teal-50">
                            <span
                              aria-hidden
                              className="h-2 w-2 shrink-0 rounded-full ring-1 ring-white/40"
                              style={{ backgroundColor: store.color }}
                            />
                            <span className="truncate">{store.name}</span>
                            {best && (
                              <span className="shrink-0 rounded-full bg-teal-300 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-teal-950">
                                Cheapest
                              </span>
                            )}
                          </span>
                          <span
                            className={`shrink-0 font-display text-sm font-bold tracking-tight ${
                              best ? "text-white" : "text-teal-100/70"
                            }`}
                          >
                            {gbp(row.pence)}
                          </span>
                        </span>
                      </li>
                    );
                  })}
                </ul>

                {spotlight.runnerUp && (
                  <p className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-teal-300">
                    <TrendingDown className="h-4 w-4 shrink-0" aria-hidden />
                    {spotlight.savePence > 0
                      ? `Save ${gbp(spotlight.savePence)} vs ${spotlight.runnerUp}`
                      : `Price-matched by ${spotlight.runnerUp}`}
                  </p>
                )}
              </div>

              {motionOk && SPOTLIGHTS.length > 1 && (
                <div
                  aria-hidden
                  className="mt-5 h-px w-full overflow-hidden bg-white/10"
                >
                  <div
                    key={index}
                    className="hero-progress h-px bg-gradient-to-r from-teal-300 to-cyan-200"
                    style={
                      {
                        "--hero-rotate": `${ROTATE_MS}ms`,
                        animationPlayState: paused ? "paused" : "running",
                      } as CSSProperties
                    }
                  />
                </div>
              )}
            </div>

            {/* Second, faster-moving pane so the glass reads as layered */}
            <div className="hero-parallax-fast hero-glass absolute -bottom-5 -left-2 hidden items-center gap-2 rounded-2xl px-3.5 py-2 text-xs text-teal-50 sm:flex lg:-left-6">
              <span className="font-display text-base font-bold tracking-tight text-white">
                {PRICE_POINTS}
              </span>
              live prices compared
            </div>
          </div>
        </div>

        {/* --- catalogue stats --- */}
        <dl
          className="hero-glass hero-reveal mt-16 grid grid-cols-1 divide-y divide-white/10 rounded-2xl sm:grid-cols-3 sm:divide-x sm:divide-y-0"
          style={{ animationDelay: "480ms" }}
        >
          {[
            { label: "Products tracked", value: products },
            { label: "Supermarkets compared", value: stores },
            { label: "Prices last updated", value: UPDATED || "—" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col-reverse gap-0.5 px-6 py-5 text-center sm:text-left"
            >
              <dt className="text-xs font-semibold uppercase tracking-widest text-teal-100/75">
                {stat.label}
              </dt>
              <dd className="font-display text-2xl font-bold tracking-tight text-white">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>

        <div
          aria-hidden
          className="mt-10 flex justify-center text-teal-200/70 sm:mt-12"
        >
          <ChevronDown className="hero-bob h-5 w-5" />
        </div>
      </div>
    </section>
  );
}
