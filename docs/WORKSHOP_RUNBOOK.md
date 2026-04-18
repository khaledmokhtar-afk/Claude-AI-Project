# IESL AI Workshop — Facilitator Runbook

Use this runbook the morning of the workshop. Every product is demo-ready without network.

## Pre-flight (60 min before)

1. `cd /home/user/Claude-AI-Project`
2. `pnpm install` if dependencies have changed.
3. Copy the key: `cp .env.example .env.local` then paste your `ANTHROPIC_API_KEY`.
4. Open three terminals, start all three products:
   ```bash
   pnpm dev:risk        # http://localhost:3001
   pnpm dev:scope       # http://localhost:3002
   pnpm dev:estimator   # http://localhost:3003
   ```
5. Open each URL in its own browser window/tab.
6. In each header, confirm the mode toggle defaults to **Demo Mode** (● dot). AI Mode will auto-enable if the API key is detected.
7. Toggle to AI Mode on one product, click the primary action once to warm the API / prompt cache.

## Session plan — what to show, when

### Day 1 · Part 2
**LM05 — AI and the scoping dilemma (20 min, session)** · Use **ScopeSmith**
- Start in Demo Mode. Pick "Deepwater wellhead maintenance campaign". Click **Generate WBS & Gantt**. Let the animation play.
- Talk over the building Gantt: "Every bar you see was inferred from the scope sentence up-left."
- Switch to AI Mode, **paste a live scope from the room** (volunteer a PM's current project), rerun. Highlight the live reasoning rail.

**LM06 — Planning & scheduling tools (20 min, session)** · Use **ScopeSmith**
- Zoom the Gantt. Critical path is amber. Emphasise resource diversity in the WBS column.
- Click **Generate Executive Report →**. Print preview → the PDF-ready view. This is the hand-over deliverable.

**LM07 — Hands-on Lab (90 min)** · Attendees use **ScopeSmith**
- Each table gets one real scope brief they bring. They iterate Demo → AI → Executive Report.
- Time box: 20 min generate, 40 min refine, 20 min report, 10 min share.

### Day 1 · Part 3
**LM08 — AI for Effort Estimation (20 min, session)** · Use **EstimatorAI**
- Start in Demo Mode with "4-well unmanned wellhead install". Show the analog list retrieve.
- Walk the room through one analog row (e.g. H-007 over-budget). Point at the lesson.
- Click Run Estimate. Focus on the P50/P80 card + contingency rationale.

**LM09 — Workflow analysis (20 min, scouting)** · Use **EstimatorAI**
- Prompt attendees: "Which of these analog signals would your estimation committee have missed?"

**LM10 — Indexing Historical Data (90 min, Lab)** · Use **EstimatorAI**
- Show that the retrieval engine is simple bag-of-tokens over the 40-project corpus. Teach the concept; swap in embeddings is trivial.
- Attendees write a scope in their own terms and iterate until matches feel right.

**LM11 — Take-home app (30 min, Lab/Report)** · Use **EstimatorAI**
- After an estimate is produced, click **⬇ Take-home Estimator (HTML)**. File downloads.
- Open it in a fresh browser. Show the live form: change size/duration/contingency, numbers recompute. This is the LM11 deliverable.

### Day 2 · Part 5
**LM14 — Risk Register, Early Mitigation (20 min, scouting)** · Use **RiskLens**
- Start in Demo Mode. Pick "FPSO Aurora 5-Year Turnaround".
- Walk the heat matrix. Click risks. Show the 30/60/90-day curve on the right.
- Show the risk table with scores.

**LM15 — Predictive model (70 min, Lab)** · Use **RiskLens**
- Switch to AI Mode. Click **⚡ Run with Claude**. Watch the live narration.
- When JSON arrives, panel populates new risks + portfolio insight. Toggle the compare series on the 30/60/90 chart.
- Show the Monte Carlo simulation — drag "Runs" slider, re-seed. Explain P50 / P80 / P95.
- Click **Generate Executive Risk Snapshot →**.

### Day 2 · Parts 7-8
**LM17 — Performance Management** · Every product ships a KPI strip (duration, score, P80). Show any one.
**LM18 — Reporting** · Demonstrate the three Executive Reports side-by-side as Gamma/Canva replacements.
**LM19 — Security** · Open `packages/ai/src/client.ts`. Show key stays server-side. No real data anywhere — search the repo for "IESL" to prove all data is synthetic.
**LM20 — Hallucinations** · In AI Mode, click Run twice and compare. Show the JSON contract in each prompt file under `packages/ai/src/prompts/`.

## If something goes wrong

| Symptom | Fix |
| --- | --- |
| AI Mode disabled | Check `.env.local` has `ANTHROPIC_API_KEY=sk-ant-...` and restart the affected app |
| Slow first token | Retry — prompt cache warms on second call. |
| "Error" red banner | Flip to Demo Mode, tell the audience you're demonstrating resilience, continue. |
| No network at venue | Stay entirely in Demo Mode. Every scenario is pre-seeded. |

## One-liner pitches for each app

- **ScopeSmith** — "Paste a scope. Watch a plan build itself."
- **RiskLens** — "Every risk, now predictive. The register comes alive."
- **EstimatorAI** — "Your last ten years of projects, now a forecast."
