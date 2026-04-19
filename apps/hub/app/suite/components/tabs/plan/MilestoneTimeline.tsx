"use client";

import { motion } from "framer-motion";
import type { Milestone } from "@iesl/ui";

const TYPE_COLOR: Record<Milestone["type"], string> = {
  gate: "#6366F1",
  regulatory: "#EC4899",
  delivery: "#F59E0B",
  commissioning: "#10B981",
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
      {/* Track */}
      <div className="relative h-20">
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px bg-gradient-to-r from-white/5 via-white/15 to-white/5" />
        <div className="absolute inset-0">
          {sorted.map((m, i) => {
            const left = (m.dayOffset / span) * 100;
            const above = i % 2 === 0;
            const color = TYPE_COLOR[m.type] ?? "#6366F1";
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
                style={{ left: `${left}%` }}
              >
                <div
                  className="w-3 h-3 rounded-full ring-4 ring-[var(--color-bg)] shadow-lg"
                  style={{ background: color, boxShadow: `0 0 14px ${color}88` }}
                />
                <div
                  className={`absolute left-1/2 -translate-x-1/2 ${above ? "bottom-5" : "top-5"} text-[10px] font-mono whitespace-nowrap`}
                  style={{ color }}
                >
                  D+{m.dayOffset}
                </div>
                <div
                  className={`absolute left-1/2 -translate-x-1/2 ${above ? "bottom-10" : "top-10"} text-xs font-medium text-white/90 whitespace-nowrap max-w-[140px] truncate`}
                  title={m.name}
                >
                  {m.name}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Type legend */}
      <div className="flex flex-wrap gap-3 pt-2">
        {(Object.keys(TYPE_COLOR) as Milestone["type"][]).map((t) => (
          <div key={t} className="flex items-center gap-1.5 text-[10px] text-[var(--color-text-muted)]">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: TYPE_COLOR[t] }} />
            {TYPE_LABEL[t]}
          </div>
        ))}
      </div>
    </div>
  );
}
