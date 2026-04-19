"use client";

import { motion } from "framer-motion";
import type { ScheduleStrategy } from "@iesl/ui";

export function ScheduleStrategyCard({ strategy }: { strategy: ScheduleStrategy }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/8 bg-white/[0.03] p-6 space-y-5"
    >
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-indigo-500" />
        <div className="eyebrow">Scheduling strategy</div>
      </div>

      <div>
        <div className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] mb-1.5">Approach</div>
        <p className="text-sm text-white leading-relaxed font-display">{strategy.approach}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl bg-white/[0.03] p-4">
          <div className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] mb-1.5">Buffer strategy</div>
          <p className="text-xs text-[var(--color-text)] leading-relaxed">{strategy.bufferStrategy}</p>
        </div>
        <div className="rounded-xl bg-white/[0.03] p-4">
          <div className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] mb-1.5">Method</div>
          <p className="text-xs text-[var(--color-text)] leading-relaxed">{strategy.schedulingMethod}</p>
        </div>
      </div>

      {strategy.resourceConstraints.length > 0 && (
        <div>
          <div className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] mb-2">Constraints</div>
          <div className="space-y-1.5">
            {strategy.resourceConstraints.map((c, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-[var(--color-text-muted)] leading-relaxed">
                <span className="text-amber-400 shrink-0 mt-0.5">▸</span>
                <span>{c}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
