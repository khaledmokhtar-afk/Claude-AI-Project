"use client";

import type { EstimateTrace } from "@/lib/types";

export default function EstimateTracePanel({ data }: { data: EstimateTrace }) {
  const totalCost = data.costBreakdown.reduce((s, x) => s + x.amountUSDm, 0) || 1;
  const maxSwing = Math.max(
    ...data.swingFactors.map((s) => Math.abs(s.highUSDm) + Math.abs(s.lowUSDm)),
    1,
  );

  return (
    <div className="space-y-6">
      <div>
        <div className="eyebrow mb-2">Cost breakdown ({totalCost.toFixed(1)} USD m)</div>
        <div className="space-y-1.5">
          {data.costBreakdown.map((c, i) => {
            const pct = (c.amountUSDm / totalCost) * 100;
            return (
              <div key={i} className="flex items-center gap-3 text-xs">
                <div className="w-44 shrink-0 text-white/80 truncate" title={c.basis}>
                  {c.category}
                </div>
                <div className="flex-1 h-3 rounded bg-white/[0.03] border border-white/5">
                  <div
                    className="h-full rounded bg-gradient-to-r from-emerald-500/70 to-indigo-500/70"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="w-20 shrink-0 text-right font-mono text-white/70">
                  {c.amountUSDm.toFixed(1)}
                </div>
                <div className="w-12 shrink-0 text-right text-white/40 text-[10px] font-mono">
                  {pct.toFixed(0)}%
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <div className="eyebrow mb-2">Personnel roster</div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-white/40 font-mono uppercase text-[10px]">
                <th className="py-1.5 pr-3">Role</th>
                <th className="py-1.5 pr-3 text-right">Count</th>
                <th className="py-1.5 pr-3 text-right">Rate /mo</th>
                <th className="py-1.5 pr-3 text-right">Person-months</th>
                <th className="py-1.5 text-right">Cost (USD m)</th>
              </tr>
            </thead>
            <tbody>
              {data.personnel.map((p, i) => (
                <tr key={i} className="border-t border-white/5">
                  <td className="py-1.5 pr-3 text-white/80">{p.role}</td>
                  <td className="py-1.5 pr-3 text-right font-mono">{p.count}</td>
                  <td className="py-1.5 pr-3 text-right font-mono text-white/70">
                    ${p.monthlyRateUSD.toLocaleString()}
                  </td>
                  <td className="py-1.5 pr-3 text-right font-mono text-white/70">
                    {p.totalPersonMonths}
                  </td>
                  <td className="py-1.5 text-right font-mono text-emerald-300">
                    {p.totalCostUSDm.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <div className="eyebrow mb-2">Methodology</div>
        <ol className="space-y-2">
          {data.methodology.map((m) => (
            <li key={m.step} className="flex gap-3">
              <div className="shrink-0 w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-xs font-mono flex items-center justify-center text-indigo-200">
                {m.step}
              </div>
              <div>
                <div className="text-sm text-white/90">{m.title}</div>
                <div className="text-xs text-white/55 mt-0.5">{m.detail}</div>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div>
        <div className="eyebrow mb-2">Analog scaling</div>
        <ul className="space-y-1.5 text-xs text-white/70">
          {data.analogScaling.map((a, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="font-mono text-indigo-300 shrink-0">{a.analogName}</span>
              <span className="text-white/40">·</span>
              <span className="text-white/60 font-mono">{a.scalingFactor}</span>
              <span className="text-white/40">→</span>
              <span>{a.contribution}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <div className="eyebrow mb-2">Swing factors (tornado)</div>
        <div className="space-y-1.5">
          {data.swingFactors.map((s, i) => {
            const lowPct = (Math.abs(s.lowUSDm) / maxSwing) * 50;
            const highPct = (Math.abs(s.highUSDm) / maxSwing) * 50;
            return (
              <div key={i} className="flex items-center gap-2 text-xs">
                <div className="w-40 shrink-0 text-white/80 truncate">{s.label}</div>
                <div className="flex-1 h-4 flex relative">
                  <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/20" />
                  <div className="w-1/2 flex justify-end">
                    <div
                      className="h-full bg-red-500/50 rounded-l"
                      style={{ width: `${lowPct}%` }}
                    />
                  </div>
                  <div className="w-1/2">
                    <div
                      className="h-full bg-emerald-500/50 rounded-r"
                      style={{ width: `${highPct}%` }}
                    />
                  </div>
                </div>
                <div className="w-28 shrink-0 text-right font-mono text-white/60">
                  {s.lowUSDm.toFixed(1)} / +{s.highUSDm.toFixed(1)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
