"use client";

import { motion } from "framer-motion";
import { useAnimatedNumber } from "@iesl/ui";
import type { ProjectAnalysis } from "@iesl/ui";

function BigMetric({
  label,
  value,
  suffix = "",
  color,
  delay,
}: {
  label: string;
  value: number;
  suffix?: string;
  color: string;
  delay: number;
}) {
  const animated = useAnimatedNumber(value, 1000);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="relative overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] p-6"
    >
      <div
        className="absolute inset-0 opacity-5 rounded-2xl"
        style={{ background: `radial-gradient(ellipse at top left, ${color}, transparent 70%)` }}
      />
      <div className="eyebrow mb-2 relative">{label}</div>
      <div
        className="text-4xl font-bold font-display relative"
        style={{ color }}
      >
        {Number.isInteger(value) ? Math.round(animated) : animated.toFixed(1)}
        <span className="text-xl ml-1 opacity-70">{suffix}</span>
      </div>
    </motion.div>
  );
}

export function OverviewTab({ analysis }: { analysis: ProjectAnalysis }) {
  const { plan, risks, estimate } = analysis;

  const topRiskScore = Math.max(
    ...risks.newRisks.map((r) => r.likelihood * r.impact),
    0,
  );
  const criticalTasks = plan.tasks.filter((t) => t.critical).length;

  return (
    <div className="space-y-8">
      {/* Hero summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-white/8 bg-white/[0.03] p-8"
      >
        <div className="eyebrow mb-3">Project summary</div>
        <h2 className="font-display text-3xl md:text-4xl mb-3">{analysis.projectName}</h2>
        <p className="text-[var(--color-text-muted)] text-base leading-relaxed max-w-3xl">
          {analysis.summary}
        </p>
      </motion.div>

      {/* Big 4 metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <BigMetric
          label="P50 Cost"
          value={estimate.costUSDm.likely}
          suffix="$m"
          color="#10B981"
          delay={0.1}
        />
        <BigMetric
          label="Duration"
          value={estimate.durationMonths.likely}
          suffix="mo"
          color="#6366F1"
          delay={0.15}
        />
        <BigMetric
          label="Tasks"
          value={plan.tasks.length}
          color="#F59E0B"
          delay={0.2}
        />
        <BigMetric
          label="Risks"
          value={risks.newRisks.length}
          color="#EF4444"
          delay={0.25}
        />
      </div>

      {/* Two-column insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk highlight */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-white/8 bg-white/[0.03] p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <div className="eyebrow">Top risks</div>
          </div>
          <div className="space-y-3">
            {risks.newRisks
              .sort((a, b) => b.likelihood * b.impact - a.likelihood * a.impact)
              .slice(0, 4)
              .map((r, i) => {
                const score = r.likelihood * r.impact;
                const pct = (score / 25) * 100;
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-[var(--color-text)]">{r.title}</span>
                      <span className="text-xs font-mono text-[var(--color-text-muted)]">
                        L{r.likelihood}×I{r.impact}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.35 + i * 0.05 }}
                        className="h-full rounded-full"
                        style={{
                          background: score >= 12 ? "#EF4444" : score >= 6 ? "#F59E0B" : "#10B981",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>

          {risks.portfolioInsight && (
            <div className="mt-4 pt-4 border-t border-white/5">
              <div className="eyebrow mb-2">Portfolio insight</div>
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                {risks.portfolioInsight}
              </p>
            </div>
          )}
        </motion.div>

        {/* Estimate highlight */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-2xl border border-white/8 bg-white/[0.03] p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <div className="eyebrow">Cost estimate</div>
          </div>

          {/* Three bands */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {(["low", "likely", "high"] as const).map((band) => (
              <div
                key={band}
                className={`rounded-xl p-3 text-center ${band === "likely" ? "bg-emerald-500/10 border border-emerald-500/30" : "bg-white/[0.03]"}`}
              >
                <div className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] mb-1">
                  {band === "likely" ? "P50" : band === "low" ? "Low" : "High"}
                </div>
                <div
                  className="text-xl font-bold font-mono"
                  style={{ color: band === "likely" ? "#10B981" : band === "high" ? "#EF4444" : "#6366F1" }}
                >
                  ${estimate.costUSDm[band].toFixed(1)}m
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--color-text-muted)]">Contingency</span>
              <span className="font-mono text-[var(--color-text)]">{estimate.contingencyPct}%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--color-text-muted)]">Duration (likely)</span>
              <span className="font-mono text-[var(--color-text)]">{estimate.durationMonths.likely} months</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--color-text-muted)]">Effort (likely)</span>
              <span className="font-mono text-[var(--color-text)]">{estimate.effortPersonMonths.likely} person-months</span>
            </div>
          </div>

          {estimate.narrative && (
            <div className="mt-4 pt-4 border-t border-white/5">
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                {estimate.narrative}
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Critical path preview */}
      {criticalTasks > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <div className="eyebrow text-amber-400">Critical path — {criticalTasks} tasks</div>
          </div>
          <div className="flex flex-wrap gap-2">
            {plan.tasks
              .filter((t) => t.critical)
              .map((t) => (
                <span
                  key={t.id}
                  className="px-3 py-1.5 text-xs rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300"
                >
                  {t.name}
                </span>
              ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
