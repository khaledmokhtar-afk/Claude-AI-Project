"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { Risk } from "@iesl/data";

export function MonteCarlo({
  budgetUSDm,
  durationMonths,
  risks,
}: {
  budgetUSDm: number;
  durationMonths: number;
  risks: Risk[];
}) {
  const [runs, setRuns] = useState(5000);
  const [seed, setSeed] = useState(42);

  const { costSamples, p50Cost, p80Cost, p95Cost, p80Delta } = useMemo(() => {
    const rng = mulberry32(seed);
    const samples: number[] = [];
    for (let i = 0; i < runs; i++) {
      let delta = 0;
      for (const r of risks) {
        const triggerProb = r.predicted90d;
        if (rng() < triggerProb) {
          // Risk hit. Impact translates to a % hit on budget.
          const hitPct = (r.impact * r.likelihood) / 50;
          // Uncertainty cone: triangular distribution.
          const u = rng() + rng();
          const jitter = 0.5 + u * 0.5; // range 0.5 to 1.5
          delta += budgetUSDm * hitPct * jitter;
        }
      }
      samples.push(budgetUSDm + delta);
    }
    samples.sort((a, b) => a - b);
    const pick = (q: number) => samples[Math.min(samples.length - 1, Math.floor(samples.length * q))];
    return {
      costSamples: samples,
      p50Cost: pick(0.5),
      p80Cost: pick(0.8),
      p95Cost: pick(0.95),
      p80Delta: pick(0.8) - budgetUSDm,
    };
  }, [runs, seed, risks, budgetUSDm]);

  // Histogram
  const buckets = 30;
  const min = costSamples[0];
  const max = costSamples[costSamples.length - 1];
  const size = (max - min) / buckets || 1;
  const hist = new Array(buckets).fill(0);
  for (const v of costSamples) {
    const idx = Math.min(buckets - 1, Math.max(0, Math.floor((v - min) / size)));
    hist[idx]++;
  }
  const histMax = Math.max(...hist);

  return (
    <div className="glass p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
            Monte Carlo — Cost Exposure
          </div>
          <div className="text-xs text-[var(--color-text-muted)] mt-1 font-mono">
            {runs.toLocaleString()} simulated runs · {risks.length} risks · {durationMonths}mo horizon
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <label className="text-[var(--color-text-muted)]">Runs</label>
          <input
            type="range"
            min={500}
            max={20000}
            step={500}
            value={runs}
            onChange={(e) => setRuns(Number(e.target.value))}
          />
          <span className="font-mono w-16 text-right">{runs.toLocaleString()}</span>
          <button
            onClick={() => setSeed((s) => s + 1)}
            className="px-2 py-1 rounded border border-[var(--color-border)] hover:border-[var(--color-primary-soft)] text-[var(--color-text-muted)] hover:text-white"
          >
            Re-seed
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-4">
        <StatBox label="Base budget" value={`$${budgetUSDm.toFixed(1)}m`} subtle />
        <StatBox label="P50 cost" value={`$${p50Cost.toFixed(1)}m`} tone="info" />
        <StatBox
          label="P80 cost"
          value={`$${p80Cost.toFixed(1)}m`}
          tone="accent"
          delta={`+$${p80Delta.toFixed(1)}m`}
        />
        <StatBox label="P95 cost" value={`$${p95Cost.toFixed(1)}m`} tone="danger" />
      </div>

      <div className="h-28 flex items-end gap-[2px]">
        {hist.map((h, i) => {
          const v = min + i * size;
          const danger = v >= p80Cost;
          return (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${(h / histMax) * 100}%` }}
              transition={{ duration: 0.3, delay: i * 0.01 }}
              className="flex-1 rounded-t"
              style={{
                background: danger ? "var(--color-primary)" : "var(--color-info)",
                opacity: danger ? 0.9 : 0.65,
              }}
              title={`$${v.toFixed(1)}m — ${h} runs`}
            />
          );
        })}
      </div>

      <div className="flex items-center justify-between text-[10px] text-[var(--color-text-muted)] font-mono mt-2">
        <span>${min.toFixed(1)}m</span>
        <span className="text-[var(--color-accent)]">P80 threshold</span>
        <span>${max.toFixed(1)}m</span>
      </div>
    </div>
  );
}

function StatBox({
  label,
  value,
  tone,
  subtle,
  delta,
}: {
  label: string;
  value: string;
  tone?: "info" | "accent" | "danger";
  subtle?: boolean;
  delta?: string;
}) {
  const tones = {
    info: "var(--color-info)",
    accent: "var(--color-accent)",
    danger: "var(--color-primary-soft)",
  } as const;
  const color = tone ? tones[tone] : "var(--color-text)";
  return (
    <div
      className="p-3 rounded-lg border"
      style={{
        background: subtle ? "var(--color-bg-soft)" : `color-mix(in srgb, ${color} 10%, var(--color-bg-soft))`,
        borderColor: subtle ? "var(--color-border)" : color,
      }}
    >
      <div className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">
        {label}
      </div>
      <div className="text-xl font-bold font-mono mt-1" style={{ color }}>
        {value}
      </div>
      {delta && (
        <div className="text-[10px] font-mono mt-0.5 text-[var(--color-text-muted)]">{delta} vs base</div>
      )}
    </div>
  );
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
