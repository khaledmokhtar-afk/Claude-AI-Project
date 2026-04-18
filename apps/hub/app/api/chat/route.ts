import { streamText } from "@iesl/ai";
import type { SuiteApp, Workspace } from "@iesl/ui";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ChatMessage = { role: "user" | "assistant"; content: string };

type Body = {
  messages: ChatMessage[];
  activeApp: SuiteApp;
  workspace: Workspace;
};

const BASE_SYSTEM = `You are Claude, the shared AI assistant embedded in the IESL AI Suite — a three-product workspace (RiskLens, ScopeSmith, EstimatorAI) for Nigerian energy-sector projects.
You always answer with the current workspace as context, so responses stay grounded in the user's actual scope, WBS, risks, or estimates.
Tone: pragmatic, senior-consultant, non-promotional, no markdown, no bullet characters unless the user asks for them. Keep answers concise (under ~200 words) unless the user explicitly asks for depth.`;

const APP_HINT: Record<SuiteApp, string> = {
  risk:
    "The user is currently in the RiskLens tab. Favour risk-register framing, L×I scoring, 30/60/90 forecasts, and portfolio insights.",
  scope:
    "The user is currently in the ScopeSmith tab. Favour WBS structure, critical-path reasoning, resource contention, and schedule risk.",
  estimator:
    "The user is currently in the EstimatorAI tab. Favour analog-driven reasoning, P50/P80 bands, contingency rationale, and swing-factor leverage.",
};

function renderWorkspace(w: Workspace): string {
  const parts: string[] = [];
  if (w.scope) {
    parts.push(
      `SCOPE: ${w.scope.projectName} — ${w.scope.summary}\nBrief:\n${w.scope.text.slice(0, 1200)}`,
    );
  }
  if (w.wbs) {
    parts.push(
      `WBS: ${w.wbs.projectName} — ${w.wbs.tasks.length} tasks, ${w.wbs.tasks.filter((t) => t.critical).length} critical.\nTop tasks: ${w.wbs.tasks
        .slice(0, 10)
        .map((t) => `${t.id} ${t.name} (${t.durationDays}d${t.critical ? ", critical" : ""})`)
        .join("; ")}`,
    );
  }
  if (w.risks) {
    parts.push(
      `RISKS (${w.risks.newRisks.length} new). Insight: ${w.risks.portfolioInsight}\nTop: ${w.risks.newRisks
        .slice(0, 5)
        .map((r) => `${r.category} — ${r.title} (L${r.likelihood}×I${r.impact})`)
        .join("; ")}`,
    );
  }
  if (w.estimate) {
    parts.push(
      `ESTIMATE: ${w.estimate.projectType}. Cost P50 USD ${w.estimate.costUSDm.likely}m (low ${w.estimate.costUSDm.low} / high ${w.estimate.costUSDm.high}). Contingency ${w.estimate.contingencyPct}% — ${w.estimate.contingencyRationale}. Top swings: ${w.estimate.swingFactors
        .slice(0, 3)
        .map((s) => `${s.label} (${s.lowUSDm}..+${s.highUSDm})`)
        .join("; ")}.`,
    );
  }
  return parts.length ? parts.join("\n\n") : "No workspace data yet. The user has not produced a scope, WBS, risks, or estimate.";
}

function renderTranscript(messages: ChatMessage[]): string {
  // The /api/chat endpoint expects a single streamText() call; collapse the
  // transcript into the user turn with clear role labels so the model can
  // follow the conversation.
  return messages
    .map((m) => `${m.role === "user" ? "USER" : "ASSISTANT"}: ${m.content}`)
    .join("\n\n");
}

export async function POST(req: Request) {
  const encoder = new TextEncoder();
  try {
    const body = (await req.json()) as Body;
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const activeApp: SuiteApp =
      body.activeApp === "risk" || body.activeApp === "estimator" || body.activeApp === "scope"
        ? body.activeApp
        : "scope";
    const workspace: Workspace = body.workspace ?? { mode: "ai" };

    const system = `${BASE_SYSTEM}\n\n${APP_HINT[activeApp]}\n\nCURRENT WORKSPACE:\n${renderWorkspace(workspace)}`;
    const user = renderTranscript(messages);

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamText({
            system,
            user,
            mode: "fast",
            cacheSystem: true,
            maxTokens: 800,
          })) {
            controller.enqueue(encoder.encode(chunk));
          }
        } catch (err) {
          controller.enqueue(encoder.encode(`\n[error: ${(err as Error).message}]`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err) {
    return new Response(`chat error: ${(err as Error).message}`, { status: 500 });
  }
}
