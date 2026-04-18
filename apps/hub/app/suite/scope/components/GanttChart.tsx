"use client";

import { motion } from "framer-motion";
import type { Schedule } from "../lib/schedule";
import type { DemoWBSNode } from "@iesl/data";
import { formatDay } from "../lib/schedule";

export function GanttChart({ tasks, schedule }: { tasks: DemoWBSNode[]; schedule: Schedule }) {
  const sorted = [...tasks].sort((a, b) =>
    a.id.localeCompare(b.id, undefined, { numeric: true }),
  );
  const total = schedule.totalDays;
  const weekTicks = Math.ceil(total / 7);

  return (
    <div className="glass p-5 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
          Gantt — {total} days
        </div>
        <div className="flex items-center gap-4 text-xs text-[var(--color-text-muted)]">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-sm" style={{ background: "var(--color-primary)" }} />
            Task
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-sm" style={{ background: "var(--color-critical)" }} />
            Critical path
          </span>
        </div>
      </div>

      <div className="relative overflow-auto max-h-[60vh] pr-2">
        <div className="relative min-w-[600px]" style={{ width: `${Math.max(600, total * 18)}px` }}>
          <div className="sticky top-0 z-10 bg-[var(--color-surface)]/80 backdrop-blur border-b border-[var(--color-border)] mb-3">
            <div className="relative h-7">
              {Array.from({ length: weekTicks + 1 }).map((_, i) => {
                const day = i * 7;
                const left = (day / total) * 100;
                return (
                  <div
                    key={i}
                    className="absolute top-0 text-[10px] text-[var(--color-text-muted)] font-mono"
                    style={{ left: `${left}%` }}
                  >
                    <div className="border-l border-[var(--color-border)] h-2" />
                    {formatDay(day, schedule.startDate)}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            {sorted.map((t, i) => {
              const scheduled = schedule.byId[t.id];
              if (!scheduled) return null;
              const leftPct = (scheduled.start / total) * 100;
              const widthPct = ((scheduled.end - scheduled.start) / total) * 100;
              const isCritical = Boolean(t.critical);
              const color = isCritical ? "var(--color-critical)" : "var(--color-primary)";
              return (
                <div key={t.id} className="relative h-7">
                  <div className="absolute inset-y-0 left-0 right-0 bg-white/[0.02] rounded" />
                  <motion.div
                    className="absolute h-5 top-1 rounded-md flex items-center px-2 text-[11px] font-medium overflow-hidden"
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: `${widthPct}%`, opacity: 1 }}
                    transition={{ delay: i * 0.05, duration: 0.5, ease: "easeOut" }}
                    style={{
                      left: `${leftPct}%`,
                      background: color,
                      color: isCritical ? "#0F172A" : "white",
                      boxShadow: isCritical
                        ? "0 0 16px -4px var(--color-critical)"
                        : "0 0 14px -6px var(--color-primary)",
                    }}
                  >
                    <span className="whitespace-nowrap truncate">
                      {t.id}. {t.name}
                    </span>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-[var(--color-border)] text-xs text-[var(--color-text-muted)]">
        <strong className="text-[var(--color-critical)]">Critical path:</strong>{" "}
        {schedule.criticalPath.map((id, i) => {
          const t = schedule.byId[id];
          return (
            <span key={id}>
              {i > 0 ? " → " : ""}
              <span className="text-[var(--color-text)]">{t.name}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
