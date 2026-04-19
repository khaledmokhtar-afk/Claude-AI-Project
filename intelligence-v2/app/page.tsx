"use client";

import { useRouter } from "next/navigation";
import BriefForm from "@/components/intake/BriefForm";
import { useAnalysis } from "@/store/useAnalysis";

export default function Home() {
  const router = useRouter();
  const setBrief = useAnalysis((s) => s.setBrief);

  return (
    <main className="min-h-screen">
      {/* Top nav */}
      <nav className="px-8 lg:px-12 py-6 flex items-center justify-between max-w-[1280px] mx-auto">
        <div className="flex items-center gap-2.5">
          <Logo />
          <div className="leading-tight">
            <div className="text-[15px] font-semibold tracking-tight">IESL</div>
            <div className="text-[11px] text-[var(--ink-3)] -mt-0.5">Project Intelligence</div>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-6 text-[13.5px] text-[var(--ink-3)]">
          <span className="chip">v2.0</span>
          <a className="hover:text-[var(--ink)] transition" href="#how">How it works</a>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid pointer-events-none" />
        <div className="relative max-w-[1100px] mx-auto px-8 lg:px-12 pt-12 lg:pt-20 pb-16">
          <div className="max-w-[760px]">
            <div className="eyebrow eyebrow-brand mb-5 blur-in">For capital projects · v2.0</div>

            <h1 className="font-display text-[58px] leading-[1.05] tracking-[-0.025em] text-[var(--ink)] blur-in">
              From a paragraph
              <br />
              to a <em className="italic">defensible</em> project plan,
              <br />
              <span className="text-[var(--ink-3)]">in under two minutes.</span>
            </h1>

            <p className="mt-7 text-[18px] leading-[1.55] text-[var(--ink-2)] max-w-[620px] rise" style={{ animationDelay: "120ms" }}>
              Paste a brief. Claude returns a CPM work breakdown, an ISO-grounded
              risk register with mitigation controls, and a P10 / P50 / P80 cost
              estimate traced to historical analogs — streamed panel by panel.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-2.5 rise" style={{ animationDelay: "200ms" }}>
              <span className="chip"><span className="dot dot-ok" /> ISO 31000 · 45001 · 14001</span>
              <span className="chip"><span className="dot dot-ok" /> AACE Class 3 estimating</span>
              <span className="chip"><span className="dot dot-ok" /> 40+ historical analogs</span>
            </div>
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="max-w-[1100px] mx-auto px-8 lg:px-12 pb-24">
        <div className="card-elev p-8 lg:p-10 rise" style={{ animationDelay: "300ms" }}>
          <div className="flex items-baseline justify-between mb-7">
            <h2 className="font-display text-[28px] leading-tight tracking-tight">
              Describe your project
            </h2>
            <div className="eyebrow">Step 1 of 1</div>
          </div>
          <BriefForm
            onSubmit={(b) => {
              setBrief(b);
              router.push("/dashboard");
            }}
          />
        </div>

        {/* How it works */}
        <div id="how" className="mt-20">
          <div className="eyebrow mb-3">How it works</div>
          <h3 className="font-display text-[36px] leading-tight tracking-tight max-w-[640px]">
            Six focused models, one streaming response.
          </h3>
          <div className="mt-10 grid sm:grid-cols-3 gap-5">
            <Step n="01" title="Plan & Schedule">
              CPM-ready WBS, milestones, phase summaries and resource load — built
              with Sonnet for speed.
            </Step>
            <Step n="02" title="Risks & ISO">
              Inherent and residual risk register, mitigation controls, ISO framework
              — escalated to Opus for reasoning depth.
            </Step>
            <Step n="03" title="Estimate">
              P10 / P50 / P80 bands, cost breakdown, personnel roster, methodology
              and tornado — anchored to closest analogs.
            </Step>
          </div>
        </div>
      </section>

      <footer className="border-t border-[var(--line)] py-8 px-8 lg:px-12">
        <div className="max-w-[1100px] mx-auto flex items-center justify-between text-[12.5px] text-[var(--ink-3)]">
          <div>IESL Project Intelligence — built on Claude.</div>
          <div className="font-mono">v2.0.0</div>
        </div>
      </footer>
    </main>
  );
}

function Step({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <div className="card p-6">
      <div className="font-mono text-[12px] text-[var(--brand)] mb-3">{n}</div>
      <div className="text-[16px] font-semibold tracking-tight mb-1.5">{title}</div>
      <p className="text-[14.5px] leading-[1.55] text-[var(--ink-3)]">{children}</p>
    </div>
  );
}

function Logo() {
  return (
    <div
      className="w-9 h-9 rounded-[10px] grid place-items-center text-white"
      style={{
        background: "linear-gradient(135deg, #1A56DB 0%, #0F3FA8 100%)",
        boxShadow: "0 4px 12px -2px rgba(26,86,219,0.45)",
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M4 18 L10 6 L14 14 L20 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="20" cy="6" r="1.5" fill="currentColor" />
      </svg>
    </div>
  );
}
