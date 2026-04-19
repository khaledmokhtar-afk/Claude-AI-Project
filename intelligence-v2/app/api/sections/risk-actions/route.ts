import { NextResponse } from "next/server";
import { generateJSON } from "@/lib/ai/client";
import { riskActionsSystem, riskActionsUser } from "@/lib/ai/prompts/risk-actions";
import type { Brief, RiskActions, RiskRegister } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { brief, register } = (await req.json()) as { brief: Brief; register: RiskRegister };
    if (!brief?.projectBrief?.trim() || !register?.newRisks?.length) {
      return NextResponse.json({ error: "brief and risk-register required" }, { status: 400 });
    }
    const payload = await generateJSON<RiskActions>({
      system: riskActionsSystem,
      user: riskActionsUser(brief, register),
      model: "fast",
      maxTokens: 1800,
      cacheSystem: true,
    });
    return NextResponse.json(payload);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
