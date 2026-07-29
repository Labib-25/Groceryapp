import Link from "next/link";
import { CreditCard, ShoppingBasket } from "lucide-react";

/** Closing call-to-action band on deep teal. */
export default function ClosingCta() {
  return (
    <section className="bg-teal-950 text-white">
      <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-teal-300">
          Start saving on the whole shop
        </p>
        <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Ready to shop smarter?
        </h2>
        <p className="mx-auto mt-4 max-w-xl leading-relaxed text-teal-100">
          Build your list once and let BasketWise work out the cheapest
          practical way to buy it. Add your loyalty cards so every Clubcard and
          Nectar price is counted in your totals.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/list"
            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-teal-900 transition-colors hover:bg-teal-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <ShoppingBasket className="h-4 w-4" aria-hidden />
            Start your list
          </Link>
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <CreditCard className="h-4 w-4" aria-hidden />
            Add your loyalty cards
          </Link>
        </div>
        <p className="mt-6 text-xs text-teal-300/80">
          Free to use · No account needed · Travel figures are estimates
        </p>
      </div>
    </section>
  );
}
