import type { SectionEvent } from "@/lib/types";

/**
 * Consume an SSE stream, yielding SectionEvent objects as they arrive.
 * Tolerates chunk boundaries mid-event (buffers until next double-newline).
 */
export async function* parseSSE(res: Response): AsyncGenerator<SectionEvent> {
  if (!res.body) return;
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let idx: number;
    while ((idx = buffer.indexOf("\n\n")) !== -1) {
      const frame = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 2);
      for (const line of frame.split("\n")) {
        if (!line.startsWith("data:")) continue;
        const raw = line.slice(5).trim();
        if (!raw) continue;
        try {
          yield JSON.parse(raw) as SectionEvent;
        } catch {
          // ignore malformed frame — the orchestrator only emits well-formed JSON,
          // so this guards against network-level corruption only.
        }
      }
    }
  }
}
