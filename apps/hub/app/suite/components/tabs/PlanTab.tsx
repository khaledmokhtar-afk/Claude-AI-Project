"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import type { ProjectAnalysis } from "@iesl/ui";
import { WBSView } from "../../scope/components/WBSView";
import { GanttChart } from "../../scope/components/GanttChart";
import { computeSchedule } from "../../scope/lib/schedule";
import { MilestoneTimeline } from "./plan/MilestoneTimeline";
import { ResourceHistogram } from "./plan/ResourceHistogram";
import { PhaseSummaryGrid } from "./plan/PhaseSummaryGrid";
import { ScheduleStrategyCard } from "./plan/ScheduleStrategyCard";

export function PlanTab({ analysis }: { analysis: ProjectAnalysis }) {
  const { plan } = analysis;
  const schedule = useMemo(() => computeSchedule(plan.tasks), [plan.tasks]);

  return (
    <div className="space-y-6">
      {/* Header stats */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap gap-4"
      >
        {[
          { label: "Total tasks", value: plan.tasks.length },
          { label: "Total days", value: `${schedule.totalDays}d` },
          { label: "Critical path", value: `${schedule.criticalPath.length} tasks` },
          { label: "Resources", value: `${new Set(plan.tasks.map((t) => t.resource).filter(Boolean)).size} types` },
          ...(plan.milestones?.length ? [{ label: "Milestones", value: plan.milestones.length }] : []),
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-white/8 bg-white/[0.03]"
          >
            <div className="text-xs text-[var(--color-text-muted)]">{s.label}</div>
            <div className="text-sm font-semibold font-mono text-[var(--color-text)]">{s.value}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Phase summary cards */}
      {plan.phaseSummaries && plan.phaseSummaries.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="eyebrow mb-3">Phases · primary driver per phase</div>
          <PhaseSummaryGrid phases={plan.phaseSummaries} />
        </motion.div>
      )}

      {/* Milestone timeline */}
      {plan.milestones && plan.milestones.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl border border-white/8 bg-white/[0.03] p-6"
        >
          <div className="eyebrow mb-4">Milestones · gates, regulatory, deliveries, commissioning</div>
          <MilestoneTimeline milestones={plan.milestones} totalDays={schedule.totalDays} />
        </motion.div>
      )}

      {/* Two-column: WBS + Gantt */}
      <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-6">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-white/8 bg-white/[0.03] overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-white/5">
            <div className="eyebrow">Work breakdown structure</div>
          </div>
          <div className="p-5">
            <WBSView tasks={plan.tasks} schedule={schedule} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-2xl border border-white/8 bg-white/[0.03] overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-white/5">
            <div className="eyebrow">Gantt chart · Critical path highlighted</div>
          </div>
          <div className="p-5">
            <GanttChart tasks={plan.tasks} schedule={schedule} />
          </div>
        </motion.div>
      </div>

      {/* Resource histogram + Strategy card */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-white/8 bg-white/[0.03] p-6"
        >
          <div className="eyebrow mb-4">Resource loading · person-days by discipline</div>
          <ResourceHistogram load={plan.resourceLoad} tasks={plan.tasks} />
        </motion.div>

        {plan.scheduleStrategy && (
          <ScheduleStrategyCard strategy={plan.scheduleStrategy} />
        )}
      </div>
    </div>
  );
}
