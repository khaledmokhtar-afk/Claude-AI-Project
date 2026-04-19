"use client";

import { motion } from "framer-motion";
import type { ResourceLoad, WBSTask } from "@iesl/ui";

function deriveLoad(tasks: WBSTask[]): ResourceLoad[] {
  const map = new Map<string, { totalDays: number; tasks: WBSTask[] }>();
  for (const t of tasks) {
    if (!t.resource) continue;
    const entry = map.get(t.resource) ?? { totalDays: 0, tasks: [] };
    entry.totalDays += t.durationDays;
    entry.tasks.push(t);
    map.set(t.resource, entry);
  }
  return Array.from(map.entries()).map(([resource, v]) => ({
    resource,
    totalDays: v.totalDays,
    peakConcurrency: 1,
  }));
}

export function ResourceHistogram({
  load,
  tasks,
}: {
  load?: ResourceLoad[];
  tasks: WBSTask[];
}) {
  const data = (load && load.length ? load : deriveLoad(tasks))
    .sort((a, b) => b.totalDays - a.totalDays);
  const max = Math.max(...data.map((d) => d.totalDays), 1);

  if (!data.length) return null;

  return (
    <div className="space-y-2.5">
      {data.map((r, i) => {
        const pct = (r.totalDays / max) * 100;
        return (
          <div key={r.resource} className="grid grid-cols-[140px_1fr_60px] gap-3 items-center">
            <div className="text-xs text-[var(--color-text)] truncate" title={r.resource}>
              {r.resource}
            </div>
            <div className="h-5 rounded-md bg-white/[0.04] overflow-hidden relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, delay: 0.05 * i, ease: "easeOut" }}
                className="h-full rounded-md relative"
                style={{
                  background: `linear-gradient(90deg, #6366F1, #818CF8)`,
                }}
              >
                <div className="absolute inset-0 opacity-30 mix-blend-overlay"
                  style={{ background: `repeating-linear-gradient(45deg, transparent 0 4px, rgba(255,255,255,0.15) 4px 6px)` }}
                />
              </motion.div>
              {r.peakConcurrency > 1 && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-white/80">
                  ×{r.peakConcurrency} peak
                </div>
              )}
            </div>
            <div className="text-xs font-mono text-right text-[var(--color-text-muted)]">{r.totalDays}d</div>
          </div>
        );
      })}
    </div>
  );
}
