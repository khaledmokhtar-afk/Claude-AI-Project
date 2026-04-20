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
      <header className="sticky top-0 z-40 border-b border-[var(--color-line)] bg-[var(--color-bg)]/85 backdrop-blur">
        <div className="max-w-[1600px] mx-auto px-6 py-3.5 flex items-center gap-6">
          <Link
            href="/suite"
            className="flex items-center gap-3 shrink-0 hover:opacity-90 transition-opacity"
          >
            <Logo />
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="font-display text-[18px] tracking-[-0.01em] text-[var(--color-ink)]">
                IESL Project Intelligence
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-ink-4)] font-mono">
                Powered by Claude
              </span>
            </div>
          </Link>

          <div className="ml-auto flex items-center gap-3">
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--color-line)] bg-[var(--color-card)] text-[11px] font-mono tracking-[0.08em] uppercase"
              title={
                apiKeyPresent
                  ? "ANTHROPIC_API_KEY detected — live Claude streaming"
                  : "Set ANTHROPIC_API_KEY in apps/hub/.env.local to enable Claude"
              }
            >
              <span className={`dot ${apiKeyPresent ? "dot-ok" : "dot-bad"}`} />
              <span className="text-[var(--color-ink-3)]">
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

function Logo() {
  return (
    <span
      className="w-9 h-9 rounded-[10px] grid place-items-center shrink-0"
      style={{
        background: "var(--color-ink)",
        boxShadow: "0 2px 6px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.08)",
      }}
    >
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
        <path
          d="M3 12.5 L9 4 L15 12.5"
          stroke="#FAFAF7"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="9" cy="14" r="1" fill="#FAFAF7" />
      </svg>
    </span>
  );
}
