"use client";

import { motion } from "framer-motion";
import type { Risk } from "@iesl/data";

const HEAT = [
  "var(--color-heat-0)",
  "var(--color-heat-1)",
  "var(--color-heat-2)",
  "var(--color-heat-3)",
  "var(--color-heat-4)",
  "var(--color-heat-5)",
];

function cellColor(l: number, i: number) {
  const score = Math.min(25, l * i);
  const idx = Math.min(5, Math.floor(score / 5));
  return HEAT[idx];
}

export function RiskMatrix({
  risks,
  selectedRiskId,
  onSelect,
}: {
  risks: Risk[];
  selectedRiskId: string | null;
  onSelect: (id: string) => void;
}) {
  const grid: Record<string, Risk[]> = {};
  for (const r of risks) {
    const key = `${r.likelihood}-${r.impact}`;
    (grid[key] ??= []).push(r);
  }
  const likelihoods = [5, 4, 3, 2, 1];
  const impacts = [1, 2, 3, 4, 5];

  return (
    <div>
      <div className="flex gap-3">
        <div className="flex flex-col justify-around text-[10px] text-[var(--color-ink-4)] font-mono py-2 pr-1">
          {likelihoods.map((n) => (
            <div key={n} className="h-12 flex items-center">{n}</div>
          ))}
        </div>
        <div className="flex-1">
          <div className="grid grid-cols-5 gap-1.5">
            {likelihoods.map((l) =>
              impacts.map((i) => {
                const key = `${l}-${i}`;
                const cell = grid[key] ?? [];
                const color = cellColor(l, i);
                return (
                  <div
                    key={key}
                    className="relative h-12 w-12 rounded-md"
                    style={{
                      background: cell.length ? color : "var(--color-card-soft)",
                      boxShadow: cell.length
                        ? "inset 0 0 0 1px color-mix(in srgb, var(--color-ink) 6%, transparent)"
                        : "inset 0 0 0 1px var(--color-line)",
                    }}
                  >
                    <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-1 p-1">
                      {cell.map((r, idx) => {
                        const isSel = r.id === selectedRiskId;
                        const dot =
                          r.trend === "Rising"
                            ? "var(--color-bad)"
                            : r.trend === "Falling"
                              ? "var(--color-ok)"
                              : "var(--color-ink)";
                        return (
                          <motion.button
                            key={r.id}
                            onClick={() => onSelect(r.id)}
                            className="w-2.5 h-2.5 rounded-full transition-all"
                            initial={{ scale: 0 }}
                            animate={{ scale: isSel ? 1.5 : 1 }}
                            transition={{ delay: idx * 0.04 }}
                            style={{
                              background: dot,
                              boxShadow: isSel
                                ? "0 0 0 2px var(--color-bg), 0 0 0 3.5px var(--color-ink)"
                                : "0 0 0 1.5px var(--color-bg)",
                            }}
                            title={r.title}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              }),
            )}
          </div>
          <div className="flex text-[10px] text-[var(--color-ink-4)] font-mono mt-2 justify-around px-1">
            {impacts.map((n) => <div key={n}>{n}</div>)}
          </div>
          <div className="text-[10px] text-center text-[var(--color-ink-4)] mt-1 tracking-[0.15em] uppercase">
            Impact →
          </div>
        </div>
      </div>

      <div className="flex gap-4 mt-5 pt-4 border-t border-[var(--color-line)] text-[11px] text-[var(--color-ink-3)]">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ background: "var(--color-bad)" }} />
          Rising
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ background: "var(--color-ink)" }} />
          Stable
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ background: "var(--color-ok)" }} />
          Falling
        </span>
      </div>
    </div>
  );
}
