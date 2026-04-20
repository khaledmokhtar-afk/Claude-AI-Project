"use client";

import { motion } from "framer-motion";
import type { ProjectAnalysis } from "@iesl/ui";
import type { HistoricalProject } from "@iesl/data";
import { EstimateCard } from "../../estimator/components/EstimateCard";
import { CostWaterfall } from "../../estimator/components/CostWaterfall";
import { Tornado } from "../../estimator/components/Tornado";
import { AnalogList } from "../../estimator/components/AnalogList";
import { CostBreakdown } from "./estimate/CostBreakdown";
import { PersonnelRoster } from "./estimate/PersonnelRoster";
import { MethodologyTrace } from "./estimate/MethodologyTrace";

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
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="card-elev p-7">
        <EstimateCard estimate={estimate} query={query} />
      </motion.div>

      {/* Cost breakdown */}
      {estimate.costBreakdown && estimate.costBreakdown.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          className="card p-6"
        >
          <div className="eyebrow mb-4">Cost breakdown by category · with derivation basis</div>
          <CostBreakdown items={estimate.costBreakdown} total={estimate.costUSDm.likely} />
        </motion.div>
      )}

      {/* Personnel + Methodology */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_440px] gap-6">
        {estimate.personnel && estimate.personnel.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-6"
          >
            <div className="eyebrow mb-4">Personnel roster · roles, rates, person-months, cost</div>
            <PersonnelRoster roles={estimate.personnel} />
          </motion.div>
        ) : (
          <div />
        )}

        {estimate.methodology && estimate.methodology.length > 0 && (
          <MethodologyTrace steps={estimate.methodology} scaling={estimate.analogScaling} />
        )}
      </div>

      {/* Waterfall + Tornado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
          className="card overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-[var(--color-line)]">
            <div className="eyebrow">Cost build-up · P50 → P80</div>
          </div>
          <div className="p-5">
            <CostWaterfall estimate={estimate} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="card overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-[var(--color-line)]">
            <div className="eyebrow">Sensitivity · swing factors (±USDm)</div>
          </div>
          <div className="p-5">
            <Tornado swing={estimate.swingFactors} baseCost={estimate.costUSDm.likely} />
          </div>
        </motion.div>
      </div>

      {/* Assumptions */}
      {estimate.assumptions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
          className="card p-6"
        >
          <div className="eyebrow mb-4">Key assumptions · {estimate.assumptions.length}</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {estimate.assumptions.map((a, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -3 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.26 + i * 0.03 }}
                className="flex items-start gap-3 card-soft p-3"
              >
                <div className="w-5 h-5 rounded-full grid place-items-center font-mono text-[10px] font-semibold text-white shrink-0 mt-0.5"
                     style={{ background: "var(--color-ink)" }}>
                  {i + 1}
                </div>
                <p className="text-[13.5px] text-[var(--color-ink-2)] leading-[1.55]">{a}</p>
              </motion.div>
            ))}
          </div>

          {estimate.contingencyRationale && (
            <div className="mt-5 pt-5 border-t border-[var(--color-line)]">
              <div className="eyebrow mb-2">Contingency rationale · {estimate.contingencyPct}%</div>
              <p className="text-[13.5px] text-[var(--color-ink-3)] leading-[1.6]">
                {estimate.contingencyRationale}
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Analogs */}
      {analogs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.26 }}
        >
          <AnalogList analogs={analogs} />
        </motion.div>
      )}
    </div>
  );
}
