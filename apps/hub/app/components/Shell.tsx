"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type TabDef = {
  id: "risk" | "scope" | "estimator";
  name: string;
  tagline: string;
  accent: string;
  href: string;
};

const TABS: TabDef[] = [
  { id: "risk", name: "RiskLens", tagline: "Predictive risk intelligence", accent: "#DC2626", href: "/suite/risk" },
  { id: "scope", name: "ScopeSmith", tagline: "Scope to WBS & Gantt", accent: "#2563EB", href: "/suite/scope" },
  { id: "estimator", name: "EstimatorAI", tagline: "Analog-driven estimates", accent: "#10B981", href: "/suite/estimator" },
];

export function Shell({
  apiKeyPresent,
  children,
  side,
}: {
  apiKeyPresent: boolean;
  children: ReactNode;
  side?: ReactNode;
}) {
  const pathname = usePathname() ?? "";
  const activeTab =
    TABS.find((t) => pathname.startsWith(t.href))?.id ?? "scope";

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur">
        <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold shrink-0 hover:opacity-80"
          >
            <span className="w-7 h-7 rounded-md flex items-center justify-center glass text-[11px]">
              IE
            </span>
            <span className="hidden sm:inline font-display tracking-tight">IESL AI Suite</span>
          </Link>

          <nav className="flex items-center gap-1 overflow-x-auto">
            {TABS.map((t) => {
              const active = t.id === activeTab;
              return (
                <Link
                  key={t.id}
                  href={t.href}
                  className="relative px-3 py-1.5 text-sm rounded-lg transition-colors"
                  style={{
                    color: active ? t.accent : "var(--color-text-muted)",
                    background: active ? `${t.accent}15` : "transparent",
                    border: active ? `1px solid ${t.accent}40` : "1px solid transparent",
                  }}
                  aria-current={active ? "page" : undefined}
                >
                  <span className="font-medium">{t.name}</span>
                  <span className="hidden md:inline text-xs ml-2 opacity-70">
                    {t.tagline}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-full glass text-[11px] uppercase tracking-[0.18em] font-semibold"
              title={
                apiKeyPresent
                  ? "ANTHROPIC_API_KEY detected — live Claude streaming"
                  : "Set ANTHROPIC_API_KEY in apps/hub/.env.local to enable Claude"
              }
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{
                  background: apiKeyPresent ? "var(--color-estimator-soft)" : "var(--color-critical)",
                  boxShadow: apiKeyPresent
                    ? "0 0 10px 1px var(--color-estimator-soft)"
                    : "0 0 10px 1px var(--color-critical)",
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

export { TABS as SUITE_TABS };
