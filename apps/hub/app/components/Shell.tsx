"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWorkspace } from "@iesl/ui";
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
  const { mode, setMode } = useWorkspace();
  const aiDisabled = !apiKeyPresent;
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
            <span className="hidden sm:inline">IESL AI Suite</span>
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

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 p-1 rounded-full glass">
              <button
                onClick={() => setMode("demo")}
                className={`px-3 py-1 text-xs rounded-full transition-all font-medium ${
                  mode === "demo" ? "bg-white/10 text-white" : "text-[var(--color-text-muted)]"
                }`}
              >
                ● Demo Mode
              </button>
              <button
                onClick={() => !aiDisabled && setMode("ai")}
                disabled={aiDisabled}
                title={aiDisabled ? "Set ANTHROPIC_API_KEY in .env.local to enable live AI" : ""}
                className={`px-3 py-1 text-xs rounded-full transition-all font-medium ${
                  mode === "ai" ? "text-[var(--color-bg)]" : "text-[var(--color-text-muted)]"
                } ${aiDisabled ? "opacity-40 cursor-not-allowed" : ""}`}
                style={{
                  background: mode === "ai" ? "var(--color-estimator)" : "transparent",
                }}
              >
                ⚡ AI Mode
              </button>
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
