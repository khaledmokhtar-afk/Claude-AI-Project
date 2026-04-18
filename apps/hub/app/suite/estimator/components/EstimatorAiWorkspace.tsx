"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useWorkspace, type Mode } from "@iesl/ui";
import { findAnalogs, type HistoricalProject } from "@iesl/data";
import { QueryPanel } from "./QueryPanel";
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

const DEMO_QUERIES = [
  {
    id: "wellhead-4",
    label: "4-well unmanned wellhead install, deepwater",
    text: "Install a new unmanned wellhead platform in the OML 130 deepwater area with 4 subsea tie-ins. Pre-fabricated jacket and topsides, HLV lift, 2-well commissioning in campaign 1, 2-well in campaign 2.",
  },
  {
    id: "pipeline-12",
    label: "12km 20\" subsea crude pipeline, Niger Delta",
    text: "Replace 12km of 20-inch subsea crude line in Niger Delta. Includes community engagement, NUPRC permit, 2 tie-in spools and hydrotest. Must be completed in one wet-season-adjacent window.",
  },
  {
    id: "fpso-25yr",
    label: "2.5-year FPSO class survey",
    text: "2.5-year class survey on a mature FPSO. Scope: swivel inspection (on-station), ballast tank NDT, cargo manifold inspection, crane re-certification. No drydock.",
  },
];

