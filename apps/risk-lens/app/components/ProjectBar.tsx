"use client";

import type { DemoProject, Risk } from "@iesl/data";

export function ProjectBar({
  projects,
  activeProjectId,
  onChange,
  risks,
}: {
  projects: DemoProject[];
  activeProjectId: string;
  onChange: (id: string) => void;
  risks: Risk[];
}) {
  return (
    <div className="glass p-4">
      <div className="flex flex-wrap gap-3">
        {projects.map((p) => {
          const open = risks.filter((r) => r.projectId === p.id && r.status !== "Closed").length;
          const escalated = risks.filter(
            (r) => r.projectId === p.id && r.likelihood * r.impact >= 16,
          ).length;
          const active = activeProjectId === p.id;
          return (
            <button
              key={p.id}
              onClick={() => onChange(p.id)}
              className={`flex-1 min-w-[260px] text-left p-4 rounded-lg border transition-all ${
                active
                  ? "border-[var(--color-primary)] glow-primary"
                  : "border-[var(--color-border)] hover:border-[var(--color-primary-soft)]"
              }`}
              style={{ background: active ? "rgba(220,38,38,0.08)" : "var(--color-bg-soft)" }}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-semibold text-sm">{p.name}</div>
                  <div className="text-xs text-[var(--color-text-muted)] mt-0.5">
                    {p.type} · {p.location}
                  </div>
                </div>
                {escalated > 0 && (
                  <span className="relative shrink-0">
                    <span className="absolute inset-0 rounded-full pulse-danger" />
                    <span
                      className="relative inline-flex items-center justify-center w-6 h-6 text-[10px] font-bold rounded-full"
                      style={{ background: "var(--color-primary)", color: "white" }}
                    >
                      {escalated}
                    </span>
                  </span>
                )}
              </div>
              <div className="mt-3 flex items-center gap-4 text-[11px] text-[var(--color-text-muted)] font-mono">
                <span>{open} open risks</span>
                <span>•</span>
                <span>USD {p.budgetUSDm}m</span>
                <span>•</span>
                <span>{p.durationMonths}mo</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
