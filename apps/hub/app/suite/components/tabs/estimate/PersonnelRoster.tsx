"use client";

import { motion } from "framer-motion";
import type { PersonnelRole } from "@iesl/ui";

function fmtUSD(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(0)}k` : n.toFixed(0);
}

export function PersonnelRoster({ roles }: { roles: PersonnelRole[] }) {
  if (!roles.length) return null;
  const sorted = [...roles].sort((a, b) => b.totalCostUSDm - a.totalCostUSDm);
  const totalPM = sorted.reduce((a, b) => a + b.count * b.totalPersonMonths, 0);
  const totalCost = sorted.reduce((a, b) => a + b.totalCostUSDm, 0);
  const totalHeadcount = sorted.reduce((a, b) => a + b.count, 0);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Headcount peak", value: totalHeadcount, suffix: "" },
          { label: "Person-months", value: totalPM, suffix: "" },
          { label: "Personnel cost", value: totalCost, suffix: "$m", decimals: 1 },
        ].map((s) => (
          <div key={s.label} className="card-soft p-3.5 text-center">
            <div className="eyebrow mb-1.5">{s.label}</div>
            <div className="font-display text-[24px] text-[var(--color-ink)] tabular-nums leading-none">
              {typeof s.decimals === "number" ? s.value.toFixed(s.decimals) : s.value}
              {s.suffix && (
                <span className="text-[13px] ml-1 text-[var(--color-ink-3)] font-sans">{s.suffix}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-[var(--color-line)] overflow-hidden">
        <div className="grid grid-cols-[1fr_60px_90px_90px_90px] gap-3 px-4 py-2.5 bg-[var(--color-card-soft)] border-b border-[var(--color-line)]">
          <div className="eyebrow">Role</div>
          <div className="eyebrow text-right">Count</div>
          <div className="eyebrow text-right">$/month</div>
          <div className="eyebrow text-right">P-months</div>
          <div className="eyebrow text-right">Cost $m</div>
        </div>
        <div className="divide-y divide-[var(--color-line)]">
          {sorted.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="grid grid-cols-[1fr_60px_90px_90px_90px] gap-3 px-4 py-3 text-[12.5px] hover:bg-[var(--color-card-soft)] transition-colors tabular-nums"
            >
              <div className="text-[var(--color-ink)] truncate">{r.role}</div>
              <div className="text-right font-mono text-[var(--color-ink-3)]">×{r.count}</div>
              <div className="text-right font-mono text-[var(--color-ink-3)]">${fmtUSD(r.monthlyRateUSD)}</div>
              <div className="text-right font-mono text-[var(--color-ink-3)]">{r.totalPersonMonths}</div>
              <div className="text-right font-mono font-semibold text-[var(--color-ink)]">
                ${r.totalCostUSDm.toFixed(2)}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
