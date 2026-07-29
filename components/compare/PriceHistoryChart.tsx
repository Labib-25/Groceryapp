"use client";

import { useMemo, useState } from "react";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import { gbp } from "@/lib/format";
import type { PriceHistoryPoint } from "@/lib/types";

const TEAL = "#0d9488"; // teal-600 — single series, brand hue
const GRID = "#e2e8f0"; // slate-200, recessive
const INK_MUTED = "#64748b"; // slate-500 — labels wear ink, not series colour

const W = 640;
const H = 230;
const M = { top: 30, right: 14, bottom: 32, left: 14 };
const innerW = W - M.left - M.right;
const innerH = H - M.top - M.bottom;

/** "2026-02" → "Feb 2026" */
function monthLabel(month: string): string {
  const [y, m] = month.split("-");
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

interface Pt {
  x: number;
  y: number;
  month: string;
  pence: number;
}

/**
 * Single-series price-history line chart (SVG, no chart library) with a
 * per-point hover tooltip, min/max/current annotations, an aria summary and a
 * visually-hidden data table — plus lowest/average stat tiles and a
 * plain-English "good time to buy?" verdict.
 */
export default function PriceHistoryChart({
  history,
  productName,
}: {
  history: PriceHistoryPoint[];
  productName: string;
}) {
  const [hover, setHover] = useState<number | null>(null);

  const model = useMemo(() => {
    const prices = history.map((h) => h.pricePence);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const avg = Math.round(prices.reduce((s, p) => s + p, 0) / prices.length);
    const current = prices[prices.length - 1];
    const span = max - min;
    const pad = Math.max(Math.round(span * 0.2), Math.round(max * 0.04), 10);
    const lo = Math.max(0, min - pad);
    const hi = max + pad;

    const points: Pt[] = history.map((h, i) => ({
      x:
        M.left +
        (history.length === 1 ? innerW / 2 : (i * innerW) / (history.length - 1)),
      y: M.top + ((hi - h.pricePence) / (hi - lo)) * innerH,
      month: h.month,
      pence: h.pricePence,
    }));

    const line = points
      .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
      .join(" ");
    const baseline = M.top + innerH;
    const first = points[0];
    const last = points[points.length - 1];
    const area = `${line} L${last.x.toFixed(1)},${baseline} L${first.x.toFixed(
      1
    )},${baseline} Z`;

    const minIdx = prices.indexOf(min);
    const maxIdx = prices.indexOf(max);
    return { prices, min, max, avg, current, points, line, area, minIdx, maxIdx };
  }, [history]);

  const { min, max, avg, current, points, line, area, minIdx, maxIdx } = model;
  const lastIdx = history.length - 1;
  const lowestMonth = history[minIdx].month;

  // Annotations: min, max and current — merged when they share a point.
  const annotations = useMemo(() => {
    const list: { idx: number; text: string; above: boolean }[] = [];
    const nowOnMax = lastIdx === maxIdx;
    const nowOnMin = lastIdx === minIdx;
    list.push({
      idx: maxIdx,
      text: nowOnMax ? `High ${gbp(max)} (now)` : `High ${gbp(max)}`,
      above: true,
    });
    if (minIdx !== maxIdx) {
      list.push({
        idx: minIdx,
        text: nowOnMin ? `Low ${gbp(min)} (now)` : `Low ${gbp(min)}`,
        above: false,
      });
    }
    if (!nowOnMax && !nowOnMin) {
      list.push({ idx: lastIdx, text: `Now ${gbp(current)}`, above: true });
    }
    return list;
  }, [minIdx, maxIdx, lastIdx, min, max, current]);

  const trend =
    current > history[0].pricePence * 1.03
      ? "rising"
      : current < history[0].pricePence * 0.97
        ? "falling"
        : "broadly steady";

  const summary = `Price history for ${productName} over ${
    history.length
  } months, ${monthLabel(history[0].month)} to ${monthLabel(
    history[lastIdx].month
  )}: lowest ${gbp(min)}, highest ${gbp(max)}, currently ${gbp(
    current
  )} — ${trend} over the period.`;

  // Plain-English verdict: current price vs the shown-period average.
  const verdict =
    current <= avg * 0.97
      ? {
          tone: "good" as const,
          Icon: TrendingDown,
          text: `Today's ${gbp(current)} is below the ${gbp(
            avg
          )} average for this period — a good time to buy.`,
        }
      : current >= avg * 1.03
        ? {
            tone: "poor" as const,
            Icon: TrendingUp,
            text: `Today's ${gbp(current)} is above the ${gbp(
              avg
            )} average for this period — a poor time to buy if you can wait.`,
          }
        : {
            tone: "neutral" as const,
            Icon: Minus,
            text: `Today's ${gbp(current)} is around the ${gbp(
              avg
            )} average for this period — a typical price.`,
          };

  const hovered = hover !== null ? points[hover] : null;

  const labelAnchor = (idx: number): "start" | "middle" | "end" =>
    idx === 0 ? "start" : idx === lastIdx ? "end" : "middle";

  return (
    <div>
      <div className="relative rounded-2xl border border-teal-100 bg-white p-4 shadow-sm">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full"
          role="img"
          aria-label={summary}
        >
          {/* Subtle horizontal gridlines only */}
          {[0, 1, 2, 3].map((k) => {
            const y = M.top + (k * innerH) / 3;
            return (
              <line
                key={k}
                x1={M.left}
                x2={M.left + innerW}
                y1={y}
                y2={y}
                stroke={GRID}
                strokeWidth={1}
              />
            );
          })}

          {/* Soft area fill + 2px line */}
          <path d={area} fill={TEAL} opacity={0.1} />
          <path
            d={line}
            fill="none"
            stroke={TEAL}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* Anchor dots for the annotated points */}
          {annotations.map((a) => (
            <circle
              key={`dot-${a.idx}`}
              cx={points[a.idx].x}
              cy={points[a.idx].y}
              r={3}
              fill={TEAL}
            />
          ))}

          {/* Min / max / current annotations — small slate text */}
          {annotations.map((a) => (
            <text
              key={`ann-${a.idx}`}
              x={points[a.idx].x}
              y={a.above ? points[a.idx].y - 10 : points[a.idx].y + 17}
              textAnchor={labelAnchor(a.idx)}
              fontSize={11}
              fill={INK_MUTED}
              className="font-medium"
            >
              {a.text}
            </text>
          ))}

          {/* Month labels at start and end only */}
          <text
            x={M.left}
            y={H - 8}
            textAnchor="start"
            fontSize={11}
            fill={INK_MUTED}
          >
            {monthLabel(history[0].month)}
          </text>
          <text
            x={M.left + innerW}
            y={H - 8}
            textAnchor="end"
            fontSize={11}
            fill={INK_MUTED}
          >
            {monthLabel(history[lastIdx].month)}
          </text>

          {/* Hover marker */}
          {hovered && (
            <circle
              cx={hovered.x}
              cy={hovered.y}
              r={4.5}
              fill="#ffffff"
              stroke={TEAL}
              strokeWidth={2.5}
            />
          )}

          {/* Invisible hit areas, comfortably larger than the marks */}
          {points.map((p, i) => (
            <circle
              key={`hit-${p.month}`}
              cx={p.x}
              cy={p.y}
              r={16}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            />
          ))}
        </svg>

        {/* Tooltip */}
        {hovered && (
          <div
            className="pointer-events-none absolute z-10 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs text-white shadow-lg"
            style={{
              left: `${(hovered.x / W) * 100}%`,
              top: `${(hovered.y / H) * 100}%`,
              transform: `translate(${
                hover === 0 ? "-12%" : hover === lastIdx ? "-88%" : "-50%"
              }, -135%)`,
            }}
          >
            <span className="font-semibold">{monthLabel(hovered.month)}</span>{" "}
            · {gbp(hovered.pence)}
          </div>
        )}

        {/* Table view of the same data for screen readers */}
        <table className="sr-only">
          <caption>
            Monthly cheapest-store price for {productName} (demo data)
          </caption>
          <thead>
            <tr>
              <th scope="col">Month</th>
              <th scope="col">Price</th>
            </tr>
          </thead>
          <tbody>
            {history.map((h) => (
              <tr key={h.month}>
                <th scope="row">{monthLabel(h.month)}</th>
                <td>{gbp(h.pricePence)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Stats + verdict */}
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-teal-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-600">
            Lowest in shown period
          </p>
          <p className="mt-1 font-display text-xl font-bold tracking-tight text-slate-900">
            {gbp(min)}
          </p>
          <p className="text-xs text-slate-500">{monthLabel(lowestMonth)}</p>
        </div>
        <div className="rounded-2xl border border-teal-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-600">
            Average
          </p>
          <p className="mt-1 font-display text-xl font-bold tracking-tight text-slate-900">
            {gbp(avg)}
          </p>
          <p className="text-xs text-slate-500">
            Across {history.length} months
          </p>
        </div>
        <div
          className={`rounded-2xl border p-4 shadow-sm ${
            verdict.tone === "good"
              ? "border-teal-200 bg-teal-50"
              : verdict.tone === "poor"
                ? "border-amber-200 bg-amber-50"
                : "border-slate-200 bg-slate-50"
          }`}
        >
          <p
            className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest ${
              verdict.tone === "good"
                ? "text-teal-700"
                : verdict.tone === "poor"
                  ? "text-amber-700"
                  : "text-slate-600"
            }`}
          >
            <verdict.Icon className="h-3.5 w-3.5" aria-hidden />
            Worth buying now?
          </p>
          <p
            className={`mt-1 text-sm leading-relaxed ${
              verdict.tone === "good"
                ? "text-teal-900"
                : verdict.tone === "poor"
                  ? "text-amber-900"
                  : "text-slate-700"
            }`}
          >
            {verdict.text}
          </p>
        </div>
      </div>
    </div>
  );
}
