import { streamText } from "@iesl/ai";
import type { ProjectSubmission, Workspace } from "@iesl/ui";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ChatMessage = { role: "user" | "assistant"; content: string };

type Body = {
  messages: ChatMessage[];
  workspace: Workspace;
  activeProject?: ProjectSubmission;
};

const BASE_SYSTEM = `You are Claude, the AI assistant embedded in the IESL Project Intelligence workspace — a unified tool for Nigerian energy-sector project managers, executives, and finance leads.
The workspace shows one project at a time across three lenses: plan & schedule, risks & mitigation, cost & resources. You always answer grounded in the active project's data — never invent vessel names, analog project names, or day-rates.
Tone: pragmatic, senior-consultant, non-promotional, no markdown, no bullet characters unless the user asks for them. Keep answers concise (under ~200 words) unless the user explicitly asks for depth.`;

function renderActiveProject(p: ProjectSubmission | undefined): string {
  if (!p) return "No project is currently active. The user is on the welcome screen.";
  const parts: string[] = [];
  parts.push(`PROJECT: ${p.title}`);
  if (p.meta.sector) parts.push(`Sector: ${p.meta.sector}`);
  if (p.meta.scale) parts.push(`Scale: ${p.meta.scale}`);
  if (p.meta.horizon) parts.push(`Horizon: ${p.meta.horizon}`);
  parts.push(`\nBRIEF:\n${p.input.slice(0, 1500)}`);

  const a = p.analysis;
  if (!a) {
    parts.push("\nNo analysis generated yet — the project has just been submitted.");
    return parts.join("\n");
  }

  parts.push(`\nSUMMARY: ${a.summary}`);

  parts.push(
    `\nPLAN: ${a.plan.tasks.length} tasks, ${a.plan.tasks.filter((t) => t.critical).length} on critical path.\nTop tasks: ${a.plan.tasks
      .slice(0, 10)
      .map((t) => `${t.id} ${t.name} (${t.durationDays}d${t.critical ? ", critical" : ""})`)
      .join("; ")}`,
  );

  parts.push(
    `\nRISKS (${a.risks.newRisks.length}). Insight: ${a.risks.portfolioInsight}\nTop: ${a.risks.newRisks
      .slice(0, 5)
      .map((r) => `${r.category} — ${r.title} (L${r.likelihood}×I${r.impact})`)
      .join("; ")}`,
  );

  parts.push(
    `\nESTIMATE: ${a.estimate.projectType}. Cost P50 USD ${a.estimate.costUSDm.likely}m (low ${a.estimate.costUSDm.low} / high ${a.estimate.costUSDm.high}). Contingency ${a.estimate.contingencyPct}% — ${a.estimate.contingencyRationale}. Top swings: ${a.estimate.swingFactors
      .slice(0, 3)
      .map((s) => `${s.label} (${s.lowUSDm}..+${s.highUSDm})`)
      .join("; ")}.`,
  );

  return parts.join("\n");
}

function renderTranscript(messages: ChatMessage[]): string {
  return messages
    .map((m) => `${m.role === "user" ? "USER" : "ASSISTANT"}: ${m.content}`)
    .join("\n\n");
}

export async function POST(req: Request) {
  const encoder = new TextEncoder();
  try {
    const body = (await req.json()) as Body;
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const activeProject = body.activeProject;

    const system = `${BASE_SYSTEM}\n\nCURRENT PROJECT:\n${renderActiveProject(activeProject)}`;
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
