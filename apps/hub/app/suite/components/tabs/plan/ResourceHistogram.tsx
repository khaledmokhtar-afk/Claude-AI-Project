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
            <div className="text-[12.5px] text-[var(--color-ink-2)] truncate" title={r.resource}>
              {r.resource}
            </div>
            <div className="h-5 rounded-md bg-[var(--color-card-soft)] overflow-hidden relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, delay: 0.05 * i, ease: "easeOut" }}
                className="h-full rounded-md"
                style={{
                  background:
                    "linear-gradient(90deg, var(--color-brand), color-mix(in srgb, var(--color-brand) 65%, var(--color-accent)))",
                }}
              />
              {r.peakConcurrency > 1 && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-white/90">
                  ×{r.peakConcurrency} peak
                </div>
              )}
            </div>
            <div className="text-[12px] font-mono text-right text-[var(--color-ink-3)] tabular-nums">
              {r.totalDays}d
            </div>
          </div>
        );
      })}
    </div>
  );
}
