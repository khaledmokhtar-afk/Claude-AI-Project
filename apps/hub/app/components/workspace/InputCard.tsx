"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { SuiteApp } from "@iesl/ui";
import { Chip } from "../ui/Chip";

type MetaField =
  | { key: string; label: string; options: string[]; kind: "select" }
  | { key: string; label: string; placeholder?: string; kind: "text" };

export function InputCard({
  kind,
  placeholder,
  meta = [],
  disabled = false,
  minChars = 40,
  onSubmit,
}: {
  kind: SuiteApp;
  placeholder: string;
  meta?: MetaField[];
  disabled?: boolean;
  minChars?: number;
  onSubmit: (input: string, meta: Record<string, string>) => void;
}) {
  const draftKey = `iesl:draft:${kind}`;
  const [text, setText] = useState("");
  const [metaValues, setMetaValues] = useState<Record<string, string>>({});

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(draftKey);
      if (raw) {
        const parsed = JSON.parse(raw) as { text?: string; meta?: Record<string, string> };
        setText(parsed.text ?? "");
        setMetaValues(parsed.meta ?? {});
      }
    } catch {
      // ignore
    }
  }, [draftKey]);

  useEffect(() => {
    try {
      window.localStorage.setItem(draftKey, JSON.stringify({ text, meta: metaValues }));
    } catch {
      // ignore
    }
  }, [draftKey, text, metaValues]);

  const canSubmit = !disabled && text.trim().length >= minChars;

  const submit = () => {
    if (!canSubmit) return;
    onSubmit(text.trim(), metaValues);
    setText("");
    setMetaValues({});
    try {
      window.localStorage.removeItem(draftKey);
    } catch {
      // ignore
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-accent relative overflow-hidden p-6 md:p-8 max-w-3xl mx-auto"
    >
      <label
        htmlFor={`input-${kind}`}
        className="eyebrow block mb-3"
      >
        Project brief
      </label>
      <textarea
        id={`input-${kind}`}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submit();
        }}
        placeholder={placeholder}
        rows={6}
        className="w-full text-base font-mono leading-relaxed bg-black/30 border border-[var(--color-border)] rounded-xl p-4 resize-y focus:outline-none focus:border-[color-mix(in_srgb,var(--suite-accent,var(--color-primary))_60%,var(--color-border))] transition-colors"
      />

      {meta.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {meta.map((f) =>
            f.kind === "select" ? (
              <div key={f.key} className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-[var(--color-text-muted)] mr-1">
                  {f.label}:
                </span>
                {f.options.map((opt) => (
                  <Chip
                    key={opt}
                    as="button"
                    active={metaValues[f.key] === opt}
                    onClick={() =>
                      setMetaValues((m) => ({
                        ...m,
                        [f.key]: m[f.key] === opt ? "" : opt,
                      }))
                    }
                  >
                    {opt}
                  </Chip>
                ))}
              </div>
            ) : (
              <input
                key={f.key}
                value={metaValues[f.key] ?? ""}
                onChange={(e) =>
                  setMetaValues((m) => ({ ...m, [f.key]: e.target.value }))
                }
                placeholder={f.placeholder ?? f.label}
                className="chip !text-xs !px-3 !py-1.5 bg-black/30 text-white focus:outline-none"
              />
            ),
          )}
        </div>
      )}

      <div className="mt-6 flex items-center justify-between gap-3">
        <div className="text-xs text-[var(--color-text-muted)]">
          {disabled
            ? "Set ANTHROPIC_API_KEY to enable Generate."
            : text.trim().length < minChars
              ? `${Math.max(0, minChars - text.trim().length)} more chars to unlock Generate`
              : "Ready. ⌘/Ctrl + Enter to generate."}
        </div>
        <button
          type="button"
          onClick={submit}
          disabled={!canSubmit}
          className="btn-primary"
        >
          Generate with Claude
          <span aria-hidden className="text-base leading-none">→</span>
        </button>
      </div>
    </motion.div>
  );
}
