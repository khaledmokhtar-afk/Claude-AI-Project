"use client";

import type { Mode } from "@iesl/ui";

export function Header({
  mode,
  onModeChange,
  apiKeyPresent,
}: {
  mode: Mode;
  onModeChange: (m: Mode) => void;
  apiKeyPresent: boolean;
}) {
  const aiDisabled = !apiKeyPresent;
  return (
    <header className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center glow-primary" style={{ background: "rgba(16,185,129,0.18)" }}>
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-[var(--color-primary-soft)]" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <path d="M3 10h18" />
            <path d="M9 16l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-semibold leading-none">EstimatorAI</h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            Historical-Intelligence Effort &amp; Cost Estimator — IESL Workshop Edition
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 p-1 rounded-full glass">
        <button
          onClick={() => onModeChange("demo")}
          className={`px-4 py-1.5 text-xs rounded-full transition-all font-medium ${
            mode === "demo" ? "bg-white/10 text-white" : "text-[var(--color-text-muted)]"
          }`}
        >
          ● Demo Mode
        </button>
        <button
          onClick={() => !aiDisabled && onModeChange("ai")}
          disabled={aiDisabled}
          title={aiDisabled ? "Set ANTHROPIC_API_KEY in .env.local to enable live AI" : ""}
          className={`px-4 py-1.5 text-xs rounded-full transition-all font-medium ${
            mode === "ai" ? "glow-accent text-[var(--color-bg)]" : "text-[var(--color-text-muted)]"
          } ${aiDisabled ? "opacity-40 cursor-not-allowed" : ""}`}
          style={{ background: mode === "ai" ? "var(--color-accent)" : "transparent" }}
        >
          ⚡ AI Mode
        </button>
      </div>
    </header>
  );
}
