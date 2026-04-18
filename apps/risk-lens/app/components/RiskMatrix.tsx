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
    <div className="glass p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
          Risk Heat Matrix
        </div>
        <div className="text-[10px] text-[var(--color-text-muted)] font-mono">L × I</div>
      </div>
      <div className="flex gap-2">
        <div className="flex flex-col justify-around text-[10px] text-[var(--color-text-muted)] font-mono py-2">
          <div className="h-6">5</div>
          <div className="h-6">4</div>
          <div className="h-6">3</div>
          <div className="h-6">2</div>
          <div className="h-6">1</div>
        </div>
        <div className="flex-1">
          <div className="grid grid-cols-5 gap-1">
            {likelihoods.map((l) =>
              impacts.map((i) => {
                const key = `${l}-${i}`;
                const cell = grid[key] ?? [];
                const color = cellColor(l, i);
                return (
                  <div
                    key={key}
                    className="relative h-12 rounded"
                    style={{
                      background: cell.length
                        ? color
                        : "rgba(255,255,255,0.03)",
                    }}
                  >
                    <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-1 p-1">
                      {cell.map((r, idx) => (
                        <motion.button
                          key={r.id}
                          onClick={() => onSelect(r.id)}
                          className={`w-3 h-3 rounded-full border transition-all ${
                            r.id === selectedRiskId ? "ring-2 ring-white scale-125" : ""
                          }`}
                          initial={{ scale: 0 }}
                          animate={{ scale: r.id === selectedRiskId ? 1.25 : 1 }}
                          transition={{ delay: idx * 0.05 }}
                          style={{
                            background: r.trend === "Rising"
                              ? "var(--color-accent)"
                              : r.trend === "Falling"
                                ? "var(--color-success)"
                                : "white",
                            borderColor: "rgba(0,0,0,0.3)",
                          }}
                          title={r.title}
                        />
                      ))}
                    </div>
                  </div>
                );
              }),
            )}
          </div>
          <div className="flex text-[10px] text-[var(--color-text-muted)] font-mono mt-1 justify-around">
            <div>1</div><div>2</div><div>3</div><div>4</div><div>5</div>
          </div>
          <div className="text-[10px] text-center text-[var(--color-text-muted)] mt-1">Impact →</div>
        </div>
      </div>
      <div className="flex gap-4 mt-3 text-[10px] text-[var(--color-text-muted)]">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ background: "var(--color-accent)" }} />
          Rising
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-white" />
          Stable
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ background: "var(--color-success)" }} />
          Falling
        </span>
      </div>
    </div>
  );
}
