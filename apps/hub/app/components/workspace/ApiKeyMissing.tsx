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
      <div className="relative rounded-2xl overflow-hidden">
        <div
          className="absolute -inset-[1px] rounded-2xl"
          style={{
            background: "linear-gradient(135deg, rgba(239,68,68,0.5) 0%, rgba(245,158,11,0.3) 100%)",
          }}
        />
        <div className="relative rounded-2xl bg-[#0B0F1A] p-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center">
              <svg className="w-5 h-5 text-red-400" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7v6c0 5.25 3.75 9.5 10 11 6.25-1.5 10-5.75 10-11V7l-10-5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <div className="eyebrow" style={{ color: "#F87171" }}>Claude · offline</div>
              <h2 className="text-xl font-semibold text-white mt-1">API key missing on the server</h2>
            </div>
          </div>

          <p className="text-sm text-[var(--color-text-muted)] leading-relaxed mb-5">
            The analyzer calls Claude directly from the Next.js server. No key means no output — there is no demo fallback.
            Add your Anthropic key to <code className="px-1.5 py-0.5 rounded bg-white/5 font-mono text-xs">apps/hub/.env.local</code> and restart the dev server.
          </p>

          <div className="space-y-3">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] mb-2">1 · Create .env.local</div>
              <pre className="bg-black/50 border border-white/10 rounded-lg p-3 text-xs font-mono overflow-x-auto">
                <code className="text-emerald-300">echo &apos;ANTHROPIC_API_KEY=sk-ant-...&apos; &gt; apps/hub/.env.local</code>
              </pre>
            </div>

            <div>
              <div className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] mb-2">2 · Restart the dev server</div>
              <pre className="bg-black/50 border border-white/10 rounded-lg p-3 text-xs font-mono overflow-x-auto">
                <code className="text-emerald-300">pnpm --filter iesl-hub dev</code>
              </pre>
            </div>

            <div>
              <div className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] mb-2">3 · Open the app</div>
              <pre className="bg-black/50 border border-white/10 rounded-lg p-3 text-xs font-mono overflow-x-auto">
                <code className="text-emerald-300">http://localhost:3333</code>
              </pre>
            </div>
          </div>

          <p className="text-[11px] text-[var(--color-text-muted)] mt-5 pt-5 border-t border-white/5">
            The key is read server-side only (in the API route). It never ships to the browser bundle.
            Get one at <span className="text-white font-mono">console.anthropic.com</span>.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
