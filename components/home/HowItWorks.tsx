import { ClipboardList, Route, Store } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ALL_STORES } from "@/lib/stores";
import SectionHeading from "@/components/SectionHeading";

interface Step {
  icon: LucideIcon;
  title: string;
  body: string;
}

const STEPS: Step[] = [
  {
    icon: ClipboardList,
    title: "Build your list",
    body: "Add everything you actually buy — bananas, bin bags, the lot — to one shopping list. No account needed.",
  },
  {
    icon: Store,
    title: "We price it at every store",
    body: `Every item is matched across ${ALL_STORES.length} supermarkets, own-brand equivalents included, with loyalty prices and promotions labelled honestly.`,
  },
  {
    icon: Route,
    title: "Pick Cheapest, Practical or Convenient",
    body: "Three ready-made plans: the rock-bottom total, the best value within your store cap, or one easy stop — with travel costs (est.) counted.",
  },
];

/** Three-step explainer for the whole-shop optimisation flow. */
export default function HowItWorks() {
  return (
    <section className="mesh-teal">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <SectionHeading
          eyebrow="How BasketWise works"
          title="From list to plan in three steps"
          description="We optimise the whole shop, not just single bargains — so an extra store stop only makes the plan when the saving pays for the trip."
        />

        <ol className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <li key={step.title} className="h-full">
                <div className="flex h-full flex-col rounded-2xl border border-teal-100 bg-white p-6 shadow-sm transition hover:border-teal-200 hover:shadow-md">
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden
                      className="glow-teal flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 font-display text-lg font-bold text-white"
                    >
                      {i + 1}
                    </span>
                    <Icon className="h-6 w-6 text-teal-600" aria-hidden />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-bold tracking-tight text-slate-900">
                    <span className="sr-only">Step {i + 1}: </span>
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {step.body}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
