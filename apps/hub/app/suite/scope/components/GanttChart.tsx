"use client";

import { motion } from "framer-motion";
import type { Schedule } from "../lib/schedule";
import type { WBSNode } from "@iesl/data";
import { formatDay } from "../lib/schedule";

export function GanttChart({ tasks, schedule }: { tasks: WBSNode[]; schedule: Schedule }) {
  const sorted = [...tasks].sort((a, b) =>
    a.id.localeCompare(b.id, undefined, { numeric: true }),
  );
  const total = schedule.totalDays;
  const weekTicks = Math.ceil(total / 7);

  return (
    <div>
      <div className="flex items-center justify-end gap-4 mb-4 text-[11px] text-[var(--color-ink-3)]">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ background: "var(--color-brand)" }} />
          Task
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ background: "var(--color-accent)" }} />
          Critical path
        </span>
      </div>

      <div className="relative overflow-auto max-h-[60vh] pr-2">
        <div className="relative min-w-[600px]" style={{ width: `${Math.max(600, total * 18)}px` }}>
          <div className="sticky top-0 z-10 bg-[var(--color-bg)]/95 backdrop-blur border-b border-[var(--color-line)] mb-3">
            <div className="relative h-7">
              {Array.from({ length: weekTicks + 1 }).map((_, i) => {
                const day = i * 7;
                const left = (day / total) * 100;
                return (
                  <div
                    key={i}
                    className="absolute top-0 text-[10px] text-[var(--color-ink-4)] font-mono"
                    style={{ left: `${left}%` }}
                  >
                    <div className="border-l border-[var(--color-line)] h-2" />
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
              const color = isCritical ? "var(--color-accent)" : "var(--color-brand)";
              return (
                <div key={t.id} className="relative h-7">
                  <div className="absolute inset-y-0 left-0 right-0 bg-[var(--color-card-soft)] rounded" />
                  <motion.div
                    className="absolute h-5 top-1 rounded-md flex items-center px-2 text-[11px] font-medium overflow-hidden"
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: `${widthPct}%`, opacity: 1 }}
                    transition={{ delay: i * 0.05, duration: 0.5, ease: "easeOut" }}
                    style={{
                      left: `${leftPct}%`,
                      background: color,
                      color: "white",
                      boxShadow: isCritical
                        ? "0 4px 10px -4px color-mix(in srgb, var(--color-accent) 45%, transparent)"
                        : "0 3px 8px -4px color-mix(in srgb, var(--color-brand) 40%, transparent)",
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

      <div className="mt-5 pt-4 border-t border-[var(--color-line)] text-[12.5px] text-[var(--color-ink-3)] leading-[1.6]">
        <strong style={{ color: "var(--color-accent)" }}>Critical path:</strong>{" "}
        {schedule.criticalPath.map((id, i) => {
          const t = schedule.byId[id];
          return (
            <span key={id}>
              {i > 0 ? " → " : ""}
              <span className="text-[var(--color-ink)]">{t.name}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
