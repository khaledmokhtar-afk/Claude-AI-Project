"use client";

import { motion } from "framer-motion";
import type { HistoricalProject } from "@iesl/data";

export function AnalogList({ analogs }: { analogs: HistoricalProject[] }) {
  return (
    <div className="card p-6">
      <div className="eyebrow mb-4">
        Retrieved analogs · top {analogs.length} · budget vs actual
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {analogs.map((a, i) => {
          const over = a.actualUSDm > a.budgetUSDm * 1.03;
          const under = a.actualUSDm < a.budgetUSDm * 0.97;
          const outcomeChip =
            a.outcome === "Over-budget" || a.outcome === "Over-schedule"
              ? "chip-bad"
              : a.outcome === "Under-budget"
                ? "chip-ok"
                : "chip";
          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card-soft p-4"
            >
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-[13.5px] text-[var(--color-ink)] leading-snug">
                    {a.name}
                  </div>
                  <div className="text-[11px] text-[var(--color-ink-4)] mt-1 font-mono uppercase tracking-[0.1em]">
                    {a.projectType} · {a.yearCompleted}
                  </div>
                </div>
                <span className="chip chip-brand shrink-0 tabular-nums">{a.durationMonths}mo</span>
              </div>
              <div className="flex items-center gap-2 text-[11.5px] font-mono text-[var(--color-ink-3)] tabular-nums">
                <span>${a.budgetUSDm.toFixed(1)}m</span>
                <span className="text-[var(--color-ink-4)]">→</span>
                <span
                  style={{
                    color: over
                      ? "var(--color-bad)"
                      : under
                        ? "var(--color-ok)"
                        : "var(--color-ink)",
                  }}
                >
                  ${a.actualUSDm.toFixed(1)}m
                </span>
                <span className={`chip ${outcomeChip} ml-auto`}>{a.outcome}</span>
              </div>
              {a.lessons && (
                <div className="mt-2.5 text-[12px] text-[var(--color-ink-2)] leading-[1.5]">
                  <span className="text-[var(--color-ink-4)] font-mono text-[10px] uppercase tracking-[0.12em]">
                    Lesson ·{" "}
                  </span>
                  {a.lessons}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
