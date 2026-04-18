"use client";

import { motion } from "framer-motion";
import type { HistoricalProject } from "@iesl/data";

export function AnalogList({ analogs }: { analogs: HistoricalProject[] }) {
  return (
    <div className="glass p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
          Retrieved analogs · top {analogs.length}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {analogs.map((a, i) => {
          const outcomeTone =
            a.outcome === "Over-budget" || a.outcome === "Over-schedule"
              ? "var(--color-neg)"
              : a.outcome === "Under-budget"
                ? "var(--color-pos)"
                : "var(--color-text-muted)";
          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-soft)]"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-medium text-sm">{a.name}</div>
                  <div className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                    {a.projectType} · {a.yearCompleted}
                  </div>
                </div>
                <div
                  className="text-[10px] px-2 py-0.5 rounded shrink-0"
                  style={{ background: "rgba(234,179,8,0.12)", color: "var(--color-accent)" }}
                >
                  {a.durationMonths}mo
                </div>
              </div>
              <div className="mt-2 flex items-center gap-3 text-[11px] font-mono text-[var(--color-text-muted)]">
                <span>
                  Budget ${a.budgetUSDm.toFixed(1)}m → Actual{" "}
                  <span
                    style={{
                      color:
                        a.actualUSDm > a.budgetUSDm
                          ? "var(--color-neg)"
                          : a.actualUSDm < a.budgetUSDm
                            ? "var(--color-pos)"
                            : "var(--color-text)",
                    }}
                  >
                    ${a.actualUSDm.toFixed(1)}m
                  </span>
                </span>
              </div>
              <div className="mt-2 text-[11px]" style={{ color: outcomeTone }}>
                {a.outcome}
              </div>
              {a.lessons && (
                <div className="mt-1 text-[11px] text-[var(--color-text)]">
                  <span className="text-[var(--color-text-muted)]">Lesson: </span>
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
