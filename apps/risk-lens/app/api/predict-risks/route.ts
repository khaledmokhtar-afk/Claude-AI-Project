import { NextResponse } from "next/server";
import { generateJSON, riskPrompts } from "@iesl/ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ExistingRisk = {
  title: string;
  category: string;
  likelihood: number;
  impact: number;
  status: string;
};

type AiPrediction = {
  newRisks: {
    title: string;
    category: string;
    likelihood: number;
    impact: number;
    trend: string;
    predicted30d: number;
    predicted60d: number;
    predicted90d: number;
    description: string;
    mitigation: string;
  }[];
  portfolioInsight: string;
};

export async function POST(req: Request) {
  try {
    const { projectSummary, existingRisks } = (await req.json()) as {
      projectSummary: string;
      existingRisks: ExistingRisk[];
    };
    const payload = await generateJSON<AiPrediction>({
      system: riskPrompts.SYSTEM,
      user: riskPrompts.user(projectSummary, existingRisks),
      mode: "reasoning",
      cacheSystem: true,
      maxTokens: 3500,
    });
    return NextResponse.json(payload);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
