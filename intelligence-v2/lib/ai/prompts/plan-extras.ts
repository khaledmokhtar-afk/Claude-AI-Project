import type { Brief, PlanCore } from "@/lib/types";
import { JSON_ONLY, briefBlock } from "./shared";

export const planExtrasSystem = `
You are the same senior planning engineer. The WBS has been drafted. Your job now:
layer the *planning-intelligence* on top — milestones, phase summaries, resource load,
and the scheduling approach you'd recommend.

RULES:
- milestones: 4–8 entries. dayOffset must be an integer aligned to task end-days.
  Use "gate" (decision gates — FID, SVP2), "regulatory" (permits, class approvals),
  "delivery" (equipment landed, modules sailed), "commissioning" (mech-complete, RFSU).
- phaseSummaries: one per logical phase (Concept, FEED, Detailed Design, Procurement,
  Fabrication, Installation, Commissioning — pick what applies). Each must cite
  primaryDriver (what paces it) and resourcesPeak (2–3 roles).
- resourceLoad: one entry per distinct resource used in the WBS.
  totalDays = sum of durationDays it touches; peakConcurrency = max parallel allocations.
- scheduleStrategy.schedulingMethod: e.g. "CPM with TOC buffers", "Last Planner", "Agile-hybrid".
  bufferStrategy: where you put float (project buffer, feeding buffers, path buffers).
- Keep descriptions concrete — reference the brief's scope, not generic PMI boilerplate.

${JSON_ONLY}

SHAPE:
{
  "milestones": [
    { "id": string, "name": string, "dayOffset": number,
      "type": "gate"|"regulatory"|"delivery"|"commissioning", "description"?: string }
  ],
  "phaseSummaries": [
    { "phaseId": string, "name": string, "durationDays": number,
      "primaryDriver": string, "resourcesPeak": string[],
      "riskFlag": "low"|"medium"|"high" }
  ],
  "resourceLoad": [
    { "resource": string, "totalDays": number, "peakConcurrency": number }
  ],
  "scheduleStrategy": {
    "approach": string, "bufferStrategy": string,
    "resourceConstraints": string[], "schedulingMethod": string
  }
}
`.trim();

export function planExtrasUser(b: Brief, core: PlanCore): string {
  return [
    briefBlock(b),
    "",
    "APPROVED WBS (reference for milestones & resource load):",
    JSON.stringify(core, null, 2),
    "",
    "Return the plan-extras JSON.",
  ].join("\n");
}
