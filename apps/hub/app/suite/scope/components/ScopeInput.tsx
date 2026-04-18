"use client";

import type { DemoScopeTemplate } from "@iesl/data";
import type { Mode } from "@iesl/ui";

export function ScopeInput({
  scopes,
  selectedScopeId,
  scopeText,
  onSelectScope,
  onScopeTextChange,
  onGenerate,
  isWorking,
  mode,
}: {
  scopes: DemoScopeTemplate[];
  selectedScopeId: string;
  scopeText: string;
  onSelectScope: (id: string) => void;
  onScopeTextChange: (text: string) => void;
  onGenerate: () => void;
  isWorking: boolean;
  mode: Mode;
}) {
  return (
    <div className="glass p-5 h-fit sticky top-4">
      <div className="mb-4">
        <div className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
          Demo scope library
        </div>
        <div className="flex flex-col gap-2">
          {scopes.map((s) => (
            <button
              key={s.id}
              onClick={() => onSelectScope(s.id)}
              className={`text-left p-3 rounded-lg border text-sm transition-all ${
                selectedScopeId === s.id
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                  : "border-[var(--color-border)] hover:border-[var(--color-primary-soft)]"
              }`}
            >
              <div className="font-medium">{s.label}</div>
              <div className="text-xs text-[var(--color-text-muted)] mt-1">{s.summary}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
            Scope brief
          </label>
          <span className="text-xs text-[var(--color-text-muted)] font-mono">
            {scopeText.length} chars
          </span>
        </div>
        <textarea
          value={scopeText}
          onChange={(e) => onScopeTextChange(e.target.value)}
          rows={10}
          className="w-full p-3 rounded-lg bg-[var(--color-bg-soft)] border border-[var(--color-border)] text-sm font-[var(--font-mono)] resize-y focus:outline-none focus:border-[var(--color-primary)]"
        />
      </div>

      <button
        onClick={onGenerate}
        disabled={isWorking || !scopeText.trim()}
        className="w-full py-3 rounded-lg font-semibold text-sm transition-all disabled:opacity-40"
        style={{
          background: mode === "ai" ? "var(--color-accent)" : "var(--color-primary)",
          color: mode === "ai" ? "var(--color-bg)" : "white",
          boxShadow:
            mode === "ai"
              ? "0 0 32px -8px var(--color-accent)"
              : "0 0 28px -10px var(--color-primary)",
        }}
      >
        {isWorking
          ? "Building plan…"
          : mode === "ai"
            ? "⚡ Generate with Claude"
            : "Generate WBS & Gantt"}
      </button>

      <div className="mt-4 text-xs text-[var(--color-text-muted)]">
        {mode === "demo" ? (
          <>
            <strong className="text-[var(--color-text)]">Demo Mode:</strong> returns the pre-seeded
            IESL reference plan. Runs offline.
          </>
        ) : (
          <>
            <strong className="text-[var(--color-accent)]">AI Mode:</strong> Claude generates a fresh
            plan from the scope above. System prompt uses cache_control for low latency.
          </>
        )}
      </div>
    </div>
  );
}
