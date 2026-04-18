"use client";

import { motion } from "framer-motion";

export function Tornado({
  swing,
  baseCost,
}: {
  swing: { label: string; lowUSDm: number; highUSDm: number }[];
  baseCost: number;
}) {
  const sorted = [...swing].sort(
    (a, b) => Math.abs(b.highUSDm) + Math.abs(b.lowUSDm) - (Math.abs(a.highUSDm) + Math.abs(a.lowUSDm)),
  );
  const maxAbs = Math.max(
    ...swing.flatMap((s) => [Math.abs(s.lowUSDm), Math.abs(s.highUSDm)]),
    1,
  );

  return (
    <div className="glass p-5">
      <div className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] mb-1">
        Sensitivity — swing factors
      </div>
      <div className="text-sm text-[var(--color-text-muted)] mb-4">
        How much each factor could push cost vs. the P50 of ${baseCost.toFixed(1)}m.
      </div>

      <div className="flex flex-col gap-2">
        {sorted.map((s, i) => {
          const lowPct = (Math.abs(s.lowUSDm) / maxAbs) * 50;
          const highPct = (Math.abs(s.highUSDm) / maxAbs) * 50;
          return (
            <div key={s.label} className="relative">
              <div className="text-xs mb-1 flex justify-between">
                <span>{s.label}</span>
                <span className="font-mono text-[var(--color-text-muted)]">
                  {s.lowUSDm.toFixed(1)} / +{s.highUSDm.toFixed(1)}
                </span>
              </div>
              <div className="relative h-5 rounded" style={{ background: "var(--color-bg-soft)" }}>
                <div
                  className="absolute top-0 bottom-0 border-r border-[var(--color-border)]"
                  style={{ left: "50%" }}
                />
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${lowPct}%` }}
                  transition={{ delay: i * 0.08 }}
                  className="absolute top-0 bottom-0 rounded-l"
                  style={{
                    right: "50%",
                    background: "var(--color-pos)",
                    opacity: 0.7,
                  }}
                />
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${highPct}%` }}
                  transition={{ delay: i * 0.08 + 0.05 }}
                  className="absolute top-0 bottom-0 rounded-r"
                  style={{
                    left: "50%",
                    background: "var(--color-neg)",
                    opacity: 0.85,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
