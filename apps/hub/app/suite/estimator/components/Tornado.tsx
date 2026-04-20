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
    <div>
      <p className="text-[12.5px] text-[var(--color-ink-3)] leading-[1.55] mb-4 max-w-2xl">
        How much each factor could push cost vs. the P50 of ${baseCost.toFixed(1)}m.
      </p>

      <div className="flex flex-col gap-2.5">
        {sorted.map((s, i) => {
          const lowPct = (Math.abs(s.lowUSDm) / maxAbs) * 50;
          const highPct = (Math.abs(s.highUSDm) / maxAbs) * 50;
          return (
            <div key={s.label} className="relative">
              <div className="text-[12px] mb-1.5 flex justify-between">
                <span className="text-[var(--color-ink-2)]">{s.label}</span>
                <span className="font-mono text-[var(--color-ink-4)] tabular-nums">
                  {s.lowUSDm.toFixed(1)} / +{s.highUSDm.toFixed(1)}
                </span>
              </div>
              <div className="relative h-5 rounded bg-[var(--color-card-soft)]">
                <div
                  className="absolute top-0 bottom-0 border-r border-[var(--color-line-strong)]"
                  style={{ left: "50%" }}
                />
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${lowPct}%` }}
                  transition={{ delay: i * 0.07 }}
                  className="absolute top-0 bottom-0 rounded-l"
                  style={{
                    right: "50%",
                    background: "var(--color-ok)",
                    opacity: 0.85,
                  }}
                />
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${highPct}%` }}
                  transition={{ delay: i * 0.07 + 0.05 }}
                  className="absolute top-0 bottom-0 rounded-r"
                  style={{
                    left: "50%",
                    background: "var(--color-bad)",
                    opacity: 0.9,
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
