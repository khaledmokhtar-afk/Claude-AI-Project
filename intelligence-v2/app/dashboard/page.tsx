"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAnalysis } from "@/store/useAnalysis";
import { parseSSE } from "@/lib/stream/sse-parser";
import type { Brief, SectionId } from "@/lib/types";
import PanelShell from "@/components/panels/PanelShell";
import PlanCorePanel from "@/components/panels/PlanCorePanel";
import PlanExtrasPanel from "@/components/panels/PlanExtrasPanel";
import RiskRegisterPanel from "@/components/panels/RiskRegisterPanel";
import RiskActionsPanel from "@/components/panels/RiskActionsPanel";
import EstimateCorePanel from "@/components/panels/EstimateCorePanel";
import EstimateTracePanel from "@/components/panels/EstimateTracePanel";

type TabId = "plan" | "risks" | "estimate";

const TABS: { id: TabId; label: string; sections: SectionId[] }[] = [
  { id: "plan", label: "Plan & Schedule", sections: ["plan-core", "plan-extras"] },
  { id: "risks", label: "Risks & ISO", sections: ["risk-register", "risk-actions"] },
  { id: "estimate", label: "Estimate", sections: ["estimate-core", "estimate-trace"] },
];

export default function Dashboard() {
  const router = useRouter();
  const brief = useAnalysis((s) => s.brief);
  const sections = useAnalysis((s) => s.sections);
  const activeTab = useAnalysis((s) => s.activeTab);
  const setTab = useAnalysis((s) => s.setTab);
  const startedAt = useAnalysis((s) => s.startedAt);
  const elapsedMs = useAnalysis((s) => s.elapsedMs);
  const markStreaming = useAnalysis((s) => s.markStreaming);
  const markReady = useAnalysis((s) => s.markReady);
  const markFailed = useAnalysis((s) => s.markFailed);
  const markDone = useAnalysis((s) => s.markDone);
  const reset = useAnalysis((s) => s.reset);

  const [runId, setRunId] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  // If no brief in memory, send the user back to the intake page.
  useEffect(() => {
    if (!brief) router.replace("/");
  }, [brief, router]);

  const runAnalysis = useCallback(
    async (b: Brief) => {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;

      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(b),
          signal: ctrl.signal,
        });
        if (!res.ok) {
          const { error } = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
          for (const t of TABS) for (const s of t.sections) markFailed(s, error ?? "Request failed");
          return;
        }
        for await (const event of parseSSE(res)) {
          if (event.status === "streaming") markStreaming(event.id);
          else if (event.status === "ready")
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            markReady(event.id, event.payload as any);
          else markFailed(event.id, event.error);
        }
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        const msg = e instanceof Error ? e.message : "Stream error";
        for (const t of TABS) for (const s of t.sections) markFailed(s, msg);
      } finally {
        if (startedAt) markDone(Date.now() - startedAt);
      }
    },
    [markStreaming, markReady, markFailed, markDone, startedAt],
  );

  useEffect(() => {
    if (!brief) return;
    runAnalysis(brief);
    return () => abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brief, runId]);

  const progress = useMemo(() => {
    const all = Object.values(sections);
    const ready = all.filter((s) => s.status === "ready").length;
    const failed = all.filter((s) => s.status === "failed").length;
    return { ready, failed, total: all.length };
  }, [sections]);

  const activeSections = TABS.find((t) => t.id === activeTab)?.sections ?? [];

  if (!brief) return null;

  const pct = progress.total ? Math.round((progress.ready / progress.total) * 100) : 0;

  return (
    <main className="min-h-screen pb-24">
      {/* Sticky top bar */}
      <div className="sticky top-0 z-30 bg-[var(--bg)]/85 backdrop-blur border-b border-[var(--line)]">
        <div className="max-w-[1180px] mx-auto px-6 lg:px-10 py-4 flex items-center justify-between gap-4">
          <button
            onClick={() => {
              reset();
              router.push("/");
            }}
            className="flex items-center gap-2 text-[13.5px] text-[var(--ink-3)] hover:text-[var(--ink)] transition"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M11 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            New brief
          </button>

          <div className="flex items-center gap-3 text-[13px] text-[var(--ink-3)]">
            <span className="font-mono">{progress.ready}/{progress.total}</span>
            <div className="w-32 h-[5px] rounded-full bg-[var(--line)] overflow-hidden">
              <div
                className="h-full transition-[width] duration-700"
                style={{ width: `${pct}%`, background: progress.failed ? "var(--bad)" : "var(--ink)" }}
              />
            </div>
            {elapsedMs !== null ? (
              <span className="font-mono text-[var(--ink-3)]">{(elapsedMs / 1000).toFixed(1)}s</span>
            ) : (
              <span className="text-[var(--brand)] inline-flex items-center gap-1.5">
                <span className="dot dot-stream" /> streaming
              </span>
            )}
            <button onClick={() => setRunId((n) => n + 1)} className="btn-ghost ml-1">
              ↻ Re-run
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1180px] mx-auto px-6 lg:px-10 pt-10">
        {/* Brief summary */}
        <header className="mb-10">
          <div className="eyebrow eyebrow-brand mb-4">Analysis</div>
          <h1 className="font-display text-[44px] leading-[1.08] tracking-[-0.02em] text-[var(--ink)] max-w-[820px]">
            {brief.projectBrief.split(/[.!?\n]/)[0]}.
          </h1>
          <p className="mt-4 text-[15px] leading-[1.65] text-[var(--ink-3)] max-w-[760px]">
            {brief.projectBrief}
          </p>
          {(brief.sector || brief.scale || brief.horizon || brief.budgetCeilingUSDm) && (
            <div className="mt-5 flex flex-wrap gap-2">
              {brief.sector && <span className="chip">{brief.sector}</span>}
              {brief.scale && <span className="chip">{brief.scale}</span>}
              {brief.horizon && <span className="chip">{brief.horizon}</span>}
              {brief.budgetCeilingUSDm && <span className="chip">≤ ${brief.budgetCeilingUSDm}M</span>}
              {brief.targetCompletionISO && <span className="chip">by {brief.targetCompletionISO}</span>}
            </div>
          )}
        </header>

        {/* Tab nav */}
        <nav className="border-b border-[var(--line)] mb-8 flex flex-wrap" role="tablist">
          {TABS.map((t) => {
            const done = t.sections.every((s) => sections[s].status === "ready");
            const failed = t.sections.some((s) => sections[s].status === "failed");
            const streaming = t.sections.some((s) => sections[s].status === "streaming");
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={activeTab === t.id}
                onClick={() => setTab(t.id)}
                className="tab inline-flex items-center gap-2"
              >
                {t.label}
                {streaming && <span className="dot dot-stream" />}
                {!streaming && done && <span className="dot dot-ok" />}
                {!streaming && failed && <span className="dot dot-bad" />}
              </button>
            );
          })}
        </nav>

        {/* Panels */}
        <div className="grid grid-cols-1 gap-6">
          {activeSections.map((id, i) => (
            <div key={id} className="rise" style={{ animationDelay: `${i * 80}ms` }}>
              <SectionRenderer id={id} runId={runId} />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

function SectionRenderer({ id, runId }: { id: SectionId; runId: number }) {
  const section = useAnalysis((s) => s.sections[id]);
  const brief = useAnalysis((s) => s.brief);
  const markStreaming = useAnalysis((s) => s.markStreaming);
  const markReady = useAnalysis((s) => s.markReady);
  const markFailed = useAnalysis((s) => s.markFailed);
  const all = useAnalysis((s) => s.sections);

  const meta = SECTION_META[id];
  const retryOne = useCallback(async () => {
    if (!brief) return;
    markStreaming(id);
    try {
      const body = meta.buildBody(brief, all);
      const res = await fetch(meta.endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? `HTTP ${res.status}`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      markReady(id, data);
    } catch (e) {
      markFailed(id, e instanceof Error ? e.message : "Retry failed");
    }
  }, [id, brief, all, markStreaming, markReady, markFailed, meta]);

  return (
    <PanelShell
      title={meta.title}
      eyebrow={meta.eyebrow}
      status={section.status}
      error={section.status === "failed" ? section.error : undefined}
      onRetry={retryOne}
      key={`${id}-${runId}`}
    >
      {section.status === "ready" && <PanelBody id={id} payload={section.payload} />}
    </PanelShell>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function PanelBody({ id, payload }: { id: SectionId; payload: any }) {
  switch (id) {
    case "plan-core":
      return <PlanCorePanel data={payload} />;
    case "plan-extras":
      return <PlanExtrasPanel data={payload} />;
    case "risk-register":
      return <RiskRegisterPanel data={payload} />;
    case "risk-actions":
      return <RiskActionsPanel data={payload} />;
    case "estimate-core":
      return <EstimateCorePanel data={payload} />;
    case "estimate-trace":
      return <EstimateTracePanel data={payload} />;
  }
}

type SectionMeta = {
  title: string;
  eyebrow: string;
  endpoint: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  buildBody: (brief: Brief, sections: any) => unknown;
};

const SECTION_META: Record<SectionId, SectionMeta> = {
  "plan-core": {
    title: "Work breakdown & critical path",
    eyebrow: "Plan · Core",
    endpoint: "/api/sections/plan-core",
    buildBody: (brief) => brief,
  },
  "plan-extras": {
    title: "Milestones, phases & resource load",
    eyebrow: "Plan · Intelligence",
    endpoint: "/api/sections/plan-extras",
    buildBody: (brief, all) => ({
      brief,
      core: all["plan-core"]?.status === "ready" ? all["plan-core"].payload : null,
    }),
  },
  "risk-register": {
    title: "Inherent-risk register",
    eyebrow: "Risks · Register",
    endpoint: "/api/sections/risk-register",
    buildBody: (brief) => brief,
  },
  "risk-actions": {
    title: "Top actions & ISO framework",
    eyebrow: "Risks · Synthesis",
    endpoint: "/api/sections/risk-actions",
    buildBody: (brief, all) => ({
      brief,
      register: all["risk-register"]?.status === "ready" ? all["risk-register"].payload : null,
    }),
  },
  "estimate-core": {
    title: "P10/P50/P80 bands",
    eyebrow: "Estimate · Core",
    endpoint: "/api/sections/estimate-core",
    buildBody: (brief) => brief,
  },
  "estimate-trace": {
    title: "Breakdown, roster & methodology",
    eyebrow: "Estimate · Trace",
    endpoint: "/api/sections/estimate-trace",
    buildBody: (brief, all) => ({
      brief,
      core: all["estimate-core"]?.status === "ready" ? all["estimate-core"].payload : null,
    }),
  },
};
