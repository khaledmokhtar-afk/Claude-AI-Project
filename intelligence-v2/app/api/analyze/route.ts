import { generateJSON } from "@/lib/ai/client";
import { findAnalogs } from "@/lib/analogs";
import { planCoreSystem, planCoreUser } from "@/lib/ai/prompts/plan-core";
import { planExtrasSystem, planExtrasUser } from "@/lib/ai/prompts/plan-extras";
import { riskRegisterSystem, riskRegisterUser } from "@/lib/ai/prompts/risk-register";
import { riskActionsSystem, riskActionsUser } from "@/lib/ai/prompts/risk-actions";
import { estimateCoreSystem, estimateCoreUser } from "@/lib/ai/prompts/estimate-core";
import { estimateTraceSystem, estimateTraceUser } from "@/lib/ai/prompts/estimate-trace";
import type {
  Brief,
  EstimateCore,
  EstimateTrace,
  PlanCore,
  PlanExtras,
  RiskActions,
  RiskRegister,
  SectionEvent,
  SectionId,
} from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 300;

type EventWriter = (event: SectionEvent) => void;

function sseLine(event: SectionEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

async function runSection<T>(
  id: SectionId,
  write: EventWriter,
  work: () => Promise<T>,
): Promise<T | null> {
  write({ id, status: "streaming" });
  try {
    const payload = await work();
    write({ id, status: "ready", payload });
    return payload;
  } catch (e) {
    const error = e instanceof Error ? e.message : "Unknown error";
    write({ id, status: "failed", error });
    return null;
  }
}

export async function POST(req: Request) {
  const brief = (await req.json()) as Brief;
  if (!brief?.projectBrief?.trim()) {
    return new Response(JSON.stringify({ error: "projectBrief is required" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      const write: EventWriter = (event) => {
        controller.enqueue(enc.encode(sseLine(event)));
      };
      const analogs = findAnalogs(brief.projectBrief, 8);

      // Kick off the three independent chains in parallel. Each chain is sequential
      // internally (core must finish before extras/actions/trace can run).
      const planChain = (async () => {
        const core = await runSection<PlanCore>("plan-core", write, () =>
          generateJSON<PlanCore>({
            system: planCoreSystem,
            user: planCoreUser(brief),
            model: "fast",
            maxTokens: 2400,
            cacheSystem: true,
          }),
        );
        if (!core) return;
        await runSection<PlanExtras>("plan-extras", write, () =>
          generateJSON<PlanExtras>({
            system: planExtrasSystem,
            user: planExtrasUser(brief, core),
            model: "fast",
            maxTokens: 2400,
            cacheSystem: true,
          }),
        );
      })();

      const riskChain = (async () => {
        const register = await runSection<RiskRegister>("risk-register", write, () =>
          generateJSON<RiskRegister>({
            system: riskRegisterSystem,
            user: riskRegisterUser(brief),
            model: "reasoning",
            maxTokens: 2600,
            cacheSystem: true,
          }),
        );
        if (!register) return;
        await runSection<RiskActions>("risk-actions", write, () =>
          generateJSON<RiskActions>({
            system: riskActionsSystem,
            user: riskActionsUser(brief, register),
            model: "fast",
            maxTokens: 1800,
            cacheSystem: true,
          }),
        );
      })();

      const estimateChain = (async () => {
        const core = await runSection<EstimateCore>("estimate-core", write, () =>
          generateJSON<EstimateCore>({
            system: estimateCoreSystem,
            user: estimateCoreUser(brief, analogs),
            model: "fast",
            maxTokens: 2200,
            cacheSystem: true,
          }),
        );
        if (!core) return;
        await runSection<EstimateTrace>("estimate-trace", write, () =>
          generateJSON<EstimateTrace>({
            system: estimateTraceSystem,
            user: estimateTraceUser(brief, core, analogs),
            model: "reasoning",
            maxTokens: 2600,
            cacheSystem: true,
          }),
        );
      })();

      await Promise.allSettled([planChain, riskChain, estimateChain]);
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
      "x-accel-buffering": "no",
    },
  });
}
