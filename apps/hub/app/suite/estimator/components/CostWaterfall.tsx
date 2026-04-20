"use client";

import { motion } from "framer-motion";
import type { ProjectAnalysis } from "@iesl/ui";

type Estimate = ProjectAnalysis["estimate"];

export function CostWaterfall({ estimate }: { estimate: Estimate }) {
  const p50 = estimate.costUSDm.likely;
  const ctg = p50 * (estimate.contingencyPct / 100);
  const p80 = estimate.costUSDm.high;

  const steps = [
    { label: "Base P50", delta: p50, color: "var(--color-brand)" },
    { label: "+ Contingency", delta: ctg, color: "var(--color-accent)" },
    { label: "+ Upside risk", delta: Math.max(0, p80 - p50 - ctg), color: "var(--color-bad)" },
  ];
  const total = steps.reduce((s, x) => s + x.delta, 0);

  let cum = 0;
  const bars = steps.map((s) => {
    const left = (cum / total) * 100;
    const width = (s.delta / total) * 100;
    cum += s.delta;
    return { ...s, left, width };
  });

  return (
    <div>
      <p className="text-[12.5px] text-[var(--color-ink-3)] leading-[1.55] mb-4 max-w-2xl">
        Base plus contingency plus residual upside risk drives the P80 number executives
        underwrite.
      </p>
      <div className="relative h-10 mb-4 rounded-md overflow-hidden bg-[var(--color-card-soft)]">
        {bars.map((b, i) => (
          <motion.div
            key={i}
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: `${b.width}%`, opacity: 1 }}
            transition={{ delay: i * 0.15, duration: 0.5 }}
            className="absolute top-0 h-10 flex items-center px-3 text-[11px] font-medium"
            style={{
              left: `${b.left}%`,
              background: b.color,
              color: "white",
            }}
          >
            <span className="truncate">
              {b.label} · ${b.delta.toFixed(1)}m
            </span>
          </motion.div>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-2 text-[11.5px] font-mono tabular-nums">
        <span className="text-[var(--color-ink-4)]">$0m</span>
        <span style={{ color: "var(--color-brand-ink)" }}>P50 ${p50.toFixed(1)}m</span>
        <span style={{ color: "var(--color-accent)" }}>+Ctg ${(p50 + ctg).toFixed(1)}m</span>
        <span className="text-right" style={{ color: "var(--color-bad)" }}>P80 ${p80.toFixed(1)}m</span>
      </div>
    </div>
  );
}
