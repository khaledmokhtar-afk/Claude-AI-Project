"use client";

import { motion } from "framer-motion";
import type { ScheduleStrategy } from "@iesl/ui";

export function ScheduleStrategyCard({ strategy }: { strategy: ScheduleStrategy }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6 space-y-5"
    >
      <div className="flex items-center gap-2">
        <span className="dot dot-brand" />
        <div className="eyebrow eyebrow-brand">Scheduling strategy</div>
      </div>

      <div>
        <div className="eyebrow mb-1.5">Approach</div>
        <p className="font-display text-[18px] leading-[1.4] text-[var(--color-ink)] italic">
          &ldquo;{strategy.approach}&rdquo;
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="card-soft p-4">
          <div className="eyebrow mb-1.5">Buffer strategy</div>
          <p className="text-[12.5px] text-[var(--color-ink-2)] leading-[1.55]">
            {strategy.bufferStrategy}
          </p>
        </div>
        <div className="card-soft p-4">
          <div className="eyebrow mb-1.5">Method</div>
          <p className="text-[12.5px] text-[var(--color-ink-2)] leading-[1.55]">
            {strategy.schedulingMethod}
          </p>
        </div>
      </div>

      {strategy.resourceConstraints.length > 0 && (
        <div>
          <div className="eyebrow mb-2">Constraints</div>
          <div className="space-y-1.5">
            {strategy.resourceConstraints.map((c, i) => (
              <div
                key={i}
                className="flex items-start gap-2 text-[12.5px] text-[var(--color-ink-2)] leading-[1.55]"
              >
                <span className="shrink-0 mt-0.5" style={{ color: "var(--color-warn)" }}>▸</span>
                <span>{c}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
