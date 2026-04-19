# IESL Project Intelligence — v2 Architecture

**Status:** approved 2026-04-19 · supersedes v1 Hub.

## 1. Why v2

v1 failed on three axes despite shipping working code:

1. **Reliability.** Three parallel Claude calls × 6k tokens each routinely hit token ceilings → truncated JSON → "Analysis failed" with no output.
2. **Visibility.** Users stared at a spinner for 60–90s with no feedback; failures surfaced only at the end.
3. **Complexity drag.** Monorepo (`apps/hub` + `packages/{ai,data,ui}`), localStorage versioning (`v1`→`v5`), pre-seeded demo data, and `data-suite` CSS attribute wiring produced confusing bugs that compounded across revisions.

v2 fixes these with a narrower scope, fewer moving parts, and an explicit reliability model.

## 2. Goals

1. **Zero silent failures.** Every Claude call is independently retryable; a failed panel shows a retry button, not a dead dashboard.
2. **Streaming UX.** User sees the first panel populate within 3 seconds. No 60-second spinners.
3. **AI-only output.** No demo mode, no pre-seeded data, no placeholder content misread as real output.
4. **Frontend-first polish.** Typography, spacing, motion, and colour tokens defined once in `globals.css` and referenced everywhere — no per-tab CSS drift.

## 3. Tech stack

| Concern | Choice | Why |
|---|---|---|
| Framework | Next.js 15 App Router | Same as v1; mature streaming support |
| Structure | **Single app** (no monorepo) | v1's packages added more friction than reuse |
| Styling | Tailwind + CSS variables | Proven; one tokens file |
| Motion | Framer Motion (minimal) | Page transitions + panel reveals only; no mesh backdrops |
| State | Zustand | No localStorage reducer complexity |
| Streaming | Server-Sent Events via `ReadableStream` | Native Next.js, no WebSocket infra |
| AI SDK | `@anthropic-ai/sdk` direct | No wrapper; use prompt caching + streaming |
| Model | `claude-sonnet-4-6` (fast path), `claude-opus-4-7` (escalation) | Fast for panels, Opus if a retry needs deeper reasoning |

## 4. Architecture

```
┌──────────────────┐        ┌─────────────────────────────┐
│  /  (brief)      │──POST──│  /api/analyze (orchestrator)│
└──────────────────┘        └─────────────┬───────────────┘
                                          │ SSE stream
                                          ▼
                  ┌──────────┬──────────┬──────────┬──────────┬──────────┬──────────┐
                  │plan-core │plan-xtras│risk-reg  │risk-acts │est-core  │est-trace │
                  │≤2k tok   │≤2k tok   │≤2k tok   │≤1k tok   │≤1k tok   │≤2k tok   │
                  └──────────┴──────────┴──────────┴──────────┴──────────┴──────────┘
                                          │
                                          ▼
                              ┌──────────────────────┐
                              │  /dashboard          │
                              │  panels render as    │
                              │  each SSE event lands│
                              └──────────────────────┘
```

**Six focused Claude calls, each ≤ 2,048 max tokens, each returning a strict schema of 4–8 fields:**

| Endpoint | Output |
|---|---|
| `plan-core` | `projectName`, `summary`, `tasks[]` (15–25 entries, CPM-ready) |
| `plan-extras` | `milestones[]`, `phaseSummaries[]`, `resourceLoad[]`, `scheduleStrategy` |
| `risk-register` | `newRisks[]` with inherent L×I, controls hierarchy, residual, ISO tags |
| `risk-actions` | `topActions[]` (exactly 5), `isoFramework[]` (3–6 entries), `portfolioInsight` |
| `estimate-core` | `costUSDm{low,likely,high}`, `durationMonths`, `effortPersonMonths`, `contingencyPct`, `assumptions`, `narrative` |
| `estimate-trace` | `costBreakdown[]`, `personnel[]`, `methodology[]` (5 steps), `analogScaling[]`, `swingFactors[]` |

### 4.1 Streaming contract

- Orchestrator fires all 6 calls via `Promise.allSettled`.
- As each resolves, orchestrator writes an SSE event:
  ```
  event: section
  data: {"id":"plan-core","status":"ready","payload":{...}}
  ```
- On failure:
  ```
  event: section
  data: {"id":"risk-register","status":"failed","error":"token budget exceeded","retryable":true}
  ```
- Final event:
  ```
  event: done
  data: {"elapsedMs":12400,"succeeded":5,"failed":1}
  ```

### 4.2 Per-panel retry

Each dashboard panel has three states — `streaming | ready | failed` — and a retry button on failure that POSTs to the single endpoint it depends on. No tab-wide retry.

## 5. State model

