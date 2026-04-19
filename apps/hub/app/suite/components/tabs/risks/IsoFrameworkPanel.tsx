"use client";

import { motion } from "framer-motion";
import type { IsoFrameworkEntry } from "@iesl/ui";

const STANDARD_FAMILY = (s: string): { color: string; label: string } => {
  if (s.startsWith("ISO 45001")) return { color: "#EF4444", label: "HSE" };
  if (s.startsWith("ISO 14001")) return { color: "#10B981", label: "ENV" };
  if (s.startsWith("ISO 31000") || s.startsWith("ISO 31010")) return { color: "#6366F1", label: "RISK" };
  if (s.startsWith("ISO 27001")) return { color: "#3B82F6", label: "INFO" };
  if (s.startsWith("ISO 22301")) return { color: "#8B5CF6", label: "BCM" };
  if (s.startsWith("ISO 9001")) return { color: "#14B8A6", label: "QMS" };
  if (s.startsWith("ISO 19011")) return { color: "#06B6D4", label: "AUDIT" };
  if (s.startsWith("API")) return { color: "#F59E0B", label: "API" };
  if (s.startsWith("DNV")) return { color: "#EC4899", label: "DNV" };
  if (s.startsWith("IOGP")) return { color: "#F97316", label: "IOGP" };
  if (s.startsWith("NUPRC") || s.startsWith("NCDMB") || s.startsWith("NIMASA")) return { color: "#22C55E", label: "REG" };
  return { color: "#9CA3AF", label: "STD" };
};

export function IsoFrameworkPanel({ framework }: { framework: IsoFrameworkEntry[] }) {
  if (!framework.length) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/8 bg-white/[0.03] p-6"
    >
      <div className="flex items-center gap-2 mb-1">
        <svg className="w-4 h-4 text-indigo-400" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L4 6v6c0 5 3.5 9 8 10 4.5-1 8-5 8-10V6l-8-4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
          <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <div className="eyebrow text-indigo-400">ISO & industry frameworks applied</div>
      </div>
      <p className="text-xs text-[var(--color-text-muted)] mb-5">
        Standards mapped to risks in the register, with the controls clause invoked and why each is relevant to this project.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {framework.map((f, i) => {
          const fam = STANDARD_FAMILY(f.standard);
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-white/8 bg-white/[0.025] p-4 relative overflow-hidden"
            >
              <div
                className="absolute top-0 left-0 bottom-0 w-1"
                style={{ background: fam.color }}
              />
              <div className="pl-2">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="text-[9px] px-1.5 py-0.5 rounded font-semibold tracking-wider"
                    style={{ background: `${fam.color}20`, color: fam.color }}
                  >
                    {fam.label}
                  </span>
                  <span className="text-xs font-mono text-white">{f.standard}</span>
                </div>
                <div className="text-sm font-medium text-[var(--color-text)] mb-2">{f.title}</div>
                <p className="text-[11px] text-[var(--color-text-muted)] leading-relaxed mb-3">
                  {f.whyRelevant}
                </p>
                <div className="text-[9px] uppercase tracking-wider text-[var(--color-text-muted)] mb-1">
                  Applies to {f.appliesTo.length} risk{f.appliesTo.length === 1 ? "" : "s"}
                </div>
                <div className="space-y-1">
                  {f.appliesTo.slice(0, 3).map((r, j) => (
                    <div key={j} className="text-[11px] text-[var(--color-text)] flex items-start gap-1.5">
                      <span style={{ color: fam.color }}>›</span>
                      <span className="line-clamp-1">{r}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
