"use client";

import { Check } from "lucide-react";
import { useAppState } from "@/lib/app-state";
import type { DietTag } from "@/lib/types";

const DIET_TAGS: { tag: DietTag; label: string }[] = [
  { tag: "vegan", label: "Vegan" },
  { tag: "vegetarian", label: "Vegetarian" },
  { tag: "gluten-free", label: "Gluten-free" },
  { tag: "dairy-free", label: "Dairy-free" },
  { tag: "organic", label: "Organic" },
  { tag: "high-protein", label: "High-protein" },
  { tag: "low-sugar", label: "Low-sugar" },
  { tag: "halal", label: "Halal" },
  { tag: "kosher", label: "Kosher" },
];

/** Toggle chips for every dietary preference, wired to prefs.dietTags. */
export default function DietTagChips() {
  const { prefs, toggleDietTag } = useAppState();

  return (
    <ul className="flex flex-wrap gap-2">
      {DIET_TAGS.map(({ tag, label }) => {
        const active = prefs.dietTags.includes(tag);
        return (
          <li key={tag}>
            <button
              type="button"
              aria-pressed={active}
              onClick={() => toggleDietTag(tag)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 ${
                active
                  ? "border-teal-600 bg-teal-600 text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-700 hover:border-teal-200 hover:bg-teal-50"
              }`}
            >
              {active && <Check className="h-4 w-4" aria-hidden strokeWidth={3} />}
              {label}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
