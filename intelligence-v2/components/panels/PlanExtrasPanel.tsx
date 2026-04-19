"use client";

import type { PlanExtras } from "@/lib/types";

const TYPE_STYLE: Record<string, string> = {
  gate: "chip-brand",
  regulatory: "chip-warn",
  delivery: "chip-ok",
  commissioning: "chip",
};

const FLAG_STYLE: Record<string, string> = {
  low: "chip-ok",
  medium: "chip-warn",
  high: "chip-bad",
};

export default function PlanExtrasPanel({ data }: { data: PlanExtras }) {
  const totalPhaseDays = Math.max(
    data.phaseSummaries.reduce((m, p) => Math.max(m, p.durationDays), 0),
    1,
  );
  const maxLoad = Math.max(...data.resourceLoad.map((r) => r.totalDays), 1);

  return (
    <div className="space-y-8">
      <Section title="Milestones">
        <div className="space-y-2.5">
          {data.milestones.map((m) => (
            <div key={m.id} className="flex items-start gap-3 py-2 border-b border-[var(--line)] last:border-0">
              <span className={`chip ${TYPE_STYLE[m.type] ?? ""} shrink-0`}>{m.type}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[14px] text-[var(--ink)] font-medium">{m.name}</span>
                  <span className="font-mono text-[12px] text-[var(--ink-3)] tabular-nums shrink-0">
                    Day {m.dayOffset}
                  </span>
                </div>
                {m.description && (
                  <div className="text-[13px] text-[var(--ink-3)] mt-0.5">{m.description}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Phases">
        <div className="grid sm:grid-cols-2 gap-3">
          {data.phaseSummaries.map((p) => (
            <div key={p.phaseId} className="card-soft p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[14px] font-medium text-[var(--ink)]">{p.name}</span>
                <span className={`chip ${FLAG_STYLE[p.riskFlag] ?? ""}`}>{p.riskFlag} risk</span>
              </div>
              <div className="mt-3 h-1.5 rounded-full bg-[var(--line)] overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${(p.durationDays / totalPhaseDays) * 100}%`, background: "var(--brand)" }}
                />
              </div>
              <div className="mt-3 text-[12.5px] text-[var(--ink-3)]">
                <span className="text-[var(--ink-4)] mr-1.5">Driver</span>
                {p.primaryDriver}
              </div>
              <div className="mt-1 text-[12.5px] text-[var(--ink-3)]">
                <span className="text-[var(--ink-4)] mr-1.5">Peak</span>
                {p.resourcesPeak.join(" · ")}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Resource load">
        <div className="space-y-1.5">
          {data.resourceLoad.map((r) => (
            <div key={r.resource} className="flex items-center gap-3 text-[13px]">
              <div className="w-44 shrink-0 truncate text-[var(--ink-2)]">{r.resource}</div>
              <div className="flex-1 h-2.5 rounded-full bg-[var(--line)] overflow-hidden">
                <div
                  className="h-full"
                  style={{ width: `${(r.totalDays / maxLoad) * 100}%`, background: "var(--brand)" }}
                />
              </div>
              <div className="w-16 shrink-0 text-right font-mono text-[12px] text-[var(--ink-3)] tabular-nums">
                {r.totalDays}d
              </div>
              <div className="w-10 shrink-0 text-right font-mono text-[11px] text-[var(--ink-4)]">
                ×{r.peakConcurrency}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Schedule strategy">
        <div className="card-soft p-5 space-y-3 text-[14px]">
          <Field label="Approach">{data.scheduleStrategy.approach}</Field>
          <Field label="Method">{data.scheduleStrategy.schedulingMethod}</Field>
          <Field label="Buffers">{data.scheduleStrategy.bufferStrategy}</Field>
          {data.scheduleStrategy.resourceConstraints.length > 0 && (
            <Field label="Constraints">{data.scheduleStrategy.resourceConstraints.join(" · ")}</Field>
          )}
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="eyebrow mb-3">{title}</div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[110px_1fr] gap-3 items-baseline">
      <div className="font-mono text-[11px] uppercase tracking-wider text-[var(--ink-4)]">{label}</div>
      <div className="text-[var(--ink-2)]">{children}</div>
    </div>
  );
}
