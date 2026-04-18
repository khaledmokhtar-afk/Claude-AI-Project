# IESL AI Suite

Three AI products built for the **International Energy Services Limited (IESL) AI Workshop** — a 2-day hands-on programme for Project Managers, the Executive Director, and Finance.

All three products now live inside a **single Next.js app** (the Hub) with a shared workspace, a global AI Mode toggle, and a persistent Claude side-panel that is aware of whichever tab you are on.

Every product runs in two modes:

- **Demo Mode** — fully offline, pre-seeded with synthetic IESL-flavoured data. Zero network required.
- **AI Mode** — live Claude API calls with streaming responses for real-time "magic".

## The Products

| # | Product | Tab | Covers LM modules | Theme |
|---|---------|------|-------------------|-------|
| 1 | **RiskLens** — Risk Intelligence Command Center | `/suite/risk` | LM14, LM15 | Crimson alert / command-centre |
| 2 | **ScopeSmith** — AI Scoping, Planning & Scheduling Studio | `/suite/scope` | LM05, LM06, LM07 | Electric-blue blueprint |
| 3 | **EstimatorAI** — Historical-Intelligence Effort & Cost Estimator | `/suite/estimator` | LM08–LM11 | Emerald / ledger |

Each product ships the cross-cutting **"Executive Report" export** used in LM17/LM18.
The Claude side-panel is available on every tab and reads the current workspace (scope, WBS, risks, estimate) as context.

## Quick start

```bash
pnpm install

# (Optional) enable live AI Mode
cp .env.example apps/hub/.env.local
# edit apps/hub/.env.local with your ANTHROPIC_API_KEY

pnpm dev                 # http://localhost:3000
```

The Hub landing page (`/`) links to `/suite/risk`, `/suite/scope`, `/suite/estimator`. Switching tabs keeps the Shell, AI Mode toggle, and Claude panel mounted.

## Repo layout

```
apps/
  hub/                   # Next.js app hosting the three products + landing page
    app/
      page.tsx           # Landing with product cards → /suite/*
      suite/
        layout.tsx       # Shell (top bar, tabs, AI toggle) + ClaudePanel
        risk/            # RiskLens workspace
        scope/           # ScopeSmith workspace
        estimator/       # EstimatorAI workspace
      api/
        risk/            # predict-risks, narrate-risk
        scope/           # generate-wbs, narrate-plan
        estimator/       # estimate, narrate-estimate
        chat/            # Global Claude side-panel stream
packages/
  ai/                    # Claude SDK wrapper, prompt templates, streamText
  ui/                    # Shared hooks + WorkspaceProvider (cross-app state)
  data/                  # Synthetic IESL JSON corpora
```

## Cross-app workspace

`@iesl/ui` exports `WorkspaceProvider` + `useWorkspace()`, persisted to
`localStorage` under `iesl:workspace:v1`. Each tab reads mode/data from the
same context and writes its output back, so producing a WBS in ScopeSmith
seeds the context the Claude panel references when you switch to RiskLens or
EstimatorAI.

## Safety notes

- All "IESL" data in this repo is **synthetic**. No real customer data.
- `ANTHROPIC_API_KEY` is server-side only (Next.js API routes). It never reaches the browser bundle.
- See `/docs/SECURITY.md` for the LM19 security checklist.
