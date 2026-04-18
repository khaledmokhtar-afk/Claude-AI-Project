"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useMode } from "@iesl/ui";
import type { DemoProject, Risk } from "@iesl/data";
import { Header } from "./Header";
import { ProjectBar } from "./ProjectBar";
import { RiskMatrix } from "./RiskMatrix";
import { RiskTable } from "./RiskTable";
import { PredictionPanel } from "./PredictionPanel";
import { MonteCarlo } from "./MonteCarlo";
import { ExecutiveRiskReport } from "./ExecutiveRiskReport";

export type AiPrediction = {
  newRisks: {
    title: string;
    category: string;
    likelihood: number;
    impact: number;
    trend: string;
    predicted30d: number;
    predicted60d: number;
    predicted90d: number;
    description: string;
    mitigation: string;
  }[];
  portfolioInsight: string;
};

export function CommandCenter({
  projects,
  risks,
  apiKeyPresent,
}: {
  projects: DemoProject[];
  risks: Risk[];
  apiKeyPresent: boolean;
}) {
  const [mode, setMode] = useMode("demo");
  const [activeProjectId, setActiveProjectId] = useState(projects[0].id);
  const [selectedRiskId, setSelectedRiskId] = useState<string | null>(null);
  const [ai, setAi] = useState<AiPrediction | null>(null);
  const [aiThinking, setAiThinking] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);

  const project = projects.find((p) => p.id === activeProjectId)!;
  const projectRisks = useMemo(
    () => risks.filter((r) => r.projectId === activeProjectId),
    [risks, activeProjectId],
  );

  const runPrediction = async () => {
    setError(null);
    setAi(null);
    setAiThinking("");
    setIsRunning(true);

    if (mode === "demo") {
      await demoPrediction(project.name, projectRisks.length, setAiThinking);
      setAi(buildDemoPrediction(activeProjectId));
      setIsRunning(false);
      return;
    }

    try {
      const narration = streamNarration(project, projectRisks, setAiThinking);
      const jsonRes = await fetch("/api/predict-risks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectSummary: `${project.name}: ${project.summary} (Location: ${project.location}, Duration: ${project.durationMonths}mo, Budget: USD ${project.budgetUSDm}m)`,
          existingRisks: projectRisks.map((r) => ({
            title: r.title,
            category: r.category,
            likelihood: r.likelihood,
            impact: r.impact,
            status: r.status,
          })),
        }),
      });
      if (!jsonRes.ok) throw new Error((await jsonRes.text()) || "AI failed");
      const payload = (await jsonRes.json()) as AiPrediction;
      await narration;
      setAi(payload);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsRunning(false);
    }
  };

  const selectedRisk = projectRisks.find((r) => r.id === selectedRiskId) ?? projectRisks[0];

  return (
    <div className="max-w-[1500px] mx-auto px-6 py-8">
      <Header mode={mode} onModeChange={setMode} apiKeyPresent={apiKeyPresent} />

      <ProjectBar
        projects={projects}
        activeProjectId={activeProjectId}
        onChange={(id) => {
          setActiveProjectId(id);
          setSelectedRiskId(null);
          setAi(null);
          setAiThinking("");
        }}
        risks={risks}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 mt-6">
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-6">
            <RiskMatrix
              risks={projectRisks}
              selectedRiskId={selectedRisk?.id ?? null}
              onSelect={setSelectedRiskId}
            />
            <PredictionPanel
              selected={selectedRisk}
              aiForSelected={
                ai?.newRisks.find((r) => r.title === selectedRisk?.title)
              }
            />
          </div>

          <RiskTable
            risks={projectRisks}
            selectedRiskId={selectedRisk?.id ?? null}
            onSelect={setSelectedRiskId}
          />

          <MonteCarlo
            budgetUSDm={project.budgetUSDm}
            durationMonths={project.durationMonths}
            risks={projectRisks}
          />
        </div>

        <div className="flex flex-col gap-6">
          <div className="glass p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
                AI Predictive Run
              </div>
              {ai && (
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded" style={{ background: "var(--color-accent)", color: "var(--color-bg)" }}>
                  Live
                </span>
              )}
            </div>
            <button
              onClick={runPrediction}
              disabled={isRunning}
              className="w-full py-3 rounded-lg font-semibold text-sm transition-all disabled:opacity-40"
              style={{
                background:
                  mode === "ai" ? "var(--color-accent)" : "var(--color-primary)",
                color: mode === "ai" ? "var(--color-bg)" : "white",
                boxShadow:
                  mode === "ai"
                    ? "0 0 32px -8px var(--color-accent)"
                    : "0 0 28px -10px var(--color-primary)",
              }}
            >
              {isRunning
                ? "Predicting…"
                : mode === "ai"
                  ? "⚡ Run with Claude"
                  : "▶ Run Predictive Model"}
            </button>

            <AnimatePresence>
              {aiThinking && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 text-xs font-[var(--font-mono)] whitespace-pre-wrap text-[var(--color-text-muted)] max-h-52 overflow-auto"
                >
                  {aiThinking}
                  {isRunning && <span className="cursor-blink">▊</span>}
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <div className="mt-3 text-xs text-[var(--color-primary-soft)]">{error}</div>
            )}
          </div>

          {ai && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass p-5"
            >
              <div className="text-xs uppercase tracking-wider text-[var(--color-accent)] mb-2">
                Portfolio insight
              </div>
              <p className="text-sm text-[var(--color-text)] mb-4">{ai.portfolioInsight}</p>

              <div className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
                New risks detected ({ai.newRisks.length})
              </div>
              <div className="flex flex-col gap-2 max-h-80 overflow-auto pr-1">
                {ai.newRisks.map((r, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-soft)]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-medium text-sm">{r.title}</div>
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded shrink-0"
                        style={{
                          background: "rgba(245,158,11,0.15)",
                          color: "var(--color-accent)",
                        }}
                      >
                        {r.category}
                      </span>
                    </div>
                    <div className="text-xs text-[var(--color-text-muted)] mt-1">{r.description}</div>
                    <div className="flex items-center gap-3 mt-2 text-[11px] font-mono text-[var(--color-text-muted)]">
                      <span>L{r.likelihood}×I{r.impact}</span>
                      <span>→ 30d {(r.predicted30d * 100).toFixed(0)}%</span>
                      <span>60d {(r.predicted60d * 100).toFixed(0)}%</span>
                      <span>90d {(r.predicted90d * 100).toFixed(0)}%</span>
                    </div>
                    <div className="mt-2 text-xs">
                      <span className="text-[var(--color-success)] font-medium">Mitigation: </span>
                      <span className="text-[var(--color-text)]">{r.mitigation}</span>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowReport(true)}
                className="mt-4 w-full py-2 rounded-lg font-medium text-sm glow-primary"
                style={{ background: "var(--color-primary)", color: "white" }}
              >
                Generate Executive Risk Snapshot →
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {showReport && (
        <ExecutiveRiskReport
          project={project}
          risks={projectRisks}
          ai={ai}
          mode={mode}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  );
}

async function demoPrediction(name: string, count: number, setThinking: (t: string) => void) {
  const lines = [
    `Loading ${name} risk register (${count} risks)…`,
    `Sampling analog projects from IESL archive…`,
    `Projecting escalation probabilities for 30, 60, 90 days…`,
    `Scanning for emergent risks not yet on the register…`,
    `Drafting mitigations aligned to HSE and commercial posture…`,
    `Done.`,
  ].join("\n");
  let i = 0;
  await new Promise<void>((resolve) => {
    const tick = () => {
      if (i > lines.length) return resolve();
      setThinking(lines.slice(0, i));
      i += 3;
      setTimeout(tick, 22);
    };
    tick();
  });
}

async function streamNarration(
  project: DemoProject,
  existing: Risk[],
  setThinking: (t: string) => void,
) {
  const res = await fetch("/api/narrate-risk", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ project, count: existing.length }),
  });
  if (!res.ok || !res.body) return;
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let acc = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    acc += decoder.decode(value, { stream: true });
    setThinking(acc);
  }
}

