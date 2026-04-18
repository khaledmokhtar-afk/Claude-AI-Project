import { streamText } from "@iesl/ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NARRATE_SYSTEM = `You are a senior risk analyst at IESL reasoning aloud.
Narrate your predictive-model reasoning for an energy-sector project in Nigeria.
- 6-9 short lines, each under 100 chars.
- Mention the analog history you'd draw from, the categories that dominate, and
  one surprising insight. Do not invent numbers. Pragmatic, non-promotional tone.
- No markdown. No bullet characters.`;

export async function POST(req: Request) {
  const { projectSummary } = (await req.json()) as { projectSummary: string };

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of streamText({
          system: NARRATE_SYSTEM,
          user: `Project brief:\n${projectSummary}\n\nNarrate your reasoning now.`,
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
