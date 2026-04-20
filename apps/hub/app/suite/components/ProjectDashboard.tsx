"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { ProjectAnalysis, ProjectSubmission } from "@iesl/ui";
import { useWorkspace } from "@iesl/ui";
import type { HistoricalProject } from "@iesl/data";
import { OverviewTab } from "./tabs/OverviewTab";
import { PlanTab } from "./tabs/PlanTab";
import { RisksTab } from "./tabs/RisksTab";
import { EstimateTab } from "./tabs/EstimateTab";

type TabId = "overview" | "plan" | "risks" | "estimate";

const TABS: { id: TabId; label: string }[] = [
  { id: "overview",  label: "Overview" },
  { id: "plan",      label: "Plan & Schedule" },
  { id: "risks",     label: "Risks & Mitigation" },
  { id: "estimate",  label: "Cost & Resources" },
];

export function ProjectDashboard({
  project,
  analysis,
  analogs,
  isRegenerating,
  onRegenerate,
  onNew,
  onPickPrevious,
}: {
  project: ProjectSubmission;
  analysis: ProjectAnalysis;
  analogs: HistoricalProject[];
  isRegenerating: boolean;
  onRegenerate: () => void;
  onNew: () => void;
  onPickPrevious?: (id: string) => void;
}) {
  const { projects } = useWorkspace();
  const [tab, setTab] = useState<TabId>("overview");
  const [historyOpen, setHistoryOpen] = useState(false);
  const otherProjects = projects.filter((p) => p.id !== project.id && p.analysis);

  return (
    <div className="w-full pb-20">
      {/* Sticky top bar */}
      <div className="sticky top-[62px] z-20 bg-[var(--color-bg)]/90 backdrop-blur border-b border-[var(--color-line)]">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          {/* Project header */}
          <div className="flex items-center justify-between gap-4 flex-wrap py-5">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1.5 text-[11px] font-mono uppercase tracking-[0.12em] text-[var(--color-ink-4)]">
                <span>
                  {new Date(project.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric", month: "short", year: "numeric",
                  })}
                </span>
                {project.meta.sector && <><span>·</span><span>{project.meta.sector}</span></>}
                {project.meta.scale && <><span>·</span><span>{project.meta.scale}</span></>}
                {project.meta.horizon && <><span>·</span><span>{project.meta.horizon}</span></>}
              </div>
              <h1 className="font-display text-[28px] md:text-[34px] leading-[1.08] tracking-[-0.02em] text-[var(--color-ink)] truncate">
                {analysis.projectName}
              </h1>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {otherProjects.length > 0 && onPickPrevious && (
                <div className="relative">
                  <button
                    onClick={() => setHistoryOpen((v) => !v)}
                    onBlur={() => setTimeout(() => setHistoryOpen(false), 140)}
                    className="btn-ghost"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
                      <path d="M1 7h12M1 4h12M1 10h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                    History
                  </button>
                  {historyOpen && (
                    <div className="absolute right-0 top-full mt-1.5 w-72 card-elev overflow-hidden z-50">
                      {otherProjects.slice(0, 5).map((p) => (
                        <button
                          key={p.id}
                          onMouseDown={() => onPickPrevious(p.id)}
                          className="w-full text-left px-4 py-3 text-[13px] hover:bg-[var(--color-card-soft)] transition-colors border-b border-[var(--color-line)] last:border-0"
                        >
                          <div className="font-medium text-[var(--color-ink)] truncate">{p.title}</div>
                          <div className="text-[11px] text-[var(--color-ink-4)] mt-0.5 font-mono">
                            {p.meta.sector ?? "No sector"}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <button
                onClick={onRegenerate}
                disabled={isRegenerating}
                className="btn-ghost"
              >
                {isRegenerating ? (
                  <span className="w-3.5 h-3.5 border-2 border-[var(--color-line-strong)] border-t-[var(--color-ink)] rounded-full spin-slow" />
                ) : (
                  <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7a5 5 0 019-3M12 7a5 5 0 01-9 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                    <path d="M11 1v3h-3M3 13v-3h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
                Regenerate
              </button>
              <button onClick={onNew} className="btn-primary">
                <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
                  <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
                New project
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-0 overflow-x-auto -mx-1" role="tablist">
            {TABS.map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={t.id === tab}
                onClick={() => setTab(t.id)}
                className="tab shrink-0"
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 pt-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            {tab === "overview"  && <OverviewTab  analysis={analysis} />}
            {tab === "plan"      && <PlanTab      analysis={analysis} />}
            {tab === "risks"     && <RisksTab     analysis={analysis} />}
            {tab === "estimate"  && <EstimateTab  analysis={analysis} analogs={analogs} query={project.input} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
