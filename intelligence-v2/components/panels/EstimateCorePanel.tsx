"use client";

import type { Band, EstimateCore } from "@/lib/types";

function fmt(n: number, unit = ""): string {
  const s = n >= 100 ? n.toFixed(0) : n >= 10 ? n.toFixed(1) : n.toFixed(2);
  return `${s}${unit}`;
}

export default function EstimateCorePanel({ data }: { data: EstimateCore }) {
  return (
    <div className="space-y-7">
      <div>
        <div className="eyebrow mb-1.5">Project type</div>
        <div className="font-display text-[24px] leading-tight tracking-[-0.015em]">
          {data.projectType}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <BandCard label="Duration" band={data.durationMonths} unit=" mo" />
        <BandCard label="Effort" band={data.effortPersonMonths} unit=" PM" />
        <BandCard label="Cost" band={data.costUSDm} unit="m" prefix="$" highlight />
      </div>

      <div className="card-soft p-5 flex items-baseline justify-between gap-4">
        <div>
          <div className="eyebrow mb-1">Contingency</div>
          <div className="text-[13.5px] text-[var(--ink-2)] leading-[1.55] max-w-[560px]">
            {data.contingencyRationale}
          </div>
        </div>
        <div className="font-display text-[40px] leading-none text-[var(--accent)] tabular-nums shrink-0">
          {data.contingencyPct}%
        </div>
      </div>

      <div>
        <div className="eyebrow mb-2.5">Narrative</div>
        <p className="text-[15px] text-[var(--ink-2)] leading-[1.65] max-w-[760px]">
          {data.narrative}
        </p>
      </div>

      <div>
        <div className="eyebrow mb-3">Assumptions</div>
        <ul className="space-y-1.5">
          {data.assumptions.map((a, i) => (
            <li key={i} className="flex gap-3 text-[14px] text-[var(--ink-2)] leading-[1.55]">
              <span className="text-[var(--brand)] shrink-0 mt-1.5">•</span>
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
  prefix = "",
  highlight,
}: {
  label: string;
  band: Band;
  unit: string;
  prefix?: string;
  highlight?: boolean;
}) {
  const range = band.high - band.low || 1;
  const likelyPct = ((band.likely - band.low) / range) * 100;
  return (
    <div className="card-soft p-5">
      <div className="eyebrow mb-2">{label}</div>
      <div
        className={`font-display text-[36px] leading-none tracking-[-0.02em] tabular-nums ${highlight ? "text-[var(--brand-ink)]" : "text-[var(--ink)]"}`}
      >
        {prefix}{fmt(band.likely, unit)}
      </div>
      <div className="mt-4 relative h-1.5 rounded-full" style={{ background: "var(--line-strong)" }}>
        <div
          className="absolute top-0 bottom-0 rounded-full"
          style={{
            left: 0,
            right: 0,
            background: highlight ? "var(--brand)" : "var(--ink-3)",
            opacity: 0.55,
          }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full ring-2 ring-white"
          style={{ left: `${likelyPct}%`, background: highlight ? "var(--brand)" : "var(--ink)" }}
        />
      </div>
      <div className="mt-2 flex justify-between font-mono text-[11px] text-[var(--ink-3)] tabular-nums">
        <span>P10 {prefix}{fmt(band.low, unit)}</span>
        <span>P80 {prefix}{fmt(band.high, unit)}</span>
      </div>
    </div>
  );
}
