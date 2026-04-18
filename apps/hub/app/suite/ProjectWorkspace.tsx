"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useWorkspace } from "@iesl/ui";
import type { ProjectAnalysis, ProjectMeta } from "@iesl/ui";
import type { HistoricalProject } from "@iesl/data";
import { ApiKeyMissing } from "../components/workspace/ApiKeyMissing";
import { ProjectBriefInput } from "./components/ProjectBriefInput";
import { ProjectDashboard } from "./components/ProjectDashboard";

type AnalyzeResponse = ProjectAnalysis & { analogs: HistoricalProject[] };

const HERO_WORDS = ["One", "brief.", "Complete", "project", "intelligence."];

export function ProjectWorkspace({ apiKeyPresent }: { apiKeyPresent: boolean }) {
  const {
    activeProject,
    createProject,
    updateAnalysis,
    clearActive,
    setScope,
    setWBS,
    setRisks,
    setEstimate,
  } = useWorkspace();

  const [isWorking, setIsWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analogs, setAnalogs] = useState<HistoricalProject[]>([]);
  const [stage, setStage] = useState<string>("");

  const analyze = useCallback(
    async (id: string, brief: string, meta: ProjectMeta) => {
      setError(null);
      setIsWorking(true);
      setStage("Retrieving analog projects…");

      try {
        setTimeout(() => setStage("Generating work breakdown & schedule…"), 600);
        setTimeout(() => setStage("Predicting risks & mitigations…"), 2400);
        setTimeout(() => setStage("Computing cost bands & sensitivity…"), 4800);

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
          throw new Error((await res.text()) || "Analysis failed");
        }

        const data = (await res.json()) as AnalyzeResponse;
        const { analogs: analogList, ...analysis } = data;

        updateAnalysis(id, analysis);
        setAnalogs(analogList);

        // Mirror to Claude panel state
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
      } finally {
        setIsWorking(false);
        setStage("");
      }
    },
    [updateAnalysis, setScope, setWBS, setRisks, setEstimate],
  );

  // Auto-analyze when a freshly-created project has no analysis yet
  useEffect(() => {
    if (activeProject && !activeProject.analysis && !isWorking) {
      void analyze(activeProject.id, activeProject.input, activeProject.meta);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProject?.id]);

  // Rehydrate analogs when switching to an existing project with analysis
  useEffect(() => {
    if (activeProject?.analysis && analogs.length === 0) {
      setAnalogs([]);
    }
  }, [activeProject?.id, activeProject?.analysis, analogs.length]);

  const handleGenerate = (input: string, meta: ProjectMeta) => {
    const proj = createProject(input, meta);
    void analyze(proj.id, input, meta);
  };

  if (!apiKeyPresent) {
    return (
      <div className="relative min-h-[85vh] flex items-center justify-center px-4">
        <ApiKeyMissing />
      </div>
    );
  }

  // Dashboard when a project is active and has analysis
  if (activeProject && activeProject.analysis) {
    return (
      <ProjectDashboard
        project={activeProject}
        analysis={activeProject.analysis}
        analogs={analogs}
        isRegenerating={isWorking}
        onRegenerate={() => analyze(activeProject.id, activeProject.input, activeProject.meta)}
        onNew={() => {
          clearActive();
          setAnalogs([]);
          setError(null);
        }}
      />
    );
  }

  // Working state — show a beautiful generating screen
  if (isWorking && activeProject) {
    return (
      <div className="relative min-h-[85vh] flex items-center justify-center px-4">
        <div className="max-w-lg w-full text-center space-y-8">
          <div className="relative w-24 h-24 mx-auto">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full"
              style={{
                background: "conic-gradient(from 0deg, transparent 0%, #6366F1 30%, #10B981 60%, #EF4444 90%, transparent 100%)",
                mask: "radial-gradient(circle, transparent 32px, black 34px)",
                WebkitMask: "radial-gradient(circle, transparent 32px, black 34px)",
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-display text-xl">IE</span>
            </div>
          </div>

          <div>
            <div className="eyebrow mb-2">Claude is analyzing</div>
            <h2 className="font-display text-3xl mb-4 line-clamp-2">{activeProject.title}</h2>
            <motion.p
              key={stage}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-[var(--color-text-muted)]"
            >
              {stage || "Warming up the model…"}
            </motion.p>
          </div>

          {error && (
            <div className="mt-4 p-4 rounded-xl border border-red-500/30 bg-red-500/[0.04] text-sm text-red-300">
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Welcome screen
  return (
    <div className="relative min-h-[88vh] px-4 md:px-6 py-12 md:py-20 overflow-hidden">
      {/* Animated mesh background */}
      <div className="absolute inset-0 pointer-events-none -z-10 opacity-40">
        <div
          className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full blur-3xl drift-slow"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.35) 0%, transparent 70%)" }}
        />
        <div
          className="absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full blur-3xl drift-slow"
          style={{
            background: "radial-gradient(circle, rgba(16,185,129,0.3) 0%, transparent 70%)",
            animationDelay: "2s",
          }}
        />
        <div
          className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] rounded-full blur-3xl drift-slow"
          style={{
            background: "radial-gradient(circle, rgba(220,38,38,0.22) 0%, transparent 70%)",
            animationDelay: "4s",
          }}
        />
      </div>

      <div className="max-w-3xl mx-auto text-center mb-12">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-sm mb-6"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-ring" />
          <span className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-muted)] font-semibold">
            IESL Project Intelligence
          </span>
        </motion.div>

        <h1 className="font-display text-4xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight mb-6">
          {HERO_WORDS.map((w, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.55, delay: 0.12 + i * 0.06 }}
              className="inline-block mr-3"
            >
              {i === HERO_WORDS.length - 1 ? (
                <span className="shimmer">{w}</span>
              ) : (
                w
              )}
            </motion.span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-base md:text-lg text-[var(--color-text-muted)] max-w-2xl mx-auto leading-relaxed"
        >
          Describe a project once. Claude produces a phased work-breakdown schedule with critical path,
          a predictive risk register with 30/60/90-day probabilities, and a P50/P80 cost estimate grounded
          in 40 historical IESL analog projects.
        </motion.p>
      </div>

      <ProjectBriefInput onGenerate={handleGenerate} isGenerating={isWorking} />

      {error && (
        <div className="max-w-3xl mx-auto mt-4 p-4 rounded-xl border border-red-500/30 bg-red-500/[0.04] text-sm text-red-300">
          {error}
        </div>
      )}
    </div>
  );
}
