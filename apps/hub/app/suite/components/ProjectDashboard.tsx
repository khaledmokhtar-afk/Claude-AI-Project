"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { ProjectAnalysis, ProjectSubmission } from "@iesl/ui";
import type { HistoricalProject } from "@iesl/data";
import { OverviewTab } from "./tabs/OverviewTab";
import { PlanTab } from "./tabs/PlanTab";
import { RisksTab } from "./tabs/RisksTab";
import { EstimateTab } from "./tabs/EstimateTab";

type TabId = "overview" | "plan" | "risks" | "estimate";

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  {
    id: "overview",
    label: "Overview",
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    id: "plan",
    label: "Plan & Schedule",
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="3" width="8" height="2" rx="1" fill="currentColor" />
        <rect x="4" y="7" width="10" height="2" rx="1" fill="currentColor" />
        <rect x="3" y="11" width="7" height="2" rx="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "risks",
    label: "Risks & Mitigation",
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
        <path d="M8 1.5L14.5 13h-13L8 1.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M8 6v3M8 11.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "estimate",
    label: "Cost & Resources",
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 4.5v7M6 7h4M6 9h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

export function ProjectDashboard({
  project,
  analysis,
  analogs,
  isRegenerating,
  onRegenerate,
  onNew,
}: {
  project: ProjectSubmission;
  analysis: ProjectAnalysis;
  analogs: HistoricalProject[];
  isRegenerating: boolean;
  onRegenerate: () => void;
  onNew: () => void;
}) {
  const [tab, setTab] = useState<TabId>("overview");

  return (
    <div className="w-full max-w-[1500px] mx-auto px-4 md:px-8 pb-12">
      {/* Top bar */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between gap-4 flex-wrap mb-6 py-4"
      >
        <div className="min-w-0 flex-1">
          <div className="eyebrow mb-1">Project · {new Date(project.createdAt).toLocaleDateString()}</div>
          <h1 className="font-display text-2xl md:text-3xl truncate">{analysis.projectName}</h1>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg border border-white/10 hover:border-white/25 hover:bg-white/5 transition-all text-[var(--color-text)] disabled:opacity-50"
          >
            {isRegenerating ? (
              <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
                <path d="M3 8a5 5 0 019-3M13 8a5 5 0 01-9 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M12.5 2v3h-3M3.5 14v-3h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            Regenerate
          </button>
          <button
            onClick={onNew}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-white text-[var(--color-bg)] hover:bg-white/90 transition-all"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
              <path d="M8 3.5v9M3.5 8h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            New project
          </button>
        </div>
      </motion.div>

      {/* Tab bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-6 border-b border-white/8"
      >
        <div className="flex items-center gap-1 overflow-x-auto">
          {TABS.map((t) => {
            const active = t.id === tab;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors shrink-0 ${
                  active
                    ? "text-white"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                }`}
              >
                {t.icon}
                {t.label}
                {active && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute bottom-[-1px] left-0 right-0 h-[2px] rounded-t-full"
                    style={{
                      background: "linear-gradient(to right, #6366F1, #10B981)",
                    }}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
        >
          {tab === "overview" && <OverviewTab analysis={analysis} />}
          {tab === "plan" && <PlanTab analysis={analysis} />}
          {tab === "risks" && <RisksTab analysis={analysis} />}
          {tab === "estimate" && <EstimateTab analysis={analysis} analogs={analogs} query={project.input} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
