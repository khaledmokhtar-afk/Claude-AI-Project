"use client";

import { motion } from "framer-motion";

type Action = { action: string; owner: string; dueWithinDays: number };

function dueColor(days: number): string {
  if (days <= 14) return "#EF4444";
  if (days <= 60) return "#F59E0B";
  return "#10B981";
}

export function ActionRegister({ actions }: { actions: Action[] }) {
  if (!actions.length) return null;
  const sorted = [...actions].sort((a, b) => a.dueWithinDays - b.dueWithinDays);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-6"
    >
      <div className="flex items-center gap-2 mb-1">
        <svg className="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <div className="eyebrow text-amber-400">Top 5 immediate actions · time-bound</div>
      </div>
      <p className="text-xs text-[var(--color-text-muted)] mb-5">
        Highest-leverage interventions, ordered by due date. Each action has a named role accountable.
      </p>

      <div className="space-y-2">
        {sorted.map((a, i) => {
          const c = dueColor(a.dueWithinDays);
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="grid grid-cols-[60px_1fr_auto] items-center gap-4 rounded-xl bg-white/[0.025] p-3 hover:bg-white/[0.04] transition-colors"
            >
              <div
                className="flex flex-col items-center justify-center rounded-lg py-1.5"
                style={{ background: `${c}15`, border: `1px solid ${c}40` }}
              >
                <div className="text-base font-bold font-mono" style={{ color: c }}>{a.dueWithinDays}</div>
                <div className="text-[8px] uppercase tracking-wider" style={{ color: c }}>days</div>
              </div>
              <div className="min-w-0">
                <div className="text-sm text-white leading-tight">{a.action}</div>
              </div>
              <div className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider whitespace-nowrap font-mono">
                {a.owner}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
