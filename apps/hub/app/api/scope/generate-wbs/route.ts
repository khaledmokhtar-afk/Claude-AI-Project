import { NextResponse } from "next/server";
import { generateJSON, scopePrompts } from "@iesl/ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type WBSResponse = {
  projectName: string;
  summary: string;
  tasks: {
    id: string;
    name: string;
    durationDays: number;
    dependsOn?: string[];
    critical?: boolean;
    resource?: string;
  }[];
};

export async function POST(req: Request) {
  try {
    const { scope } = (await req.json()) as { scope: string };
    if (!scope || scope.trim().length < 20) {
      return NextResponse.json({ error: "Scope is too short." }, { status: 400 });
    }
    const payload = await generateJSON<WBSResponse>({
      system: scopePrompts.SYSTEM,
      user: scopePrompts.user(scope),
      mode: "fast",
      cacheSystem: true,
      maxTokens: 3000,
    });
    return NextResponse.json(payload);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