export function EstimatorAiWorkspace({
  historical,
}: {
  historical: HistoricalProject[];
}) {
  const { mode, setEstimate } = useWorkspace();

  const [query, setQuery] = useState(DEMO_QUERIES[0].text);
  const [selectedPreset, setSelectedPreset] = useState<string>(DEMO_QUERIES[0].id);
  const [analogs, setAnalogs] = useState<HistoricalProject[]>(
    findAnalogs(DEMO_QUERIES[0].text, 5),
  );
  const [estimate, setEstimateLocal] = useState<Estimate | null>(null);
  const [thinking, setThinking] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    setEstimateLocal(null);
    setThinking("");
    setError(null);
    setIsRunning(false);
    if (mode === "ai") {
      setQuery("");
      setSelectedPreset("");
      setAnalogs([]);
    } else {
      setQuery(DEMO_QUERIES[0].text);
      setSelectedPreset(DEMO_QUERIES[0].id);
      setAnalogs(findAnalogs(DEMO_QUERIES[0].text, 5));
    }
  }, [mode]);

  const selectPreset = (id: string) => {
    const q = DEMO_QUERIES.find((x) => x.id === id);
    if (!q) return;
    setSelectedPreset(id);
    setQuery(q.text);
    setAnalogs(findAnalogs(q.text, 5));
    setEstimateLocal(null);
    setThinking("");
  };

  const onQueryChange = (text: string) => {
    setQuery(text);
    setSelectedPreset("");
    setAnalogs(findAnalogs(text, 5));
  };

  const runEstimate = async () => {
    setError(null);
    setEstimateLocal(null);
    setThinking("");
    setIsRunning(true);

    if (mode === "demo") {
      await animate(
        [
          "Embedding new scope…",
          "Searching historical corpus (40 projects)…",
          `→ Matched ${analogs.length} analogs by type, size, and tags.`,
          "Reasoning on outcome deltas between analogs and new scope…",
          "Drafting low / likely / high bounds…",
          "Producing swing factors…",
        ].join("\n"),
        setThinking,
      );
      const demo = buildDemoEstimate(selectedPreset || "wellhead-4");
      setEstimateLocal(demo);
      setEstimate({ query, ...demo });
      setIsRunning(false);
      return;
    }

    try {
      const narrPromise = streamNarration(query, analogs, setThinking);
      const res = await fetch("/api/estimator/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, analogs }),
      });
      if (!res.ok) throw new Error((await res.text()) || "AI failed");
      const data = (await res.json()) as Estimate;
      await narrPromise;
      setEstimateLocal(data);
      setEstimate({ query, ...data });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsRunning(false);
    }
  };

  const takeHomeUrl = useMemo(() => {
    if (!estimate) return null;
    const blob = new Blob([buildTakeHomeHtml(query, estimate, analogs)], { type: "text/html" });
    return URL.createObjectURL(blob);
  }, [estimate, query, analogs]);

  return (
    <div className="max-w-[1500px] mx-auto px-6 py-8">
      <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-6">
        <QueryPanel
          presets={DEMO_QUERIES}
          selectedPresetId={selectedPreset}
          query={query}
          onSelectPreset={selectPreset}
          onQueryChange={onQueryChange}
          onRun={runEstimate}
          isRunning={isRunning}
          mode={mode as Mode}
          historicalCount={historical.length}
          matchedCount={analogs.length}
        />

        <div className="flex flex-col gap-6 min-h-[70vh]">
          <AnimatePresence>
            {thinking && !estimate && (
              <motion.div
                key="thinking"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="glass p-5"
              >
                <div className="text-xs uppercase tracking-wider text-[var(--color-primary-soft)] mb-2">
                  Reasoning trace
                </div>
                <pre className="whitespace-pre-wrap text-sm font-[var(--font-mono)] text-[var(--color-text)]">
                  {thinking}
                  {isRunning && <span className="cursor-blink">▊</span>}
                </pre>
              </motion.div>
            )}
          </AnimatePresence>

          <AnalogList analogs={analogs} />

          {estimate ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col gap-6"
            >
              <EstimateCard estimate={estimate} query={query} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CostWaterfall estimate={estimate} />
                <Tornado swing={estimate.swingFactors} baseCost={estimate.costUSDm.likely} />
              </div>

              <div className="glass p-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] mb-1">
                    Deliverables
                  </div>
                  <div className="text-sm">
                    Export the full estimate, or download a take-home single-page estimator (LM11).
                  </div>
                </div>
                <div className="flex gap-2">
                  {takeHomeUrl && (
                    <a
                      href={takeHomeUrl}
                      download={`iesl-takehome-estimator-${selectedPreset || "custom"}.html`}
                      className="px-4 py-2 text-sm font-medium rounded-lg border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10"
                    >
                      ⬇ Take-home Estimator (HTML)
                    </a>
                  )}
                  <button
                    onClick={() => setShowReport(true)}
                    className="px-4 py-2 text-sm font-medium rounded-lg glow-primary"
                    style={{ background: "var(--color-primary)", color: "var(--color-bg)" }}
                  >
                    Generate Executive Report →
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            !thinking &&
            !isRunning && (
              <div className="glass p-10 text-center text-[var(--color-text-muted)]">
                <div className="text-5xl mb-3">📊</div>
                <h2 className="text-lg font-semibold text-[var(--color-text)]">Ready to estimate</h2>
                <p className="text-sm max-w-md mx-auto mt-2">
                  Pick a preset or enter your own brief. Top-5 analog projects are retrieved live from
                  the historical corpus. Click <strong>Run estimate</strong> to produce bounds.
                </p>
              </div>
            )
          )}

          {error && (
            <div
              className="glass p-3 text-sm border-l-4"
              style={{ borderLeftColor: "var(--color-danger)" }}
            >
              <strong style={{ color: "var(--color-danger)" }}>Error:</strong> {error}
            </div>
          )}
        </div>
      </div>

      {showReport && estimate && (
        <ExecutiveEstimateReport
          estimate={estimate}
          query={query}
          analogs={analogs}
          mode={mode as Mode}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  );
}

