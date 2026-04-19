"use client";

import { useState } from "react";
import type { Brief } from "@/lib/types";

const SECTOR_OPTIONS = [
  "Oil & Gas — Offshore",
  "Oil & Gas — Onshore",
  "Power & Utilities",
  "Infrastructure / Transport",
  "Petrochemicals",
  "Mining & Minerals",
  "Renewables",
];

const SCALE_OPTIONS = ["Small (<50M)", "Mid (50–250M)", "Large (250M–1B)", "Mega (>1B)"];
const HORIZON_OPTIONS = ["< 12 months", "12–24 months", "24–48 months", "> 48 months"];

const EXAMPLE = `25 km subsea tieback in 1,200 m water depth in the deepwater Gulf of Mexico. Two new production wells tied back to an existing FPSO with chemical injection, gas lift and full SCM. First oil targeted within 28 months. Engineering led from Houston with fabrication in Singapore.`;

type Props = { onSubmit: (b: Brief) => void; disabled?: boolean };

export default function BriefForm({ onSubmit, disabled }: Props) {
  const [projectBrief, setProjectBrief] = useState("");
  const [sector, setSector] = useState("");
  const [scale, setScale] = useState("");
  const [horizon, setHorizon] = useState("");
  const [budgetCeilingUSDm, setBudget] = useState("");
  const [targetCompletionISO, setTarget] = useState("");
  const [constraints, setConstraints] = useState("");
  const [showOptional, setShowOptional] = useState(false);

  const len = projectBrief.trim().length;
  const canSubmit = len >= 40 && !disabled;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit({
      projectBrief: projectBrief.trim(),
      sector: sector || undefined,
      scale: scale || undefined,
      horizon: horizon || undefined,
      budgetCeilingUSDm: budgetCeilingUSDm ? Number(budgetCeilingUSDm) : undefined,
      targetCompletionISO: targetCompletionISO || undefined,
      constraints: constraints.trim() || undefined,
    });
  }

  return (
    <form onSubmit={submit} className="space-y-7">
      {/* Brief */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <label htmlFor="brief" className="text-[13.5px] font-medium text-[var(--ink)]">
            Project brief
          </label>
          <button
            type="button"
            onClick={() => setProjectBrief(EXAMPLE)}
            className="text-[12px] text-[var(--brand)] hover:underline"
          >
            Use example
          </button>
        </div>
        <textarea
          id="brief"
          value={projectBrief}
          onChange={(e) => setProjectBrief(e.target.value)}
          placeholder="Describe the project: scope, location, technical highlights, schedule and budget intent."
          className="input min-h-[160px]"
          disabled={disabled}
        />
        <div className="mt-2 flex items-center gap-2 text-[12px] text-[var(--ink-3)]">
          <span className={`inline-block w-1.5 h-1.5 rounded-full ${len >= 40 ? "bg-[var(--ok)]" : "bg-[var(--ink-4)]"}`} />
          <span>{len} / 40 characters</span>
        </div>
      </div>

      {/* Meta */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Field label="Sector">
          <select className="input" value={sector} onChange={(e) => setSector(e.target.value)} disabled={disabled}>
            <option value="">Choose sector</option>
            {SECTOR_OPTIONS.map((o) => <option key={o}>{o}</option>)}
          </select>
        </Field>
        <Field label="Scale">
          <select className="input" value={scale} onChange={(e) => setScale(e.target.value)} disabled={disabled}>
            <option value="">Choose scale</option>
            {SCALE_OPTIONS.map((o) => <option key={o}>{o}</option>)}
          </select>
        </Field>
        <Field label="Horizon">
          <select className="input" value={horizon} onChange={(e) => setHorizon(e.target.value)} disabled={disabled}>
            <option value="">Choose horizon</option>
            {HORIZON_OPTIONS.map((o) => <option key={o}>{o}</option>)}
          </select>
        </Field>
      </div>

      {/* Optional */}
      <div>
        <button
          type="button"
          onClick={() => setShowOptional((v) => !v)}
          className="text-[13px] text-[var(--ink-2)] hover:text-[var(--ink)] inline-flex items-center gap-1.5"
        >
          <span className={`inline-block transition-transform ${showOptional ? "rotate-90" : ""}`}>›</span>
          {showOptional ? "Hide" : "Add"} budget, deadline & constraints
        </button>

        {showOptional && (
          <div className="mt-4 grid sm:grid-cols-2 gap-4 rise">
            <Field label="Budget ceiling (USD M)">
              <input
                type="number"
                min={0}
                step={1}
                value={budgetCeilingUSDm}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="e.g. 420"
                className="input"
                disabled={disabled}
              />
            </Field>
            <Field label="Target completion">
              <input
                type="date"
                value={targetCompletionISO}
                onChange={(e) => setTarget(e.target.value)}
                className="input"
                disabled={disabled}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Constraints / context">
                <textarea
                  value={constraints}
                  onChange={(e) => setConstraints(e.target.value)}
                  placeholder="Regulatory regime, local content quotas, weather windows, partner agreements…"
                  className="input min-h-[88px]"
                  disabled={disabled}
                />
              </Field>
            </div>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="pt-3 flex items-center justify-between gap-4 flex-wrap">
        <div className="text-[12.5px] text-[var(--ink-3)]">
          Streams to your screen in ~30 seconds. No data persisted.
        </div>
        <button type="submit" disabled={!canSubmit} className="btn-primary">
          Analyse with Claude
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[13.5px] font-medium text-[var(--ink)] block mb-2">{label}</label>
      {children}
    </div>
  );
}
