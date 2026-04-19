"use client";

import { motion } from "framer-motion";
import type { MethodologyStep, AnalogScalingEntry } from "@iesl/ui";

export function MethodologyTrace({
  steps,
  scaling,
}: {
  steps: MethodologyStep[];
  scaling?: AnalogScalingEntry[];
}) {
  if (!steps.length) return null;
  const sorted = [...steps].sort((a, b) => a.step - b.step);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/8 bg-white/[0.03] p-6"
    >
      <div className="eyebrow mb-1">How this estimate was derived</div>
      <p className="text-xs text-[var(--color-text-muted)] mb-5">
        Numbered traceable steps from analog selection through contingency setting. Auditable by a senior estimator.
      </p>

      <ol className="relative ml-3 space-y-5 border-l border-white/10 pl-6">
        {sorted.map((s, i) => (
          <motion.li
            key={s.step}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className="relative"
          >
            <div
              className="absolute -left-[33px] top-0 w-6 h-6 rounded-full bg-[var(--color-bg)] border-2 border-emerald-500/40 flex items-center justify-center text-[10px] font-bold font-mono text-emerald-400"
            >
              {s.step}
            </div>
            <div>
              <div className="text-sm font-semibold text-white mb-1">{s.title}</div>
              <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                {s.detail}
              </p>
            </div>
          </motion.li>
        ))}
      </ol>

      {scaling && scaling.length > 0 && (
        <div className="mt-6 pt-5 border-t border-white/5">
          <div className="eyebrow mb-3">Analog scaling applied</div>
          <div className="space-y-2">
            {scaling.map((a, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                className="rounded-xl bg-white/[0.025] p-3"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-white">{a.analogName}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-mono">
                    {a.scalingFactor}
                  </span>
                </div>
                <p className="text-[11px] text-[var(--color-text-muted)] leading-relaxed">
                  {a.contribution}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
