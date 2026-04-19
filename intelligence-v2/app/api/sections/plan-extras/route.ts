import { NextResponse } from "next/server";
import { generateJSON } from "@/lib/ai/client";
import { planExtrasSystem, planExtrasUser } from "@/lib/ai/prompts/plan-extras";
import type { Brief, PlanCore, PlanExtras } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { brief, core } = (await req.json()) as { brief: Brief; core: PlanCore };
    if (!brief?.projectBrief?.trim() || !core?.tasks?.length) {
      return NextResponse.json({ error: "brief and plan-core required" }, { status: 400 });
    }
    const payload = await generateJSON<PlanExtras>({
      system: planExtrasSystem,
      user: planExtrasUser(brief, core),
      model: "fast",
      maxTokens: 2400,
      cacheSystem: true,
    });
    return NextResponse.json(payload);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
