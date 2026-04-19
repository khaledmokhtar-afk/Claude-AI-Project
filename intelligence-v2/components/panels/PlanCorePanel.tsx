"use client";

import { useMemo } from "react";
import { computeSchedule, formatDay } from "@/lib/schedule";
import type { PlanCore } from "@/lib/types";

export default function PlanCorePanel({ data }: { data: PlanCore }) {
  const schedule = useMemo(() => computeSchedule(data.tasks), [data.tasks]);
  const start = schedule.startDate;
  const scale = schedule.totalDays || 1;

  return (
    <div className="space-y-5">
      <div>
        <div className="text-lg" style={{ fontFamily: "var(--font-display), serif" }}>
          {data.projectName}
        </div>
        <p className="text-sm text-white/70 mt-1">{data.summary}</p>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[640px]">
          <div className="flex items-center justify-between text-xs text-white/40 mb-2">
            <div>Day 0 — {formatDay(0, start)}</div>
            <div>
              Day {schedule.totalDays} — {formatDay(schedule.totalDays, start)}
            </div>
          </div>
          <div className="space-y-1">
            {schedule.tasks.map((t) => {
              const left = (t.start / scale) * 100;
              const width = ((t.end - t.start) / scale) * 100;
              return (
                <div key={t.id} className="flex items-center gap-3 text-xs">
                  <div className="w-52 shrink-0 truncate">
                    <span className="text-white/40 mr-2">{t.id}</span>
                    <span style={{ paddingLeft: t.depth * 8 }}>{t.name}</span>
                  </div>
                  <div className="relative flex-1 h-5 rounded bg-white/[0.03] border border-white/5">
                    <div
                      className={`absolute top-0 bottom-0 rounded ${
                        t.critical
                          ? "bg-gradient-to-r from-pink-500/80 to-red-500/80"
                          : "bg-gradient-to-r from-indigo-500/60 to-emerald-500/60"
                      }`}
                      style={{ left: `${left}%`, width: `${Math.max(width, 1)}%` }}
                      title={`${t.durationDays}d · ${t.resource ?? ""}`}
                    />
                  </div>
                  <div className="w-16 shrink-0 text-right text-white/50">{t.durationDays}d</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-white/50">
        <span>Total {schedule.totalDays} working days</span>
        <span>{data.tasks.length} tasks</span>
        <span>{schedule.criticalPath.length} on critical path</span>
      </div>
    </div>
  );
}
