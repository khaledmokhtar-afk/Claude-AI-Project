import { NextResponse } from "next/server";
import { generateJSON } from "@/lib/ai/client";
import { riskRegisterSystem, riskRegisterUser } from "@/lib/ai/prompts/risk-register";
import type { Brief, RiskRegister } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const brief = (await req.json()) as Brief;
    if (!brief?.projectBrief?.trim()) {
      return NextResponse.json({ error: "projectBrief is required" }, { status: 400 });
    }
    const payload = await generateJSON<RiskRegister>({
      system: riskRegisterSystem,
      user: riskRegisterUser(brief),
      model: "reasoning",
      maxTokens: 2600,
      cacheSystem: true,
    });
    if (!payload?.newRisks?.length) {
      return NextResponse.json({ error: "risk-register returned no risks" }, { status: 502 });
    }
    return NextResponse.json(payload);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
