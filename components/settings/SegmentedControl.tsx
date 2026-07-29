"use client";

export interface SegmentedOption {
  value: number;
  /** Visible label, e.g. "£10.00" or "2 stores". */
  label: string;
  /** Screen-reader-only suffix, e.g. "per hour". */
  srSuffix?: string;
}

/**
 * A single-choice segmented button group. Each option is a real button with
 * aria-pressed, so it is keyboard- and screen-reader-friendly out of the box.
 */
export default function SegmentedControl({
  groupLabel,
  options,
  value,
  onChange,
}: {
  groupLabel: string;
  options: SegmentedOption[];
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div
      role="group"
      aria-label={groupLabel}
      className="inline-flex flex-wrap gap-1.5 rounded-full bg-slate-100 p-1.5"
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(opt.value)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 ${
              active
                ? "bg-teal-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-white hover:text-slate-900"
            }`}
          >
            {opt.label}
            {opt.srSuffix && <span className="sr-only"> {opt.srSuffix}</span>}
          </button>
        );
      })}
    </div>
  );
}
