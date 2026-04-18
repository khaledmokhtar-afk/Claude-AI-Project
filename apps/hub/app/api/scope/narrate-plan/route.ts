import { streamText } from "@iesl/ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NARRATION_SYSTEM = `You are an AI project planner reasoning aloud about a scope.
Narrate your plan-building process in 6-10 short lines.
Mention:
- what you noticed in the scope (phases, risks, resource needs),
- the critical path candidate,
- any resource contention,
- when you'd sequence community / permit work relative to offshore work.
Keep each line under 90 characters. Use a pragmatic, non-promotional tone. No markdown.`;

export async function POST(req: Request) {
  const { scope } = (await req.json()) as { scope: string };

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of streamText({
          system: NARRATION_SYSTEM,
          user: `Scope:\n${scope}\n\nNarrate your reasoning now.`,
          mode: "fast",
          cacheSystem: true,
          maxTokens: 500,
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
}
