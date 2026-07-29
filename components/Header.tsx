"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ListChecks, Search, Settings, ShoppingBasket, Sparkles } from "lucide-react";
import { useAppState } from "@/lib/app-state";

const NAV = [
  { href: "/", label: "Home", icon: Sparkles },
  { href: "/compare", label: "Compare", icon: Search },
  { href: "/list", label: "My list", icon: ListChecks },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Header() {
  const pathname = usePathname();
  const { basketCount, hydrated } = useAppState();

  return (
    <header className="glass sticky top-0 z-50 border-b border-teal-100">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2" aria-label="BasketWise home">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 text-white glow-teal">
            <ShoppingBasket className="h-5 w-5" aria-hidden />
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-teal-950">
            Basket<span className="text-teal-600">Wise</span>
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 sm:flex">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`relative flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-teal-600 text-white"
                    : "text-slate-600 hover:bg-teal-50 hover:text-teal-800"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden />
                <span className="hidden sm:inline">{label}</span>
                {href === "/list" && hydrated && basketCount > 0 && (
                  <span
                    aria-label={`${basketCount} items in list`}
                    className={`ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold ${
                      active ? "bg-white text-teal-700" : "bg-teal-600 text-white"
                    }`}
                  >
                    {basketCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
