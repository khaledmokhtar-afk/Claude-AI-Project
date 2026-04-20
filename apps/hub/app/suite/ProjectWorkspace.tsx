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
  "Retrieving analog project benchmarks",
  "Generating work breakdown structure",
  "Predicting risks with 30/60/90-day forecast",
  "Computing P50/P80 cost estimate",
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
      <div className="flex items-center justify-center min-h-[80vh] px-4 py-12">
        <ApiKeyMissing />
      </div>
    );
  }

  // ── Working ───────────────────────────────────────────────────────────────
  if (isWorking) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <div className="text-center max-w-md w-full">
          <div className="card-elev p-10">
            <div className="relative w-14 h-14 mx-auto mb-6">
              <div
                className="absolute inset-0 rounded-full border-[3px] border-[var(--color-line)]"
              />
              <div
                className="absolute inset-0 rounded-full border-[3px] border-transparent spin-slow"
                style={{ borderTopColor: "var(--color-brand)" }}
              />
            </div>

            <div className="eyebrow eyebrow-brand mb-3">Claude is working</div>
            <AnimatePresence mode="wait">
              <motion.p
                key={stageIdx}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.25 }}
                className="font-display text-[22px] leading-[1.3] text-[var(--color-ink)] max-w-[320px] mx-auto"
              >
                {STAGES[stageIdx]}
              </motion.p>
            </AnimatePresence>

            <div className="flex justify-center gap-1.5 mt-6">
              {STAGES.map((_, i) => (
                <div
                  key={i}
                  className="rounded-full transition-all duration-500"
                  style={{
                    width: i === stageIdx ? "22px" : "6px",
                    height: "6px",
                    background: i <= stageIdx ? "var(--color-brand)" : "var(--color-line-strong)",
                  }}
                />
              ))}
            </div>

            <p className="text-[12px] text-[var(--color-ink-4)] mt-6 font-mono">
              Usually completes in 25–40 seconds
            </p>
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
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card-elev p-8 max-w-lg w-full"
        >
          <div className="w-11 h-11 rounded-xl grid place-items-center mb-4" style={{ background: "var(--color-bad-soft)" }}>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" style={{ color: "var(--color-bad)" }}>
              <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="eyebrow mb-2" style={{ color: "var(--color-bad)" }}>Analysis failed</div>
          <h2 className="font-display text-[24px] leading-tight text-[var(--color-ink)] mb-3">
            Claude couldn&apos;t finish this one.
          </h2>
          <pre className="text-[12.5px] text-[var(--color-ink-3)] leading-relaxed font-mono bg-[var(--color-card-soft)] border border-[var(--color-line)] rounded-lg p-3 whitespace-pre-wrap break-words">
            {error}
          </pre>
          <button
            onClick={() => setError(null)}
            className="btn-primary mt-5"
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
    <div className="relative min-h-[88vh]">
      {/* Subtle grid behind hero */}
      <div className="absolute inset-x-0 top-0 h-[520px] bg-grid pointer-events-none -z-10" />

      <div className="max-w-[1100px] mx-auto px-6 lg:px-10 pt-16 lg:pt-24 pb-20">
        {/* Hero */}
        <div className="max-w-[820px] mb-12">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 mb-6"
          >
            <span className="dot dot-brand" />
            <span className="eyebrow eyebrow-brand">
              For capital projects · Powered by Claude
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="font-display text-[clamp(40px,6vw,64px)] leading-[1.04] tracking-[-0.025em] text-[var(--color-ink)]"
          >
            From a paragraph to a{" "}
            <em className="italic text-[var(--color-brand-ink)] not-italic-fallback">
              defensible
            </em>{" "}
            project plan,
            <br className="hidden sm:block" /> in under two minutes.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="mt-6 text-[17px] leading-[1.6] text-[var(--color-ink-3)] max-w-[620px]"
          >
            Describe a capital project in plain English. Claude returns a full work breakdown with
            critical path, an ISO-grounded risk register with 30/60/90-day forecasts, and a
            P50/P80 cost estimate — calibrated against 40 real IESL analog projects.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-6 flex flex-wrap gap-2"
          >
            <span className="chip">ISO 31000</span>
            <span className="chip">ISO 45001</span>
            <span className="chip">ISO 14001</span>
            <span className="chip chip-brand">AACE Class 3</span>
            <span className="chip">40+ analog projects</span>
          </motion.div>
        </div>

        {/* Input */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <ProjectBriefInput onGenerate={handleGenerate} isGenerating={isWorking} />
        </motion.div>

        {/* How it works */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="mt-20"
        >
          <div className="eyebrow mb-5">How it works</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Step
              n={1}
              title="Describe the project"
              body="One paragraph of scope — plus optional sector, scale, and delivery horizon."
            />
            <Step
              n={2}
              title="Claude analyses in parallel"
              body="ScopeSmith builds the WBS, RiskLens predicts risks, EstimatorAI prices it against analogs."
            />
            <Step
              n={3}
              title="Drill in and iterate"
              body="Four dashboards — Overview, Plan & Schedule, Risks, Cost — all stay in sync. Ask Claude anything."
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-3 mb-2.5">
        <span
          className="w-7 h-7 rounded-full grid place-items-center font-mono text-[12px] font-semibold text-white"
          style={{ background: "var(--color-ink)" }}
        >
          {n}
        </span>
        <span className="font-display text-[17px] tracking-[-0.01em] text-[var(--color-ink)]">
          {title}
        </span>
      </div>
      <p className="text-[13.5px] leading-[1.6] text-[var(--color-ink-3)]">{body}</p>
    </div>
  );
}
