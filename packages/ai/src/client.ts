import Anthropic from "@anthropic-ai/sdk";

// Keep the latest-capable models centralised so we can swap easily.
export const MODELS = {
  fast: "claude-sonnet-4-6",
  reasoning: "claude-opus-4-7",
} as const;

export type ClaudeMode = "fast" | "reasoning";

let _client: Anthropic | null = null;

export function getClient(apiKey?: string): Anthropic {
  const key = apiKey ?? process.env.ANTHROPIC_API_KEY;
  if (!key) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Copy .env.example to .env.local and add your key, or switch the app to Demo Mode.",
    );
  }
  if (!_client) {
    _client = new Anthropic({ apiKey: key });
  }
  return _client;
}

export function hasApiKey(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export type StreamOptions = {
  system: string;
  user: string;
  mode?: ClaudeMode;
  maxTokens?: number;
  cacheSystem?: boolean;
};

/**
 * Streams plain-text tokens from Claude. Uses prompt caching on the system
 * message when cacheSystem is true — a big cost/latency win during the
 * workshop because every attendee exercises the same system prompt.
 */
export async function* streamText(opts: StreamOptions): AsyncGenerator<string, void, unknown> {
  const client = getClient();
  const model = MODELS[opts.mode ?? "fast"];

  const systemBlock = opts.cacheSystem
    ? [{ type: "text" as const, text: opts.system, cache_control: { type: "ephemeral" as const } }]
    : opts.system;

  const stream = client.messages.stream({
    model,
    max_tokens: opts.maxTokens ?? 2048,
    system: systemBlock,
    messages: [{ role: "user", content: opts.user }],
  });

  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      yield event.delta.text;
    }
  }
}

/**
 * One-shot (non-streaming) structured JSON response. Falls back to best-effort
 * extraction if the model wraps JSON in prose.
 */
export async function generateJSON<T>(opts: StreamOptions): Promise<T> {
  const client = getClient();
  const model = MODELS[opts.mode ?? "fast"];

  const systemBlock = opts.cacheSystem
    ? [{ type: "text" as const, text: opts.system, cache_control: { type: "ephemeral" as const } }]
    : opts.system;

  const response = await client.messages.create({
    model,
    max_tokens: opts.maxTokens ?? 4096,
    system: systemBlock,
    messages: [{ role: "user", content: opts.user }],
  });

  const text = response.content
    .filter((block) => block.type === "text")
    .map((block) => (block as { text: string }).text)
    .join("");

  const jsonStart = text.indexOf("{");
  const jsonEnd = text.lastIndexOf("}");
  const arrStart = text.indexOf("[");
  const arrEnd = text.lastIndexOf("]");

  const useArr =
    arrStart !== -1 && (jsonStart === -1 || arrStart < jsonStart);
  const start = useArr ? arrStart : jsonStart;
  const end = useArr ? arrEnd : jsonEnd;

  if (start === -1 || end === -1 || end < start) {
    throw new Error("No JSON payload found in model response:\n" + text);
  }
  return JSON.parse(text.slice(start, end + 1)) as T;
}
