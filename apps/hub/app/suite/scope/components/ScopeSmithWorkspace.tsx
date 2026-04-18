"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useWorkspace } from "@iesl/ui";
import type { WBSNode } from "@iesl/data";
import { Hero } from "../../../components/workspace/Hero";
import { InputCard } from "../../../components/workspace/InputCard";
import { BacklogStrip } from "../../../components/workspace/BacklogStrip";
import { ApiKeyMissing } from "../../../components/workspace/ApiKeyMissing";
import { ResultShell } from "../../../components/workspace/ResultShell";
import { WBSView } from "./WBSView";
import { GanttChart } from "./GanttChart";
import { ThinkingRail } from "./ThinkingRail";
import { ExecutiveReport } from "./ExecutiveReport";
import { computeSchedule } from "../lib/schedule";

type WBSResult = {
  projectName: string;
  summary: string;
  tasks: WBSNode[];
};

export function ScopeSmithWorkspace({ apiKeyPresent }: { apiKeyPresent: boolean }) {
  const {
    activeSubmission,
    createSubmission,
    updateSubmissionOutput,
    clearActive,
    setScope: setWorkspaceScope,
    setWBS,
  } = useWorkspace();
  const submission = activeSubmission("scope");

  const [thinking, setThinking] = useState("");
  const [isWorking, setIsWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);

  const result = submission?.output as WBSResult | undefined;
  const schedule = useMemo(() => (result ? computeSchedule(result.tasks) : null), [result]);

  useEffect(() => {
    if (submission && !submission.output) {
      void generateFor(submission.id, submission.input);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submission?.id]);

  const generateFor = useCallback(
    async (id: string, text: string) => {
      setError(null);
      setThinking("");
      setIsWorking(true);
      try {
        const narrationPromise = streamNarration(text, setThinking);
        const jsonRes = await fetch("/api/scope/generate-wbs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ scope: text }),
        });
        if (!jsonRes.ok) {
          throw new Error((await jsonRes.text()) || "AI call failed.");
        }
        const payload = (await jsonRes.json()) as WBSResult;
        await narrationPromise;
        updateSubmissionOutput<WBSResult>("scope", id, payload);
        setWorkspaceScope({
          projectName: payload.projectName,
          summary: payload.summary,
          text,
        });
        setWBS(payload);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setIsWorking(false);
      }
    },
    [updateSubmissionOutput, setWorkspaceScope, setWBS],
  );

  const handleSubmit = (text: string) => {
    const sub = createSubmission("scope", text);
    void generateFor(sub.id, text);
  };

  if (!apiKeyPresent) {
    return (
      <div className="relative min-h-[90vh] px-6">
        <Hero
          eyebrow="Scoping Studio"
          title="Turn a paragraph into a plan."
          subtitle="Paste a project brief and Claude returns a phased WBS with a critical path, resource tags, and a live Gantt."
        />
        <ApiKeyMissing />
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="relative min-h-[90vh] px-6 pb-14">
        <Hero
          eyebrow="Scoping Studio"
          title="Turn a paragraph into a plan."
          subtitle="Paste a project brief and Claude returns a phased WBS with a critical path, resource tags, and a live Gantt."
        />
        <InputCard
          kind="scope"
          placeholder="e.g. IESL will execute a six-week maintenance campaign on two unmanned wellhead platforms in OML 130. Scope covers mobilisation of a multi-purpose support vessel, choke valve R&R, xmas tree seal refurbishment, flowline isolation test, CP survey…"
          onSubmit={handleSubmit}
        />
        <BacklogStrip kind="scope" />
      </div>
    );
  }

  return (
    <ResultShell
      submission={submission}
      streaming={isWorking}
      onNewSession={() => {
        clearActive("scope");
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
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="eyebrow mb-1">Generated plan</div>
                    <h2 className="font-display text-3xl">{result.projectName}</h2>
                    <p className="text-[var(--color-text-muted)] mt-2 max-w-2xl">{result.summary}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => setShowReport(true)}
                      className="btn-primary"
                    >
                      Executive Report →
                    </button>
                    <div className="flex gap-4 text-xs text-[var(--color-text-muted)] font-mono">
                      <span>{result.tasks.length} tasks</span>
                      <span>•</span>
                      <span>{schedule.totalDays}d total</span>
                      <span>•</span>
                      <span>{schedule.criticalPath.length} on critical path</span>
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
        </AnimatePresence>

        {error && (
          <div
            className="glass p-4 border-l-4 text-sm"
            style={{ borderLeftColor: "var(--color-danger)" }}
          >
            <strong className="text-[var(--color-danger)]">Error:</strong> {error}
          </div>
        )}
      </div>

      {showReport && result && schedule && (
        <ExecutiveReport
          projectName={result.projectName}
          summary={result.summary}
          tasks={result.tasks}
          schedule={schedule}
          onClose={() => setShowReport(false)}
        />
      )}
    </ResultShell>
  );
}

async function streamNarration(scope: string, setThinking: (t: string) => void) {
  const res = await fetch("/api/scope/narrate-plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ scope }),
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
