"use client";

import { motion } from "framer-motion";
import type { ProjectAnalysis } from "@iesl/ui";

type Estimate = ProjectAnalysis["estimate"];

export function CostWaterfall({ estimate }: { estimate: Estimate }) {
  const p50 = estimate.costUSDm.likely;
  const ctg = p50 * (estimate.contingencyPct / 100);
  const p80 = estimate.costUSDm.high;

  const steps = [
    { label: "Base P50", delta: p50, color: "var(--color-primary)" },
    { label: "+ Contingency", delta: ctg, color: "var(--color-accent)" },
    { label: "+ Upside risk", delta: Math.max(0, p80 - p50 - ctg), color: "var(--color-neg)" },
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
    <div className="glass p-5">
      <div className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] mb-1">
        Cost build-up — P50 → P80
      </div>
      <div className="text-sm text-[var(--color-text-muted)] mb-4">
        Base plus contingency plus residual upside risk drives the P80 number executives will
        underwrite.
      </div>
      <div className="relative h-10 mb-3">
        {bars.map((b, i) => (
          <motion.div
            key={i}
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: `${b.width}%`, opacity: 1 }}
            transition={{ delay: i * 0.2, duration: 0.5 }}
            className="absolute top-0 h-10 rounded flex items-center px-3 text-[11px] font-medium"
            style={{
              left: `${b.left}%`,
              background: b.color,
              color:
                b.color === "var(--color-accent)" ? "var(--color-bg)" : "white",
              boxShadow: `0 0 20px -6px ${b.color}`,
            }}
          >
            <span className="truncate">
              {b.label} · ${b.delta.toFixed(1)}m
            </span>
          </motion.div>
        ))}
      </div>
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="text-[var(--color-text-muted)]">$0m</span>
        <span style={{ color: "var(--color-primary-soft)" }}>P50 ${p50.toFixed(1)}m</span>
        <span style={{ color: "var(--color-accent)" }}>+Ctg ${(p50 + ctg).toFixed(1)}m</span>
        <span style={{ color: "var(--color-neg)" }}>P80 ${p80.toFixed(1)}m</span>
      </div>
    </div>
  );
}
