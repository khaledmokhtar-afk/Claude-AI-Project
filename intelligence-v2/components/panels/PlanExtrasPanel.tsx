"use client";

import type { PlanExtras } from "@/lib/types";

const TYPE_COLOR: Record<string, string> = {
  gate: "bg-indigo-500/20 text-indigo-200 border-indigo-400/40",
  regulatory: "bg-amber-500/20 text-amber-200 border-amber-400/40",
  delivery: "bg-emerald-500/20 text-emerald-200 border-emerald-400/40",
  commissioning: "bg-pink-500/20 text-pink-200 border-pink-400/40",
};

const FLAG_COLOR: Record<string, string> = {
  low: "bg-emerald-500/15 text-emerald-300",
  medium: "bg-amber-500/15 text-amber-300",
  high: "bg-red-500/15 text-red-300",
};

export default function PlanExtrasPanel({ data }: { data: PlanExtras }) {
  const totalPhaseDays = Math.max(
    data.phaseSummaries.reduce((m, p) => Math.max(m, p.durationDays), 0),
    1,
  );
  const maxLoad = Math.max(...data.resourceLoad.map((r) => r.totalDays), 1);

  return (
    <div className="space-y-6">
      <div>
        <div className="eyebrow mb-2">Milestones</div>
        <ul className="space-y-2">
          {data.milestones.map((m) => (
            <li key={m.id} className="flex items-start gap-3 text-sm">
              <span
                className={`shrink-0 inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider ${TYPE_COLOR[m.type] ?? ""}`}
              >
                {m.type}
              </span>
              <div className="flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-white/90">{m.name}</span>
                  <span className="text-xs text-white/40">Day {m.dayOffset}</span>
                </div>
                {m.description && <div className="text-xs text-white/50 mt-0.5">{m.description}</div>}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <div className="eyebrow mb-2">Phase summaries</div>
        <div className="space-y-2">
          {data.phaseSummaries.map((p) => (
            <div key={p.phaseId} className="glass-hi p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{p.name}</span>
                <span className={`text-[10px] font-mono uppercase rounded px-1.5 py-0.5 ${FLAG_COLOR[p.riskFlag] ?? ""}`}>
                  {p.riskFlag} risk
                </span>
              </div>
              <div className="mt-2 h-1.5 rounded bg-white/5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500"
                  style={{ width: `${(p.durationDays / totalPhaseDays) * 100}%` }}
                />
              </div>
              <div className="mt-2 text-xs text-white/60">
                <span className="text-white/40">Driver:</span> {p.primaryDriver}
              </div>
              <div className="mt-1 text-xs text-white/50">
                <span className="text-white/40">Peak:</span> {p.resourcesPeak.join(", ")}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="eyebrow mb-2">Resource load</div>
        <div className="space-y-2">
          {data.resourceLoad.map((r) => (
            <div key={r.resource} className="flex items-center gap-3 text-xs">
              <div className="w-40 shrink-0 truncate text-white/80">{r.resource}</div>
              <div className="flex-1 h-3 rounded bg-white/[0.03] border border-white/5 relative">
                <div
                  className="h-full rounded bg-gradient-to-r from-emerald-500/70 to-indigo-500/70"
                  style={{ width: `${(r.totalDays / maxLoad) * 100}%` }}
                />
              </div>
              <div className="w-20 shrink-0 text-right text-white/60">{r.totalDays}d</div>
              <div className="w-10 shrink-0 text-right text-white/40">×{r.peakConcurrency}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="eyebrow mb-2">Schedule strategy</div>
        <div className="glass-hi p-4 text-sm space-y-2">
          <div>
            <span className="text-white/40 text-xs uppercase mr-2">Approach</span>
            {data.scheduleStrategy.approach}
          </div>
          <div>
            <span className="text-white/40 text-xs uppercase mr-2">Method</span>
            {data.scheduleStrategy.schedulingMethod}
          </div>
          <div>
            <span className="text-white/40 text-xs uppercase mr-2">Buffers</span>
            {data.scheduleStrategy.bufferStrategy}
          </div>
          {data.scheduleStrategy.resourceConstraints.length > 0 && (
            <div>
              <span className="text-white/40 text-xs uppercase mr-2">Constraints</span>
              {data.scheduleStrategy.resourceConstraints.join(" · ")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
