import Link from "next/link";
import { ShoppingBasket } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-16 bg-teal-950 text-teal-100">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/20 text-teal-300">
                <ShoppingBasket className="h-4 w-4" aria-hidden />
              </span>
              <span className="font-display text-lg font-bold tracking-tight text-white">
                BasketWise
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-teal-200/80">
              The grocery app that finds the cheapest practical way to complete
              your whole shop — not just the cheapest individual products.
            </p>
          </div>
          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm">
            <Link className="hover:text-white" href="/compare">Compare prices</Link>
            <Link className="hover:text-white" href="/list">My shopping list</Link>
            <Link className="hover:text-white" href="/optimise">Basket optimiser</Link>
            <Link className="hover:text-white" href="/settings">Loyalty cards</Link>
          </nav>
        </div>
        <p className="mt-10 border-t border-teal-800/60 pt-6 text-xs leading-relaxed text-teal-300/60">
          Demo pricing data for illustration. Prices are shown as last checked and
          may differ in store; always verify on the shelf or retailer site. Travel
          costs and times are estimates.
        </p>
      </div>
    </footer>
  );
}
