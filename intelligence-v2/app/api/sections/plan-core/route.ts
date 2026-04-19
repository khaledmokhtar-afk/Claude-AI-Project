import { NextResponse } from "next/server";
import { generateJSON } from "@/lib/ai/client";
import { planCoreSystem, planCoreUser } from "@/lib/ai/prompts/plan-core";
import type { Brief, PlanCore } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const brief = (await req.json()) as Brief;
    if (!brief?.projectBrief?.trim()) {
      return NextResponse.json({ error: "projectBrief is required" }, { status: 400 });
    }
    const payload = await generateJSON<PlanCore>({
      system: planCoreSystem,
      user: planCoreUser(brief),
      model: "fast",
      maxTokens: 2400,
      cacheSystem: true,
    });
    if (!payload?.tasks?.length) {
      return NextResponse.json({ error: "plan-core returned no tasks" }, { status: 502 });
    }
    return NextResponse.json(payload);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
