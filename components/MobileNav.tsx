"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ListChecks, Search, Settings, Sparkles } from "lucide-react";
import { useAppState } from "@/lib/app-state";

const TABS = [
  { href: "/", label: "Home", icon: Sparkles },
  { href: "/compare", label: "Compare", icon: Search },
  { href: "/list", label: "My list", icon: ListChecks },
  { href: "/settings", label: "Settings", icon: Settings },
];

/**
 * App-style bottom tab bar, shown on small screens only. Sits above the
 * iPhone home indicator via the safe-area inset.
 */
export default function MobileNav() {
  const pathname = usePathname();
  const { basketCount, hydrated } = useAppState();

  return (
    <nav
      aria-label="Primary"
      className="glass fixed inset-x-0 bottom-0 z-50 border-t border-teal-100 pb-[env(safe-area-inset-bottom)] sm:hidden"
    >
      <ul className="grid grid-cols-4">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`relative flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors ${
                  active ? "text-teal-700" : "text-slate-500 hover:text-teal-700"
                }`}
              >
                <span
                  className={`relative flex h-8 w-14 items-center justify-center rounded-full transition-colors ${
                    active ? "bg-teal-600 text-white" : ""
                  }`}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                  {href === "/list" && hydrated && basketCount > 0 && (
                    <span
                      aria-label={`${basketCount} items in list`}
                      className={`absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold ${
                        active
                          ? "bg-white text-teal-700 ring-1 ring-teal-200"
                          : "bg-teal-600 text-white"
                      }`}
                    >
                      {basketCount}
                    </span>
                  )}
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
