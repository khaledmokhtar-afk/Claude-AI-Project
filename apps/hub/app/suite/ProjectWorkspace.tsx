"use client";

import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWorkspace } from "@iesl/ui";
import type { ProjectAnalysis, ProjectMeta } from "@iesl/ui";
import type { HistoricalProject } from "@iesl/data";
import { ApiKeyMissing } from "../components/workspace/ApiKeyMissing";
import { ProjectBriefInput } from "./components/ProjectBriefInput";
import { ProjectDashboard } from "./components/ProjectDashboard";

type AnalyzeResponse = ProjectAnalysis & { analogs: HistoricalProject[] };

const STAGES = [
  "Retrieving analog project benchmarks…",
  "Generating work breakdown structure…",
  "Predicting risks with 30/60/90-day forecast…",
  "Computing P50/P80 cost estimate…",
];

export function ProjectWorkspace({ apiKeyPresent }: { apiKeyPresent: boolean }) {
  const {
    activeProject,
    createProject,
    updateAnalysis,
    clearActive,
    setActiveId,
    setScope,
    setWBS,
    setRisks,
    setEstimate,
  } = useWorkspace();

  const [isWorking, setIsWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analogs, setAnalogs] = useState<HistoricalProject[]>([]);
  const [stageIdx, setStageIdx] = useState(0);

  const analyze = useCallback(
    async (id: string, brief: string, meta: ProjectMeta) => {
      setError(null);
      setIsWorking(true);
      setStageIdx(0);

      const timers = STAGES.slice(1).map((_, i) =>
        setTimeout(() => setStageIdx(i + 1), (i + 1) * 3500),
      );

      try {
        const res = await fetch("/api/project/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectBrief: brief,
            sector: meta.sector,
            scale: meta.scale,
            horizon: meta.horizon,
          }),
        });

        if (!res.ok) {
          const errText = await res.text().catch(() => `HTTP ${res.status}`);
          throw new Error(errText || `Analysis failed (${res.status})`);
        }

        const data = (await res.json()) as AnalyzeResponse;

        if (!data.plan || !data.risks || !data.estimate) {
          throw new Error("Incomplete response from Claude — missing plan, risks, or estimate. Try again.");
        }

        const { analogs: analogList, ...analysis } = data;

        updateAnalysis(id, analysis);
        setAnalogs(analogList ?? []);

        // Mirror to Claude panel
        setScope({ projectName: analysis.projectName, summary: analysis.summary, text: brief });
        setWBS(analysis.plan);
        setRisks({
          projectSummary: brief,
          portfolioInsight: analysis.risks.portfolioInsight,
          newRisks: analysis.risks.newRisks,
        });
        setEstimate({ query: brief, ...analysis.estimate });
      } catch (e) {
        setError((e as Error).message);
        clearActive();
      } finally {
        timers.forEach(clearTimeout);
        setIsWorking(false);
        setStageIdx(0);
      }
    },
    [updateAnalysis, clearActive, setScope, setWBS, setRisks, setEstimate],
  );

  const handleGenerate = (input: string, meta: ProjectMeta) => {
    const proj = createProject(input, meta);
    void analyze(proj.id, input, meta);
  };

  // ── No API key ────────────────────────────────────────────────────────────
  if (!apiKeyPresent) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <ApiKeyMissing />
      </div>
    );
  }

  // ── Working ───────────────────────────────────────────────────────────────
  if (isWorking) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <div className="text-center max-w-md w-full space-y-10">
          {/* Spinning ring */}
          <div className="relative w-28 h-28 mx-auto">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full"
              style={{
                background: "conic-gradient(from 0deg, transparent 0%, #6366F1 25%, #10B981 55%, #EF4444 85%, transparent 100%)",
                mask: "radial-gradient(circle, transparent 36px, black 38px)",
                WebkitMask: "radial-gradient(circle, transparent 36px, black 38px)",
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-xl font-bold" style={{ fontFamily: "var(--font-display)" }}>IE</div>
            </div>
          </div>

          <div>
            <div className="eyebrow mb-3">Claude is working</div>
            <AnimatePresence mode="wait">
              <motion.p
                key={stageIdx}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
                className="text-base text-[var(--color-text-muted)] leading-relaxed"
              >
                {STAGES[stageIdx]}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Stage dots */}
          <div className="flex justify-center gap-2">
            {STAGES.map((_, i) => (
              <div
                key={i}
                className="rounded-full transition-all duration-500"
                style={{
                  width: i === stageIdx ? "24px" : "6px",
                  height: "6px",
                  background: i <= stageIdx ? "linear-gradient(90deg, #6366F1, #10B981)" : "rgba(255,255,255,0.15)",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full text-center space-y-6"
        >
          <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center">
            <svg className="w-7 h-7 text-red-400" viewBox="0 0 24 24" fill="none">
              <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white mb-2">Analysis failed</h2>
            <p className="text-sm text-[var(--color-text-muted)] leading-relaxed font-mono">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="px-6 py-2.5 rounded-xl font-semibold text-sm text-white"
            style={{ background: "linear-gradient(135deg, #6366F1, #10B981)" }}
          >
            Try again
          </button>
        </motion.div>
      </div>
    );
  }

  // ── Dashboard ─────────────────────────────────────────────────────────────
  if (activeProject?.analysis) {
    return (
      <ProjectDashboard
        project={activeProject}
        analysis={activeProject.analysis}
        analogs={analogs}
        isRegenerating={false}
        onRegenerate={() => void analyze(activeProject.id, activeProject.input, activeProject.meta)}
        onNew={() => {
          clearActive();
          setAnalogs([]);
        }}
        onPickPrevious={(id) => setActiveId(id)}
      />
    );
  }

  // ── Welcome ───────────────────────────────────────────────────────────────
  return (
    <div className="relative min-h-[88vh] px-4 md:px-6 py-16 md:py-24 overflow-hidden">
      {/* Mesh blobs */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute -top-60 -left-40 w-[700px] h-[700px] rounded-full blur-[120px] opacity-25 drift-slow"
          style={{ background: "radial-gradient(circle, #6366F1 0%, transparent 70%)" }} />
        <div className="absolute top-1/4 -right-40 w-[600px] h-[600px] rounded-full blur-[120px] opacity-20 drift-slow"
          style={{ background: "radial-gradient(circle, #10B981 0%, transparent 70%)", animationDelay: "3s" }} />
        <div className="absolute -bottom-40 left-1/4 w-[500px] h-[500px] rounded-full blur-[100px] opacity-15 drift-slow"
          style={{ background: "radial-gradient(circle, #EF4444 0%, transparent 70%)", animationDelay: "6s" }} />
      </div>

      {/* Hero */}
      <div className="max-w-3xl mx-auto text-center mb-14">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-sm mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-ring" />
          <span className="eyebrow">IESL Project Intelligence · Claude</span>
        </motion.div>

        <h1 className="font-display text-5xl md:text-7xl leading-[1.02] tracking-tight mb-6">
          {["One", "brief.", "Complete", "project", "intelligence."].map((w, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.6, delay: 0.1 + i * 0.07 }}
              className="inline-block mr-3"
            >
              {i === 4 ? (
                <span className="shimmer">{w}</span>
              ) : i === 1 || i === 4 ? (
                <span style={{ color: "#818CF8" }}>{w}</span>
              ) : (
                w
              )}
            </motion.span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="text-lg text-[var(--color-text-muted)] max-w-xl mx-auto leading-relaxed"
        >
          Describe your project. Claude generates a full WBS with Gantt schedule, a predictive risk
          register, and P50/P80 cost estimate — grounded in 40 real IESL analog projects.
        </motion.p>

        {/* Feature badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.75 }}
          className="flex flex-wrap justify-center gap-3 mt-8"
        >
          {[
            { label: "WBS + Critical Path", color: "#6366F1" },
            { label: "Risk Register 30/60/90d", color: "#EF4444" },
            { label: "P50 / P80 Cost", color: "#10B981" },
          ].map((b) => (
            <div key={b.label} className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.03] text-xs text-[var(--color-text-muted)]">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: b.color }} />
              {b.label}
            </div>
          ))}
        </motion.div>
      </div>

      <ProjectBriefInput onGenerate={handleGenerate} isGenerating={isWorking} />
    </div>
  );
}
