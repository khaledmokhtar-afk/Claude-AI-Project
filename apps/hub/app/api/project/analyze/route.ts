import { generateJSON } from "@iesl/ai";
import { SYSTEM as SCOPE_SYSTEM, user as scopeUser } from "@iesl/ai/prompts/scope-to-wbs";
import { SYSTEM as RISK_SYSTEM, user as riskUser } from "@iesl/ai/prompts/risk-prediction";
import { SYSTEM as EST_SYSTEM, user as estUser } from "@iesl/ai/prompts/estimate";
import { findAnalogs } from "@iesl/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

type ReqBody = {
  projectBrief: string;
  sector?: string;
  scale?: string;
  horizon?: string;
};

type PlanShape = {
  projectName?: string;
  summary?: string;
  tasks?: Array<{ id: string; name: string; durationDays: number; critical?: boolean; dependsOn?: string[]; resource?: string }>;
  milestones?: Array<{ id: string; name: string; dayOffset: number; type: string; description?: string }>;
  phaseSummaries?: Array<{ phaseId: string; name: string; durationDays: number; primaryDriver: string; resourcesPeak: string[]; riskFlag?: string }>;
  resourceLoad?: Array<{ resource: string; totalDays: number; peakConcurrency: number }>;
  scheduleStrategy?: { approach: string; bufferStrategy: string; resourceConstraints: string[]; schedulingMethod: string };
};
type RiskShape = {
  newRisks?: Array<{
    title: string; category: string; likelihood: number; impact: number; trend: string;
    predicted30d: number; predicted60d: number; predicted90d: number;
    description: string; mitigation: string;
    isoStandards?: Array<{ standard: string; clause?: string; application: string }>;
    controls?: Array<{ type: string; description: string }>;
    residualLikelihood?: number; residualImpact?: number;
    owner?: string; dueWithinDays?: number;
  }>;
  portfolioInsight?: string;
  isoFramework?: Array<{ standard: string; title: string; appliesTo: string[]; whyRelevant: string }>;
  topActions?: Array<{ action: string; owner: string; dueWithinDays: number }>;
};
type EstShape = {
  projectType?: string;
  durationMonths?: { low: number; likely: number; high: number };
  effortPersonMonths?: { low: number; likely: number; high: number };
  costUSDm?: { low: number; likely: number; high: number };
  contingencyPct?: number;
  contingencyRationale?: string;
  assumptions?: string[];
  swingFactors?: Array<{ label: string; lowUSDm: number; highUSDm: number }>;
  narrative?: string;
  costBreakdown?: Array<{ category: string; amountUSDm: number; basis: string }>;
  personnel?: Array<{ role: string; count: number; monthlyRateUSD: number; totalPersonMonths: number; totalCostUSDm: number }>;
  methodology?: Array<{ step: number; title: string; detail: string }>;
  analogScaling?: Array<{ analogName: string; scalingFactor: string; contribution: string }>;
};

function validatePlan(p: PlanShape): string | null {
  if (!p.tasks || !Array.isArray(p.tasks) || p.tasks.length === 0)
    return "plan.tasks is missing or empty";
  for (const t of p.tasks) {
    if (!t.id || !t.name || typeof t.durationDays !== "number")
      return `plan.task malformed: ${JSON.stringify(t).slice(0, 120)}`;
  }
  return null;
}

function validateRisks(r: RiskShape): string | null {
  if (!r.newRisks || !Array.isArray(r.newRisks) || r.newRisks.length === 0)
    return "risks.newRisks is missing or empty";
  for (const x of r.newRisks) {
    if (!x.title || typeof x.likelihood !== "number" || typeof x.impact !== "number")
      return `risks.risk malformed: ${JSON.stringify(x).slice(0, 120)}`;
  }
  return null;
}

function validateEstimate(e: EstShape): string | null {
  if (!e.costUSDm || typeof e.costUSDm.likely !== "number")
    return "estimate.costUSDm.likely is missing";
  if (!e.durationMonths || typeof e.durationMonths.likely !== "number")
    return "estimate.durationMonths.likely is missing";
  if (!Array.isArray(e.swingFactors))
    return "estimate.swingFactors is not an array";
  if (!Array.isArray(e.assumptions))
    return "estimate.assumptions is not an array";
  return null;
}

export async function POST(req: Request) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return new Response(
        "ANTHROPIC_API_KEY is not set on the server. Create apps/hub/.env.local with ANTHROPIC_API_KEY=sk-ant-... and restart pnpm dev.",
        { status: 500 },
      );
    }

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

    const startedAt = Date.now();

    const [planRes, risksRes, estRes] = await Promise.allSettled([
      generateJSON<PlanShape>({
        system: SCOPE_SYSTEM,
        user: scopeUser(fullBrief),
        mode: "fast",
        cacheSystem: true,
        maxTokens: 6144,
      }),
      generateJSON<RiskShape>({
        system: RISK_SYSTEM,
        user: riskUser(fullBrief, []),
        mode: "fast",
        cacheSystem: true,
        maxTokens: 6144,
      }),
      generateJSON<EstShape>({
        system: EST_SYSTEM,
        user: estUser(fullBrief, analogs),
        mode: "fast",
        cacheSystem: true,
        maxTokens: 6144,
      }),
    ]);

    const elapsedMs = Date.now() - startedAt;
    console.log(`[analyze] Claude responded in ${elapsedMs}ms`);

    const failures: string[] = [];
    if (planRes.status === "rejected") failures.push(`Plan call failed: ${(planRes.reason as Error).message}`);
    if (risksRes.status === "rejected") failures.push(`Risks call failed: ${(risksRes.reason as Error).message}`);
    if (estRes.status === "rejected") failures.push(`Estimate call failed: ${(estRes.reason as Error).message}`);
    if (failures.length > 0) {
      console.error("[analyze] failures:", failures);
      return new Response(failures.join("\n"), { status: 502 });
    }

    const plan = (planRes as PromiseFulfilledResult<PlanShape>).value;
    const risks = (risksRes as PromiseFulfilledResult<RiskShape>).value;
    const estimate = (estRes as PromiseFulfilledResult<EstShape>).value;

    const planErr = validatePlan(plan);
    const riskErr = validateRisks(risks);
    const estErr = validateEstimate(estimate);
    const validationErrors = [planErr, riskErr, estErr].filter(Boolean);
    if (validationErrors.length > 0) {
      console.error("[analyze] validation errors:", validationErrors);
      return new Response(
        `Claude returned malformed JSON:\n• ${validationErrors.join("\n• ")}`,
        { status: 502 },
      );
    }

    return Response.json({
      projectName: plan.projectName ?? "Untitled Project",
      summary: plan.summary ?? "",
      plan,
      risks,
      estimate,
      analogs,
      _meta: { elapsedMs },
    });
  } catch (err) {
    const msg = (err as Error).message || "Unknown error";
    console.error("[/api/project/analyze] Exception:", err);
    return new Response(msg, { status: 500 });
  }
}
