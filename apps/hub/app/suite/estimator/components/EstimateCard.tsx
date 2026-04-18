"use client";

import { motion } from "framer-motion";
import { useAnimatedNumber, type ProjectAnalysis } from "@iesl/ui";

type Estimate = ProjectAnalysis["estimate"];

export function EstimateCard({ estimate, query }: { estimate: Estimate; query: string }) {
  const costLikely = useAnimatedNumber(estimate.costUSDm.likely, 900);
  const durLikely = useAnimatedNumber(estimate.durationMonths.likely, 700);
  const effLikely = useAnimatedNumber(estimate.effortPersonMonths.likely, 900);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass p-6 animate-fade-up"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
            Estimate — {estimate.projectType}
          </div>
          <p className="text-sm text-[var(--color-text-muted)] mt-1 max-w-2xl">
            {query.slice(0, 180)}
            {query.length > 180 ? "…" : ""}
          </p>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase text-[var(--color-text-muted)]">Contingency</div>
          <div className="text-2xl font-bold" style={{ color: "var(--color-accent)" }}>
            {estimate.contingencyPct}%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Bounds
          label="Cost"
          unit="USD m"
          low={estimate.costUSDm.low}
          likely={costLikely}
          high={estimate.costUSDm.high}
          tone="primary"
        />
        <Bounds
          label="Duration"
          unit="months"
          low={estimate.durationMonths.low}
          likely={durLikely}
          high={estimate.durationMonths.high}
          tone="accent"
          precision={0}
        />
        <Bounds
          label="Effort"
          unit="person-months"
          low={estimate.effortPersonMonths.low}
          likely={effLikely}
          high={estimate.effortPersonMonths.high}
          tone="primary"
          precision={0}
        />
      </div>

      <div className="mt-5 pt-5 border-t border-[var(--color-border)]">
        <div className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
          Narrative
        </div>
        <p className="text-sm">{estimate.narrative}</p>
      </div>

      <div className="mt-4">
        <div className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
          Top assumptions
        </div>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-1 text-sm">
          {estimate.assumptions.map((a, i) => (
            <li key={i} className="flex items-start gap-2">
              <span style={{ color: "var(--color-primary-soft)" }}>•</span>
              <span>{a}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 text-xs text-[var(--color-text-muted)]">
          <strong style={{ color: "var(--color-accent)" }}>Contingency rationale:</strong>{" "}
          {estimate.contingencyRationale}
        </div>
      </div>
    </motion.div>
  );
}

function Bounds({
  label,
  unit,
  low,
  likely,
  high,
  tone,
  precision = 1,
}: {
  label: string;
  unit: string;
  low: number;
  likely: number;
  high: number;
  tone: "primary" | "accent";
  precision?: number;
}) {
  const color = tone === "primary" ? "var(--color-primary-soft)" : "var(--color-accent)";
  return (
    <div
      className="rounded-lg border p-4"
      style={{
        background: "var(--color-bg-soft)",
        borderColor: "var(--color-border)",
      }}
    >
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
          {label}
        </div>
        <div className="text-[10px] text-[var(--color-text-muted)]">{unit}</div>
      </div>
      <div className="text-3xl font-bold font-mono mt-1" style={{ color }}>
        {likely.toFixed(precision)}
      </div>
      <div className="flex items-center gap-2 text-[11px] font-mono text-[var(--color-text-muted)] mt-1">
        <span>Low {low.toFixed(precision)}</span>
        <div className="flex-1 h-1 rounded-full" style={{ background: "var(--color-border)" }}>
          <div
            className="h-full rounded-full"
            style={{
              background: color,
              width: `${((likely - low) / Math.max(0.01, high - low)) * 100}%`,
            }}
          />
        </div>
        <span>High {high.toFixed(precision)}</span>
      </div>
    </div>
  );
}
