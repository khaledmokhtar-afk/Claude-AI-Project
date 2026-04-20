"use client";

import { motion } from "framer-motion";
import { useRef, useState } from "react";
import type { ProjectMeta, ProjectSubmission } from "@iesl/ui";
import { useWorkspace } from "@iesl/ui";

const SECTOR_OPTIONS = ["Subsea", "FPSO", "Pipeline", "Drilling", "Platform", "Topsides EPC", "SURF"];
const SCALE_OPTIONS = ["< $10m", "$10–50m", "$50–150m", "$150m+"];
const HORIZON_OPTIONS = ["< 3 months", "3–6 months", "6–12 months", "1 year+"];

const EXAMPLE =
  "IESL will execute an 18 km pipeline replacement in OML 58, Port Harcourt. Scope includes NUPRC permits, lay-barge mobilisation, 2 subsea tie-in spools, 4 pig-trap modifications, and a full hydrotest. 12-month delivery under tight dry-season window, NCDMB local-content ≥45%.";

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 text-[12px] rounded-full border font-mono transition-all duration-150 ${
        active
          ? "text-white bg-[var(--color-ink)] border-[var(--color-ink)]"
          : "text-[var(--color-ink-3)] bg-[var(--color-card)] border-[var(--color-line)] hover:border-[var(--color-line-strong)] hover:text-[var(--color-ink)]"
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
      <span className="text-[10px] text-[var(--color-ink-4)] uppercase tracking-[0.18em] w-14 shrink-0 font-mono">
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
  const trimmedLen = text.trim().length;
  const charsLeft = Math.max(0, minChars - trimmedLen);
  const canSubmit = !isGenerating && charsLeft === 0;

  const submit = () => {
    if (!canSubmit) return;
    onGenerate(text.trim(), {
      sector: sector || undefined,
      scale: scale || undefined,
      horizon: horizon || undefined,
    });
  };

  const useExample = () => {
    setText(EXAMPLE);
    setSector("Pipeline");
    setScale("$50–150m");
    setHorizon("6–12 months");
    textareaRef.current?.focus();
  };

  return (
    <div className="w-full space-y-6">
      <div className="card-elev overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-6 pt-5 pb-3 border-b border-[var(--color-line)]">
          <div className="flex items-center gap-2.5">
            <span className={`dot ${canSubmit ? "dot-ok" : "dot-idle"}`} />
            <label htmlFor="project-brief" className="eyebrow">
              Project brief
            </label>
          </div>
          <div className="flex items-center gap-3">
            {trimmedLen === 0 && (
              <button
                type="button"
                onClick={useExample}
                className="text-[12px] text-[var(--color-brand-ink)] hover:text-[var(--color-brand)] font-medium transition-colors"
              >
                Use example
              </button>
            )}
            {trimmedLen > 0 && (
              <span className="text-[11px] font-mono text-[var(--color-ink-4)] tabular-nums">
                {charsLeft > 0 ? `${charsLeft} more` : `${trimmedLen} chars`}
              </span>
            )}
          </div>
        </div>

        {/* Textarea */}
        <div className="px-6 pt-4 pb-2">
          <textarea
            id="project-brief"
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submit();
            }}
            placeholder="Describe your project scope — at least 40 characters. What's the asset, where is it, what's the delivery window, and which constraints matter (permits, local content, weather, HSE)?"
            rows={6}
            autoFocus
            className="w-full bg-transparent text-[15px] leading-[1.65] text-[var(--color-ink)] placeholder:text-[var(--color-ink-4)] border-0 outline-none resize-none font-sans"
          />
        </div>

        {/* Meta chips */}
        <div className="px-6 py-4 border-t border-[var(--color-line)] bg-[var(--color-card-soft)] space-y-3">
          <ChipRow label="Sector" options={SECTOR_OPTIONS} value={sector} onChange={setSector} />
          <ChipRow label="Scale" options={SCALE_OPTIONS} value={scale} onChange={setScale} />
          <ChipRow label="Horizon" options={HORIZON_OPTIONS} value={horizon} onChange={setHorizon} />
        </div>

        {/* Footer CTA */}
        <div className="px-6 py-4 border-t border-[var(--color-line)] flex items-center justify-between gap-4">
          <p className="text-[12.5px] text-[var(--color-ink-3)]">
            {charsLeft > 0
              ? `${charsLeft} more characters to unlock Analyze`
              : isGenerating
                ? "Claude is analyzing your project…"
                : <>Ready — press <kbd className="font-mono text-[11px] px-1.5 py-0.5 rounded border border-[var(--color-line)] bg-[var(--color-card)] text-[var(--color-ink-2)]">⌘ Enter</kbd> or click Analyze</>}
          </p>

          <button
            type="button"
            onClick={submit}
            disabled={!canSubmit}
            className="btn-primary"
          >
            {isGenerating ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full spin-slow" />
                Analyzing…
              </>
            ) : (
              <>
                Analyze with Claude
                <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
                  <path d="M1 7h11M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Past projects */}
      {projects.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
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
      transition={{ delay: index * 0.05 }}
      className="group relative card hover:border-[var(--color-line-strong)] cursor-pointer overflow-hidden transition-colors"
      onClick={onPick}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px]"
        style={{ background: project.analysis ? "var(--color-brand)" : "var(--color-line-strong)" }}
      />
      <div className="pl-4 pr-3 py-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="font-medium text-[13.5px] text-[var(--color-ink)] leading-snug line-clamp-2">
            {project.title}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); deleteProject(project.id); }}
            className="opacity-0 group-hover:opacity-100 text-[var(--color-ink-4)] hover:text-[var(--color-bad)] transition-all shrink-0 mt-0.5 p-0.5"
            aria-label="Delete"
          >
            <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
              <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <div className="mt-2 flex items-center gap-2 text-[11px] text-[var(--color-ink-4)] font-mono">
          <span>{relTime}</span>
          {project.meta.sector && <><span>·</span><span>{project.meta.sector}</span></>}
          <span className={`ml-auto chip ${project.analysis ? "chip-ok" : ""}`}>
            {project.analysis ? "Analysed" : "Pending"}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
