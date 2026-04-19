import type { Brief, RiskRegister } from "@/lib/types";
import { JSON_ONLY, briefBlock } from "./shared";

export const riskActionsSystem = `
You are the same senior risk manager. The inherent-risk register has been drafted.
Your job now: synthesise the portfolio view — 5 top priority actions, the ISO
framework that governs this scope, and a one-paragraph portfolio insight.

RULES:
- topActions: EXACTLY 5 entries, ranked by expected loss reduction × urgency.
  Each: action (imperative verb, concrete), owner (role), dueWithinDays (14–120).
- isoFramework: 4–8 standards that genuinely govern the scope. For each:
    standard (e.g. "ISO 31000:2018"), title (full short title),
    appliesTo (list of risk categories or lifecycle phases),
    whyRelevant (1 sentence anchored in THIS project, not generic).
  Prefer standards actually referenced in the risk register; you may add 1–2 umbrella ones.
- portfolioInsight: 2–3 sentences. Name the dominant risk concentration
  (e.g. "supply chain + schedule cluster on long-lead subsea trees")
  and the governance posture needed. No filler.

${JSON_ONLY}

SHAPE:
{
  "topActions": [
    { "action": string, "owner": string, "dueWithinDays": number }
  ],
  "isoFramework": [
    { "standard": string, "title": string, "appliesTo": string[], "whyRelevant": string }
  ],
  "portfolioInsight": string
}
`.trim();

export function riskActionsUser(b: Brief, register: RiskRegister): string {
  return [
    briefBlock(b),
    "",
    "APPROVED RISK REGISTER (synthesise from this):",
    JSON.stringify(register, null, 2),
    "",
    "Return the risk-actions JSON.",
  ].join("\n");
}
