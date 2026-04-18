"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useWorkspace } from "@iesl/ui";
import type { Risk } from "@iesl/data";
import { Hero } from "../../../components/workspace/Hero";
import { InputCard } from "../../../components/workspace/InputCard";
import { BacklogStrip } from "../../../components/workspace/BacklogStrip";
import { ApiKeyMissing } from "../../../components/workspace/ApiKeyMissing";
import { ResultShell } from "../../../components/workspace/ResultShell";
import { RiskMatrix } from "./RiskMatrix";
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

export function RiskLensWorkspace({ apiKeyPresent }: { apiKeyPresent: boolean }) {
  const {
    activeSubmission,
    createSubmission,
    updateSubmissionOutput,
    clearActive,
    setRisks,
  } = useWorkspace();
  const submission = activeSubmission("risk");

  const [selectedRiskId, setSelectedRiskId] = useState<string | null>(null);
  const [thinking, setThinking] = useState("");
  const [isWorking, setIsWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);

  const result = submission?.output as AiPrediction | undefined;

  useEffect(() => {
    setSelectedRiskId(null);
    if (submission && !submission.output) {
      void generateFor(submission.id, submission.input, submission.meta ?? {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submission?.id]);

  const generateFor = useCallback(
    async (id: string, text: string, meta: Record<string, string>) => {
      setError(null);
      setThinking("");
      setIsWorking(true);
      const projectSummary = buildSummary(text, meta);
      try {
        const narration = streamNarration(projectSummary, setThinking);
        const jsonRes = await fetch("/api/risk/predict-risks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectSummary,
            existingRisks: [],
          }),
        });
        if (!jsonRes.ok) throw new Error((await jsonRes.text()) || "AI failed");
        const payload = (await jsonRes.json()) as AiPrediction;
        await narration;
        updateSubmissionOutput<AiPrediction>("risk", id, payload);
        setRisks({
          projectSummary,
          portfolioInsight: payload.portfolioInsight,
          newRisks: payload.newRisks,
        });
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setIsWorking(false);
      }
    },
    [updateSubmissionOutput, setRisks],
  );

  const handleSubmit = (text: string, meta: Record<string, string>) => {
    const sub = createSubmission("risk", text, meta);
    void generateFor(sub.id, text, meta);
  };

  if (!apiKeyPresent) {
    return (
      <div className="relative min-h-[90vh] px-6">
        <Hero
          eyebrow="Risk Intelligence"
          title="See the risks before they see you."
          subtitle="Describe the project and Claude builds a predictive risk register with likelihood × impact scores, 30/60/90-day probabilities, and pre-drafted mitigations."
        />
        <ApiKeyMissing />
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="relative min-h-[90vh] px-6 pb-14">
        <Hero
          eyebrow="Risk Intelligence"
          title="See the risks before they see you."
          subtitle="Describe the project and Claude builds a predictive risk register with likelihood × impact scores, 30/60/90-day probabilities, and pre-drafted mitigations."
        />
        <InputCard
          kind="risk"
          placeholder="e.g. 18km shallow-water pipeline tie-in in OML 58, wet-season start, host-community sensitive, 42-day window with a lay barge and coating yard in Onne…"
          meta={[
            {
              kind: "select",
              key: "sector",
              label: "Sector",
              options: ["Subsea", "FPSO", "Pipeline", "Drilling", "Platform"],
            },
            {
              kind: "select",
              key: "horizon",
              label: "Horizon",
              options: ["< 3 months", "3–6 months", "6–12 months", "1 year+"],
            },
          ]}
          onSubmit={handleSubmit}
        />
        <BacklogStrip kind="risk" />
      </div>
    );
  }

  const projectName = submission.title;
  const risksForMatrix: Risk[] = (result?.newRisks ?? []).map((r, i) => ({
    id: `ai-${i}`,
    projectId: submission.id,
    title: r.title,
    category: r.category,
    likelihood: r.likelihood,
    impact: r.impact,
    trend: r.trend,
    description: r.description,
    mitigation: r.mitigation,
  }));

  return (
    <ResultShell
      submission={submission}
      streaming={isWorking}
      onNewSession={() => {
        clearActive("risk");
        setThinking("");
        setError(null);
      }}
      onRegenerate={() => generateFor(submission.id, submission.input, submission.meta ?? {})}
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        <div className="flex flex-col gap-6">
          {result && (
            <RiskMatrix
              risks={risksForMatrix}
              selectedRiskId={selectedRiskId}
              onSelect={setSelectedRiskId}
            />
          )}

          <AnimatePresence mode="wait">
            {thinking && !result && (
              <motion.div
                key="thinking"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="glass p-6 animate-fade-up"
              >
                <div className="eyebrow mb-3">Reasoning</div>
                <pre className="text-sm whitespace-pre-wrap font-mono leading-relaxed text-[var(--color-text-muted)]">
                  {thinking}
                  {isWorking && <span className="cursor-blink">▊</span>}
                </pre>
              </motion.div>
            )}
          </AnimatePresence>

          {result?.portfolioInsight && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-accent p-6"
            >
              <div className="eyebrow mb-2">Portfolio insight</div>
              <p className="text-base leading-relaxed text-white font-display">
                {result.portfolioInsight}
              </p>
            </motion.div>
          )}
        </div>

        <div className="flex flex-col gap-5">
          {result && (
            <>
              <div className="flex items-center justify-between">
                <h3 className="eyebrow">Predicted risks ({result.newRisks.length})</h3>
                <button
                  onClick={() => setShowReport(true)}
                  className="btn-ghost"
                >
                  Export report →
                </button>
              </div>
              <div className="flex flex-col gap-2 max-h-[70vh] overflow-auto pr-1">
                {result.newRisks.map((r, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="glass p-4 relative overflow-hidden"
                  >
                    <div
                      className="absolute left-0 top-0 bottom-0 w-[3px]"
                      style={{
                        background:
                          r.likelihood * r.impact >= 12
                            ? "var(--color-danger)"
                            : r.likelihood * r.impact >= 6
                              ? "var(--color-critical)"
                              : "var(--color-success)",
                      }}
                    />
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="text-sm font-semibold text-white leading-snug">{r.title}</div>
                      <span className="chip !text-[10px] !px-2 !py-0.5 shrink-0">{r.category}</span>
                    </div>
                    <div className="text-xs text-[var(--color-text-muted)] mb-2 leading-relaxed">
                      {r.description}
                    </div>
                    <div className="flex items-center gap-3 mb-2 text-[11px] font-mono text-[var(--color-text-muted)]">
                      <span>L{r.likelihood}×I{r.impact}</span>
                      <span>30d {(r.predicted30d * 100).toFixed(0)}%</span>
                      <span>60d {(r.predicted60d * 100).toFixed(0)}%</span>
                      <span>90d {(r.predicted90d * 100).toFixed(0)}%</span>
                    </div>
                    <div className="text-xs leading-relaxed">
                      <span className="text-[var(--color-estimator-soft)] font-medium">Mitigation · </span>
                      <span>{r.mitigation}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {error && (
        <div
          className="glass p-4 border-l-4 text-sm mt-6"
          style={{ borderLeftColor: "var(--color-danger)" }}
        >
          <strong className="text-[var(--color-danger)]">Error:</strong> {error}
        </div>
      )}

      {showReport && result && (
        <ExecutiveRiskReport
          projectName={projectName}
          projectSummary={submission.input}
          ai={result}
          onClose={() => setShowReport(false)}
        />
      )}
    </ResultShell>
  );
}

function buildSummary(text: string, meta: Record<string, string>): string {
  const bits: string[] = [text];
  const metaLine = Object.entries(meta)
    .filter(([, v]) => v && v.trim().length > 0)
    .map(([k, v]) => `${k}=${v}`)
    .join(", ");
  if (metaLine) bits.push(`\n\n[context: ${metaLine}]`);
  return bits.join("");
}

async function streamNarration(projectSummary: string, setThinking: (t: string) => void) {
  const res = await fetch("/api/risk/narrate-risk", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectSummary }),
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
