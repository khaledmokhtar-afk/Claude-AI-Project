import { NextResponse } from "next/server";
import { generateJSON } from "@/lib/ai/client";
import { estimateTraceSystem, estimateTraceUser } from "@/lib/ai/prompts/estimate-trace";
import { findAnalogs } from "@/lib/analogs";
import type { Brief, EstimateCore, EstimateTrace } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { brief, core } = (await req.json()) as { brief: Brief; core: EstimateCore };
    if (!brief?.projectBrief?.trim() || !core?.costUSDm?.likely) {
      return NextResponse.json({ error: "brief and estimate-core required" }, { status: 400 });
    }
    const analogs = findAnalogs(brief.projectBrief, 8);
    const payload = await generateJSON<EstimateTrace>({
      system: estimateTraceSystem,
      user: estimateTraceUser(brief, core, analogs),
      model: "reasoning",
      maxTokens: 2600,
      cacheSystem: true,
    });
    return NextResponse.json(payload);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
