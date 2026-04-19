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
  Rising: "#EF4444",
  Stable: "#F59E0B",
  Falling: "#10B981",
};

const CATEGORY_COLORS: Record<string, string> = {
  HSE: "#EF4444",
  Schedule: "#F59E0B",
  Cost: "#10B981",
  Commercial: "#84CC16",
  Regulatory: "#6366F1",
  "Supply Chain": "#8B5CF6",
  Geopolitical: "#EC4899",
  Weather: "#3B82F6",
  Technical: "#14B8A6",
};

const CONTROL_COLORS: Record<string, { bg: string; fg: string; label: string }> = {
  preventive: { bg: "#6366F120", fg: "#818CF8", label: "PREVENTIVE" },
  detective:  { bg: "#F59E0B20", fg: "#FBBF24", label: "DETECTIVE" },
  corrective: { bg: "#EC489920", fg: "#F472B6", label: "CORRECTIVE" },
};

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

  const selectedCatColor = selected ? (CATEGORY_COLORS[selected.category] ?? "#6366F1") : "#6366F1";

  return (
    <div className="space-y-6">
      {/* Portfolio insight banner */}
      {risks.portfolioInsight && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-indigo-500/20 bg-indigo-500/[0.04] p-6"
        >
          <div className="flex items-start gap-3">
            <div className="w-1 self-stretch rounded-full bg-indigo-500 shrink-0" />
            <div>
              <div className="eyebrow text-indigo-400 mb-2">Portfolio insight</div>
              <p className="text-base text-[var(--color-text)] leading-relaxed font-display">
                {risks.portfolioInsight}
              </p>
            </div>
          </div>
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
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-white/8 bg-white/[0.03] p-6"
        >
          <div className="eyebrow mb-4">Heat matrix — {risks.newRisks.length} risks</div>
          <RiskMatrix
            risks={matrixRisks}
            selectedRiskId={selectedId}
            onSelect={setSelectedId}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl border border-white/8 bg-white/[0.03] overflow-hidden"
        >
          {selected ? (
            <div className="p-6 space-y-5">
              <button
                onClick={() => setSelectedId(null)}
                className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] flex items-center gap-1"
              >
                ← All risks
              </button>

              <div className="flex items-start gap-3">
                <div
                  className="w-1 self-stretch rounded-full shrink-0"
                  style={{ background: selectedCatColor }}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider"
                      style={{ background: `${selectedCatColor}20`, color: selectedCatColor }}
                    >
                      {selected.category}
                    </span>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                      style={{ color: TREND_COLOR[selected.trend] ?? "#9CA3AF" }}
                    >
                      {selected.trend}
                    </span>
                    {selected.owner && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-[var(--color-text-muted)] font-mono uppercase tracking-wider">
                        {selected.owner}
                      </span>
                    )}
                    {typeof selected.dueWithinDays === "number" && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-mono">
                        Due {selected.dueWithinDays}d
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--color-text)]">
                    {selected.title}
                  </h3>
                </div>
              </div>

              {/* Probability bands */}
              <div className="grid grid-cols-3 gap-3">
                {(["30d", "60d", "90d"] as const).map((d) => {
                  const val =
                    d === "30d" ? selected.predicted30d :
                    d === "60d" ? selected.predicted60d :
                    selected.predicted90d;
                  return (
                    <div key={d} className="rounded-xl bg-white/[0.03] p-3 text-center">
                      <div className="text-[10px] text-[var(--color-text-muted)] mb-1">{d} Prob.</div>
                      <div
                        className="text-xl font-bold font-mono"
                        style={{ color: TREND_COLOR[selected.trend] ?? "#9CA3AF" }}
                      >
                        {(val * 100).toFixed(0)}%
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Inherent vs residual */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white/[0.03] p-3">
                  <div className="text-[10px] text-[var(--color-text-muted)] mb-1 uppercase tracking-wider">Inherent</div>
                  <div className="text-base font-mono">
                    L{selected.likelihood} × I{selected.impact}
                    <span className="ml-2 text-xs text-[var(--color-text-muted)]">= {selected.likelihood * selected.impact}</span>
                  </div>
                </div>
                {typeof selected.residualLikelihood === "number" && typeof selected.residualImpact === "number" && (
                  <div className="rounded-xl bg-emerald-500/[0.05] p-3 border border-emerald-500/20">
                    <div className="text-[10px] text-emerald-400 mb-1 uppercase tracking-wider">Residual (post-controls)</div>
                    <div className="text-base font-mono text-emerald-300">
                      L{selected.residualLikelihood} × I{selected.residualImpact}
                      <span className="ml-2 text-xs text-emerald-400/70">= {selected.residualLikelihood * selected.residualImpact}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <div className="eyebrow mb-1">Description</div>
                <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                  {selected.description}
                </p>
              </div>

              {/* ISO standards */}
              {selected.isoStandards && selected.isoStandards.length > 0 && (
                <div>
                  <div className="eyebrow mb-2 text-indigo-400">ISO / industry standards invoked</div>
                  <div className="space-y-2">
                    {selected.isoStandards.map((iso, i) => (
                      <div
                        key={i}
                        className="rounded-xl border border-indigo-500/20 bg-indigo-500/[0.04] p-3"
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-xs font-mono font-semibold text-indigo-300">{iso.standard}</span>
                          {iso.clause && iso.clause !== "—" && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-300 font-mono">
                              §{iso.clause}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[var(--color-text-muted)] leading-relaxed">
                          {iso.application}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Controls hierarchy */}
              {selected.controls && selected.controls.length > 0 && (
                <div>
                  <div className="eyebrow mb-2">Controls hierarchy · ISO 45001 §8.1.2</div>
                  <div className="space-y-2">
                    {selected.controls.map((c, i) => {
                      const meta = CONTROL_COLORS[c.type] ?? CONTROL_COLORS.preventive;
                      return (
                        <div key={i} className="flex items-start gap-3">
                          <span
                            className="text-[9px] font-bold tracking-wider px-1.5 py-1 rounded shrink-0 mt-0.5"
                            style={{ background: meta.bg, color: meta.fg }}
                          >
                            {meta.label}
                          </span>
                          <p className="text-xs text-[var(--color-text)] leading-relaxed">
                            {c.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Mitigation summary */}
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-4">
                <div className="eyebrow text-emerald-400 mb-2">Recommended mitigation</div>
                <p className="text-sm text-[var(--color-text)] leading-relaxed">
                  {selected.mitigation}
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="px-5 py-4 border-b border-white/5">
                <div className="eyebrow">Risk register — click a cell or row to drill in</div>
              </div>
              <div className="divide-y divide-white/5 max-h-[700px] overflow-auto">
                {sorted.map((r, i) => {
                  const score = r.likelihood * r.impact;
                  const residual =
                    typeof r.residualLikelihood === "number" && typeof r.residualImpact === "number"
                      ? r.residualLikelihood * r.residualImpact
                      : null;
                  return (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => setSelectedId(`r-${risks.newRisks.indexOf(r)}`)}
                      className="w-full text-left px-5 py-4 hover:bg-white/[0.025] transition-colors group"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                          style={{ background: CATEGORY_COLORS[r.category] ?? "#6366F1" }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-sm font-medium text-[var(--color-text)] truncate">
                              {r.title}
                            </span>
                            <span
                              className="text-[9px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider shrink-0"
                              style={{
                                background: `${CATEGORY_COLORS[r.category] ?? "#6366F1"}15`,
                                color: CATEGORY_COLORS[r.category] ?? "#6366F1",
                              }}
                            >
                              {r.category}
                            </span>
                            {r.isoStandards && r.isoStandards.length > 0 && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded font-mono bg-indigo-500/15 text-indigo-300 shrink-0">
                                {r.isoStandards[0].standard.replace(/^ISO /, "ISO ")}
                                {r.isoStandards.length > 1 ? ` +${r.isoStandards.length - 1}` : ""}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[var(--color-text-muted)] line-clamp-1">
                            {r.mitigation}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 ml-2">
                          <div className="flex items-center gap-1 font-mono text-xs">
                            <span
                              className="font-bold px-2 py-1 rounded-lg"
                              style={{
                                background: score >= 12 ? "#EF444420" : score >= 6 ? "#F59E0B20" : "#10B98120",
                                color: score >= 12 ? "#EF4444" : score >= 6 ? "#F59E0B" : "#10B981",
                              }}
                            >
                              {score}
                            </span>
                            {residual !== null && (
                              <>
                                <span className="text-[10px] text-[var(--color-text-muted)]">→</span>
                                <span className="font-bold text-emerald-400">{residual}</span>
                              </>
                            )}
                          </div>
                          <span
                            className="text-[10px]"
                            style={{ color: TREND_COLOR[r.trend] ?? "#9CA3AF" }}
                          >
                            {r.trend}
                          </span>
                          <svg className="w-3 h-3 text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" viewBox="0 0 16 16" fill="none">
                            <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
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

      {/* Residual risk bars */}
      <ResidualRiskBars risks={risks.newRisks} />
    </div>
  );
}
