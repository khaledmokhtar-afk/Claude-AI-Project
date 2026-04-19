"use client";

import { useRouter } from "next/navigation";
import BriefForm from "@/components/intake/BriefForm";
import { useAnalysis } from "@/store/useAnalysis";

export default function Home() {
  const router = useRouter();
  const setBrief = useAnalysis((s) => s.setBrief);

  return (
    <main className="min-h-screen flex flex-col">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-96 h-96 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 rounded-full bg-gradient-to-tr from-emerald-500/10 to-blue-500/10 blur-3xl" />
      </div>

      <div className="relative flex-1 flex flex-col">
        <div className="max-w-4xl mx-auto px-6 py-20 w-full">
          <header className="mb-16">
            <div className="eyebrow mb-4 inline-block">PROJECT INTELLIGENCE</div>

            <h1 className="text-6xl lg:text-7xl font-black leading-tight tracking-tight mb-6">
              <span className="inline-block">
                Architect your
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                capital project
              </span>
              <br />
              <span className="inline-block">
                with AI in minutes.
              </span>
            </h1>

            <p className="text-lg text-slate-300 max-w-3xl leading-relaxed mt-8">
              Paste a project scope. Claude generates a work breakdown structure with
              critical-path scheduling, an ISO-grounded risk register with mitigation
              controls, and a P10/P50/P80 cost estimate traced to historical analogs.
              All streamed live.
            </p>
          </header>

          <div className="space-y-8">
            <div className="glass p-8 lg:p-10">
              <BriefForm
                onSubmit={(b) => {
                  setBrief(b);
                  router.push("/dashboard");
                }}
              />
            </div>

            <div className="flex flex-wrap gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400" />
                6 parallel Claude calls
              </span>
              <span className="flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-purple-400" />
                Prompt caching
              </span>
              <span className="flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Per-panel retry
              </span>
              <span className="flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-pink-400" />
                Opus reasoning
              </span>
            </div>
          </div>
        </div>

        <footer className="px-6 py-8 text-center text-xs text-slate-500 border-t border-slate-800/50">
          <p>Built on Next.js 15 + Claude 3.5 Sonnet / Opus with real-time SSE streaming</p>
        </footer>
      </div>
    </main>
  );
}
