"use client";

import type { RiskItem, RiskRegister } from "@/lib/types";

const HEAT = ["var(--heat-0)", "var(--heat-1)", "var(--heat-2)", "var(--heat-3)", "var(--heat-4)", "var(--heat-5)"];
function heatColor(score: number) {
  return HEAT[Math.min(5, Math.max(0, Math.floor((score - 1) / 5)))];
}

export default function RiskRegisterPanel({ data }: { data: RiskRegister }) {
  const risks = data.newRisks;

  return (
    <div className="space-y-8">
      <div>
        <div className="eyebrow mb-3">Inherent risk · 5 × 5 heat matrix</div>
        <HeatMatrix risks={risks} />
      </div>

      <div>
        <div className="eyebrow mb-3">Register · {risks.length} risks</div>
        <div className="space-y-3">
          {risks.map((r, i) => <RiskCard key={i} r={r} />)}
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
    <div className="inline-grid" style={{ gridTemplateColumns: "auto repeat(5, 56px)", gap: 6 }}>
      <div />
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={`ih-${i}`} className="font-mono text-[11px] text-[var(--ink-4)] text-center">
          I{i}
        </div>
      ))}
      {[5, 4, 3, 2, 1].flatMap((l) => [
        <div key={`lh-${l}`} className="font-mono text-[11px] text-[var(--ink-4)] text-right pr-2 self-center">
          L{l}
        </div>,
        ...[1, 2, 3, 4, 5].map((i) => {
          const score = l * i;
          const items = cells[`${l}-${i}`] ?? [];
          return (
            <div
              key={`c-${l}-${i}`}
              className="h-12 rounded-md grid place-items-center font-mono text-[12px] text-[var(--ink)]"
              style={{ background: heatColor(score) }}
              title={items.map((x) => x.title).join("\n") || `score ${score}`}
            >
              {items.length > 0 && <span className="font-semibold">{items.length}</span>}
            </div>
          );
        }),
      ])}
    </div>
  );
}

function RiskCard({ r }: { r: RiskItem }) {
  const inherent = r.likelihood * r.impact;
  const residual = r.residualLikelihood * r.residualImpact;
  const trend = r.trend === "Rising" ? "↗" : r.trend === "Falling" ? "↘" : "→";

  return (
    <div className="card-soft p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="chip">{r.category}</span>
            <span className="text-[12px] text-[var(--ink-3)]">
              <span className="text-[var(--ink-4)]">Owner</span> {r.owner}
            </span>
            <span className="text-[12px] text-[var(--ink-3)]">
              <span className="text-[var(--ink-4)]">Due</span> {r.dueWithinDays}d
            </span>
          </div>
          <div className="text-[15px] font-medium text-[var(--ink)] mb-1">{r.title}</div>
          <p className="text-[13.5px] text-[var(--ink-2)] leading-[1.55]">{r.description}</p>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          <ScoreChip label="Inherent" value={inherent} />
          <span className="text-[var(--ink-4)]">→</span>
          <ScoreChip label="Residual" value={residual} />
          <span className="text-[18px] text-[var(--ink-3)]">{trend}</span>
        </div>
      </div>

      <div className="mt-3.5 text-[13.5px] text-[var(--ink-2)] leading-[1.55]">
        <span className="font-mono text-[10.5px] uppercase tracking-wider text-[var(--ink-4)] mr-2">Mitigation</span>
        {r.mitigation}
      </div>

      {r.controls.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {r.controls.map((c, i) => (
            <span
              key={i}
              className="chip"
              title={c.description}
            >
              <span className="font-mono text-[10px] text-[var(--ink-4)] uppercase">{c.type.slice(0, 4)}</span>
              <span className="text-[var(--ink-2)]">{c.description}</span>
            </span>
          ))}
        </div>
      )}

      {r.isoStandards.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {r.isoStandards.map((iso, i) => (
            <span key={i} className="chip chip-brand" title={iso.application}>
              <span className="font-mono">{iso.standard}</span>
              {iso.clause && <span className="opacity-70">{iso.clause}</span>}
            </span>
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center gap-3 font-mono text-[11px] text-[var(--ink-4)]">
        <span>Forecast L×I</span>
        <span>30d {r.predicted30d}</span>
        <span>·</span>
        <span>60d {r.predicted60d}</span>
        <span>·</span>
        <span>90d {r.predicted90d}</span>
      </div>
    </div>
  );
}

function ScoreChip({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center">
      <span className="font-mono text-[9.5px] uppercase tracking-wider text-[var(--ink-4)]">{label}</span>
      <span
        className="px-2 py-0.5 rounded font-mono text-[12px] text-[var(--ink)] mt-0.5"
        style={{ background: heatColor(value) }}
      >
        {value}
      </span>
    </div>
  );
}
