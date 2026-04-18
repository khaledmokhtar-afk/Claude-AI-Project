"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { ProjectMeta, ProjectSubmission } from "@iesl/ui";
import { useWorkspace } from "@iesl/ui";

const SECTOR_OPTIONS = ["Subsea", "FPSO", "Pipeline", "Drilling", "Platform", "Topsides EPC", "SURF"];
const SCALE_OPTIONS = ["< $10m", "$10–50m", "$50–150m", "$150m+"];
const HORIZON_OPTIONS = ["< 3 months", "3–6 months", "6–12 months", "1 year+"];

const PLACEHOLDER =
  `e.g. IESL will execute an 18km shallow-water pipeline replacement in OML 58 during the dry season. Scope includes community GMoU renewal, NUPRC permits, lay-barge mobilisation from Onne, coating yard in Warri, 2 subsea tie-in spools and a full hydrotest. 42-day execution window, host-community sensitive area, first-time use of X-ray inspection drones on the welds.`;

const DRAFT_KEY = "iesl:draft:project";

type ChipGroupProps = {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
};

function ChipGroup({ label, options, value, onChange }: ChipGroupProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[11px] text-[var(--color-text-muted)] uppercase tracking-wider w-16 shrink-0">
        {label}
      </span>
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(value === opt ? "" : opt)}
          className={`px-3 py-1 text-xs rounded-full border transition-all duration-150 ${
            value === opt
              ? "border-[var(--color-primary)] text-[var(--color-primary)] bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)]"
              : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)]/50 hover:text-[var(--color-text)]"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

export function ProjectBriefInput({
  onGenerate,
  isGenerating,
}: {
  onGenerate: (input: string, meta: ProjectMeta) => void;
  isGenerating: boolean;
}) {
  const { projects, setActiveId } = useWorkspace();
  const [text, setText] = useState("");
  const [sector, setSector] = useState("");
  const [scale, setScale] = useState("");
  const [horizon, setHorizon] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load draft
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const d = JSON.parse(raw) as { text?: string; sector?: string; scale?: string; horizon?: string };
        if (d.text) setText(d.text);
        if (d.sector) setSector(d.sector);
        if (d.scale) setScale(d.scale);
        if (d.horizon) setHorizon(d.horizon);
      }
    } catch { /* ignore */ }
  }, []);

  // Save draft
  useEffect(() => {
    try {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify({ text, sector, scale, horizon }));
    } catch { /* ignore */ }
  }, [text, sector, scale, horizon]);

  const canSubmit = !isGenerating && text.trim().length >= 40;

  const submit = () => {
    if (!canSubmit) return;
    try { window.localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
    onGenerate(text.trim(), { sector: sector || undefined, scale: scale || undefined, horizon: horizon || undefined });
  };

  const charsLeft = Math.max(0, 40 - text.trim().length);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Input card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm"
      >
        {/* Glow border */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            background: "linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(16,185,129,0.06) 50%, rgba(220,38,38,0.06) 100%)",
          }}
        />

        <div className="relative p-6 md:p-8">
          <label htmlFor="project-brief" className="eyebrow block mb-3">
            Project brief
          </label>

          <textarea
            id="project-brief"
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submit();
            }}
            placeholder={PLACEHOLDER}
            rows={7}
            className="w-full bg-transparent font-mono text-sm leading-relaxed text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]/50 border-0 outline-none resize-y"
          />

          <div className="mt-5 border-t border-white/5 pt-5 space-y-3">
            <ChipGroup label="Sector" options={SECTOR_OPTIONS} value={sector} onChange={setSector} />
            <ChipGroup label="Scale" options={SCALE_OPTIONS} value={scale} onChange={setScale} />
            <ChipGroup label="Horizon" options={HORIZON_OPTIONS} value={horizon} onChange={setHorizon} />
          </div>

          <div className="mt-6 flex items-center justify-between gap-4">
            <div className="text-xs text-[var(--color-text-muted)]">
              {charsLeft > 0
                ? `${charsLeft} more chars to unlock`
                : isGenerating
                  ? "Generating…"
                  : "Ready — ⌘ Enter to analyze"}
            </div>

            <motion.button
              type="button"
              onClick={submit}
              disabled={!canSubmit}
              whileTap={{ scale: 0.96 }}
              className={`relative flex items-center gap-2.5 px-7 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                canSubmit
                  ? "bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:brightness-110"
                  : "bg-white/5 text-[var(--color-text-muted)] cursor-not-allowed"
              }`}
            >
              {isGenerating ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                    <path d="M8 1.5C4.41 1.5 1.5 4.41 1.5 8S4.41 14.5 8 14.5 14.5 11.59 14.5 8 11.59 1.5 8 1.5z" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M5.5 8h5M8 5.5v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  Analyze Project
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Past projects */}
      {projects.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.55 }}
        >
          <div className="eyebrow mb-3">Recent projects</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {projects.slice(0, 6).map((p, i) => (
              <PastProjectCard key={p.id} project={p} index={i} onPick={() => setActiveId(p.id)} />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

function PastProjectCard({
  project,
  index,
  onPick,
}: {
  project: ProjectSubmission;
  index: number;
  onPick: () => void;
}) {
  const { deleteProject } = useWorkspace();
  const age = Date.now() - project.createdAt;
  const relTime =
    age < 60_000
      ? "just now"
      : age < 3_600_000
        ? `${Math.floor(age / 60_000)}m ago`
        : age < 86_400_000
          ? `${Math.floor(age / 3_600_000)}h ago`
          : `${Math.floor(age / 86_400_000)}d ago`;

  const hasResult = Boolean(project.analysis);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group relative rounded-xl border border-white/8 bg-white/[0.025] hover:bg-white/[0.05] hover:border-white/15 transition-all duration-200 cursor-pointer overflow-hidden"
      onClick={onPick}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl"
        style={{
          background: hasResult
            ? "linear-gradient(to bottom, #6366f1, #10b981)"
            : "var(--color-border)",
        }}
      />

      <div className="pl-4 pr-3 py-3">
        <div className="flex items-start justify-between gap-2">
          <div className="font-medium text-sm text-[var(--color-text)] leading-snug line-clamp-2">
            {project.title}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); deleteProject(project.id); }}
            className="opacity-0 group-hover:opacity-100 text-[var(--color-text-muted)] hover:text-[var(--color-danger)] transition-all shrink-0 mt-0.5"
            aria-label="Delete"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="mt-2 flex items-center gap-2 text-[10px] text-[var(--color-text-muted)]">
          <span>{relTime}</span>
          {project.meta.sector && (
            <>
              <span>·</span>
              <span>{project.meta.sector}</span>
            </>
          )}
          <span className={`ml-auto px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider font-semibold ${
            hasResult
              ? "bg-emerald-500/15 text-emerald-400"
              : "bg-white/5 text-[var(--color-text-muted)]"
          }`}>
            {hasResult ? "Cached" : "No result"}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
