"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { ProjectAnalysis } from "@iesl/ui";
import type { Risk } from "@iesl/data";
import { RiskMatrix } from "../../risk/components/RiskMatrix";
import { IsoFrameworkPanel } from "./risks/IsoFrameworkPanel";
import { ResidualRiskBars } from "./risks/ResidualRiskBars";
import { ActionRegister } from "./risks/ActionRegister";

const TREND_COLOR: Record<string, string> = {
  Rising:  "var(--color-bad)",
  Stable:  "var(--color-warn)",
  Falling: "var(--color-ok)",
};

const CONTROL_STYLE: Record<string, { chip: string; label: string }> = {
  preventive: { chip: "chip-brand", label: "PREVENTIVE" },
  detective:  { chip: "chip-warn",  label: "DETECTIVE"  },
  corrective: { chip: "chip-accent",label: "CORRECTIVE" },
};

function scoreTone(score: number): string {
  return score >= 15 ? "var(--color-bad)" : score >= 8 ? "var(--color-warn)" : "var(--color-ok)";
}
function scoreChip(score: number): string {
  return score >= 15 ? "chip-bad" : score >= 8 ? "chip-warn" : "chip-ok";
}

export function RisksTab({ analysis }: { analysis: ProjectAnalysis }) {
  const { risks } = analysis;
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const matrixRisks: Risk[] = risks.newRisks.map((r, i) => ({
    id: `r-${i}`,
    projectId: "project",
    title: r.title,
    category: r.category,
    likelihood: r.likelihood,
    impact: r.impact,
    trend: r.trend,
    description: r.description,
    mitigation: r.mitigation,
  }));

  const sorted = [...risks.newRisks].sort(
    (a, b) => b.likelihood * b.impact - a.likelihood * a.impact,
  );

  const selected = selectedId
    ? risks.newRisks[parseInt(selectedId.replace("r-", ""))]
    : null;

  return (
    <div className="space-y-6">
      {/* Portfolio insight banner */}
      {risks.portfolioInsight && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-accent p-6 lg:p-7"
        >
          <div className="eyebrow eyebrow-brand mb-2.5">Portfolio insight</div>
          <p className="font-display text-[22px] md:text-[24px] leading-[1.35] text-[var(--color-ink)] italic max-w-[820px]">
            &ldquo;{risks.portfolioInsight}&rdquo;
          </p>
        </motion.div>
      )}

      {/* Top action register */}
      {risks.topActions && risks.topActions.length > 0 && (
        <ActionRegister actions={risks.topActions} />
      )}

      {/* ISO framework panel */}
      {risks.isoFramework && risks.isoFramework.length > 0 && (
        <IsoFrameworkPanel framework={risks.isoFramework} />
      )}

      {/* Matrix + selected card / list */}
      <div className="grid grid-cols-1 xl:grid-cols-[auto_1fr] gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.08 }}
          className="card p-6"
        >
          <div className="eyebrow mb-4">Heat matrix — {risks.newRisks.length} risks</div>
          <RiskMatrix
            risks={matrixRisks}
            selectedRiskId={selectedId}
            onSelect={setSelectedId}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.12 }}
          className="card overflow-hidden"
        >
          {selected ? (
            <div className="p-6 space-y-5">
              <button
                onClick={() => setSelectedId(null)}
                className="text-[12px] text-[var(--color-ink-3)] hover:text-[var(--color-ink)] flex items-center gap-1 transition-colors"
              >
                ← All risks
              </button>

              <div>
                <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                  <span className="chip">{selected.category}</span>
                  <span className="chip" style={{ color: TREND_COLOR[selected.trend] }}>
                    {selected.trend}
                  </span>
                  {selected.owner && <span className="chip">{selected.owner}</span>}
                  {typeof selected.dueWithinDays === "number" && (
                    <span className="chip chip-warn">Due {selected.dueWithinDays}d</span>
                  )}
                </div>
                <h3 className="font-display text-[22px] leading-tight text-[var(--color-ink)]">
                  {selected.title}
                </h3>
              </div>

              {/* Probability bands */}
              <div className="grid grid-cols-3 gap-2.5">
                {(["30d", "60d", "90d"] as const).map((d) => {
                  const val =
                    d === "30d" ? selected.predicted30d :
                    d === "60d" ? selected.predicted60d :
                    selected.predicted90d;
                  return (
                    <div key={d} className="card-soft p-3 text-center">
                      <div className="text-[10px] text-[var(--color-ink-4)] uppercase tracking-[0.15em] font-mono mb-1">{d} prob</div>
                      <div className="font-mono text-[20px] tabular-nums" style={{ color: TREND_COLOR[selected.trend] }}>
                        {(val * 100).toFixed(0)}%
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Inherent vs residual */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="card-soft p-3">
                  <div className="eyebrow mb-1">Inherent</div>
                  <div className="font-mono text-[14.5px] text-[var(--color-ink)] tabular-nums">
                    L{selected.likelihood} × I{selected.impact}
                    <span className="ml-2 text-[var(--color-ink-4)]">= {selected.likelihood * selected.impact}</span>
                  </div>
                </div>
                {typeof selected.residualLikelihood === "number" && typeof selected.residualImpact === "number" && (
                  <div className="card-soft p-3" style={{ background: "var(--color-ok-soft)" }}>
                    <div className="eyebrow" style={{ color: "var(--color-ok)" }}>Residual</div>
                    <div className="font-mono text-[14.5px] tabular-nums mt-1" style={{ color: "var(--color-ok)" }}>
                      L{selected.residualLikelihood} × I{selected.residualImpact}
                      <span className="ml-2 opacity-80">= {selected.residualLikelihood * selected.residualImpact}</span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <div className="eyebrow mb-1.5">Description</div>
                <p className="text-[13.5px] text-[var(--color-ink-2)] leading-[1.6]">{selected.description}</p>
              </div>

              {selected.isoStandards && selected.isoStandards.length > 0 && (
                <div>
                  <div className="eyebrow eyebrow-brand mb-2">ISO / industry standards</div>
                  <div className="space-y-2">
                    {selected.isoStandards.map((iso, i) => (
                      <div key={i} className="card-soft p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-[12.5px] font-semibold text-[var(--color-brand-ink)]">{iso.standard}</span>
                          {iso.clause && iso.clause !== "—" && (
                            <span className="chip chip-brand">§{iso.clause}</span>
                          )}
                        </div>
                        <p className="text-[12.5px] text-[var(--color-ink-3)] leading-[1.55]">{iso.application}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selected.controls && selected.controls.length > 0 && (
                <div>
                  <div className="eyebrow mb-2">Controls hierarchy · ISO 45001 §8.1.2</div>
                  <div className="space-y-2">
                    {selected.controls.map((c, i) => {
                      const meta = CONTROL_STYLE[c.type] ?? CONTROL_STYLE.preventive;
                      return (
                        <div key={i} className="flex items-start gap-3">
                          <span className={`chip ${meta.chip} shrink-0 mt-0.5`}>{meta.label}</span>
                          <p className="text-[13px] text-[var(--color-ink-2)] leading-[1.55]">{c.description}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="card-soft p-4" style={{ background: "var(--color-ok-soft)" }}>
                <div className="eyebrow mb-2" style={{ color: "var(--color-ok)" }}>Recommended mitigation</div>
                <p className="text-[13.5px] text-[var(--color-ink)] leading-[1.6]">{selected.mitigation}</p>
              </div>
            </div>
          ) : (
            <>
              <div className="px-5 py-4 border-b border-[var(--color-line)]">
                <div className="eyebrow">Risk register — click a cell or row to drill in</div>
              </div>
              <div className="divide-y divide-[var(--color-line)] max-h-[700px] overflow-auto">
                {sorted.map((r, i) => {
                  const score = r.likelihood * r.impact;
                  const residual =
                    typeof r.residualLikelihood === "number" && typeof r.residualImpact === "number"
                      ? r.residualLikelihood * r.residualImpact
                      : null;
                  return (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, x: 6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => setSelectedId(`r-${risks.newRisks.indexOf(r)}`)}
                      className="w-full text-left px-5 py-3.5 hover:bg-[var(--color-card-soft)] transition-colors group"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="w-1.5 h-1.5 rounded-full mt-2 shrink-0"
                          style={{ background: scoreTone(score) }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                            <span className="text-[13.5px] font-medium text-[var(--color-ink)]">{r.title}</span>
                            <span className="chip">{r.category}</span>
                            {r.isoStandards && r.isoStandards.length > 0 && (
                              <span className="chip chip-brand">
                                {r.isoStandards[0].standard}
                                {r.isoStandards.length > 1 ? ` +${r.isoStandards.length - 1}` : ""}
                              </span>
                            )}
                          </div>
                          <p className="text-[12.5px] text-[var(--color-ink-3)] line-clamp-1">
                            {r.mitigation}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <span className={`chip ${scoreChip(score)} font-semibold tabular-nums`}>{score}</span>
                          {residual !== null && (
                            <>
                              <span className="text-[11px] text-[var(--color-ink-4)]">→</span>
                              <span className="chip chip-ok tabular-nums font-semibold">{residual}</span>
                            </>
                          )}
                          <span className="text-[11px] font-mono" style={{ color: TREND_COLOR[r.trend] }}>
                            {r.trend[0]}
                          </span>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </>
          )}
        </motion.div>
      </div>

      <ResidualRiskBars risks={risks.newRisks} />
    </div>
  );
}
