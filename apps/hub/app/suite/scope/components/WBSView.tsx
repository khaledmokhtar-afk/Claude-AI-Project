"use client";

import { motion } from "framer-motion";
import type { Schedule } from "../lib/schedule";
import type { WBSNode } from "@iesl/data";

export function WBSView({ tasks, schedule }: { tasks: WBSNode[]; schedule: Schedule }) {
  const sorted = [...tasks].sort((a, b) =>
    a.id.localeCompare(b.id, undefined, { numeric: true }),
  );
  return (
    <div className="glass p-5 overflow-hidden">
      <div className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] mb-3">
        Work Breakdown Structure
      </div>
      <div className="flex flex-col gap-1 max-h-[60vh] overflow-auto pr-1">
        {sorted.map((t, i) => {
          const scheduled = schedule.byId[t.id];
          const depth = scheduled?.depth ?? 0;
          const isCritical = Boolean(t.critical);
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04, duration: 0.25 }}
              className="flex items-start gap-2 text-sm py-1.5 px-2 rounded-md hover:bg-white/5"
              style={{ paddingLeft: `${8 + depth * 20}px` }}
            >
              <span className="font-mono text-xs text-[var(--color-text-muted)] shrink-0 w-10">
                {t.id}
              </span>
              <span className="flex-1">
                {t.name}
                {t.resource && (
                  <span className="ml-2 text-xs text-[var(--color-text-muted)]">
                    · {t.resource}
                  </span>
                )}
              </span>
              <span className="font-mono text-xs text-[var(--color-text-muted)] shrink-0">
                {t.durationDays}d
              </span>
              {isCritical && (
                <span
                  className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase"
                  style={{
                    background: "color-mix(in srgb, var(--color-critical) 20%, transparent)",
                    color: "var(--color-critical)",
                  }}
                >
                  Critical
                </span>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
