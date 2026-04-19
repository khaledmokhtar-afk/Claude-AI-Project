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
      {/* Header totals */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Headcount peak", value: totalHeadcount, suffix: "" },
          { label: "Person-months", value: totalPM, suffix: "" },
          { label: "Personnel cost", value: totalCost, suffix: "$m", decimals: 1 },
        ].map((s) => (
          <div key={s.label} className="rounded-xl bg-white/[0.03] p-3 text-center">
            <div className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] mb-1">
              {s.label}
            </div>
            <div className="text-xl font-bold font-mono text-white">
              {typeof s.decimals === "number" ? s.value.toFixed(s.decimals) : s.value}
              {s.suffix && <span className="text-xs ml-1 text-[var(--color-text-muted)]">{s.suffix}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Role table */}
      <div className="rounded-xl border border-white/5 overflow-hidden">
        <div className="grid grid-cols-[1fr_60px_90px_90px_90px] gap-3 px-4 py-2.5 text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] bg-white/[0.025] border-b border-white/5">
          <div>Role</div>
          <div className="text-right">Count</div>
          <div className="text-right">$/month</div>
          <div className="text-right">P-months</div>
          <div className="text-right">Cost $m</div>
        </div>
        <div className="divide-y divide-white/5">
          {sorted.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="grid grid-cols-[1fr_60px_90px_90px_90px] gap-3 px-4 py-3 text-xs hover:bg-white/[0.025] transition-colors"
            >
              <div className="text-[var(--color-text)] truncate">{r.role}</div>
              <div className="text-right font-mono text-[var(--color-text-muted)]">×{r.count}</div>
              <div className="text-right font-mono text-[var(--color-text-muted)]">${fmtUSD(r.monthlyRateUSD)}</div>
              <div className="text-right font-mono text-[var(--color-text-muted)]">{r.totalPersonMonths}</div>
              <div className="text-right font-mono font-bold text-white">${r.totalCostUSDm.toFixed(2)}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
