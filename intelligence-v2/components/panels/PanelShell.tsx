"use client";

import type { ReactNode } from "react";

type Status = "idle" | "streaming" | "ready" | "failed";

type Props = {
  title: string;
  eyebrow: string;
  status: Status;
  error?: string;
  onRetry?: () => void;
  children?: ReactNode;
};

export default function PanelShell({ title, eyebrow, status, error, onRetry, children }: Props) {
  return (
    <section className="card-elev overflow-hidden">
      <header className="px-7 pt-6 pb-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="eyebrow eyebrow-brand mb-1.5">{eyebrow}</div>
          <h3 className="font-display text-[26px] leading-tight tracking-[-0.015em] text-[var(--ink)]">
            {title}
          </h3>
        </div>
        <StatusBadge status={status} />
      </header>

      <div className="px-7 pb-7">
        {status === "idle" && (
          <p className="text-[14px] text-[var(--ink-4)]">Waiting in queue…</p>
        )}
        {status === "streaming" && <Skeleton />}
        {status === "failed" && (
          <div className="card-soft p-4 flex items-start justify-between gap-4">
            <div className="text-[13.5px] text-[var(--bad)] leading-relaxed">
              <strong className="font-semibold">Couldn’t generate this panel.</strong>
              <div className="text-[var(--ink-3)] mt-1">{error ?? "Unknown error."}</div>
            </div>
            {onRetry && (
              <button onClick={onRetry} className="btn-ghost shrink-0">
                ↻ Retry
              </button>
            )}
          </div>
        )}
        {status === "ready" && <div className="blur-in">{children}</div>}
      </div>
    </section>
  );
}

function StatusBadge({ status }: { status: Status }) {
  switch (status) {
    case "idle":
      return <span className="chip"><span className="dot dot-idle" /> Idle</span>;
    case "streaming":
      return <span className="chip chip-brand"><span className="dot dot-stream" /> Generating</span>;
    case "ready":
      return <span className="chip chip-ok"><span className="dot dot-ok" /> Ready</span>;
    case "failed":
      return <span className="chip chip-bad"><span className="dot dot-bad" /> Failed</span>;
  }
}

function Skeleton() {
  return (
    <div className="space-y-3">
      <div className="skeleton h-3.5 w-3/4" />
      <div className="skeleton h-3.5 w-5/6" />
      <div className="skeleton h-3.5 w-2/3" />
      <div className="skeleton h-32 w-full mt-4" />
    </div>
  );
}
