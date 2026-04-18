"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import type { Submission } from "@iesl/ui";

export function ResultShell({
  submission,
  streaming,
  onNewSession,
  onRegenerate,
  children,
}: {
  submission: Submission;
  streaming: boolean;
  onNewSession: () => void;
  onRegenerate: () => void;
  children: ReactNode;
}) {
  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="glass p-4 md:p-5 mb-6 flex items-start gap-4 flex-wrap"
      >
        <div
          className="w-1 self-stretch rounded-full"
          style={{ background: "var(--suite-accent, var(--color-primary))" }}
        />
        <div className="flex-1 min-w-[260px]">
          <div className="eyebrow mb-1">Current session</div>
          <div className="text-sm font-semibold text-white leading-snug">
            {submission.title}
          </div>
          <div className="text-xs text-[var(--color-text-muted)] mt-1 line-clamp-2 leading-relaxed">
            {submission.input}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn-ghost"
            onClick={onRegenerate}
            disabled={streaming}
          >
            ↻ Regenerate
          </button>
          <button
            type="button"
            className="btn-ghost"
            onClick={onNewSession}
          >
            + New session
          </button>
        </div>
      </motion.div>
      {children}
    </div>
  );
}
