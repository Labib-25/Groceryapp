import type { MatchType } from "@/lib/types";

const LABELS: Record<MatchType, { label: string; className: string }> = {
  exact: { label: "Exact match", className: "bg-teal-50 text-teal-700 border-teal-200" },
  "own-brand": {
    label: "Own-brand equivalent",
    className: "bg-cyan-50 text-cyan-700 border-cyan-200",
  },
  budget: {
    label: "Budget alternative",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  premium: {
    label: "Premium alternative",
    className: "bg-violet-50 text-violet-700 border-violet-200",
  },
  similar: {
    label: "Similar product",
    className: "bg-slate-50 text-slate-600 border-slate-200",
  },
};

/** Match-confidence indicator so comparisons are honest about equivalence. */
export default function MatchBadge({ matchType }: { matchType: MatchType }) {
  const { label, className } = LABELS[matchType];
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${className}`}
    >
      {label}
    </span>
  );
}
