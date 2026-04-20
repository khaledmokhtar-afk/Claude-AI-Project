"use client";

import { motion } from "framer-motion";

export function ApiKeyMissing() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl w-full"
    >
      <div className="card-elev p-8 lg:p-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
               style={{ background: "var(--color-bad-soft)" }}>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" style={{ color: "var(--color-bad)" }}>
              <path d="M12 2L2 7v6c0 5.25 3.75 9.5 10 11 6.25-1.5 10-5.75 10-11V7l-10-5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <div className="eyebrow" style={{ color: "var(--color-bad)" }}>Claude · offline</div>
            <h2 className="font-display text-[24px] leading-tight tracking-[-0.015em] mt-1 text-[var(--color-ink)]">
              API key missing on the server
            </h2>
          </div>
        </div>

        <p className="text-[14.5px] text-[var(--color-ink-2)] leading-[1.65] mb-6 max-w-[560px]">
          The analyzer calls Claude directly from the Next.js server. No key means no output — there is no demo fallback.
          Add your Anthropic key to{" "}
          <code className="px-1.5 py-0.5 rounded bg-[var(--color-card-soft)] border border-[var(--color-line)] font-mono text-[12px] text-[var(--color-ink)]">
            apps/hub/.env.local
          </code>{" "}
          and restart the dev server.
        </p>

        <div className="space-y-4">
          <Step n={1} label="Create .env.local">
            echo &apos;ANTHROPIC_API_KEY=sk-ant-...&apos; &gt; apps/hub/.env.local
          </Step>
          <Step n={2} label="Restart the dev server">
            pnpm --filter iesl-hub dev
          </Step>
          <Step n={3} label="Open the app">
            http://localhost:3333
          </Step>
        </div>

        <p className="text-[12px] text-[var(--color-ink-3)] mt-6 pt-5 border-t border-[var(--color-line)]">
          The key is read server-side only (in the API route). It never ships to the browser bundle.
          Get one at <span className="font-mono text-[var(--color-ink)]">console.anthropic.com</span>.
        </p>
      </div>
    </motion.div>
  );
}

function Step({ n, label, children }: { n: number; label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="w-5 h-5 rounded-full grid place-items-center font-mono text-[11px] font-semibold text-white"
              style={{ background: "var(--color-ink)" }}>
          {n}
        </span>
        <span className="eyebrow">{label}</span>
      </div>
      <pre className="bg-[var(--color-card-soft)] border border-[var(--color-line)] rounded-lg px-3 py-2.5 text-[12.5px] font-mono overflow-x-auto text-[var(--color-ink)]">
        <code>{children}</code>
      </pre>
    </div>
  );
}
