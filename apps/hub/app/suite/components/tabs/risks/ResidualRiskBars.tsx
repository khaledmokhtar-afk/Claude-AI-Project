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
      className="card p-6"
    >
      <div className="eyebrow mb-1">Inherent vs residual risk · post-mitigation effectiveness</div>
      <p className="text-[12.5px] text-[var(--color-ink-3)] mb-5 leading-[1.55] max-w-3xl">
        Score = Likelihood × Impact (max 25). The green segment shows the reduction achieved by the listed controls.
      </p>

      <div className="space-y-3.5">
        {withResidual.map((r, i) => {
          const inherent = r.likelihood * r.impact;
          const residual = (r.residualLikelihood ?? r.likelihood) * (r.residualImpact ?? r.impact);
          const reduction = inherent - residual;
          const inherentPct = (inherent / 25) * 100;
          const residualPct = (residual / 25) * 100;
          const reductionPct = ((reduction / inherent) * 100) || 0;
          const redChip =
            reductionPct >= 50 ? "chip-ok" : reductionPct >= 25 ? "chip-warn" : "chip-bad";
          return (
            <div key={i}>
              <div className="flex items-center justify-between mb-1.5 gap-3">
                <span className="text-[13px] text-[var(--color-ink)] truncate flex-1">{r.title}</span>
                <div className="flex items-center gap-2 font-mono shrink-0 text-[12px] tabular-nums">
                  <span className="text-[var(--color-ink-4)]">{inherent}</span>
                  <span className="text-[10px] text-[var(--color-ink-4)]">→</span>
                  <span style={{ color: "var(--color-ok)" }}>{residual}</span>
                  <span className={`chip ${redChip} font-semibold`}>−{Math.round(reductionPct)}%</span>
                </div>
              </div>
              <div className="relative h-2 rounded-full bg-[var(--color-card-soft)] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${inherentPct}%` }}
                  transition={{ duration: 0.8, delay: i * 0.05 }}
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    background:
                      "linear-gradient(90deg, var(--color-bad), var(--color-warn))",
                  }}
                />
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${residualPct}%` }}
                  transition={{ duration: 0.8, delay: 0.4 + i * 0.05 }}
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ background: "var(--color-ok)" }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-5 mt-5 pt-4 border-t border-[var(--color-line)] text-[11px] text-[var(--color-ink-3)]">
        <div className="flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: "linear-gradient(90deg, var(--color-bad), var(--color-warn))" }}
          />
          Inherent
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ background: "var(--color-ok)" }} />
          Residual (post-controls)
        </div>
      </div>
    </motion.div>
  );
}
