"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useWorkspace, type SuiteApp, type Submission } from "@iesl/ui";

function relativeTime(ts: number): string {
  const delta = Date.now() - ts;
  const sec = Math.round(delta / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  return `${day}d ago`;
}

export function BacklogStrip({ kind }: { kind: SuiteApp }) {
  const { backlog, setActive, deleteSubmission } = useWorkspace();
  const items = backlog[kind];

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto mt-10 text-center text-xs text-[var(--color-text-muted)] eyebrow">
        No past sessions yet · your first submission will appear here
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto mt-12 px-2">
      <div className="flex items-center justify-between mb-3">
        <h3 className="eyebrow">Your backlog · {items.length} session{items.length === 1 ? "" : "s"}</h3>
        <div className="text-[10px] text-[var(--color-text-muted)]">
          Click a card to reload it instantly
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <AnimatePresence initial={false}>
          {items.map((s, i) => (
            <BacklogCard
              key={s.id}
              submission={s}
              delay={i * 0.04}
              onOpen={() => setActive(kind, s.id)}
              onDelete={() => deleteSubmission(kind, s.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function BacklogCard({
  submission,
  delay,
  onOpen,
  onDelete,
}: {
  submission: Submission;
  delay: number;
  onOpen: () => void;
  onDelete: () => void;
}) {
  const hasOutput = submission.output !== undefined;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.35, delay }}
      className="glass group relative p-4 cursor-pointer hover:border-[color-mix(in_srgb,var(--suite-accent,var(--color-primary))_55%,var(--color-border))] transition-colors"
      onClick={onOpen}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-[18px]"
        style={{ background: "var(--suite-accent, var(--color-primary))" }}
      />
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="text-sm font-semibold text-white leading-snug line-clamp-2">
          {submission.title}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          aria-label="Delete session"
          className="opacity-0 group-hover:opacity-100 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-danger)] px-1 transition-opacity"
        >
          ×
        </button>
      </div>
      <div className="text-xs text-[var(--color-text-muted)] line-clamp-2 mb-3 leading-relaxed">
        {submission.input.slice(0, 140)}
        {submission.input.length > 140 ? "…" : ""}
      </div>
      <div className="flex items-center justify-between text-[10px] eyebrow">
        <span>{relativeTime(submission.createdAt)}</span>
        <span
          className="px-2 py-0.5 rounded-full"
          style={{
            background: hasOutput
              ? "color-mix(in srgb, var(--suite-accent, var(--color-primary)) 18%, transparent)"
              : "color-mix(in srgb, var(--color-critical) 15%, transparent)",
            color: hasOutput
              ? "var(--suite-accent-soft, var(--color-primary-soft))"
              : "var(--color-critical)",
          }}
        >
          {hasOutput ? "Cached" : "Pending"}
        </span>
      </div>
    </motion.div>
  );
}
