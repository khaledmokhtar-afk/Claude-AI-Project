"use client";

import type { RiskItem, RiskRegister } from "@/lib/types";

const HEAT = ["var(--heat-0)", "var(--heat-1)", "var(--heat-2)", "var(--heat-3)", "var(--heat-4)", "var(--heat-5)"];

function heat(score: number): string {
  // score 1..25
  const bucket = Math.min(5, Math.max(0, Math.floor((score - 1) / 5)));
  return HEAT[bucket];
}

export default function RiskRegisterPanel({ data }: { data: RiskRegister }) {
  const risks = data.newRisks;

  return (
    <div className="space-y-6">
      <div>
        <div className="eyebrow mb-3">5 × 5 heat matrix (inherent)</div>
        <HeatMatrix risks={risks} />
      </div>

      <div>
        <div className="eyebrow mb-3">Register ({risks.length})</div>
        <div className="space-y-3">
          {risks.map((r, i) => (
            <RiskRow key={`${r.title}-${i}`} r={r} />
          ))}
        </div>
      </div>
    </div>
  );
}

function HeatMatrix({ risks }: { risks: RiskItem[] }) {
  const cells: Record<string, RiskItem[]> = {};
  for (const r of risks) {
    const key = `${r.likelihood}-${r.impact}`;
    (cells[key] ??= []).push(r);
  }
  return (
    <div className="inline-grid" style={{ gridTemplateColumns: "auto repeat(5, 44px)", gap: 4 }}>
      <div />
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={`ih-${i}`} className="text-[10px] text-white/40 text-center font-mono">
          I{i}
        </div>
      ))}
      {[5, 4, 3, 2, 1].flatMap((l) => [
        <div
          key={`lh-${l}`}
          className="text-[10px] text-white/40 text-right font-mono pr-1 self-center"
        >
          L{l}
        </div>,
        ...[1, 2, 3, 4, 5].map((i) => {
          const score = l * i;
          const items = cells[`${l}-${i}`] ?? [];
          return (
            <div
              key={`c-${l}-${i}`}
              className="relative h-11 rounded-md flex items-center justify-center text-[11px] font-mono"
              style={{ background: heat(score), color: score >= 12 ? "#fff" : "rgba(0,0,0,0.8)" }}
              title={items.map((x) => x.title).join("\n") || `empty (${score})`}
            >
              {items.length > 0 && <span>{items.length}</span>}
            </div>
          );
        }),
      ])}
    </div>
  );
}

function RiskRow({ r }: { r: RiskItem }) {
  const inherent = r.likelihood * r.impact;
  const residual = r.residualLikelihood * r.residualImpact;
  const trendIcon = r.trend === "Rising" ? "↗" : r.trend === "Falling" ? "↘" : "→";

  return (
    <div className="glass-hi p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs text-white/50 mb-1">
            <span className="rounded bg-white/5 px-1.5 py-0.5">{r.category}</span>
            <span>
              Owner: <span className="text-white/80">{r.owner}</span>
            </span>
            <span>Due in {r.dueWithinDays}d</span>
          </div>
          <div className="text-sm font-medium">{r.title}</div>
          <div className="text-xs text-white/60 mt-1">{r.description}</div>
        </div>
        <div className="shrink-0 flex items-center gap-3 text-xs font-mono">
          <Score label="Inherent" value={inherent} />
          <span className="text-white/40">→</span>
          <Score label="Residual" value={residual} />
          <span className="text-white/60">{trendIcon}</span>
        </div>
      </div>

      <div className="mt-3 text-xs text-white/70">
        <span className="text-white/40 uppercase mr-2">Mitigation</span>
        {r.mitigation}
      </div>

      {r.controls.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {r.controls.map((c, i) => (
            <span
              key={i}
              className="text-[10px] font-mono uppercase rounded border border-white/10 bg-white/[0.03] px-2 py-0.5"
              title={c.description}
            >
              <span className="text-white/40 mr-1">{c.type.slice(0, 4)}:</span>
              <span className="text-white/80">{c.description}</span>
            </span>
          ))}
        </div>
      )}

      {r.isoStandards.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {r.isoStandards.map((iso, i) => (
            <span
              key={i}
              className="text-[10px] font-mono rounded bg-indigo-500/15 text-indigo-200 px-2 py-0.5"
              title={iso.application}
            >
              {iso.standard}
              {iso.clause && <span className="opacity-70"> {iso.clause}</span>}
            </span>
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center gap-2 text-[10px] text-white/40 font-mono">
        <span>Forecast L×I:</span>
        <span>30d {r.predicted30d}</span>
        <span>·</span>
        <span>60d {r.predicted60d}</span>
        <span>·</span>
        <span>90d {r.predicted90d}</span>
      </div>
    </div>
  );
}

function Score({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-[9px] text-white/40 uppercase">{label}</span>
      <span
        className="rounded px-2 py-0.5 text-[11px]"
        style={{ background: heat(value), color: value >= 12 ? "#fff" : "rgba(0,0,0,0.8)" }}
      >
        {value}
      </span>
    </div>
  );
}
