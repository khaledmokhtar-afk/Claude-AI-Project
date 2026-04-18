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

const TABS: { id: TabId; label: string; dot: string }[] = [
  { id: "overview",  label: "Overview",           dot: "#818CF8" },
  { id: "plan",      label: "Plan & Schedule",     dot: "#F59E0B" },
  { id: "risks",     label: "Risks & Mitigation",  dot: "#EF4444" },
  { id: "estimate",  label: "Cost & Resources",    dot: "#10B981" },
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
  const otherProjects = projects.filter((p) => p.id !== project.id && p.analysis);

  return (
    <div className="w-full pb-16">
      {/* Top bar */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-10 bg-[var(--color-bg)]/90 backdrop-blur border-b border-white/5"
      >
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          {/* Project header */}
          <div className="flex items-center justify-between gap-4 flex-wrap py-4">
            <div className="min-w-0 flex-1">
              <div className="eyebrow mb-1">
                {new Date(project.createdAt).toLocaleDateString("en-GB", {
                  day: "numeric", month: "short", year: "numeric",
                })}
                {project.meta.sector && ` · ${project.meta.sector}`}
                {project.meta.scale && ` · ${project.meta.scale}`}
              </div>
              <h1 className="font-display text-xl md:text-2xl truncate text-white leading-tight">
                {analysis.projectName}
              </h1>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {otherProjects.length > 0 && onPickPrevious && (
                <div className="relative group">
                  <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-white/10 hover:border-white/20 text-[var(--color-text-muted)] hover:text-white transition-all">
                    <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                      <path d="M1 6h10M1 3h10M1 9h6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                    </svg>
                    History
                  </button>
                  <div className="absolute right-0 top-full mt-1.5 w-64 rounded-xl border border-white/10 bg-[#0B0F1A] shadow-2xl overflow-hidden opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-150 z-50">
                    {otherProjects.slice(0, 5).map((p) => (
                      <button
                        key={p.id}
                        onClick={() => onPickPrevious(p.id)}
                        className="w-full text-left px-4 py-3 text-sm hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                      >
                        <div className="font-medium text-white truncate">{p.title}</div>
                        <div className="text-xs text-[var(--color-text-muted)] mt-0.5">{p.meta.sector ?? "No sector"}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <button
                onClick={onRegenerate}
                disabled={isRegenerating}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-white/10 hover:border-white/20 text-[var(--color-text-muted)] hover:text-white transition-all disabled:opacity-40"
              >
                {isRegenerating ? (
                  <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6a4 4 0 017-2.65M10 6a4 4 0 01-7 2.65" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                    <path d="M9.5 1.5v3h-3M2.5 10.5v-3h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
                Regenerate
              </button>
              <button
                onClick={onNew}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg text-white transition-all"
                style={{ background: "linear-gradient(135deg, #6366F1, #10B981)" }}
              >
                <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                  <path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                New project
              </button>
            </div>
          </div>

          {/* Tab bar */}
          <div className="flex items-center gap-0 overflow-x-auto">
            {TABS.map((t) => {
              const active = t.id === tab;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`relative flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors shrink-0 border-b-2 ${
                    active
                      ? "text-white border-transparent"
                      : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] border-transparent"
                  }`}
                >
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: active ? t.dot : "rgba(255,255,255,0.2)" }}
                  />
                  {t.label}
                  {active && (
                    <motion.div
                      layoutId="tab-indicator"
                      className="absolute bottom-[-1px] left-0 right-0 h-[2px] rounded-t-full"
                      style={{ background: `linear-gradient(90deg, ${t.dot}, ${t.dot}88)` }}
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Tab content */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 pt-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
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