async function animate(text: string, setThinking: (t: string) => void) {
  let i = 0;
  await new Promise<void>((resolve) => {
    const tick = () => {
      if (i > text.length) return resolve();
      setThinking(text.slice(0, i));
      i += 3;
      setTimeout(tick, 18);
    };
    tick();
  });
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

function buildDemoEstimate(presetId: string): Estimate {
  const map: Record<string, Estimate> = {
    "wellhead-4": {
      projectType: "Unmanned Wellhead Platform Install",
      durationMonths: { low: 7, likely: 9, high: 12 },
      effortPersonMonths: { low: 300, likely: 380, high: 480 },
      costUSDm: { low: 112.0, likely: 138.0, high: 172.0 },
      contingencyPct: 14,
      contingencyRationale: "Drawn from HLV slot-slip history and deepwater weather variance.",
      assumptions: [
        "Jacket and topsides pre-fabricated in Lagos yard on time",
        "HLV lift window aligned with wet-season end",
        "4 subsea tie-ins, no manifold works",
        "IESL supplies offshore superintendent team",
      ],
      swingFactors: [
        { label: "HLV slot slippage (4-8 weeks)", lowUSDm: -2, highUSDm: 14 },
        { label: "Steel cost (-5% / +12%)", lowUSDm: -3, highUSDm: 8 },
        { label: "Weather window variance", lowUSDm: -1, highUSDm: 6 },
        { label: "Dive spread availability", lowUSDm: -1, highUSDm: 4 },
        { label: "Permit timing", lowUSDm: 0, highUSDm: 3 },
      ],
      narrative:
        "Based on H-006 (on-target) and H-008 (under-budget), a pre-fabricated jacket approach sets the P50 near USD 138m. H-007 is the principal downside anchor — its HLV slip added USD 22m of cost; mitigation through a secondary vessel option reduces P80 exposure by ~USD 6m.",
    },
    "pipeline-12": {
      projectType: "Subsea Pipeline Replacement (wet-season)",
      durationMonths: { low: 5, likely: 7, high: 10 },
      effortPersonMonths: { low: 200, likely: 280, high: 380 },
      costUSDm: { low: 38.0, likely: 52.0, high: 72.0 },
      contingencyPct: 13,
      contingencyRationale:
        "Community and weather variance dominate; history shows 18-22 days exposure.",
      assumptions: [
        "12 km 20-inch replacement, no re-route",
        "Community GMoU amendment signed by week 4",
        "Lay-barge spread qualified for HS 2.5m",
        "Hydrotest + MEG flush within final 10 days of window",
      ],
      swingFactors: [
        { label: "Community access (GMoU)", lowUSDm: -1, highUSDm: 7 },
        { label: "Lay-barge day-rate", lowUSDm: -2, highUSDm: 5 },
        { label: "Weather window compression", lowUSDm: 0, highUSDm: 6 },
        { label: "FX on imported line pipe", lowUSDm: -1.5, highUSDm: 4 },
        { label: "Welder qualification backlog", lowUSDm: 0, highUSDm: 2 },
      ],
      narrative:
        "H-012 (on-target, 18km) and H-014 (on-target, 8km) bracket the scale. H-011 (over-budget, 30km) warns on community risk — pre-signing the GMoU amendment saves ~USD 2.5m on the P80. Recommend 13% contingency.",
    },
    "fpso-25yr": {
      projectType: "FPSO 2.5-year Class Survey",
      durationMonths: { low: 2, likely: 3, high: 4 },
      effortPersonMonths: { low: 180, likely: 230, high: 300 },
      costUSDm: { low: 16.0, likely: 20.0, high: 26.0 },
      contingencyPct: 11,
      contingencyRationale:
        "On-station work with a fairly narrow outcome distribution, balanced by tank-thickness risk.",
      assumptions: [
        "Swivel inspection remains on-station (no drydock)",
        "Tank thickness findings within 10% of the 2020 baseline",
        "Crane re-cert by OEM-approved independent party",
        "Platform supply vessels available on call-off",
      ],
      swingFactors: [
        { label: "Tank thickness findings", lowUSDm: 0, highUSDm: 4 },
        { label: "Swivel seal condition", lowUSDm: 0, highUSDm: 5 },
        { label: "Weather days lost", lowUSDm: -0.5, highUSDm: 2 },
        { label: "Dive team cert expiry", lowUSDm: 0, highUSDm: 1.5 },
      ],
      narrative:
        "H-001 and H-004 sit on either side of the P50. H-004's pre-qualified yard approach is the lever worth pulling; translating it here means pre-qualifying the inspection contractor 6 weeks earlier than typical.",
    },
  };
  return map[presetId] ?? map["wellhead-4"];
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
  © International Energy Services Limited · Workshop LM11 deliverable · Synthetic data · Generated by EstimatorAI
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
