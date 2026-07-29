import { getProduct } from "@/lib/catalog";
import type { BasketPlan } from "@/lib/types";

/** Which of the three headline recommendations is selected. */
export type PlanKey = "cheapest" | "practical" | "convenient";

export const PLAN_TITLES: Record<PlanKey, string> = {
  cheapest: "Cheapest",
  practical: "Practical",
  convenient: "Convenient",
};

/**
 * Two recommendation slots can resolve to the same underlying plan
 * (e.g. one store is both cheapest and most convenient). Detect that so
 * the UI can say "Same as Cheapest" instead of pretending they differ.
 */
export function samePlan(a: BasketPlan, b: BasketPlan): boolean {
  return (
    a === b ||
    (a.kind === b.kind &&
      a.finalPence === b.finalPence &&
      a.stores.join("|") === b.stores.join("|") &&
      a.allocations.length === b.allocations.length)
  );
}

/** Canonical product names for a list of product IDs (for warnings). */
export function productNames(ids: string[]): string[] {
  return ids
    .map((id) => getProduct(id)?.name)
    .filter((n): n is string => n !== undefined);
}
