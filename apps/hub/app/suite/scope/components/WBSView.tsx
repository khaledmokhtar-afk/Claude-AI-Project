"use client";

import { motion } from "framer-motion";
import type { Schedule } from "../lib/schedule";
import type { WBSNode } from "@iesl/data";

export function WBSView({ tasks, schedule }: { tasks: WBSNode[]; schedule: Schedule }) {
  const sorted = [...tasks].sort((a, b) =>
    a.id.localeCompare(b.id, undefined, { numeric: true }),
  );
  return (
    <div className="flex flex-col gap-0.5 max-h-[60vh] overflow-auto pr-1">
      {sorted.map((t, i) => {
        const scheduled = schedule.byId[t.id];
        const depth = scheduled?.depth ?? 0;
        const isCritical = Boolean(t.critical);
        return (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03, duration: 0.25 }}
            className="flex items-start gap-2 text-[13px] py-2 px-2 rounded-md hover:bg-[var(--color-card-soft)] transition-colors"
            style={{ paddingLeft: `${8 + depth * 18}px` }}
          >
            <span className="font-mono text-[11px] text-[var(--color-ink-4)] shrink-0 w-10 pt-0.5">
              {t.id}
            </span>
            <span className="flex-1 text-[var(--color-ink)] leading-snug">
              {t.name}
              {t.resource && (
                <span className="ml-2 text-[11px] text-[var(--color-ink-4)] font-mono">
                  · {t.resource}
                </span>
              )}
            </span>
            <span className="font-mono text-[11px] text-[var(--color-ink-3)] shrink-0 tabular-nums pt-0.5">
              {t.durationDays}d
            </span>
            {isCritical && (
              <span className="chip chip-accent shrink-0 font-semibold">Critical</span>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
