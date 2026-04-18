"use client";

import { motion } from "framer-motion";
import type { ProjectAnalysis } from "@iesl/ui";
import type { HistoricalProject } from "@iesl/data";
import { EstimateCard } from "../../estimator/components/EstimateCard";
import { CostWaterfall } from "../../estimator/components/CostWaterfall";
import { Tornado } from "../../estimator/components/Tornado";
import { AnalogList } from "../../estimator/components/AnalogList";

export function EstimateTab({
  analysis,
  analogs,
  query,
}: {
  analysis: ProjectAnalysis;
  analogs: HistoricalProject[];
  query: string;
}) {
  const { estimate } = analysis;

  return (
    <div className="space-y-6">
      {/* Hero estimate card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-white/8 bg-white/[0.03] p-6"
      >
        <EstimateCard estimate={estimate} query={query} />
      </motion.div>

      {/* Waterfall + Tornado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-white/8 bg-white/[0.03] overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-white/5">
            <div className="eyebrow">Cost build-up · P50 → P80</div>
          </div>
          <div className="p-5">
            <CostWaterfall estimate={estimate} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl border border-white/8 bg-white/[0.03] overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-white/5">
            <div className="eyebrow">Sensitivity · Swing factors (±USDm)</div>
          </div>
          <div className="p-5">
            <Tornado swing={estimate.swingFactors} baseCost={estimate.costUSDm.likely} />
          </div>
        </motion.div>
      </div>

      {/* Assumptions */}
      {estimate.assumptions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-white/8 bg-white/[0.03] p-6"
        >
          <div className="eyebrow mb-4">Key assumptions · {estimate.assumptions.length}</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {estimate.assumptions.map((a, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.04 }}
                className="flex items-start gap-3 rounded-xl bg-white/[0.025] p-3"
              >
                <div className="w-5 h-5 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-400 text-[10px] font-bold shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{a}</p>
              </motion.div>
            ))}
          </div>

          {estimate.contingencyRationale && (
            <div className="mt-5 pt-5 border-t border-white/5">
              <div className="eyebrow mb-2">Contingency rationale · {estimate.contingencyPct}%</div>
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                {estimate.contingencyRationale}
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Analogs */}
      {analogs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <AnalogList analogs={analogs} />
        </motion.div>
      )}
    </div>
  );
}
