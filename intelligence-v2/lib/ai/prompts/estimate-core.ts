import type { Brief, HistoricalProject } from "@/lib/types";
import { JSON_ONLY, briefBlock } from "./shared";

export const estimateCoreSystem = `
You are a senior cost estimator (AACE Class 3 / parametric + analog methods) for
capital projects. Deliver a defensible bottom-line estimate with P10/P50/P80 bands.

RULES:
- projectType: short industry label ("Subsea tieback", "Brownfield modification", …).
- durationMonths / effortPersonMonths / costUSDm: each is a {low, likely, high} band
  representing P10 / P50 / P80 respectively.
  low < likely < high. All numbers are real (can be decimals).
- contingencyPct: 10–35 integer; higher for less-mature scopes.
- contingencyRationale: 1–2 sentences naming the top 2 swing drivers.
- assumptions: 4–7 bullet-ready strings, each a concrete assumption a PM could challenge.
- narrative: 2–3 sentences explaining the cost shape, calling out the analog projects
  that most shape the estimate.

${JSON_ONLY}

SHAPE:
{
  "projectType": string,
  "durationMonths": { "low": number, "likely": number, "high": number },
  "effortPersonMonths": { "low": number, "likely": number, "high": number },
  "costUSDm": { "low": number, "likely": number, "high": number },
  "contingencyPct": number,
  "contingencyRationale": string,
  "assumptions": string[],
  "narrative": string
}
`.trim();

export function estimateCoreUser(b: Brief, analogs: HistoricalProject[]): string {
  const compact = analogs.slice(0, 8).map((a) => ({
    name: a.name,
    type: a.projectType,
    durationMonths: a.durationMonths,
    effortPersonMonths: a.actualEffortPersonMonths,
    actualUSDm: a.actualUSDm,
    scope: a.scopeSummary,
    outcome: a.outcome,
    contingencyPct: a.contingencyPct,
  }));
  return [
    briefBlock(b),
    "",
    "HISTORICAL ANALOGS (closest matches, already ranked):",
    JSON.stringify(compact, null, 2),
    "",
    "Return the estimate-core JSON.",
  ].join("\n");
}
