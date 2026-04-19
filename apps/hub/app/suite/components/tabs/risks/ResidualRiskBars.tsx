"use client";

import { motion } from "framer-motion";
import type { RiskItem } from "@iesl/ui";

export function ResidualRiskBars({ risks }: { risks: RiskItem[] }) {
  const withResidual = risks
    .filter((r) => typeof r.residualLikelihood === "number" && typeof r.residualImpact === "number")
    .sort((a, b) => b.likelihood * b.impact - a.likelihood * a.impact)
    .slice(0, 8);

  if (!withResidual.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/8 bg-white/[0.03] p-6"
    >
      <div className="eyebrow mb-1">Inherent vs residual risk · post-mitigation effectiveness</div>
      <p className="text-xs text-[var(--color-text-muted)] mb-5">
        Score = Likelihood × Impact (max 25). The green segment is the reduction achieved by the listed controls.
      </p>

      <div className="space-y-3">
        {withResidual.map((r, i) => {
          const inherent = r.likelihood * r.impact;
          const residual = (r.residualLikelihood ?? r.likelihood) * (r.residualImpact ?? r.impact);
          const reduction = inherent - residual;
          const inherentPct = (inherent / 25) * 100;
          const residualPct = (residual / 25) * 100;
          const reductionPct = ((reduction / inherent) * 100) || 0;
          return (
            <div key={i}>
              <div className="flex items-center justify-between mb-1.5 text-xs">
                <span className="text-[var(--color-text)] truncate flex-1 mr-3">{r.title}</span>
                <div className="flex items-center gap-2 font-mono shrink-0">
                  <span className="text-[var(--color-text-muted)]">{inherent}</span>
                  <span className="text-[10px] text-[var(--color-text-muted)]">→</span>
                  <span className="text-emerald-400">{residual}</span>
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded"
                    style={{
                      background: reductionPct >= 50 ? "#10B98120" : reductionPct >= 25 ? "#F59E0B20" : "#EF444420",
                      color: reductionPct >= 50 ? "#10B981" : reductionPct >= 25 ? "#F59E0B" : "#EF4444",
                    }}
                  >
                    −{Math.round(reductionPct)}%
                  </span>
                </div>
              </div>
              <div className="relative h-2 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${inherentPct}%` }}
                  transition={{ duration: 0.8, delay: i * 0.05 }}
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ background: "linear-gradient(90deg, #EF4444, #F59E0B)" }}
                />
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${residualPct}%` }}
                  transition={{ duration: 0.8, delay: 0.4 + i * 0.05 }}
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ background: "#10B981" }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-4 mt-5 pt-4 border-t border-white/5 text-[10px] text-[var(--color-text-muted)]">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ background: "linear-gradient(90deg, #EF4444, #F59E0B)" }} />
          Inherent
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          Residual (post-controls)
        </div>
      </div>
    </motion.div>
  );
}
