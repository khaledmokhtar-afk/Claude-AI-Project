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

  return (
    <main className="min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="eyebrow mb-2">IESL · Project Intelligence · v2</div>
            <h1
              className="text-3xl leading-tight"
              style={{ fontFamily: "var(--font-display), serif" }}
            >
              Analysis
            </h1>
            <p className="mt-2 text-sm text-white/60 max-w-2xl line-clamp-3">
              {brief.projectBrief}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setRunId((n) => n + 1)} className="btn-ghost">
              Re-run all
            </button>
            <button
              onClick={() => {
                reset();
                router.push("/");
              }}
              className="btn-ghost"
            >
              New brief
            </button>
          </div>
        </header>

        <div className="mb-6 flex items-center gap-4 text-xs text-white/50">
          <span>
            {progress.ready}/{progress.total} panels ready
            {progress.failed > 0 && (
              <span className="text-red-400 ml-2">· {progress.failed} failed</span>
            )}
          </span>
          {elapsedMs !== null && <span>total {(elapsedMs / 1000).toFixed(1)}s</span>}
        </div>

        <nav className="mb-6 flex gap-2">
          {TABS.map((t) => {
            const done = t.sections.every((s) => sections[s].status === "ready");
            const failed = t.sections.some((s) => sections[s].status === "failed");
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-2 rounded-xl text-sm transition border ${
                  activeTab === t.id
                    ? "bg-white/[0.06] border-white/20 text-white"
                    : "bg-transparent border-white/5 text-white/60 hover:border-white/15 hover:text-white/90"
                }`}
              >
                {t.label}
                {done && <span className="ml-2 text-emerald-400">●</span>}
                {failed && <span className="ml-2 text-red-400">●</span>}
              </button>
            );
          })}
        </nav>

        <div className="grid grid-cols-1 gap-6">
          {activeSections.map((id) => (
            <SectionRenderer key={id} id={id} runId={runId} />
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
