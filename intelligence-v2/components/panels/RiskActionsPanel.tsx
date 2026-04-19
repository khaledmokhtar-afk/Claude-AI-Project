"use client";

import type { RiskActions } from "@/lib/types";

export default function RiskActionsPanel({ data }: { data: RiskActions }) {
  return (
    <div className="space-y-6">
      <div>
        <div className="eyebrow mb-2">Top 5 actions</div>
        <ol className="space-y-2">
          {data.topActions.map((a, i) => (
            <li key={i} className="flex items-start gap-3 glass-hi p-3">
              <div className="shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-emerald-500 text-xs font-bold flex items-center justify-center">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-white/90">{a.action}</div>
                <div className="text-xs text-white/50 mt-1">
                  <span className="text-white/40 uppercase text-[10px] mr-1">Owner</span>
                  {a.owner}
                  <span className="mx-2 text-white/20">·</span>
                  <span className="text-white/40 uppercase text-[10px] mr-1">Due</span>
                  {a.dueWithinDays}d
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div>
        <div className="eyebrow mb-2">ISO / industry framework</div>
        <div className="space-y-2">
          {data.isoFramework.map((iso, i) => (
            <div key={i} className="glass-hi p-3">
              <div className="flex items-baseline justify-between gap-2 flex-wrap">
                <span className="font-mono text-sm text-indigo-300">{iso.standard}</span>
                <span className="text-xs text-white/70">{iso.title}</span>
              </div>
              <div className="mt-1 text-xs text-white/50">{iso.whyRelevant}</div>
              {iso.appliesTo.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {iso.appliesTo.map((a, j) => (
                    <span
                      key={j}
                      className="text-[10px] font-mono uppercase rounded bg-white/5 px-1.5 py-0.5 text-white/60"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="eyebrow mb-2">Portfolio insight</div>
        <p className="text-sm text-white/75 italic leading-relaxed">{data.portfolioInsight}</p>
      </div>
    </div>
  );
}
