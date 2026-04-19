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
        <label className="eyebrow block mb-3">Project brief</label>
        <textarea
          value={projectBrief}
          onChange={(e) => setProjectBrief(e.target.value)}
          placeholder="Describe the project in 2–5 sentences. Include scope, location, technical highlights, and any known constraints."
          className="w-full min-h-[140px] rounded-xl bg-slate-950/50 border border-slate-700/50 px-4 py-3 text-sm leading-relaxed text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition"
          disabled={disabled}
        />
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className={projectBrief.trim().length >= 40 ? "text-emerald-400" : "text-slate-500"}>
            {projectBrief.trim().length} chars {projectBrief.trim().length >= 40 ? "✓" : "— minimum 40"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Select label="Sector" value={sector} onChange={setSector} options={SECTOR_OPTIONS} disabled={disabled} />
        <Select label="Scale" value={scale} onChange={setScale} options={SCALE_OPTIONS} disabled={disabled} />
        <Select label="Horizon" value={horizon} onChange={setHorizon} options={HORIZON_OPTIONS} disabled={disabled} />
      </div>

      <details className="group">
        <summary className="cursor-pointer glass px-5 py-3 rounded-xl flex items-center justify-between hover:border-blue-500/40 transition">
          <span className="text-sm font-medium text-slate-200">Optional: budget, deadline, constraints</span>
          <span className="text-slate-500 group-open:rotate-180 transition">▼</span>
        </summary>
        <div className="mt-3 glass p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                className="w-full rounded-lg bg-slate-950/50 border border-slate-700/50 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 transition"
                disabled={disabled}
              />
            </div>
            <div>
              <label className="eyebrow block mb-2">Target completion</label>
              <input
                type="date"
                value={targetCompletionISO}
                onChange={(e) => setTarget(e.target.value)}
                className="w-full rounded-lg bg-slate-950/50 border border-slate-700/50 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 transition"
                disabled={disabled}
              />
            </div>
          </div>
          <div>
            <label className="eyebrow block mb-2">Constraints / context</label>
            <textarea
              value={constraints}
              onChange={(e) => setConstraints(e.target.value)}
              placeholder="Regulatory regime, local content quotas, weather windows, partner agreements, …"
              className="w-full min-h-[80px] rounded-lg bg-slate-950/50 border border-slate-700/50 p-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 transition"
              disabled={disabled}
            />
          </div>
        </div>
      </details>

      <div className="flex justify-end pt-4">
        <button type="submit" disabled={!canSubmit} className="btn-primary">
          Analyse with Claude →
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
        className="w-full rounded-lg bg-slate-950/50 border border-slate-700/50 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 transition appearance-none"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2364748b' d='M1 4l5 4 5-4'/%3E%3C/svg%3E")`, backgroundPosition: 'right 8px center', backgroundRepeat: 'no-repeat', paddingRight: '28px' }}
        disabled={disabled}
      >
        <option value="">— Select {label.toLowerCase()}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
