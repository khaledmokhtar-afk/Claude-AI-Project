"use client";

import { motion } from "framer-motion";
import type { Milestone } from "@iesl/ui";

const TYPE_COLOR: Record<Milestone["type"], string> = {
  gate: "var(--color-brand)",
  regulatory: "var(--color-accent)",
  delivery: "var(--color-warn)",
  commissioning: "var(--color-ok)",
};

const TYPE_LABEL: Record<Milestone["type"], string> = {
  gate: "Gate",
  regulatory: "Regulatory",
  delivery: "Delivery",
  commissioning: "Commissioning",
};

export function MilestoneTimeline({
  milestones,
  totalDays,
}: {
  milestones: Milestone[];
  totalDays: number;
}) {
  if (!milestones.length) return null;
  const sorted = [...milestones].sort((a, b) => a.dayOffset - b.dayOffset);
  const span = Math.max(totalDays, sorted[sorted.length - 1].dayOffset, 1);

  return (
    <div className="space-y-5">
      <div className="relative h-24 px-4">
        <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-px bg-[var(--color-line-strong)]" />
        <div className="absolute inset-x-4 inset-y-0">
          {sorted.map((m, i) => {
            const left = (m.dayOffset / span) * 100;
            const above = i % 2 === 0;
            const color = TYPE_COLOR[m.type] ?? "var(--color-brand)";
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.08 + i * 0.05 }}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
                style={{ left: `${left}%` }}
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    background: color,
                    boxShadow: "0 0 0 3px var(--color-bg), 0 0 0 4px var(--color-line)",
                  }}
                />
                <div
                  className={`absolute left-1/2 -translate-x-1/2 ${above ? "bottom-6" : "top-6"} text-[10px] font-mono whitespace-nowrap tabular-nums`}
                  style={{ color }}
                >
                  D+{m.dayOffset}
                </div>
                <div
                  className={`absolute left-1/2 -translate-x-1/2 ${above ? "bottom-11" : "top-11"} text-[12px] font-medium text-[var(--color-ink)] whitespace-nowrap max-w-[160px] truncate`}
                  title={m.name}
                >
                  {m.name}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 pt-2 border-t border-[var(--color-line)]">
        {(Object.keys(TYPE_COLOR) as Milestone["type"][]).map((t) => (
          <div key={t} className="flex items-center gap-1.5 text-[11px] text-[var(--color-ink-3)]">
            <span className="w-2 h-2 rounded-full" style={{ background: TYPE_COLOR[t] }} />
            {TYPE_LABEL[t]}
          </div>
        ))}
      </div>
    </div>
  );
}
