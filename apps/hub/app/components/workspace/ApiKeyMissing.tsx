"use client";

import { motion } from "framer-motion";

export function ApiKeyMissing() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-2xl mx-auto mt-10 glass-accent p-8"
    >
      <div className="eyebrow mb-3" style={{ color: "var(--color-critical)" }}>
        Claude · offline
      </div>
      <h2 className="font-display text-3xl mb-4 text-white">
        Add your Anthropic key to unlock Generate.
      </h2>
      <p className="text-sm text-[var(--color-text-muted)] leading-relaxed mb-5">
        Every tab streams directly from Claude — there is no demo fallback.
        Configure the key once and all three tabs plus the side panel come online.
      </p>
      <pre className="bg-black/40 border border-[var(--color-border)] rounded-lg p-4 text-xs font-mono overflow-x-auto leading-relaxed">
        <code>
          {`cp .env.example apps/hub/.env.local
# then edit apps/hub/.env.local:
ANTHROPIC_API_KEY=sk-ant-...

pnpm dev`}
        </code>
      </pre>
      <p className="text-[11px] text-[var(--color-text-muted)] mt-4">
        The key stays server-side only. It never ships to the browser bundle.
      </p>
    </motion.div>
  );
}
