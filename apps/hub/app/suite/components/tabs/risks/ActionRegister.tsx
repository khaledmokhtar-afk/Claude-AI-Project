"use client";

import { motion } from "framer-motion";

type Action = { action: string; owner: string; dueWithinDays: number };

function dueMeta(days: number): { tone: string; chip: string } {
  if (days <= 14) return { tone: "var(--color-bad)",  chip: "chip-bad"  };
  if (days <= 60) return { tone: "var(--color-warn)", chip: "chip-warn" };
  return               { tone: "var(--color-ok)",   chip: "chip-ok"   };
}

export function ActionRegister({ actions }: { actions: Action[] }) {
  if (!actions.length) return null;
  const sorted = [...actions].sort((a, b) => a.dueWithinDays - b.dueWithinDays);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6"
      style={{
        background: "var(--color-warn-soft)",
        borderColor: "color-mix(in srgb, var(--color-warn) 35%, var(--color-line))",
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" style={{ color: "var(--color-warn)" }}>
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <div className="eyebrow" style={{ color: "var(--color-warn)" }}>
          Top {sorted.length} immediate actions · time-bound
        </div>
      </div>
      <p className="text-[12.5px] text-[var(--color-ink-3)] mb-5 leading-[1.55] max-w-3xl">
        Highest-leverage interventions, ordered by due date. Each action has a named role accountable.
      </p>

      <div className="space-y-2">
        {sorted.map((a, i) => {
          const m = dueMeta(a.dueWithinDays);
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="grid grid-cols-[64px_1fr_auto] items-center gap-4 card-soft p-3 hover:shadow-sm transition-shadow"
            >
              <div
                className="flex flex-col items-center justify-center rounded-lg py-1.5"
                style={{
                  background: `color-mix(in srgb, ${m.tone} 10%, var(--color-bg))`,
                  border: `1px solid color-mix(in srgb, ${m.tone} 35%, var(--color-line))`,
                }}
              >
                <div className="font-display text-[18px] font-semibold tabular-nums leading-none" style={{ color: m.tone }}>
                  {a.dueWithinDays}
                </div>
                <div className="text-[9px] uppercase tracking-[0.15em] mt-0.5 font-mono" style={{ color: m.tone }}>
                  days
                </div>
              </div>
              <div className="min-w-0">
                <div className="text-[13.5px] text-[var(--color-ink)] leading-snug">{a.action}</div>
              </div>
              <span className="chip font-mono">{a.owner}</span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
