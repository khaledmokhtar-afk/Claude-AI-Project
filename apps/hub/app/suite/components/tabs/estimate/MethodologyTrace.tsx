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
      className="card p-6"
    >
      <div className="eyebrow mb-1">How this estimate was derived</div>
      <p className="text-[12.5px] text-[var(--color-ink-3)] mb-5 leading-[1.55] max-w-3xl">
        Numbered traceable steps from analog selection through contingency setting. Auditable by a senior estimator.
      </p>

      <ol className="relative ml-3 space-y-5 border-l border-[var(--color-line-strong)] pl-6">
        {sorted.map((s, i) => (
          <motion.li
            key={s.step}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className="relative"
          >
            <div
              className="absolute -left-[33px] top-0 w-6 h-6 rounded-full grid place-items-center font-mono text-[10px] font-semibold text-white"
              style={{ background: "var(--color-ink)" }}
            >
              {s.step}
            </div>
            <div>
              <div className="text-[13.5px] font-semibold text-[var(--color-ink)] mb-1">{s.title}</div>
              <p className="text-[12.5px] text-[var(--color-ink-3)] leading-[1.6]">
                {s.detail}
              </p>
            </div>
          </motion.li>
        ))}
      </ol>

      {scaling && scaling.length > 0 && (
        <div className="mt-6 pt-5 border-t border-[var(--color-line)]">
          <div className="eyebrow mb-3">Analog scaling applied</div>
          <div className="space-y-2">
            {scaling.map((a, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                className="card-soft p-3"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[12.5px] font-medium text-[var(--color-ink)]">{a.analogName}</span>
                  <span className="chip chip-ok font-mono tabular-nums">{a.scalingFactor}</span>
                </div>
                <p className="text-[12px] text-[var(--color-ink-3)] leading-[1.55]">{a.contribution}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
