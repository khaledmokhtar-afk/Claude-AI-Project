"use client";

import { useMemo } from "react";
import { computeSchedule, formatDay } from "@/lib/schedule";
import type { PlanCore } from "@/lib/types";

export default function PlanCorePanel({ data }: { data: PlanCore }) {
  const schedule = useMemo(() => computeSchedule(data.tasks), [data.tasks]);
  const start = schedule.startDate;
  const scale = schedule.totalDays || 1;

  return (
    <div className="space-y-6">
      <div>
        <div className="font-display text-[22px] leading-tight tracking-[-0.015em]">
          {data.projectName}
        </div>
        <p className="text-[14.5px] leading-[1.6] text-[var(--ink-2)] mt-1.5 max-w-[640px]">
          {data.summary}
        </p>
      </div>

      <div className="card-soft p-5 overflow-x-auto">
        <div className="min-w-[680px]">
          <div className="flex items-center justify-between font-mono text-[11px] text-[var(--ink-3)] mb-3">
            <span>D0 — {formatDay(0, start)}</span>
            <span>D{schedule.totalDays} — {formatDay(schedule.totalDays, start)}</span>
          </div>
          <div className="space-y-1.5">
            {schedule.tasks.map((t) => {
              const left = (t.start / scale) * 100;
              const width = ((t.end - t.start) / scale) * 100;
              return (
                <div key={t.id} className="flex items-center gap-3 text-[13px]">
                  <div className="w-56 shrink-0 truncate flex items-baseline gap-2">
                    <span className="font-mono text-[11px] text-[var(--ink-4)] tabular-nums">
                      {t.id}
                    </span>
                    <span className="text-[var(--ink-2)]" style={{ paddingLeft: t.depth * 8 }}>
                      {t.name}
                    </span>
                  </div>
                  <div className="relative flex-1 h-6 rounded-md bg-white border border-[var(--line)]">
                    <div
                      className="absolute top-0 bottom-0 rounded-md"
                      style={{
                        left: `${left}%`,
                        width: `${Math.max(width, 1)}%`,
                        background: t.critical ? "var(--accent)" : "var(--brand)",
                        opacity: t.critical ? 0.95 : 0.85,
                      }}
                      title={`${t.durationDays}d · ${t.resource ?? ""}`}
                    />
                  </div>
                  <div className="w-14 shrink-0 text-right font-mono text-[12px] text-[var(--ink-3)] tabular-nums">
                    {t.durationDays}d
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="chip">{schedule.totalDays} working days</span>
        <span className="chip">{data.tasks.length} tasks</span>
        <span className="chip" style={{ background: "var(--accent-soft)", color: "var(--accent)", borderColor: "rgba(217,84,43,0.2)" }}>
          {schedule.criticalPath.length} critical
        </span>
      </div>
    </div>
  );
}
