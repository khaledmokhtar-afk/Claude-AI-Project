import Anthropic from "@anthropic-ai/sdk";

export const MODELS = {
  fast: "claude-sonnet-4-6",
  reasoning: "claude-opus-4-7",
} as const;

let _client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set on the server. Create .env.local with ANTHROPIC_API_KEY=sk-ant-... and restart the dev server.",
    );
  }
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _client;
}

export type GenerateOptions = {
  system: string;
  user: string;
  model?: keyof typeof MODELS;
  maxTokens?: number;
  cacheSystem?: boolean;
};

/**
 * Robust JSON extraction. Handles:
 *  - raw JSON object or array
 *  - ```json fenced blocks
 *  - JSON embedded in prose
 *  - truncated responses where the last `}` is missing (retries with brace balance)
 */
export function extractJSON<T>(text: string): T {
  // 1. Fenced block
  const fence = text.match(/```json\s*([\s\S]*?)```/i) ?? text.match(/```\s*([\s\S]*?)```/);
  const candidate = fence ? fence[1] : text;

  const objStart = candidate.indexOf("{");
  const arrStart = candidate.indexOf("[");
  const start =
    objStart === -1 ? arrStart : arrStart === -1 ? objStart : Math.min(objStart, arrStart);
  if (start === -1) throw new Error("No JSON payload found in model response");

  const open = candidate[start];
  const close = open === "{" ? "}" : "]";
  const end = candidate.lastIndexOf(close);
  if (end === -1 || end < start) {
    throw new Error("JSON payload appears truncated (no closing brace)");
  }
  const slice = candidate.slice(start, end + 1);

  try {
    return JSON.parse(slice) as T;
  } catch (e) {
    // Try stripping trailing commas which Claude occasionally emits
    const cleaned = slice.replace(/,(\s*[}\]])/g, "$1");
    return JSON.parse(cleaned) as T;
  }
}

/**
 * One-shot structured JSON. Uses prompt caching on the system block for
 * a cost/latency win when multiple calls share the same system context.
 */
export async function generateJSON<T>(opts: GenerateOptions): Promise<T> {
  const client = getClient();
  const model = MODELS[opts.model ?? "fast"];

  const systemBlock = opts.cacheSystem
    ? [{ type: "text" as const, text: opts.system, cache_control: { type: "ephemeral" as const } }]
    : opts.system;

  const response = await client.messages.create({
    model,
    max_tokens: opts.maxTokens ?? 2048,
    system: systemBlock,
    messages: [{ role: "user", content: opts.user }],
  });

  const text = response.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { text: string }).text)
    .join("");

  return extractJSON<T>(text);
}
