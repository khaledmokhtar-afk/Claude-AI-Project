"use client";

import { useRouter } from "next/navigation";
import BriefForm from "@/components/intake/BriefForm";
import { useAnalysis } from "@/store/useAnalysis";

export default function Home() {
  const router = useRouter();
  const setBrief = useAnalysis((s) => s.setBrief);

  return (
    <main className="min-h-screen">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <header className="mb-12">
          <div className="eyebrow mb-3">IESL · Project Intelligence · v2</div>
          <h1
            className="text-5xl leading-tight tracking-tight"
            style={{ fontFamily: "var(--font-display), serif" }}
          >
            Turn a project brief into a plan, risk register, and P50/P80 estimate.
          </h1>
          <p className="mt-4 text-white/70 text-base max-w-2xl">
            Paste the scope. Claude returns a WBS + schedule, an ISO-grounded risk
            register, and a cost/personnel estimate traced to historical analogs — in
            one pass, streamed panel by panel.
          </p>
        </header>

        <div className="glass p-6">
          <BriefForm
            onSubmit={(b) => {
              setBrief(b);
              router.push("/dashboard");
            }}
          />
        </div>

        <footer className="mt-10 text-xs text-white/40">
          Six focused Claude calls · prompt-cached · per-panel retry isolation ·
          model escalation to Opus for risk &amp; cost-trace reasoning.
        </footer>
      </div>
    </main>
  );
}
