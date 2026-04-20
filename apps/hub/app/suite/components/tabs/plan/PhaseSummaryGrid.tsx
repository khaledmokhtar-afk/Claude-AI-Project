"use client";

import { motion } from "framer-motion";
import type { PhaseSummary } from "@iesl/ui";

const FLAG_META: Record<string, { tone: string; chip: string; label: string }> = {
  low:    { tone: "var(--color-ok)",   chip: "chip-ok",   label: "low" },
  medium: { tone: "var(--color-warn)", chip: "chip-warn", label: "medium" },
  high:   { tone: "var(--color-bad)",  chip: "chip-bad",  label: "high" },
};

export function PhaseSummaryGrid({ phases }: { phases: PhaseSummary[] }) {
  if (!phases.length) return null;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
      {phases.map((p, i) => {
        const flag = FLAG_META[p.riskFlag ?? "medium"] ?? FLAG_META.medium;
        return (
          <motion.div
            key={p.phaseId}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
            className="card p-4 flex flex-col gap-2.5 relative overflow-hidden"
          >
            <div
              className="absolute top-0 left-0 right-0 h-[3px]"
              style={{ background: flag.tone }}
            />
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] font-mono text-[var(--color-ink-4)] uppercase tracking-[0.12em]">
                Phase {p.phaseId}
              </span>
              <span className={`chip ${flag.chip} font-semibold`}>{flag.label}</span>
            </div>
            <div className="text-[14px] font-semibold text-[var(--color-ink)] leading-tight line-clamp-2">
              {p.name}
            </div>
            <div className="font-display text-[28px] leading-none tabular-nums text-[var(--color-ink)]">
              {p.durationDays}
              <span className="font-sans text-[13px] text-[var(--color-ink-3)] ml-1">d</span>
            </div>
            <div>
              <div className="eyebrow mb-1">Driver</div>
              <div className="text-[12px] text-[var(--color-ink-2)] leading-snug line-clamp-2">
                {p.primaryDriver}
              </div>
            </div>
            {p.resourcesPeak.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1 mt-auto">
                {p.resourcesPeak.slice(0, 3).map((r) => (
                  <span key={r} className="chip text-[10px]">{r}</span>
                ))}
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
