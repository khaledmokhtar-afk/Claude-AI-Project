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
  dense?: boolean;
};

export default function PanelShell({
  title,
  eyebrow,
  status,
  error,
  onRetry,
  children,
  dense,
}: Props) {
  return (
    <section className={`glass ${dense ? "p-4" : "p-6"}`}>
      <header className="flex items-center justify-between mb-4">
        <div>
          <div className="eyebrow">{eyebrow}</div>
          <h3
            className="text-2xl leading-tight mt-1"
            style={{ fontFamily: "var(--font-display), serif" }}
          >
            {title}
          </h3>
        </div>
        <StatusDot status={status} />
      </header>

      {status === "idle" && <div className="text-sm text-white/40">Waiting to start…</div>}
      {status === "streaming" && <Skeleton />}
      {status === "failed" && (
        <div className="space-y-2">
          <div className="text-sm text-red-400/90">{error ?? "Section failed."}</div>
          {onRetry && (
            <button onClick={onRetry} className="btn-ghost">
              Retry this panel
            </button>
          )}
        </div>
      )}
      {status === "ready" && children}
    </section>
  );
}

function StatusDot({ status }: { status: Status }) {
  const map: Record<Status, { cls: string; label: string }> = {
    idle: { cls: "bg-white/20", label: "Idle" },
    streaming: { cls: "bg-indigo-400 animate-pulse", label: "Streaming" },
    ready: { cls: "bg-emerald-400", label: "Ready" },
    failed: { cls: "bg-red-400", label: "Failed" },
  };
  const { cls, label } = map[status];
  return (
    <div className="flex items-center gap-2 text-xs text-white/50">
      <span className={`inline-block h-2 w-2 rounded-full ${cls}`} />
      {label}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-2">
      <div className="h-3 rounded shimmer" />
      <div className="h-3 rounded shimmer w-5/6" />
      <div className="h-3 rounded shimmer w-2/3" />
      <div className="h-24 rounded shimmer mt-3" />
    </div>
  );
}
