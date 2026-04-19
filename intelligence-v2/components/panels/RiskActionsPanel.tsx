"use client";

import type { RiskActions } from "@/lib/types";

export default function RiskActionsPanel({ data }: { data: RiskActions }) {
  return (
    <div className="space-y-8">
      <div>
        <div className="eyebrow mb-3">Top 5 actions</div>
        <ol className="space-y-2.5">
          {data.topActions.map((a, i) => (
            <li key={i} className="flex items-start gap-4 card-soft p-4">
              <div
                className="shrink-0 w-8 h-8 rounded-full grid place-items-center font-mono text-[13px] text-white font-semibold"
                style={{ background: "var(--ink)" }}
              >
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[14.5px] text-[var(--ink)] leading-snug">{a.action}</div>
                <div className="mt-1.5 flex flex-wrap gap-3 text-[12.5px] text-[var(--ink-3)]">
                  <span><span className="text-[var(--ink-4)] mr-1">Owner</span>{a.owner}</span>
                  <span><span className="text-[var(--ink-4)] mr-1">Due</span>{a.dueWithinDays}d</span>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div>
        <div className="eyebrow mb-3">ISO / industry framework</div>
        <div className="grid sm:grid-cols-2 gap-3">
          {data.isoFramework.map((iso, i) => (
            <div key={i} className="card-soft p-4">
              <div className="flex items-baseline justify-between gap-2 flex-wrap">
                <span className="font-mono text-[13.5px] text-[var(--brand-ink)] font-semibold">
                  {iso.standard}
                </span>
              </div>
              <div className="text-[13.5px] text-[var(--ink)] font-medium mt-0.5">{iso.title}</div>
              <p className="text-[13px] text-[var(--ink-3)] mt-1.5 leading-[1.55]">{iso.whyRelevant}</p>
              {iso.appliesTo.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {iso.appliesTo.map((a, j) => (
                    <span key={j} className="chip">{a}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="eyebrow mb-3">Portfolio insight</div>
        <p
          className="font-display text-[20px] leading-[1.45] text-[var(--ink)] italic max-w-[760px]"
        >
          “{data.portfolioInsight}”
        </p>
      </div>
    </div>
  );
}
