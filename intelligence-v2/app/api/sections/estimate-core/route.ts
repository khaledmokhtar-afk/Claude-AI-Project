import { NextResponse } from "next/server";
import { generateJSON } from "@/lib/ai/client";
import { estimateCoreSystem, estimateCoreUser } from "@/lib/ai/prompts/estimate-core";
import { findAnalogs } from "@/lib/analogs";
import type { Brief, EstimateCore } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const brief = (await req.json()) as Brief;
    if (!brief?.projectBrief?.trim()) {
      return NextResponse.json({ error: "projectBrief is required" }, { status: 400 });
    }
    const analogs = findAnalogs(brief.projectBrief, 8);
    const payload = await generateJSON<EstimateCore>({
      system: estimateCoreSystem,
      user: estimateCoreUser(brief, analogs),
      model: "fast",
      maxTokens: 2200,
      cacheSystem: true,
    });
    if (!payload?.costUSDm?.likely) {
      return NextResponse.json({ error: "estimate-core missing costUSDm.likely" }, { status: 502 });
    }
    return NextResponse.json(payload);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
