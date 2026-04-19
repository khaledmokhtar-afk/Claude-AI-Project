"use client";

import { motion } from "framer-motion";
import type { CostBreakdownItem } from "@iesl/ui";

const PALETTE = [
  "#6366F1", "#8B5CF6", "#EC4899", "#F59E0B", "#10B981",
  "#14B8A6", "#3B82F6", "#F97316", "#EF4444", "#84CC16",
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

  // Build stacked horizontal bar fractions
  let acc = 0;
  const segments = sorted.map((item, i) => {
    const start = acc / sum;
    acc += item.amountUSDm;
    const end = acc / sum;
    return { item, color: PALETTE[i % PALETTE.length], start, end };
  });

  return (
    <div className="space-y-5">
      {/* Stacked bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">
            Cost build-up — total ${sum.toFixed(1)}m
          </span>
          {Math.abs(sum - total) / total > 0.05 && (
            <span className="text-[10px] text-amber-400 font-mono">
              ≈ ${total.toFixed(1)}m P50
            </span>
          )}
        </div>
        <div className="h-7 rounded-lg overflow-hidden flex bg-white/5">
          {segments.map((s, i) => (
            <motion.div
              key={i}
              initial={{ width: 0 }}
              animate={{ width: `${(s.end - s.start) * 100}%` }}
              transition={{ duration: 0.6, delay: i * 0.04 }}
              className="h-full relative group"
              style={{ background: s.color }}
              title={`${s.item.category} · $${s.item.amountUSDm.toFixed(1)}m`}
            >
              <div className="absolute inset-0 hover:bg-white/10 transition-colors" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Detailed list */}
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
              className="rounded-xl bg-white/[0.025] p-3 hover:bg-white/[0.04] transition-colors"
            >
              <div className="flex items-center justify-between gap-3 mb-1.5">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
                  <span className="text-sm text-[var(--color-text)] truncate">{item.category}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0 font-mono text-xs">
                  <span className="text-[var(--color-text-muted)]">{pct.toFixed(0)}%</span>
                  <span className="text-white font-bold">${item.amountUSDm.toFixed(1)}m</span>
                </div>
              </div>
              <div className="h-1 rounded-full bg-white/5 overflow-hidden mb-1.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${barPct}%` }}
                  transition={{ duration: 0.6, delay: 0.2 + i * 0.04 }}
                  className="h-full rounded-full"
                  style={{ background: color }}
                />
              </div>
              <p className="text-[11px] text-[var(--color-text-muted)] leading-relaxed pl-4.5">
                {item.basis}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
