"use client";

import { motion } from "framer-motion";
import type { CostBreakdownItem } from "@iesl/ui";

const PALETTE = [
  "var(--color-brand)",
  "var(--color-accent)",
  "#8B5CF6",
  "var(--color-warn)",
  "var(--color-ok)",
  "#14B8A6",
  "#3B82F6",
  "#F97316",
  "var(--color-bad)",
  "#65A30D",
];

export function CostBreakdown({
  items,
  total,
}: {
  items: CostBreakdownItem[];
  total: number;
}) {
  if (!items.length) return null;
  const sum = items.reduce((a, b) => a + b.amountUSDm, 0);
  const sorted = [...items].sort((a, b) => b.amountUSDm - a.amountUSDm);
  const max = Math.max(...sorted.map((i) => i.amountUSDm), 1);

  let acc = 0;
  const segments = sorted.map((item, i) => {
    const start = acc / sum;
    acc += item.amountUSDm;
    const end = acc / sum;
    return { item, color: PALETTE[i % PALETTE.length], start, end };
  });

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="eyebrow">
            Cost build-up · total ${sum.toFixed(1)}m
          </span>
          {Math.abs(sum - total) / total > 0.05 && (
            <span className="chip chip-warn font-mono tabular-nums">
              ≈ ${total.toFixed(1)}m P50
            </span>
          )}
        </div>
        <div className="h-7 rounded-lg overflow-hidden flex bg-[var(--color-card-soft)]">
          {segments.map((s, i) => (
            <motion.div
              key={i}
              initial={{ width: 0 }}
              animate={{ width: `${(s.end - s.start) * 100}%` }}
              transition={{ duration: 0.6, delay: i * 0.04 }}
              className="h-full"
              style={{ background: s.color }}
              title={`${s.item.category} · $${s.item.amountUSDm.toFixed(1)}m`}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {sorted.map((item, i) => {
          const color = PALETTE[i % PALETTE.length];
          const pct = (item.amountUSDm / sum) * 100;
          const barPct = (item.amountUSDm / max) * 100;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="card-soft p-3"
            >
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
                  <span className="text-[13.5px] text-[var(--color-ink)] truncate">
                    {item.category}
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0 font-mono text-[12px] tabular-nums">
                  <span className="text-[var(--color-ink-4)]">{pct.toFixed(0)}%</span>
                  <span className="text-[var(--color-ink)] font-semibold">
                    ${item.amountUSDm.toFixed(1)}m
                  </span>
                </div>
              </div>
              <div className="h-1 rounded-full bg-[var(--color-line)] overflow-hidden mb-1.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${barPct}%` }}
                  transition={{ duration: 0.6, delay: 0.2 + i * 0.04 }}
                  className="h-full rounded-full"
                  style={{ background: color }}
                />
              </div>
              <p className="text-[11.5px] text-[var(--color-ink-3)] leading-[1.55] pl-[18px]">
                {item.basis}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