- **No persistence.** New session on each visit. (Backlog / history is a v2.1 feature.)
- Zustand store shape:
  ```ts
  type Store = {
    brief: Brief | null;
    sections: Record<SectionId, SectionState>;
    activeTab: "plan" | "risks" | "estimate";
    startAnalysis(b: Brief): void;
    retrySection(id: SectionId): void;
    setTab(t: TabId): void;
  };
  ```

## 6. Brief intake form

Single textarea + optional metadata chips:

| Field | Required | Notes |
|---|---|---|
| Project brief | Yes | 40–3,000 chars |
| Sector | Optional | Oil & Gas / Power / Renewables / Infrastructure |
| Scale | Optional | Small / Mid / Large / Mega |
| Time horizon | Optional | < 6 months / 6–12 / 12–24 / > 24 |
| **Budget ceiling (USDm)** | Optional | Numeric; fed into estimate prompts as a hard ceiling check |
| **Target completion** | Optional | Date picker; fed into plan-core as deadline the critical path must respect |
| **Known constraints** | Optional | Free-text, 200 char cap — appended to every prompt |

Budget and target completion are passed as hard constraints to the AI: Claude flags any estimate exceeding the ceiling and any schedule missing the target.

## 7. Dashboards

Same three tabs as v1, unchanged panel list:

### Plan & Schedule
- Summary stat strip (tasks, days, critical path, resources, milestones)
- Phase summary grid (one card per phase)
- Milestone timeline (gates / regulatory / delivery / commissioning)
- WBS tree + Gantt chart (critical path highlighted)
- Resource loading histogram
- Scheduling strategy card

### Risks & ISO
- Portfolio insight banner
- Top-5 time-bound action register
- ISO framework panel (ISO 31000 / 45001 / 14001 / 27001 / 22301 / 9001, IOGP 510 & 459, API RP 14C / 75 / 1173, DNV-OS-F101, NUPRC / NCDMB / NIMASA)
- Heat matrix (L×I)
- Per-risk drilldown: ISO standards invoked, controls hierarchy (preventive / detective / corrective per ISO 45001 §8.1.2), residual score, owner role, due-within-days
- Inherent vs residual bars

### Cost & People
- P50 / P80 hero card
- Cost breakdown by category (stacked bar + derivation basis per line)
- Personnel roster table (role, count, monthly rate, person-months, cost)
- Methodology trace (5 numbered steps)
- Analog scaling factors
- Waterfall P50 → P80
- Tornado swing factors
- Assumptions + contingency rationale
- Historical analog projects

## 8. Directory layout

```
/
├── app/
│   ├── page.tsx                 ← brief intake
│   ├── dashboard/page.tsx       ← streaming results
│   ├── api/
│   │   ├── analyze/route.ts     ← SSE orchestrator
│   │   └── sections/
│   │       ├── plan-core/route.ts
│   │       ├── plan-extras/route.ts
│   │       ├── risk-register/route.ts
│   │       ├── risk-actions/route.ts
│   │       ├── estimate-core/route.ts
│   │       └── estimate-trace/route.ts
│   ├── components/
│   │   ├── intake/              ← BriefForm
│   │   ├── plan/                ← 6 panels
│   │   ├── risks/               ← 5 panels
│   │   ├── estimate/            ← 9 panels
│   │   └── ui/                  ← Button, Chip, Card, Metric, EmptyState
│   ├── globals.css
│   └── layout.tsx
├── lib/
│   ├── ai/
│   │   ├── client.ts            ← Anthropic SDK wrapper
│   │   ├── generateJSON.ts      ← robust JSON extraction
│   │   └── prompts/             ← 6 prompt modules, one per section
│   ├── schedule.ts              ← CPM forward-pass
│   ├── analogs.ts               ← historical project fixtures + matching
│   └── types.ts                 ← shared TypeScript shapes
├── store/
│   └── useAnalysis.ts           ← Zustand
└── docs/
    └── v2-architecture.md       ← this file
```

## 9. Out of scope for v2.0

- History / backlog / persistence
- Multi-user or auth
- Export to PDF / PowerPoint
- Claude side-panel chat
- Demo mode of any kind
- PWA / offline

These land in v2.1+ once the core is stable.

## 10. Success criteria

v2.0 ships when:

1. Analysis completes in ≤ 20s on typical briefs, first panel ready in ≤ 3s.
2. Token budget failures are isolated to a single panel, never kill the dashboard.
3. `pnpm dev` on a fresh clone with only `ANTHROPIC_API_KEY` set produces a rendered dashboard with all 20+ panels from a 500-char brief.
4. No TypeScript errors, no ESLint warnings, Lighthouse a11y ≥ 95 on each tab.
5. Build artifact < 300 KB first-load JS.
