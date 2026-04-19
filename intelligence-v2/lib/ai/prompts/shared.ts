import type { Brief } from "@/lib/types";

export function briefBlock(b: Brief): string {
  const lines: string[] = [];
  lines.push(`PROJECT BRIEF:\n${b.projectBrief.trim()}`);
  if (b.sector) lines.push(`SECTOR: ${b.sector}`);
  if (b.scale) lines.push(`SCALE: ${b.scale}`);
  if (b.horizon) lines.push(`HORIZON: ${b.horizon}`);
  if (b.budgetCeilingUSDm) lines.push(`BUDGET CEILING: USD ${b.budgetCeilingUSDm}M`);
  if (b.targetCompletionISO) lines.push(`TARGET COMPLETION: ${b.targetCompletionISO}`);
  if (b.constraints) lines.push(`CONSTRAINTS: ${b.constraints}`);
  return lines.join("\n");
}

export const JSON_ONLY = [
  "Respond with a single JSON object only.",
  "Do not wrap it in markdown fences. Do not add prose before or after.",
  "Every numeric field must be a plain number (no units, no commas).",
  "Every required field must be present — if unsure, give your best estimate rather than omitting.",
].join(" ");
