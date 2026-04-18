# IESL AI Suite

Three AI products built for the **International Energy Services Limited (IESL) AI Workshop** — a 2-day hands-on programme for Project Managers, the Executive Director, and Finance.

Every product runs in two modes:

- **Demo Mode** — fully offline, pre-seeded with synthetic IESL-flavoured data. Zero network required.
- **AI Mode** — live Claude API calls with streaming responses for real-time "magic".

## The Products

| # | Product | Port | Covers LM modules | Theme |
|---|---------|------|-------------------|-------|
| 1 | **RiskLens** — Risk Intelligence Command Center | `3001` | LM14, LM15 | Crimson alert / command-centre |
| 2 | **ScopeSmith** — AI Scoping, Planning & Scheduling Studio | `3002` | LM05, LM06, LM07 | Electric-blue blueprint |
| 3 | **EstimatorAI** — Historical-Intelligence Effort & Cost Estimator | `3003` | LM08–LM11 | Emerald / ledger |

Each product also ships the cross-cutting **"Executive Report" export** used in LM17/LM18.

## Quick start

```bash
# Install everything
pnpm install

# (Optional) enable live AI Mode
cp .env.example .env.local
# edit .env.local with your ANTHROPIC_API_KEY

# Run a single product
pnpm dev:risk          # http://localhost:3001
pnpm dev:scope         # http://localhost:3002
pnpm dev:estimator     # http://localhost:3003
```

You can open all three at once in separate terminals.

## Repo layout

```
apps/
  risk-lens/           # Standalone Next.js app
  scope-smith/         # Standalone Next.js app
  estimator-ai/        # Standalone Next.js app
packages/
  ai/                  # Claude SDK wrapper, prompt templates, streaming
  ui/                  # Shared primitives (ModeToggle, StreamingResponse)
  data/                # Synthetic IESL JSON corpora
  charts/              # Shared chart building blocks (themable)
```

## Safety notes

- All "IESL" data in this repo is **synthetic**. No real customer data.
- The `ANTHROPIC_API_KEY` is server-side only (Next.js API routes). It never reaches the browser bundle.
- See `/docs/SECURITY.md` for the LM19 security checklist.
