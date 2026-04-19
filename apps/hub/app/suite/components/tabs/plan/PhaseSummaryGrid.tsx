"use client";

import { motion } from "framer-motion";
import type { PhaseSummary } from "@iesl/ui";

const FLAG_COLOR: Record<string, { bg: string; fg: string; ring: string }> = {
  low:    { bg: "#10B98115", fg: "#34D399", ring: "#10B98140" },
  medium: { bg: "#F59E0B15", fg: "#FBBF24", ring: "#F59E0B40" },
  high:   { bg: "#EF444415", fg: "#F87171", ring: "#EF444440" },
};

export function PhaseSummaryGrid({ phases }: { phases: PhaseSummary[] }) {
  if (!phases.length) return null;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
      {phases.map((p, i) => {
        const flag = FLAG_COLOR[p.riskFlag ?? "medium"] ?? FLAG_COLOR.medium;
        return (
          <motion.div
            key={p.phaseId}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
            className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 flex flex-col gap-2 relative overflow-hidden"
          >
            <div
              className="absolute top-0 left-0 right-0 h-[2px]"
              style={{ background: flag.fg }}
            />
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-[var(--color-text-muted)]">PHASE {p.phaseId}</span>
              <span
                className="text-[9px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider"
                style={{ background: flag.bg, color: flag.fg, border: `1px solid ${flag.ring}` }}
              >
                {p.riskFlag ?? "medium"}
              </span>
            </div>
            <div className="text-sm font-semibold text-white leading-tight line-clamp-2">{p.name}</div>
            <div className="font-mono text-2xl text-[var(--color-text)] font-bold">
              {p.durationDays}<span className="text-sm text-[var(--color-text-muted)] ml-1">d</span>
            </div>
            <div>
              <div className="text-[9px] uppercase tracking-wider text-[var(--color-text-muted)] mb-1">Driver</div>
              <div className="text-[11px] text-[var(--color-text)] leading-snug line-clamp-2">{p.primaryDriver}</div>
            </div>
            {p.resourcesPeak.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {p.resourcesPeak.slice(0, 3).map((r) => (
                  <span
                    key={r}
                    className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-[var(--color-text-muted)]"
                  >
                    {r}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
