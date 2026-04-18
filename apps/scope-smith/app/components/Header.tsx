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
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg glow-primary"
          style={{ background: "color-mix(in srgb, var(--color-primary) 25%, transparent)" }}
        >
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M3 12h12M3 18h7" strokeLinecap="round" />
            <circle cx="19" cy="17" r="3" />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-semibold leading-none">ScopeSmith</h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            AI Scoping, Planning &amp; Scheduling — IESL Workshop Edition
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
            mode === "ai"
              ? "text-[var(--color-bg)] glow-accent"
              : "text-[var(--color-text-muted)]"
          } ${aiDisabled ? "opacity-40 cursor-not-allowed" : ""}`}
          style={{
            background:
              mode === "ai" ? "var(--color-accent)" : "transparent",
          }}
        >
          ⚡ AI Mode
        </button>
      </div>
    </header>
  );
}
