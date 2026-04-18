import { generateJSON } from "@iesl/ai";
import { SYSTEM as SCOPE_SYSTEM, user as scopeUser } from "@iesl/ai/prompts/scope-to-wbs";
import { SYSTEM as RISK_SYSTEM, user as riskUser } from "@iesl/ai/prompts/risk-prediction";
import { SYSTEM as EST_SYSTEM, user as estUser } from "@iesl/ai/prompts/estimate";
import { findAnalogs } from "@iesl/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ReqBody = {
  projectBrief: string;
  sector?: string;
  scale?: string;
  horizon?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ReqBody;
    const { projectBrief, sector, scale, horizon } = body;

    if (!projectBrief || projectBrief.trim().length < 30) {
      return new Response("projectBrief must be at least 30 characters", { status: 400 });
    }

    const contextParts = [
      sector && `Sector: ${sector}`,
      scale && `Project scale: ${scale}`,
      horizon && `Time horizon: ${horizon}`,
    ].filter(Boolean);

    const fullBrief = contextParts.length
      ? `${projectBrief}\n\n[Context: ${contextParts.join(" | ")}]`
      : projectBrief;

    const analogs = findAnalogs(fullBrief, 5);

    const [plan, risks, estimate] = await Promise.all([
      generateJSON({
        system: SCOPE_SYSTEM,
        user: scopeUser(fullBrief),
        mode: "fast",
        cacheSystem: true,
        maxTokens: 4096,
      }),
      generateJSON({
        system: RISK_SYSTEM,
        user: riskUser(fullBrief, []),
        mode: "fast",
        cacheSystem: true,
        maxTokens: 4096,
      }),
      generateJSON({
        system: EST_SYSTEM,
        user: estUser(fullBrief, analogs),
        mode: "fast",
        cacheSystem: true,
        maxTokens: 4096,
      }),
    ]);

    const p = plan as { projectName?: string; summary?: string };

    return Response.json({
      projectName: p.projectName ?? "Project Analysis",
      summary: p.summary ?? "",
      plan,
      risks,
      estimate,
      analogs,
    });
  } catch (err) {
    console.error("[/api/project/analyze]", err);
    return new Response((err as Error).message || "Analysis failed", { status: 500 });
  }
}