function buildDemoPrediction(projectId: string): AiPrediction {
  const map: Record<string, AiPrediction> = {
    "fpso-aurora": {
      newRisks: [
        {
          title: "Nitrogen supply shortage during compressor refit",
          category: "Supply Chain",
          likelihood: 3,
          impact: 4,
          trend: "Rising",
          predicted30d: 0.34,
          predicted60d: 0.48,
          predicted90d: 0.58,
          description:
            "Regional nitrogen plants at 93% capacity; compressor purge needs large volumes over 5-day window.",
          mitigation:
            "Pre-purchase nitrogen slugs; second supplier on MoU; reserve tanker capacity for Q2.",
        },
        {
          title: "COVID-like workforce disruption on yard slot",
          category: "Schedule",
          likelihood: 2,
          impact: 4,
          trend: "Stable",
          predicted30d: 0.18,
          predicted60d: 0.22,
          predicted90d: 0.28,
          description:
            "Yard personnel density is high; respiratory outbreak history caused 4-week slip in 2021.",
          mitigation:
            "Pandemic protocol kept on file; local clinic contracted; vaccination drive completed.",
        },
        {
          title: "Marine insurance premium escalation",
          category: "Cost",
          likelihood: 4,
          impact: 3,
          trend: "Rising",
          predicted30d: 0.55,
          predicted60d: 0.62,
          predicted90d: 0.70,
          description:
            "Gulf of Guinea security premiums are up YoY; renewal due in 45 days.",
          mitigation:
            "Broker tendering with 3 underwriters; convoy schedule revised; ESG disclosures submitted.",
        },
      ],
      portfolioInsight:
        "FPSO Aurora's exposure is dominated by swivel-inspection HSE risk and Lagos yard slot slippage — together they account for ~68% of the simulated cost contingency. Prioritise locking the yard slot this quarter and running the pre-inspection NDT two weeks earlier than currently planned.",
    },
    "nd-pipeline-ph": {
      newRisks: [
        {
          title: "Kerosene substitution for coating oven gas supply",
          category: "Technical",
          likelihood: 2,
          impact: 3,
          trend: "Stable",
          predicted30d: 0.22,
          predicted60d: 0.28,
          predicted90d: 0.33,
          description:
            "Onshore coating plant may default to kerosene; affects coating adhesion & inspection pass rate.",
          mitigation:
            "Confirm gas feedstock; independent adhesion test per 200m section.",
        },
        {
          title: "NIMASA inspection delay on lay barge mobilisation",
          category: "Regulatory",
          likelihood: 3,
          impact: 4,
          trend: "Rising",
          predicted30d: 0.38,
          predicted60d: 0.50,
          predicted90d: 0.58,
          description:
            "Recent NIMASA turnaround on deep-draft barges extended from 9 to 16 days.",
          mitigation:
            "Pre-inspection package filed; dedicated port agent; backup anchorage nominated.",
        },
        {
          title: "Host community labour quota renegotiation",
          category: "Geopolitical",
          likelihood: 4,
          impact: 3,
          trend: "Rising",
          predicted30d: 0.52,
          predicted60d: 0.60,
          predicted90d: 0.68,
          description:
            "Cluster-wide labour quota under pressure; previous similar renegotiation delayed works 18 days.",
          mitigation:
            "Pre-emptive GMoU amendment; alternate skills pool identified upstream.",
        },
      ],
      portfolioInsight:
        "Niger Delta Pipeline Replacement remains weather-window bound; Monte Carlo simulation shows 62% probability of completion within planned 90-day window only if community GMoU closes before week 6. Accelerating local welder qualification and locking the lay-barge spread under a force-majeure-tight contract will meaningfully cut P80 cost exposure.",
    },
    "whp-egina": {
      newRisks: [
        {
          title: "Cross-project HLV competition with nearby tie-back",
          category: "Schedule",
          likelihood: 4,
          impact: 4,
          trend: "Rising",
          predicted30d: 0.58,
          predicted60d: 0.66,
          predicted90d: 0.74,
          description:
            "Neighbouring operator's tie-back lift window overlaps by 11 days; HLV contracted to both.",
          mitigation:
            "Inter-operator coordination call; pre-stage jacket for earlier slot; alternate HLV on option.",
        },
        {
          title: "Subsea tree mispairing with manifold",
          category: "Technical",
          likelihood: 2,
          impact: 5,
          trend: "Stable",
          predicted30d: 0.20,
          predicted60d: 0.24,
          predicted90d: 0.26,
          description:
            "Two tree-manifold interfaces revealed 0.3mm dimensional drift at FAT; recovery plan costly.",
          mitigation:
            "Dimensional re-verification at site integration test; drift-correction shim prefabricated.",
        },
        {
          title: "Deepwater diving team certification expiry",
          category: "HSE",
          likelihood: 2,
          impact: 4,
          trend: "Rising",
          predicted30d: 0.26,
          predicted60d: 0.34,
          predicted90d: 0.40,
          description:
            "3 of 8 saturation divers have certification expiring within 60 days.",
          mitigation:
            "Recertification booked; backup divers from partner contractor on retainer.",
        },
      ],
      portfolioInsight:
        "Egina Wellhead Platform installation is dominated by heavy-lift vessel availability. Simulation indicates a 41% chance the planned Q2 slot slips by two or more weeks. Early lock-in of a secondary HLV and pre-fabrication of jacket sections by mid-Q1 flattens the P80 cost curve by roughly USD 6.2m.",
    },
  };
  return map[projectId] ?? map["fpso-aurora"];
}
