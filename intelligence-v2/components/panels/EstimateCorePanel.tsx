"use client";

import type { Band, EstimateCore } from "@/lib/types";

function fmt(n: number, unit = ""): string {
  const s = n >= 100 ? n.toFixed(0) : n >= 10 ? n.toFixed(1) : n.toFixed(2);
  return `${s}${unit}`;
}

export default function EstimateCorePanel({ data }: { data: EstimateCore }) {
  return (
    <div className="space-y-6">
      <div>
        <div className="eyebrow mb-1">Project type</div>
        <div className="text-lg" style={{ fontFamily: "var(--font-display), serif" }}>
          {data.projectType}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <BandCard label="Duration" band={data.durationMonths} unit=" mo" />
        <BandCard label="Effort" band={data.effortPersonMonths} unit=" PM" />
        <BandCard label="Cost" band={data.costUSDm} unit=" USD m" accent />
      </div>

      <div className="glass-hi p-4">
        <div className="flex items-baseline justify-between">
          <div className="eyebrow">Contingency</div>
          <div className="text-2xl font-mono text-amber-300">{data.contingencyPct}%</div>
        </div>
        <div className="text-xs text-white/60 mt-1">{data.contingencyRationale}</div>
      </div>

      <div>
        <div className="eyebrow mb-2">Narrative</div>
        <p className="text-sm text-white/80 leading-relaxed">{data.narrative}</p>
      </div>

      <div>
        <div className="eyebrow mb-2">Assumptions</div>
        <ul className="space-y-1.5 text-sm text-white/70">
          {data.assumptions.map((a, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-indigo-400 shrink-0">–</span>
              <span>{a}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function BandCard({
  label,
  band,
  unit,
  accent,
}: {
  label: string;
  band: Band;
  unit: string;
  accent?: boolean;
}) {
  const range = band.high - band.low || 1;
  const likelyPct = ((band.likely - band.low) / range) * 100;
  return (
    <div className="glass-hi p-4">
      <div className="eyebrow">{label}</div>
      <div
        className={`mt-2 text-3xl font-mono ${accent ? "text-emerald-300" : "text-white"}`}
        style={{ fontFamily: "var(--font-display), serif" }}
      >
        {fmt(band.likely, unit)}
      </div>
      <div className="mt-3 relative h-2 rounded-full bg-white/5 overflow-hidden">
        <div
          className={`absolute top-0 bottom-0 ${
            accent
              ? "bg-gradient-to-r from-emerald-500/60 to-indigo-500/60"
              : "bg-gradient-to-r from-indigo-500/50 to-indigo-300/50"
          }`}
          style={{ left: 0, right: 0 }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 h-3 w-1 rounded-sm bg-white"
          style={{ left: `${likelyPct}%` }}
        />
      </div>
      <div className="mt-1.5 flex justify-between text-[10px] text-white/40 font-mono">
        <span>P10 {fmt(band.low, unit)}</span>
        <span>P80 {fmt(band.high, unit)}</span>
      </div>
    </div>
  );
}
