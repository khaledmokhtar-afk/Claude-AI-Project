import { NextResponse } from "next/server";
import { generateJSON, estimatePrompts } from "@iesl/ai";
import type { HistoricalProject } from "@iesl/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Estimate = {
  projectType: string;
  durationMonths: { low: number; likely: number; high: number };
  effortPersonMonths: { low: number; likely: number; high: number };
  costUSDm: { low: number; likely: number; high: number };
  contingencyPct: number;
  contingencyRationale: string;
  assumptions: string[];
  swingFactors: { label: string; lowUSDm: number; highUSDm: number }[];
  narrative: string;
};

export async function POST(req: Request) {
  try {
    const { query, analogs } = (await req.json()) as {
      query: string;
      analogs: HistoricalProject[];
    };
    const payload = await generateJSON<Estimate>({
      system: estimatePrompts.SYSTEM,
      user: estimatePrompts.user(
        query,
        analogs.map((a) => ({
          id: a.id,
          name: a.name,
          projectType: a.projectType,
          yearCompleted: a.yearCompleted,
          durationMonths: a.durationMonths,
          actualEffortPersonMonths: a.actualEffortPersonMonths,
          budgetUSDm: a.budgetUSDm,
          actualUSDm: a.actualUSDm,
          outcome: a.outcome,
          lessons: a.lessons,
        })),
      ),
      mode: "reasoning",
      cacheSystem: true,
      maxTokens: 3500,
    });
    return NextResponse.json(payload);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
