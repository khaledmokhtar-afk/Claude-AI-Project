"use client";

import type { EstimateTrace } from "@/lib/types";

export default function EstimateTracePanel({ data }: { data: EstimateTrace }) {
  const totalCost = data.costBreakdown.reduce((s, x) => s + x.amountUSDm, 0) || 1;
  const maxSwing = Math.max(
    ...data.swingFactors.map((s) => Math.abs(s.highUSDm) + Math.abs(s.lowUSDm)),
    1,
  );

  return (
    <div className="space-y-8">
      <Section title={`Cost breakdown · $${totalCost.toFixed(1)}m`}>
        <div className="space-y-2">
          {data.costBreakdown.map((c, i) => {
            const pct = (c.amountUSDm / totalCost) * 100;
            return (
              <div key={i} className="grid grid-cols-[180px_1fr_72px_44px] gap-3 items-center text-[13.5px]">
                <div className="truncate text-[var(--ink-2)]" title={c.basis}>{c.category}</div>
                <div className="h-2.5 rounded-full bg-[var(--line)] overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, background: "var(--brand)" }}
                  />
                </div>
                <div className="text-right font-mono tabular-nums text-[var(--ink)]">
                  ${c.amountUSDm.toFixed(1)}m
                </div>
                <div className="text-right font-mono text-[11px] text-[var(--ink-3)] tabular-nums">
                  {pct.toFixed(0)}%
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      <Section title="Personnel roster">
        <div className="card-soft p-0 overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[var(--line)]">
                {["Role", "Count", "Rate /mo", "Person-months", "Cost ($m)"].map((h, i) => (
                  <th
                    key={h}
                    className={`px-4 py-2.5 font-mono text-[10.5px] uppercase tracking-wider text-[var(--ink-4)] ${i === 0 ? "text-left" : "text-right"}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.personnel.map((p, i) => (
                <tr key={i} className="border-b border-[var(--line)] last:border-0">
                  <td className="px-4 py-2.5 text-[var(--ink)]">{p.role}</td>
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums">{p.count}</td>
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums text-[var(--ink-2)]">
                    ${p.monthlyRateUSD.toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums text-[var(--ink-2)]">
                    {p.totalPersonMonths}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono tabular-nums text-[var(--brand-ink)] font-medium">
                    {p.totalCostUSDm.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Methodology">
        <ol className="space-y-3">
          {data.methodology.map((m) => (
            <li key={m.step} className="flex gap-4">
              <div
                className="shrink-0 w-7 h-7 rounded-full grid place-items-center font-mono text-[12px] font-semibold text-white"
                style={{ background: "var(--brand)" }}
              >
                {m.step}
              </div>
              <div>
                <div className="text-[14px] font-medium text-[var(--ink)]">{m.title}</div>
                <div className="text-[13px] text-[var(--ink-3)] mt-0.5 leading-[1.55]">{m.detail}</div>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="Analog scaling">
        <ul className="space-y-2">
          {data.analogScaling.map((a, i) => (
            <li key={i} className="flex flex-wrap items-baseline gap-2 text-[13.5px] text-[var(--ink-2)] py-2 border-b border-[var(--line)] last:border-0">
              <span className="font-mono text-[var(--brand-ink)] font-medium">{a.analogName}</span>
              <span className="font-mono text-[12px] text-[var(--ink-4)]">{a.scalingFactor}</span>
              <span className="text-[var(--ink-4)]">→</span>
              <span>{a.contribution}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Swing factors · tornado">
        <div className="space-y-2">
          {data.swingFactors.map((s, i) => {
            const lowPct = (Math.abs(s.lowUSDm) / maxSwing) * 50;
            const highPct = (Math.abs(s.highUSDm) / maxSwing) * 50;
            return (
              <div key={i} className="grid grid-cols-[160px_1fr_120px] gap-3 items-center text-[13px]">
                <div className="truncate text-[var(--ink-2)]">{s.label}</div>
                <div className="relative h-5 flex">
                  <div className="w-1/2 flex justify-end items-center">
                    <div
                      className="h-full rounded-l-md"
                      style={{ width: `${lowPct}%`, background: "var(--bad-soft)", borderRight: "2px solid var(--bad)" }}
                    />
                  </div>
                  <div className="w-1/2 flex items-center">
                    <div
                      className="h-full rounded-r-md"
                      style={{ width: `${highPct}%`, background: "var(--ok-soft)", borderLeft: "2px solid var(--ok)" }}
                    />
                  </div>
                </div>
                <div className="text-right font-mono tabular-nums text-[12px] text-[var(--ink-3)]">
                  <span className="text-[var(--bad)]">{s.lowUSDm.toFixed(1)}</span>
                  {" / "}
                  <span className="text-[var(--ok)]">+{s.highUSDm.toFixed(1)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="eyebrow mb-3">{title}</div>
      {children}
    </div>
  );
}
