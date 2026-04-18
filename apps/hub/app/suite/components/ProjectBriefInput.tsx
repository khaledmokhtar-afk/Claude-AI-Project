"use client";

import { motion } from "framer-motion";
import { useRef, useState } from "react";
import type { ProjectMeta, ProjectSubmission } from "@iesl/ui";
import { useWorkspace } from "@iesl/ui";

const SECTOR_OPTIONS = ["Subsea", "FPSO", "Pipeline", "Drilling", "Platform", "Topsides EPC", "SURF"];
const SCALE_OPTIONS = ["< $10m", "$10–50m", "$50–150m", "$150m+"];
const HORIZON_OPTIONS = ["< 3 months", "3–6 months", "6–12 months", "1 year+"];

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 text-xs rounded-full border transition-all duration-150 font-mono tracking-wide ${
        active
          ? "border-indigo-500 text-indigo-300 bg-indigo-500/15"
          : "border-white/10 text-[var(--color-text-muted)] hover:border-white/25 hover:text-[var(--color-text)]"
      }`}
    >
      {label}
    </button>
  );
}

function ChipRow({ label, options, value, onChange }: {
  label: string; options: string[]; value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-[0.2em] w-14 shrink-0">
        {label}
      </span>
      {options.map((opt) => (
        <Chip key={opt} label={opt} active={value === opt} onClick={() => onChange(value === opt ? "" : opt)} />
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

  const minChars = 40;
  const charsLeft = Math.max(0, minChars - text.trim().length);
  const canSubmit = !isGenerating && charsLeft === 0;

  const submit = () => {
    if (!canSubmit) return;
    onGenerate(text.trim(), {
      sector: sector || undefined,
      scale: scale || undefined,
      horizon: horizon || undefined,
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.35 }}
        className="relative"
      >
        {/* Outer glow border */}
        <div
          className="absolute -inset-[1px] rounded-2xl pointer-events-none"
          style={{
            background: canSubmit
              ? "linear-gradient(135deg, rgba(99,102,241,0.6) 0%, rgba(16,185,129,0.4) 100%)"
              : "linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(16,185,129,0.15) 100%)",
            transition: "background 0.3s ease",
          }}
        />

        <div className="relative rounded-2xl bg-[#080C18] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-2">
            <label htmlFor="project-brief" className="eyebrow">
              Project brief
            </label>
            {text.trim().length > 0 && (
              <span className="text-[10px] font-mono text-[var(--color-text-muted)]">
                {text.trim().length} chars
              </span>
            )}
          </div>

          <div className="px-6 pb-4">
            <textarea
              id="project-brief"
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submit();
              }}
              placeholder="Describe your project scope — type at least 40 characters. Example: IESL will execute an 18km pipeline replacement in OML 58. Scope includes NUPRC permits, lay-barge mobilisation, 2 subsea tie-in spools, and a full hydrotest."
              rows={6}
              autoFocus
              className="w-full bg-transparent text-sm leading-relaxed text-[var(--color-text)] placeholder:text-white/20 border-0 outline-none resize-none font-sans"
            />
          </div>

          {/* Divider */}
          <div className="h-[1px] bg-white/5 mx-6" />

          {/* Meta chips */}
          <div className="px-6 py-4 space-y-3">
            <ChipRow label="Sector" options={SECTOR_OPTIONS} value={sector} onChange={setSector} />
            <ChipRow label="Scale" options={SCALE_OPTIONS} value={scale} onChange={setScale} />
            <ChipRow label="Horizon" options={HORIZON_OPTIONS} value={horizon} onChange={setHorizon} />
          </div>

          {/* Divider */}
          <div className="h-[1px] bg-white/5 mx-6" />

          {/* Footer / CTA */}
          <div className="px-6 py-4 flex items-center justify-between gap-4">
            <p className="text-[11px] text-[var(--color-text-muted)]">
              {charsLeft > 0
                ? `${charsLeft} more characters needed`
                : isGenerating
                  ? "Claude is analyzing your project…"
                  : "Ready — ⌘ Enter or click Analyze"}
            </p>

            <motion.button
              type="button"
              onClick={submit}
              disabled={!canSubmit}
              whileTap={canSubmit ? { scale: 0.96 } : {}}
              className="relative flex items-center gap-2.5 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 shrink-0"
              style={canSubmit ? {
                background: "linear-gradient(135deg, #6366F1, #10B981)",
                color: "white",
                boxShadow: "0 0 32px -6px rgba(99,102,241,0.6), 0 0 32px -6px rgba(16,185,129,0.4)",
              } : {
                background: "rgba(255,255,255,0.04)",
                color: "rgba(255,255,255,0.3)",
                cursor: "not-allowed",
              }}
            >
              {isGenerating ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                    <path d="M8 2.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11z" stroke="currentColor" strokeWidth="1.4"/>
                    <path d="M5.5 8h5M8 5.5v5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                  Analyze with Claude
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Past projects — only show if there are any */}
      {projects.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
        >
          <div className="eyebrow mb-3">Recent projects</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {projects.slice(0, 6).map((p, i) => (
              <PastCard key={p.id} project={p} index={i} onPick={() => setActiveId(p.id)} />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

function PastCard({ project, index, onPick }: {
  project: ProjectSubmission; index: number; onPick: () => void;
}) {
  const { deleteProject } = useWorkspace();
  const age = Date.now() - project.createdAt;
  const relTime =
    age < 60_000 ? "just now"
    : age < 3_600_000 ? `${Math.floor(age / 60_000)}m ago`
    : age < 86_400_000 ? `${Math.floor(age / 3_600_000)}h ago`
    : `${Math.floor(age / 86_400_000)}d ago`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="group relative rounded-xl border border-white/8 bg-white/[0.02] hover:bg-white/[0.045] hover:border-indigo-500/30 transition-all duration-200 cursor-pointer overflow-hidden"
      onClick={onPick}
    >
      <div className="absolute left-0 top-0 bottom-0 w-[2px] rounded-l-xl"
        style={{ background: project.analysis ? "linear-gradient(to bottom, #6366f1, #10b981)" : "rgba(255,255,255,0.1)" }}
      />
      <div className="pl-4 pr-3 py-3">
        <div className="flex items-start justify-between gap-2">
          <div className="font-medium text-sm text-[var(--color-text)] leading-snug line-clamp-2">
            {project.title}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); deleteProject(project.id); }}
            className="opacity-0 group-hover:opacity-100 text-[var(--color-text-muted)] hover:text-red-400 transition-all shrink-0 mt-0.5 p-0.5"
            aria-label="Delete"
          >
            <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
              <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <div className="mt-2 flex items-center gap-2 text-[10px] text-[var(--color-text-muted)]">
          <span>{relTime}</span>
          {project.meta.sector && <><span>·</span><span>{project.meta.sector}</span></>}
          <span className={`ml-auto px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider font-semibold ${
            project.analysis ? "bg-emerald-500/15 text-emerald-400" : "bg-white/5 text-[var(--color-text-muted)]"
          }`}>
            {project.analysis ? "Analyzed" : "Pending"}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
