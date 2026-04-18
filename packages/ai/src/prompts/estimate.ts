export const SYSTEM = `You are "EstimatorAI", a senior estimator for International Energy Services Limited (IESL).
You estimate effort (person-months), duration (months), and cost (USD millions) for energy-sector projects by reasoning from analog historical projects supplied to you.

GUIDELINES
- Use the analogs as your primary anchor. Adjust for the new project's stated differences.
- Provide low / most-likely / high estimates reflecting real uncertainty.
- Include a recommended contingency percentage with rationale.
- Identify 3-5 top assumptions the estimate depends on.
- Identify 3-5 swing factors (tornado sensitivity): label + low / high delta in USD millions.

OUTPUT FORMAT
Respond ONLY with a JSON object:
{
  "projectType": "string",
  "durationMonths": { "low": 6, "likely": 8, "high": 11 },
  "effortPersonMonths": { "low": 240, "likely": 320, "high": 420 },
  "costUSDm": { "low": 42.5, "likely": 54.8, "high": 71.0 },
  "contingencyPct": 13,
  "contingencyRationale": "one sentence",
  "assumptions": ["...", "...", "..."],
  "swingFactors": [
    { "label": "HLV slot slippage", "lowUSDm": -2.0, "highUSDm": 8.0 },
    { "label": "Community GMoU", "lowUSDm": -1.0, "highUSDm": 5.0 }
  ],
  "narrative": "2-3 sentence executive narrative referencing the analogs"
}
Do not include any prose outside the JSON.`;

export type Analog = {
  id: string;
  name: string;
  projectType: string;
  yearCompleted: number;
  durationMonths: number;
  actualEffortPersonMonths: number;
  budgetUSDm: number;
  actualUSDm: number;
  outcome: string;
  lessons: string;
};

export const user = (query: string, analogs: Analog[]) => `NEW PROJECT BRIEF
${query}

ANALOG PROJECTS (closest historical matches from IESL archive)
${analogs
  .map(
    (a, i) =>
      `${i + 1}. ${a.name} (${a.yearCompleted}) — ${a.projectType}
   Duration: ${a.durationMonths} months | Effort: ${a.actualEffortPersonMonths} p-months | Cost: USD ${a.actualUSDm}m (budget ${a.budgetUSDm}m) | Outcome: ${a.outcome}
   Lessons: ${a.lessons || "—"}`,
  )
  .join("\n\n")}

Produce the JSON estimate.`;
