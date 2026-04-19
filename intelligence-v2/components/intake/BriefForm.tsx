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

type Props = { onSubmit: (b: Brief) => void; disabled?: boolean };

export default function BriefForm({ onSubmit, disabled }: Props) {
  const [projectBrief, setProjectBrief] = useState("");
  const [sector, setSector] = useState<string>("");
  const [scale, setScale] = useState<string>("");
  const [horizon, setHorizon] = useState<string>("");
  const [budgetCeilingUSDm, setBudgetCeiling] = useState<string>("");
  const [targetCompletionISO, setTarget] = useState<string>("");
  const [constraints, setConstraints] = useState<string>("");

  const canSubmit = projectBrief.trim().length >= 40 && !disabled;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    const brief: Brief = {
      projectBrief: projectBrief.trim(),
      sector: sector || undefined,
      scale: scale || undefined,
      horizon: horizon || undefined,
      budgetCeilingUSDm: budgetCeilingUSDm ? Number(budgetCeilingUSDm) : undefined,
      targetCompletionISO: targetCompletionISO || undefined,
      constraints: constraints.trim() || undefined,
    };
    onSubmit(brief);
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div>
        <label className="eyebrow block mb-2">Project brief</label>
        <textarea
          value={projectBrief}
          onChange={(e) => setProjectBrief(e.target.value)}
          placeholder="Describe the project in 2–5 sentences. Include scope, location, technical highlights, and any known constraints."
          className="w-full min-h-[160px] rounded-xl bg-white/[0.02] border border-white/10 p-4 text-sm font-mono leading-relaxed focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition"
          disabled={disabled}
        />
        <div className="mt-1 text-xs text-white/40">
          {projectBrief.trim().length} chars — minimum 40 to analyse.
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Select label="Sector" value={sector} onChange={setSector} options={SECTOR_OPTIONS} disabled={disabled} />
        <Select label="Scale" value={scale} onChange={setScale} options={SCALE_OPTIONS} disabled={disabled} />
        <Select label="Horizon" value={horizon} onChange={setHorizon} options={HORIZON_OPTIONS} disabled={disabled} />
      </div>

      <details className="group glass p-4">
        <summary className="cursor-pointer text-sm text-white/70 hover:text-white transition flex items-center justify-between">
          <span>Optional: budget ceiling, target date, constraints</span>
          <span className="text-white/40 group-open:rotate-180 transition">▾</span>
        </summary>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="eyebrow block mb-2">Budget ceiling (USD M)</label>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={budgetCeilingUSDm}
              onChange={(e) => setBudgetCeiling(e.target.value)}
              placeholder="e.g. 420"
              className="w-full rounded-lg bg-white/[0.02] border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-indigo-500/60"
              disabled={disabled}
            />
          </div>
          <div>
            <label className="eyebrow block mb-2">Target completion</label>
            <input
              type="date"
              value={targetCompletionISO}
              onChange={(e) => setTarget(e.target.value)}
              className="w-full rounded-lg bg-white/[0.02] border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-indigo-500/60"
              disabled={disabled}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="eyebrow block mb-2">Constraints / context</label>
            <textarea
              value={constraints}
              onChange={(e) => setConstraints(e.target.value)}
              placeholder="Regulatory regime, local content quotas, weather windows, partner agreements, …"
              className="w-full min-h-[70px] rounded-lg bg-white/[0.02] border border-white/10 p-3 text-sm focus:outline-none focus:border-indigo-500/60"
              disabled={disabled}
            />
          </div>
        </div>
      </details>

      <div className="flex justify-end pt-2">
        <button type="submit" disabled={!canSubmit} className="btn-primary">
          Analyse with Claude
        </button>
      </div>
    </form>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="eyebrow block mb-2">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg bg-white/[0.02] border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-indigo-500/60"
        disabled={disabled}
      >
        <option value="">—</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
