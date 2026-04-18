"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useWorkspace } from "@iesl/ui";
import { findAnalogs, type HistoricalProject } from "@iesl/data";
import { Hero } from "../../../components/workspace/Hero";
import { InputCard } from "../../../components/workspace/InputCard";
import { BacklogStrip } from "../../../components/workspace/BacklogStrip";
import { ApiKeyMissing } from "../../../components/workspace/ApiKeyMissing";
import { ResultShell } from "../../../components/workspace/ResultShell";
import { AnalogList } from "./AnalogList";
import { EstimateCard } from "./EstimateCard";
import { Tornado } from "./Tornado";
import { CostWaterfall } from "./CostWaterfall";
import { ExecutiveEstimateReport } from "./ExecutiveEstimateReport";

export type Estimate = {
  projectType: string;
  durationMonths: { low: number; likely: number; high: number };
  effortPersonMonths: { low: number; likely: number; high: number };
  costUSDm: { low: number; likely: number; high: number };
  contingencyPct: number;
  contingencyRationale: string;
  assumptions: string[];
  swingFactors: { label: string; lowUSDm: number; highUSDm: number }[];
  narrative: string;
};

export function EstimatorAiWorkspace({
  apiKeyPresent,
  historical,
}: {
  apiKeyPresent: boolean;
  historical: HistoricalProject[];
}) {
  const {
    activeSubmission,
    createSubmission,
    updateSubmissionOutput,
    clearActive,
    setEstimate,
  } = useWorkspace();
  const submission = activeSubmission("estimator");

  const [thinking, setThinking] = useState("");
  const [isWorking, setIsWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);

  const result = submission?.output as Estimate | undefined;
  const analogs = useMemo(
    () => (submission ? findAnalogs(submission.input, 5) : []),
    [submission?.input],
  );

  const generateFor = useCallback(
    async (id: string, text: string) => {
      setError(null);
      setThinking("");
      setIsWorking(true);
      const runAnalogs = findAnalogs(text, 5);
      try {
        const narrPromise = streamNarration(text, runAnalogs, setThinking);
        const res = await fetch("/api/estimator/estimate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: text, analogs: runAnalogs }),
        });
        if (!res.ok) throw new Error((await res.text()) || "AI failed");
        const data = (await res.json()) as Estimate;
        await narrPromise;
        updateSubmissionOutput<Estimate>("estimator", id, data);
        setEstimate({ query: text, ...data });
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setIsWorking(false);
      }
    },
    [updateSubmissionOutput, setEstimate],
  );

  useEffect(() => {
    setThinking("");
    setError(null);
    if (submission && !submission.output) {
      void generateFor(submission.id, submission.input);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submission?.id]);

  const handleSubmit = (text: string, meta: Record<string, string>) => {
    const sub = createSubmission("estimator", text, meta);
    void generateFor(sub.id, text);
  };

  const takeHomeUrl = useMemo(() => {
    if (!result || !submission) return null;
    const blob = new Blob(
      [buildTakeHomeHtml(submission.input, result, analogs)],
      { type: "text/html" },
    );
    return URL.createObjectURL(blob);
  }, [result, submission?.input, analogs]);

  if (!apiKeyPresent) {
    return (
      <div className="relative min-h-[90vh] px-6">
        <Hero
          eyebrow="Estimator AI"
          title="Price the unknown with confidence bands."
          subtitle="Describe the project and Claude draws on the analog corpus to produce low / likely / high bounds, contingency rationale, and swing factors."
        />
        <ApiKeyMissing />
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="relative min-h-[90vh] px-6 pb-14">
        <Hero
          eyebrow="Estimator AI"
          title="Price the unknown with confidence bands."
          subtitle="Describe the project and Claude draws on the analog corpus to produce low / likely / high bounds, contingency rationale, and swing factors."
        />
        <InputCard
          kind="estimator"
          placeholder="e.g. Install a new unmanned wellhead platform in OML 130 deepwater, 4 subsea tie-ins, pre-fabricated jacket and topsides, HLV lift, two commissioning campaigns…"
          meta={[
            {
              kind: "select",
              key: "class",
              label: "Class",
              options: ["Class 5", "Class 4", "Class 3", "Class 2"],
            },
            {
              kind: "select",
              key: "scale",
              label: "Scale",
              options: ["< $10m", "$10–50m", "$50–150m", "$150m+"],
            },
          ]}
          onSubmit={handleSubmit}
        />
        <div className="max-w-3xl mx-auto mt-4 text-center text-xs text-[var(--color-text-muted)]">
          {historical.length} analog projects indexed · retrieved live on Generate
        </div>
        <BacklogStrip kind="estimator" />
      </div>
    );
  }

  return (
    <ResultShell
      submission={submission}
      streaming={isWorking}
      onNewSession={() => {
        clearActive("estimator");
        setThinking("");
        setError(null);
      }}
      onRegenerate={() => generateFor(submission.id, submission.input)}
    >
      <div className="flex flex-col gap-6 min-h-[60vh]">
        <AnimatePresence mode="wait">
          {thinking && !result && (
            <motion.div
              key="thinking"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="glass p-6 animate-fade-up"
            >
              <div className="eyebrow mb-3">Reasoning trace</div>
              <pre className="text-sm whitespace-pre-wrap font-mono leading-relaxed text-[var(--color-text-muted)]">
                {thinking}
                {isWorking && <span className="cursor-blink">▊</span>}
              </pre>
            </motion.div>
          )}
        </AnimatePresence>

        <AnalogList analogs={analogs} />

        {result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-6"
          >
            <EstimateCard estimate={result} query={submission.input} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CostWaterfall estimate={result} />
              <Tornado swing={result.swingFactors} baseCost={result.costUSDm.likely} />
            </div>

            <div className="glass-accent p-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="eyebrow mb-1">Deliverables</div>
                <div className="text-sm text-[var(--color-text-muted)]">
                  Export the full estimate, or download a take-home single-page estimator.
                </div>
              </div>
              <div className="flex gap-2">
                {takeHomeUrl && (
                  <a
                    href={takeHomeUrl}
                    download={`iesl-estimator-${submission.id.slice(0, 8)}.html`}
                    className="btn-ghost"
                  >
                    ⬇ Take-home (HTML)
                  </a>
                )}
                <button
                  onClick={() => setShowReport(true)}
                  className="btn-primary"
                >
                  Executive Report →
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {error && (
          <div
            className="glass p-4 border-l-4 text-sm"
            style={{ borderLeftColor: "var(--color-danger)" }}
          >
            <strong className="text-[var(--color-danger)]">Error:</strong> {error}
          </div>
        )}
      </div>

      {showReport && result && (
        <ExecutiveEstimateReport
          estimate={result}
          query={submission.input}
          analogs={analogs}
          onClose={() => setShowReport(false)}
        />
      )}
    </ResultShell>
  );
}

async function streamNarration(
  query: string,
  analogs: HistoricalProject[],
  setThinking: (t: string) => void,
) {
  const res = await fetch("/api/estimator/narrate-estimate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
      analogCount: analogs.length,
      analogTypes: analogs.map((a) => a.projectType),
    }),
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

function buildTakeHomeHtml(query: string, estimate: Estimate, analogs: HistoricalProject[]): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>IESL Take-home Estimator · ${estimate.projectType}</title>
<style>
  body { font-family: Inter, system-ui, sans-serif; margin: 0; background: #0F1623; color: #E5E7EB; padding: 32px; max-width: 900px; margin: auto; }
  h1 { color: #10B981; margin: 0 0 8px; }
  h2 { color: #EAB308; font-size: 14px; text-transform: uppercase; letter-spacing: 0.08em; margin: 24px 0 8px; }
  .card { background: #172033; border: 1px solid #2F3E58; border-radius: 12px; padding: 20px; margin: 16px 0; }
  .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
  .stat { background: #1C2638; padding: 12px; border-radius: 8px; }
  .stat .label { font-size: 11px; color: #9CA3AF; text-transform: uppercase; }
  .stat .val { font-size: 22px; font-weight: bold; margin-top: 4px; font-family: "JetBrains Mono", monospace; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th, td { text-align: left; padding: 6px 8px; border-bottom: 1px solid #2F3E58; }
  ul { padding-left: 20px; }
  code { color: #34D399; }
  .footer { color: #9CA3AF; font-size: 11px; margin-top: 32px; border-top: 1px solid #2F3E58; padding-top: 12px; }
  input, textarea { width: 100%; padding: 8px; background: #1C2638; color: #E5E7EB; border: 1px solid #2F3E58; border-radius: 6px; margin-top: 4px; font-family: inherit; }
  .inputs label { font-size: 12px; color: #9CA3AF; text-transform: uppercase; }
  .computed { background: rgba(16, 185, 129, 0.1); border: 1px solid #10B981; padding: 16px; border-radius: 8px; margin-top: 16px; }
</style></head><body>
<h1>IESL Take-home Estimator</h1>
<div style="color: #9CA3AF; font-size: 13px; margin-bottom: 24px;">Generated ${new Date().toLocaleDateString("en-GB")} · Template type: ${estimate.projectType}</div>

<div class="card">
  <h2>Baseline brief used to generate this template</h2>
  <p>${escapeHtml(query)}</p>
</div>

<div class="card">
  <h2>Baseline estimate (locked)</h2>
  <div class="grid">
    <div class="stat"><div class="label">Duration (likely)</div><div class="val">${estimate.durationMonths.likely} mo</div></div>
    <div class="stat"><div class="label">Effort (likely)</div><div class="val">${estimate.effortPersonMonths.likely} p-mo</div></div>
    <div class="stat"><div class="label">Cost (P50)</div><div class="val">$${estimate.costUSDm.likely.toFixed(1)}m</div></div>
  </div>
  <p style="margin-top: 16px; color: #9CA3AF;">Recommended contingency: <strong style="color: #EAB308;">${estimate.contingencyPct}%</strong> — ${escapeHtml(estimate.contingencyRationale)}</p>
</div>

<div class="card">
  <h2>Top assumptions</h2>
  <ul>${estimate.assumptions.map((a) => `<li>${escapeHtml(a)}</li>`).join("")}</ul>
</div>

<div class="card">
  <h2>Swing factors (± USD millions)</h2>
  <table>
    <tr><th>Factor</th><th>Low</th><th>High</th></tr>
    ${estimate.swingFactors.map((s) => `<tr><td>${escapeHtml(s.label)}</td><td>${s.lowUSDm.toFixed(1)}</td><td>+${s.highUSDm.toFixed(1)}</td></tr>`).join("")}
  </table>
</div>

<div class="card">
  <h2>Adjust for your specific project</h2>
  <div class="inputs">
    <label>Scope size factor (1.0 = baseline)</label>
    <input id="sizeFactor" type="number" step="0.1" value="1.0" oninput="recalc()"/>
    <label style="display:block; margin-top:12px;">Duration factor (1.0 = baseline)</label>
    <input id="durFactor" type="number" step="0.1" value="1.0" oninput="recalc()"/>
    <label style="display:block; margin-top:12px;">Contingency override %</label>
    <input id="ctg" type="number" step="1" value="${estimate.contingencyPct}" oninput="recalc()"/>
  </div>
  <div class="computed">
    <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
      <div><div class="label">Adjusted duration</div><div class="val" id="outDur">–</div></div>
      <div><div class="label">Adjusted effort</div><div class="val" id="outEff">–</div></div>
      <div><div class="label">Adjusted cost (P50 + ctg)</div><div class="val" id="outCost">–</div></div>
    </div>
  </div>
</div>

<div class="card">
  <h2>Analog projects referenced</h2>
  <table>
    <tr><th>Project</th><th>Year</th><th>Actual $m</th><th>Duration</th><th>Outcome</th></tr>
    ${analogs.map((a) => `<tr><td>${escapeHtml(a.name)}</td><td>${a.yearCompleted}</td><td>${a.actualUSDm.toFixed(1)}</td><td>${a.durationMonths}mo</td><td>${a.outcome}</td></tr>`).join("")}
  </table>
</div>

<div class="footer">
  © International Energy Services Limited · Generated by EstimatorAI · Claude
</div>

<script>
  const baselineDur = ${estimate.durationMonths.likely};
  const baselineEff = ${estimate.effortPersonMonths.likely};
  const baselineCost = ${estimate.costUSDm.likely};
  function recalc() {
    const s = Number(document.getElementById('sizeFactor').value || 1);
    const d = Number(document.getElementById('durFactor').value || 1);
    const c = Number(document.getElementById('ctg').value || 0);
    document.getElementById('outDur').textContent = (baselineDur * d).toFixed(1) + ' mo';
    document.getElementById('outEff').textContent = Math.round(baselineEff * s) + ' p-mo';
    document.getElementById('outCost').textContent = '$' + (baselineCost * s * (1 + c/100)).toFixed(1) + 'm';
  }
  recalc();
</script>
</body></html>`;
}

function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
