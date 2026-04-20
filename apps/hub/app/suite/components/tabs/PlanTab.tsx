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

  const stats = [
    { label: "Total tasks",    value: String(plan.tasks.length) },
    { label: "Total days",     value: `${schedule.totalDays}d` },
    { label: "Critical path",  value: `${schedule.criticalPath.length} tasks` },
    { label: "Resources",      value: `${new Set(plan.tasks.map((t) => t.resource).filter(Boolean)).size} types` },
    ...(plan.milestones?.length ? [{ label: "Milestones", value: String(plan.milestones.length) }] : []),
  ];

  return (
    <div className="space-y-6">
      {/* Stat chips */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap gap-2"
      >
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="card inline-flex items-center gap-2.5 px-3.5 py-2"
          >
            <span className="eyebrow">{s.label}</span>
            <span className="font-mono text-[13px] text-[var(--color-ink)] tabular-nums">{s.value}</span>
          </motion.div>
        ))}
      </motion.div>

      {/* Phases */}
      {plan.phaseSummaries && plan.phaseSummaries.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
        >
          <div className="eyebrow mb-3">Phases · primary driver per phase</div>
          <PhaseSummaryGrid phases={plan.phaseSummaries} />
        </motion.div>
      )}

      {/* Milestones */}
      {plan.milestones && plan.milestones.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="card p-6"
        >
          <div className="eyebrow mb-4">Milestones · gates, regulatory, deliveries, commissioning</div>
          <MilestoneTimeline milestones={plan.milestones} totalDays={schedule.totalDays} />
        </motion.div>
      )}

      {/* WBS + Gantt */}
      <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-6">
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.16 }}
          className="card overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-[var(--color-line)]">
            <div className="eyebrow">Work breakdown structure</div>
          </div>
          <div className="p-5">
            <WBSView tasks={plan.tasks} schedule={schedule} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="card overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-[var(--color-line)]">
            <div className="eyebrow">Gantt · critical path highlighted</div>
          </div>
          <div className="p-5">
            <GanttChart tasks={plan.tasks} schedule={schedule} />
          </div>
        </motion.div>
      </div>

      {/* Resource + Strategy */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24 }}
          className="card p-6"
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
