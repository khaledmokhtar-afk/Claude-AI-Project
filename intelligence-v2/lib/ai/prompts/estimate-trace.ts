import type { Brief, EstimateCore, HistoricalProject } from "@/lib/types";
import { JSON_ONLY, briefBlock } from "./shared";

export const estimateTraceSystem = `
You are the same senior cost estimator. The headline estimate is set. Now expose
the arithmetic trail that supports it: cost breakdown, personnel roster,
methodology, analog scaling, and swing factors.

RULES:
- costBreakdown: 6–10 items covering all major cost categories
  (Engineering, Procurement, Fabrication, Installation, Commissioning, Project
  Management, HSE & Quality, Contingency). Every amountUSDm is in USD millions.
  Sum of amountUSDm must equal costUSDm.likely ± 5%.
  basis: 1 sentence citing the source (analog %, rate × count, lump-sum quote, …).
- personnel: 7–12 roles covering the full org chart. For each role,
  monthlyRateUSD is the fully-loaded rate (USD, not millions),
  totalPersonMonths = count × months allocated,
  totalCostUSDm = monthlyRateUSD × totalPersonMonths / 1,000,000  (verify the arithmetic).
- methodology: exactly 5 numbered steps describing the estimating sequence
  (analog selection → scaling → parametric overlay → risk-adjusted contingency → band fit).
- analogScaling: 3–5 entries. For each analog used, give the scalingFactor
  ("×1.4 capacity, ×0.9 water depth") and the contribution to the final number.

${JSON_ONLY}

SHAPE:
{
  "costBreakdown": [
    { "category": string, "amountUSDm": number, "basis": string }
  ],
  "personnel": [
    { "role": string, "count": number, "monthlyRateUSD": number,
      "totalPersonMonths": number, "totalCostUSDm": number }
  ],
  "methodology": [
    { "step": number, "title": string, "detail": string }
  ],
  "analogScaling": [
    { "analogName": string, "scalingFactor": string, "contribution": string }
  ],
  "swingFactors": [
    { "label": string, "lowUSDm": number, "highUSDm": number }
  ]
}
`.trim();

export function estimateTraceUser(
  b: Brief,
  core: EstimateCore,
  analogs: HistoricalProject[],
): string {
  const compact = analogs.slice(0, 8).map((a) => ({
    name: a.name,
    type: a.projectType,
    actualUSDm: a.actualUSDm,
    durationMonths: a.durationMonths,
    effortPersonMonths: a.actualEffortPersonMonths,
  }));
  return [
    briefBlock(b),
    "",
    "APPROVED ESTIMATE-CORE (anchor your breakdown to this):",
    JSON.stringify(core, null, 2),
    "",
    "HISTORICAL ANALOGS:",
    JSON.stringify(compact, null, 2),
    "",
    "Return the estimate-trace JSON.",
  ].join("\n");
}
