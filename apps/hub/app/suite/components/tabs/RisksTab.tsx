"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { ProjectAnalysis } from "@iesl/ui";
import type { Risk } from "@iesl/data";
import { RiskMatrix } from "../../risk/components/RiskMatrix";

const TREND_COLOR: Record<string, string> = {
  Rising: "#EF4444",
  Stable: "#F59E0B",
  Falling: "#10B981",
};

const CATEGORY_COLORS: Record<string, string> = {
  HSE: "#EF4444",
  Schedule: "#F59E0B",
  Cost: "#10B981",
  Regulatory: "#6366F1",
  "Supply Chain": "#8B5CF6",
  Geopolitical: "#EC4899",
  Weather: "#3B82F6",
  Technical: "#14B8A6",
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

      {/* Matrix + selected card */}
      <div className="grid grid-cols-1 xl:grid-cols-[auto_1fr] gap-6">
        {/* Matrix */}
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

        {/* Selected risk detail OR all-risks list */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl border border-white/8 bg-white/[0.03] overflow-hidden"
        >
          {selected ? (
            <div className="p-6">
              <button
                onClick={() => setSelectedId(null)}
                className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] mb-4 flex items-center gap-1"
              >
                ← All risks
              </button>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div
                    className="w-1 self-stretch rounded-full shrink-0"
                    style={{ background: CATEGORY_COLORS[selected.category] ?? "#6366F1" }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider"
                        style={{
                          background: `${CATEGORY_COLORS[selected.category] ?? "#6366F1"}20`,
                          color: CATEGORY_COLORS[selected.category] ?? "#6366F1",
                        }}
                      >
                        {selected.category}
                      </span>
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                        style={{ color: TREND_COLOR[selected.trend] ?? "#9CA3AF" }}
                      >
                        {selected.trend}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-[var(--color-text)]">
                      {selected.title}
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {(["30d", "60d", "90d"] as const).map((d) => {
                    const val =
                      d === "30d"
                        ? selected.predicted30d
                        : d === "60d"
                          ? selected.predicted60d
                          : selected.predicted90d;
                    return (
                      <div key={d} className="rounded-xl bg-white/[0.03] p-3 text-center">
                        <div className="text-[10px] text-[var(--color-text-muted)] mb-1">
                          {d} Prob.
                        </div>
                        <div className="text-xl font-bold font-mono" style={{ color: TREND_COLOR[selected.trend] ?? "#9CA3AF" }}>
                          {(val * 100).toFixed(0)}%
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div>
                  <div className="eyebrow mb-1">Description</div>
                  <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                    {selected.description}
                  </p>
                </div>

                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-4">
                  <div className="eyebrow text-emerald-400 mb-2">Recommended mitigation</div>
                  <p className="text-sm text-[var(--color-text)] leading-relaxed">
                    {selected.mitigation}
                  </p>
                </div>

                <div className="flex gap-4 text-sm font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--color-text-muted)]">Likelihood</span>
                    <span className="font-bold text-[var(--color-text)]">
                      {selected.likelihood}/5
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--color-text-muted)]">Impact</span>
                    <span className="font-bold text-[var(--color-text)]">
                      {selected.impact}/5
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--color-text-muted)]">Score</span>
                    <span className="font-bold" style={{
                      color: selected.likelihood * selected.impact >= 12 ? "#EF4444" :
                        selected.likelihood * selected.impact >= 6 ? "#F59E0B" : "#10B981",
                    }}>
                      {selected.likelihood * selected.impact}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="px-5 py-4 border-b border-white/5">
                <div className="eyebrow">Risk register — click a cell or row to drill in</div>
              </div>
              <div className="divide-y divide-white/5 max-h-[600px] overflow-auto">
                {sorted.map((r, i) => {
                  const score = r.likelihood * r.impact;
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
                          <div className="flex items-center gap-2 mb-1">
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
                          </div>
                          <p className="text-xs text-[var(--color-text-muted)] line-clamp-1">
                            {r.mitigation}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 ml-2">
                          <span
                            className="text-xs font-mono font-bold px-2 py-1 rounded-lg"
                            style={{
                              background: score >= 12 ? "#EF444420" : score >= 6 ? "#F59E0B20" : "#10B98120",
                              color: score >= 12 ? "#EF4444" : score >= 6 ? "#F59E0B" : "#10B981",
                            }}
                          >
                            {score}
                          </span>
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
    </div>
  );
}
