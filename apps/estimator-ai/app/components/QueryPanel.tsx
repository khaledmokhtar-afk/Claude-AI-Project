"use client";

import type { Mode } from "@iesl/ui";

export function QueryPanel({
  presets,
  selectedPresetId,
  query,
  onSelectPreset,
  onQueryChange,
  onRun,
  isRunning,
  mode,
  historicalCount,
  matchedCount,
}: {
  presets: { id: string; label: string; text: string }[];
  selectedPresetId: string;
  query: string;
  onSelectPreset: (id: string) => void;
  onQueryChange: (text: string) => void;
  onRun: () => void;
  isRunning: boolean;
  mode: Mode;
  historicalCount: number;
  matchedCount: number;
}) {
  return (
    <div className="glass p-5 h-fit sticky top-4">
      <div className="mb-4">
        <div className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
          Preset briefs
        </div>
        <div className="flex flex-col gap-2">
          {presets.map((p) => (
            <button
              key={p.id}
              onClick={() => onSelectPreset(p.id)}
              className={`text-left p-3 rounded-lg border text-sm transition-all ${
                selectedPresetId === p.id
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                  : "border-[var(--color-border)] hover:border-[var(--color-primary-soft)]"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
            Project brief
          </label>
          <span className="text-[10px] text-[var(--color-text-muted)] font-mono">
            {query.length} chars
          </span>
        </div>
        <textarea
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          rows={7}
          className="w-full p-3 rounded-lg bg-[var(--color-bg-soft)] border border-[var(--color-border)] text-sm font-[var(--font-mono)] resize-y focus:outline-none focus:border-[var(--color-primary)]"
        />
      </div>

      <div className="mb-4 p-3 rounded-lg bg-[var(--color-bg-soft)] border border-[var(--color-border)]">
        <div className="text-[10px] uppercase text-[var(--color-text-muted)] mb-1">Retrieval</div>
        <div className="text-sm font-mono">
          <span className="text-[var(--color-primary-soft)]">{matchedCount}</span>{" "}
          / {historicalCount}{" "}
          <span className="text-[var(--color-text-muted)] text-xs">analog matches</span>
        </div>
        <div className="text-[10px] text-[var(--color-text-muted)] mt-1">
          Indexed corpus · bag-of-tokens similarity (swap for embeddings in production)
        </div>
      </div>

      <button
        onClick={onRun}
        disabled={isRunning || !query.trim()}
        className="w-full py-3 rounded-lg font-semibold text-sm transition-all disabled:opacity-40"
        style={{
          background:
            mode === "ai" ? "var(--color-accent)" : "var(--color-primary)",
          color: mode === "ai" ? "var(--color-bg)" : "var(--color-bg)",
          boxShadow:
            mode === "ai"
              ? "0 0 32px -8px var(--color-accent)"
              : "0 0 24px -8px var(--color-primary)",
        }}
      >
        {isRunning
          ? "Estimating…"
          : mode === "ai"
            ? "⚡ Run with Claude"
            : "▶ Run Estimate"}
      </button>

      <div className="mt-4 text-xs text-[var(--color-text-muted)]">
        {mode === "demo" ? (
          <>
            <strong className="text-[var(--color-text)]">Demo Mode:</strong> retrieves analogs and
            returns a pre-computed estimate. Offline-safe.
          </>
        ) : (
          <>
            <strong className="text-[var(--color-accent)]">AI Mode:</strong> Claude reasons over
            analogs to produce low/likely/high bounds, swing factors, and a narrative.
          </>
        )}
      </div>
    </div>
  );
}
