"use client";

import Link from "next/link";
import type { ReactNode } from "react";

export function Shell({
  apiKeyPresent,
  children,
  side,
}: {
  apiKeyPresent: boolean;
  children: ReactNode;
  side?: ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[var(--color-bg)]/80 backdrop-blur">
        <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center gap-6">
          <Link
            href="/suite"
            className="flex items-center gap-2.5 text-sm font-semibold shrink-0 hover:opacity-90 transition-opacity"
          >
            <span
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold text-white"
              style={{ background: "linear-gradient(135deg, #6366F1 0%, #10B981 100%)" }}
            >
              IE
            </span>
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="font-display text-base tracking-tight">IESL Project Intelligence</span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                Powered by Claude
              </span>
            </div>
          </Link>

          <div className="ml-auto flex items-center gap-3">
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/8 bg-white/[0.03] text-[11px] uppercase tracking-[0.18em] font-semibold"
              title={
                apiKeyPresent
                  ? "ANTHROPIC_API_KEY detected — live Claude streaming"
                  : "Set ANTHROPIC_API_KEY in apps/hub/.env.local to enable Claude"
              }
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{
                  background: apiKeyPresent ? "#10B981" : "#EF4444",
                  boxShadow: apiKeyPresent
                    ? "0 0 10px 1px rgba(16,185,129,0.6)"
                    : "0 0 10px 1px rgba(239,68,68,0.6)",
                }}
              />
              <span className="text-[var(--color-text-muted)]">
                {apiKeyPresent ? "Claude · Live" : "Claude · Offline"}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex min-h-0">
        <main className="flex-1 min-w-0">{children}</main>
        {side}
      </div>
    </div>
  );
}
