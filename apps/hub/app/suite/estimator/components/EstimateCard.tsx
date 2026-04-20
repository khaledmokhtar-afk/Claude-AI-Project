"use client";

import { useAnimatedNumber, type ProjectAnalysis } from "@iesl/ui";

type Estimate = ProjectAnalysis["estimate"];

export function EstimateCard({ estimate, query }: { estimate: Estimate; query: string }) {
  const costLikely = useAnimatedNumber(estimate.costUSDm.likely, 900);
  const durLikely = useAnimatedNumber(estimate.durationMonths.likely, 700);
  const effLikely = useAnimatedNumber(estimate.effortPersonMonths.likely, 900);

  return (
    <div>
      <div className="flex items-start justify-between gap-6 mb-6 flex-wrap">
        <div className="min-w-0 flex-1">
          <div className="eyebrow eyebrow-brand mb-2">Estimate · {estimate.projectType}</div>
          <p className="text-[13.5px] text-[var(--color-ink-3)] leading-[1.6] max-w-2xl">
            {query.slice(0, 200)}
            {query.length > 200 ? "…" : ""}
          </p>
        </div>
        <div className="card-soft px-4 py-3 text-right shrink-0">
          <div className="eyebrow mb-1">Contingency</div>
          <div className="font-display text-[28px] leading-none tabular-nums" style={{ color: "var(--color-accent)" }}>
            {estimate.contingencyPct}%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Bounds
          label="Cost"
          unit="USD m"
          low={estimate.costUSDm.low}
          likely={costLikely}
          high={estimate.costUSDm.high}
          tone="brand"
          prefix="$"
        />
        <Bounds
          label="Duration"
          unit="months"
          low={estimate.durationMonths.low}
          likely={durLikely}
          high={estimate.durationMonths.high}
          tone="ink"
          precision={0}
        />
        <Bounds
          label="Effort"
          unit="person-months"
          low={estimate.effortPersonMonths.low}
          likely={effLikely}
          high={estimate.effortPersonMonths.high}
          tone="brand"
          precision={0}
        />
      </div>

      {estimate.narrative && (
        <div className="mt-6 pt-6 border-t border-[var(--color-line)]">
          <div className="eyebrow mb-2">Narrative</div>
          <p className="text-[14px] text-[var(--color-ink-2)] leading-[1.65] max-w-3xl">
            {estimate.narrative}
          </p>
        </div>
      )}
    </div>
  );
}

function Bounds({
  label,
  unit,
  low,
  likely,
  high,
  tone,
  prefix = "",
  precision = 1,
}: {
  label: string;
  unit: string;
  low: number;
  likely: number;
  high: number;
  tone: "brand" | "ink";
  prefix?: string;
  precision?: number;
}) {
  const color = tone === "brand" ? "var(--color-brand-ink)" : "var(--color-ink)";
  return (
    <div className="card-soft p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="eyebrow">{label}</div>
        <div className="text-[10px] text-[var(--color-ink-4)] font-mono uppercase tracking-[0.12em]">
          {unit}
        </div>
      </div>
      <div className="font-display text-[30px] leading-none tabular-nums" style={{ color }}>
        {prefix}{likely.toFixed(precision)}
      </div>
      <div className="flex items-center gap-2 text-[11px] font-mono text-[var(--color-ink-4)] mt-3 tabular-nums">
        <span>{prefix}{low.toFixed(precision)}</span>
        <div className="flex-1 h-1 rounded-full bg-[var(--color-line)] overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              background: tone === "brand" ? "var(--color-brand)" : "var(--color-ink)",
              width: `${((likely - low) / Math.max(0.01, high - low)) * 100}%`,
            }}
          />
        </div>
        <span>{prefix}{high.toFixed(precision)}</span>
      </div>
    </div>
  );
}
