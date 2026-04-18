"use client";

import { motion } from "framer-motion";
import { ProductCard } from "./ProductCard";
import { RadarIcon, BlueprintIcon, LedgerIcon } from "./Icons";

type HubUrls = { risk: string; scope: string; estimator: string };

const PRODUCTS = [
  {
    id: "risk",
    name: "RiskLens",
    tagline: "Every risk, now predictive.",
    description:
      "Project risk intelligence with live heat matrix, 30/60/90-day forecast, and Monte Carlo cost-at-risk.",
    audience: ["Project Managers", "Executive Director", "Financial Accountant"],
    modules: ["LM14 · Risk Register", "LM15 · Predictive Model Lab"],
    accent: "risk",
    accentHex: "#DC2626",
    accentSoftHex: "#F87171",
    icon: RadarIcon,
    urlKey: "risk" as const,
  },
  {
    id: "scope",
    name: "ScopeSmith",
    tagline: "Paste a scope. Watch a plan build itself.",
    description:
      "AI turns a scope paragraph into WBS, animated Gantt, dependencies, and critical path — in 30 seconds.",
    audience: ["Project Managers", "Executive Director"],
    modules: ["LM05 · Scoping", "LM06 · Planning", "LM07 · Hands-on Lab"],
    accent: "scope",
    accentHex: "#2563EB",
    accentSoftHex: "#60A5FA",
    icon: BlueprintIcon,
    urlKey: "scope" as const,
  },
  {
    id: "estimator",
    name: "EstimatorAI",
    tagline: "Ten years of projects, now a forecast.",
    description:
      "Describe a new job; retrieve analog projects; produce P50/P80 cost + duration bands with swing factors.",
    audience: ["Financial Accountant", "Executive Director", "Project Managers"],
    modules: ["LM08 · Estimation", "LM10 · Indexing", "LM11 · Take-home"],
    accent: "estimator",
    accentHex: "#10B981",
    accentSoftHex: "#34D399",
    icon: LedgerIcon,
    urlKey: "estimator" as const,
  },
];

export function HubLanding({ urls }: { urls: HubUrls }) {
  return (
    <main className="relative min-h-screen">
      {/* Hero */}
      <section className="relative max-w-7xl mx-auto px-6 pt-20 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-3 mb-8"
        >
          <div className="w-11 h-11 rounded-xl flex items-center justify-center glass">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="white" strokeWidth="2">
              <path d="M4 7h16M4 12h16M4 17h10" strokeLinecap="round" />
              <circle cx="19" cy="17" r="2" />
            </svg>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
              International Energy Services Limited
            </div>
            <div className="text-sm font-semibold">AI Workshop · Suite Edition</div>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-5xl md:text-7xl font-semibold tracking-tight leading-[1.05] max-w-4xl"
        >
          Three AI products.
          <br />
          <span className="shimmer">One workshop.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-6 text-lg text-[var(--color-text-muted)] max-w-2xl"
        >
          Predictive risk intelligence. Scope-to-schedule automation. Historical-analog
          estimation. Built for IESL Project Managers, Executives, and Finance — live-demoed
          across 20 learning modules.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-8 flex items-center gap-4 text-xs text-[var(--color-text-muted)]"
        >
          <span className="inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-ring" />
            All three apps live
          </span>
          <span>·</span>
          <span>Streamed from Claude</span>
          <span>·</span>
          <span>Your inputs, your backlog</span>
        </motion.div>
      </section>

      {/* Product grid */}
      <section className="relative max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PRODUCTS.map((p, i) => (
            <ProductCard
              key={p.id}
              product={p}
              href={urls[p.urlKey]}
              delay={0.2 + i * 0.12}
            />
          ))}
        </div>
      </section>

      {/* Module coverage strip */}
      <section className="relative max-w-7xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass p-8"
        >
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <div>
              <h2 className="text-xl font-semibold">Learning-module coverage</h2>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">
                Every product maps directly to the 2-day LM syllabus.
              </p>
            </div>
            <div className="text-[11px] uppercase tracking-wider text-[var(--color-text-muted)]">
              Day 1 · Day 2
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { lm: "LM05", t: "Scoping", c: "#60A5FA" },
              { lm: "LM06", t: "Planning", c: "#60A5FA" },
              { lm: "LM07", t: "Scope Lab", c: "#60A5FA" },
              { lm: "LM08", t: "Effort Est.", c: "#34D399" },
              { lm: "LM09", t: "Workflow", c: "#34D399" },
              { lm: "LM10", t: "Indexing", c: "#34D399" },
              { lm: "LM11", t: "Take-home", c: "#34D399" },
              { lm: "LM14", t: "Risk Register", c: "#F87171" },
              { lm: "LM15", t: "Predictive Model", c: "#F87171" },
              { lm: "LM17", t: "KPIs", c: "#F59E0B" },
              { lm: "LM18", t: "Reporting", c: "#F59E0B" },
              { lm: "LM19", t: "Security", c: "#F59E0B" },
            ].map((m, i) => (
              <motion.div
                key={m.lm}
                initial={{ opacity: 0, y: 6 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.03 }}
                className="flex items-center gap-2 p-3 rounded-lg border border-white/5 bg-white/5"
              >
                <span className="w-1.5 h-7 rounded-sm" style={{ background: m.c }} />
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">
                    {m.lm}
                  </div>
                  <div className="text-sm font-medium">{m.t}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative max-w-7xl mx-auto px-6 py-10 text-xs text-[var(--color-text-muted)] border-t border-white/5 flex items-center justify-between flex-wrap gap-3">
        <div>© IESL · Workshop Edition · Synthetic data only</div>
        <div className="flex items-center gap-3">
          <span>Powered by Claude</span>
          <span>·</span>
          <span>Next.js 15</span>
        </div>
      </footer>
    </main>
  );
}
