"use client";

import { useCallback, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useMode, type Mode } from "@iesl/ui";
import type { DemoScopeTemplate, DemoWBSNode } from "@iesl/data";
import { Header } from "./Header";
import { ScopeInput } from "./ScopeInput";
import { WBSView } from "./WBSView";
import { GanttChart } from "./GanttChart";
import { ThinkingRail } from "./ThinkingRail";
import { ExecutiveReport } from "./ExecutiveReport";
import { computeSchedule } from "../lib/schedule";

type WBSResult = {
  projectName: string;
  summary: string;
  tasks: DemoWBSNode[];
};

export function Workspace({
  scopes,
  apiKeyPresent,
}: {
  scopes: DemoScopeTemplate[];
  apiKeyPresent: boolean;
}) {
  const [mode, setModeRaw] = useMode("demo");
  const [selectedScopeId, setSelectedScopeId] = useState(scopes[0].id);
  const [scopeText, setScopeText] = useState(scopes[0].scope);
  const [result, setResult] = useState<WBSResult | null>(null);
  const [thinking, setThinking] = useState<string>("");
  const [isWorking, setIsWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);

  const setMode = useCallback(
    (next: Mode) => {
      setModeRaw(next);
      setResult(null);
      setThinking("");
      setError(null);
      setIsWorking(false);
      if (next === "ai") {
        setSelectedScopeId("");
        setScopeText("");
      } else {
        setSelectedScopeId(scopes[0].id);
        setScopeText(scopes[0].scope);
      }
    },
    [setModeRaw, scopes],
  );

  const onSelectScope = (id: string) => {
    const s = scopes.find((x) => x.id === id);
    if (!s) return;
    setSelectedScopeId(id);
    setScopeText(s.scope);
    setResult(null);
    setThinking("");
  };

  const generate = async () => {
    setError(null);
    setResult(null);
    setThinking("");
    setIsWorking(true);

    if (mode === "demo") {
      const template = scopes.find((x) => x.id === selectedScopeId) ?? scopes[0];
      await runDemoAnimation(template, setThinking);
      setResult({
        projectName: template.label,
        summary: template.summary,
        tasks: template.demoWBS,
      });
      setIsWorking(false);
      return;
    }

    // AI mode — two parallel calls: a running narration + the structured JSON.
    try {
      const narrationPromise = streamNarration(scopeText, setThinking);
      const jsonRes = await fetch("/api/generate-wbs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope: scopeText }),
      });
      if (!jsonRes.ok) {
        throw new Error((await jsonRes.text()) || "AI call failed.");
      }
      const payload = (await jsonRes.json()) as WBSResult;
      await narrationPromise;
      setResult(payload);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsWorking(false);
    }
  };

  const schedule = useMemo(() => (result ? computeSchedule(result.tasks) : null), [result]);

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      <Header mode={mode} onModeChange={setMode} apiKeyPresent={apiKeyPresent} />

      <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-6">
        <ScopeInput
          scopes={scopes}
          selectedScopeId={selectedScopeId}
          scopeText={scopeText}
          onSelectScope={onSelectScope}
          onScopeTextChange={setScopeText}
          onGenerate={generate}
          isWorking={isWorking}
          mode={mode}
        />

        <div className="flex flex-col gap-6 min-h-[70vh]">
          <AnimatePresence mode="wait">
            {thinking && !result && (
              <motion.div
                key="thinking"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <ThinkingRail text={thinking} isStreaming={isWorking} />
              </motion.div>
            )}

            {result && schedule && (
              <motion.div
                key="result"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col gap-6"
              >
                <div className="glass p-6 animate-fade-up">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] mb-1">
                        Generated plan
                      </div>
                      <h2 className="text-2xl font-semibold">{result.projectName}</h2>
                      <p className="text-[var(--color-text-muted)] mt-2 max-w-2xl">{result.summary}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <button
                        onClick={() => setShowReport(true)}
                        className="px-4 py-2 text-sm font-medium rounded-lg glow-primary"
                        style={{ background: "var(--color-primary)", color: "white" }}
                      >
                        Generate Executive Report →
                      </button>
                      <div className="flex gap-4 text-xs text-[var(--color-text-muted)] font-mono">
                        <span>{result.tasks.length} tasks</span>
                        <span>•</span>
                        <span>{schedule.totalDays}d total</span>
                        <span>•</span>
                        <span>
                          {schedule.criticalPath.length} on critical path
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">
                  <WBSView tasks={result.tasks} schedule={schedule} />
                  <GanttChart tasks={result.tasks} schedule={schedule} />
                </div>
              </motion.div>
            )}

            {!thinking && !result && !isWorking && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass p-12 text-center"
              >
                <div className="text-6xl mb-4">📐</div>
                <h2 className="text-xl font-semibold mb-2">Ready to plan</h2>
                <p className="text-[var(--color-text-muted)] max-w-md mx-auto">
                  Pick a demo scope or paste your own, then click <strong>Generate WBS &amp; Gantt</strong>.
                  Watch the plan assemble itself.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <div className="glass p-4 border-l-4 text-sm" style={{ borderLeftColor: "var(--color-danger)" }}>
              <strong className="text-[var(--color-danger)]">Error:</strong> {error}
            </div>
          )}
        </div>
      </div>

      {showReport && result && schedule && (
        <ExecutiveReport
          projectName={result.projectName}
          summary={result.summary}
          tasks={result.tasks}
          schedule={schedule}
          mode={mode}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  );
}

async function runDemoAnimation(template: DemoScopeTemplate, setThinking: (t: string) => void) {
  const narration = [
    `Reading scope brief: "${template.label}"…`,
    `\nIdentifying phases…`,
    `\n→ Detected ${new Set(template.demoWBS.filter((t) => !t.id.includes(".")).map((t) => t.id)).size} top-level phases.`,
    `\nAllocating resources…`,
    `\n→ Resource plan considers offshore crews, dive teams, marine assets, and community relations.`,
    `\nSolving dependency graph…`,
    `\n→ Critical path derived. Schedule reconciled.`,
    `\nRendering plan ✓`,
  ].join("");
  let i = 0;
  return new Promise<void>((resolve) => {
    const tick = () => {
      if (i > narration.length) {
        resolve();
        return;
      }
      setThinking(narration.slice(0, i));
      i += 4;
      setTimeout(tick, 18);
    };
    tick();
  });
}

async function streamNarration(_scope: string, setThinking: (t: string) => void) {
  const res = await fetch("/api/narrate-plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ scope: _scope }),
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
