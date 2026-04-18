"use client";

import { motion } from "framer-motion";
import type { Risk } from "@iesl/data";

export function PredictionPanel({
  selected,
  aiForSelected,
}: {
  selected: Risk | undefined;
  aiForSelected?: {
    predicted30d: number;
    predicted60d: number;
    predicted90d: number;
    mitigation: string;
  };
}) {
  if (!selected) {
    return (
      <div className="glass p-5 flex items-center justify-center text-sm text-[var(--color-text-muted)]">
        Select a risk to see its prediction.
      </div>
    );
  }

  const seriesBase = [selected.predicted30d, selected.predicted60d, selected.predicted90d];
  const seriesAI = aiForSelected
    ? [aiForSelected.predicted30d, aiForSelected.predicted60d, aiForSelected.predicted90d]
    : null;
  const labels = ["30d", "60d", "90d"];

  return (
    <div className="glass p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
            Risk detail
          </div>
          <h3 className="text-lg font-semibold mt-1">{selected.title}</h3>
          <div className="text-xs text-[var(--color-text-muted)] mt-1">
            [{selected.category}] · Owner: {selected.owner} · Status: {selected.status}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase text-[var(--color-text-muted)]">Score</div>
          <div className="text-3xl font-bold" style={{ color: "var(--color-primary-soft)" }}>
            {selected.likelihood * selected.impact}
          </div>
          <div className="text-[10px] text-[var(--color-text-muted)]">
            L{selected.likelihood}×I{selected.impact}
          </div>
        </div>
      </div>

      <p className="text-sm text-[var(--color-text)] mt-3">{selected.description}</p>

      <div className="mt-5">
        <div className="flex items-end gap-4 h-40">
          {seriesBase.map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="relative w-full h-32 flex items-end gap-1">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${v * 100}%` }}
                  className="flex-1 rounded-t"
                  style={{ background: "var(--color-primary)" }}
                  title={`baseline ${(v * 100).toFixed(0)}%`}
                />
                {seriesAI && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${seriesAI[i] * 100}%` }}
                    transition={{ delay: 0.15 + i * 0.1 }}
                    className="flex-1 rounded-t"
                    style={{ background: "var(--color-accent)" }}
                    title={`AI ${(seriesAI[i] * 100).toFixed(0)}%`}
                  />
                )}
              </div>
              <div className="text-[10px] text-[var(--color-text-muted)] font-mono">
                {labels[i]}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-4 mt-2 text-[10px] text-[var(--color-text-muted)]">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded" style={{ background: "var(--color-primary)" }} />
            Baseline register
          </span>
          {seriesAI && (
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded" style={{ background: "var(--color-accent)" }} />
              AI refined
            </span>
          )}
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-[var(--color-border)]">
        <div className="text-xs uppercase tracking-wider text-[var(--color-success)] mb-2">
          Mitigation
        </div>
        <p className="text-sm">{aiForSelected?.mitigation ?? selected.mitigation ?? "—"}</p>
      </div>
    </div>
  );
}
