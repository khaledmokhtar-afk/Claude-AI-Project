"use client";

import { motion } from "framer-motion";
import { useAnimatedNumber } from "@iesl/ui";
import type { ProjectAnalysis } from "@iesl/ui";

function BigMetric({
  label,
  value,
  suffix = "",
  prefix = "",
  accent,
  delay,
}: {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  accent?: boolean;
  delay: number;
}) {
  const animated = useAnimatedNumber(value, 900);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
      className={accent ? "card-accent p-5" : "card p-5"}
    >
      <div className="eyebrow mb-2.5">{label}</div>
      <div
        className={`font-display text-[40px] leading-none tracking-[-0.02em] tabular-nums ${
          accent ? "text-[var(--color-brand-ink)]" : "text-[var(--color-ink)]"
        }`}
      >
        {prefix}
        {Number.isInteger(value) ? Math.round(animated) : animated.toFixed(1)}
        <span className="text-[18px] ml-0.5 text-[var(--color-ink-3)]">{suffix}</span>
      </div>
    </motion.div>
  );
}

export function OverviewTab({ analysis }: { analysis: ProjectAnalysis }) {
  const { plan, risks, estimate } = analysis;
  const criticalTasks = plan.tasks.filter((t) => t.critical).length;
  const topRisks = [...risks.newRisks]
    .sort((a, b) => b.likelihood * b.impact - a.likelihood * a.impact)
    .slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Hero summary */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-elev p-8 lg:p-10"
      >
        <div className="eyebrow eyebrow-brand mb-3">Project summary</div>
        <h2 className="font-display text-[32px] md:text-[38px] leading-[1.1] tracking-[-0.02em] text-[var(--color-ink)] mb-4 max-w-[820px]">
          {analysis.projectName}
        </h2>
        <p className="text-[15.5px] leading-[1.65] text-[var(--color-ink-2)] max-w-[820px]">
          {analysis.summary}
        </p>
      </motion.div>

      {/* Big 4 metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <BigMetric label="P50 cost"  value={estimate.costUSDm.likely}       prefix="$" suffix="m"   accent delay={0.06} />
        <BigMetric label="Duration"  value={estimate.durationMonths.likely}           suffix=" mo"        delay={0.12} />
        <BigMetric label="Tasks"     value={plan.tasks.length}                                            delay={0.18} />
        <BigMetric label="Risks"     value={risks.newRisks.length}                                        delay={0.24} />
      </div>

      {/* Two-column insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top risks */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <span className="dot dot-bad" />
            <div className="eyebrow">Top risks</div>
          </div>
          <div className="space-y-3.5">
            {topRisks.map((r, i) => {
              const score = r.likelihood * r.impact;
              const pct = (score / 25) * 100;
              const tone =
                score >= 15 ? "var(--color-bad)" :
                score >= 8  ? "var(--color-warn)" :
                              "var(--color-ok)";
              return (
                <div key={i}>
                  <div className="flex items-baseline justify-between gap-3 mb-1">
                    <span className="text-[13.5px] text-[var(--color-ink)] leading-snug">{r.title}</span>
                    <span className="text-[11px] font-mono text-[var(--color-ink-4)] shrink-0 tabular-nums">
                      L{r.likelihood}×I{r.impact}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[var(--color-line)] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.7, delay: 0.35 + i * 0.05 }}
                      className="h-full rounded-full"
                      style={{ background: tone }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {risks.portfolioInsight && (
            <div className="mt-5 pt-5 border-t border-[var(--color-line)]">
              <div className="eyebrow mb-2">Portfolio insight</div>
              <p className="text-[13.5px] text-[var(--color-ink-3)] leading-[1.6]">
                {risks.portfolioInsight}
              </p>
            </div>
          )}
        </motion.div>

        {/* Cost estimate */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="card p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <span className="dot dot-brand" />
            <div className="eyebrow">Cost estimate</div>
          </div>

          <div className="grid grid-cols-3 gap-2.5 mb-5">
            {(["low", "likely", "high"] as const).map((band) => {
              const isLikely = band === "likely";
              return (
                <div key={band} className={isLikely ? "card-accent p-3.5 text-center" : "card-soft p-3.5 text-center"}>
                  <div className="text-[10px] uppercase tracking-[0.15em] text-[var(--color-ink-4)] mb-1 font-mono">
                    {isLikely ? "P50" : band === "low" ? "P10" : "P80"}
                  </div>
                  <div className={`font-display text-[22px] leading-none tabular-nums ${isLikely ? "text-[var(--color-brand-ink)]" : "text-[var(--color-ink)]"}`}>
                    ${estimate.costUSDm[band].toFixed(1)}m
                  </div>
                </div>
              );
            })}
          </div>

          <div className="space-y-2.5 text-[13.5px]">
            <Row label="Contingency" value={`${estimate.contingencyPct}%`} />
            <Row label="Duration (likely)" value={`${estimate.durationMonths.likely} months`} />
            <Row label="Effort (likely)" value={`${estimate.effortPersonMonths.likely} PM`} />
          </div>

          {estimate.narrative && (
            <div className="mt-5 pt-5 border-t border-[var(--color-line)]">
              <p className="text-[13.5px] text-[var(--color-ink-3)] leading-[1.6]">
                {estimate.narrative}
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Critical path */}
      {criticalTasks > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card p-6"
          style={{ borderColor: "color-mix(in srgb, var(--color-accent) 25%, var(--color-line))" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="dot" style={{ background: "var(--color-accent)" }} />
            <div className="eyebrow eyebrow-accent">Critical path · {criticalTasks} tasks</div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {plan.tasks.filter((t) => t.critical).map((t) => (
              <span key={t.id} className="chip chip-accent">{t.name}</span>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[var(--color-ink-3)]">{label}</span>
      <span className="font-mono text-[var(--color-ink)] tabular-nums">{value}</span>
    </div>
  );
}
