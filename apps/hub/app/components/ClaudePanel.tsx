"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useWorkspace, type SuiteApp } from "@iesl/ui";

type ChatMessage = { role: "user" | "assistant"; content: string };

function activeAppFromPath(path: string): SuiteApp {
  if (path.startsWith("/suite/risk")) return "risk";
  if (path.startsWith("/suite/estimator")) return "estimator";
  return "scope";
}

const APP_LABELS: Record<SuiteApp, string> = {
  risk: "RiskLens",
  scope: "ScopeSmith",
  estimator: "EstimatorAI",
};

export function ClaudePanel({ apiKeyPresent }: { apiKeyPresent: boolean }) {
  const pathname = usePathname() ?? "/suite/scope";
  const activeApp = activeAppFromPath(pathname);
  const { workspace, mode } = useWorkspace();

  const [open, setOpen] = useState(true);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streaming]);

  const send = useCallback(async () => {
    const prompt = input.trim();
    if (!prompt || streaming) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: prompt }];
    setMessages(nextMessages);
    setInput("");
    setStreaming(true);

    // Placeholder assistant message we grow as tokens arrive.
    setMessages((m) => [...m, { role: "assistant", content: "" }]);

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      if (mode === "demo" || !apiKeyPresent) {
        const canned = demoReply(activeApp, workspace);
        for (const chunk of canned) {
          if (ctrl.signal.aborted) break;
          await new Promise((r) => setTimeout(r, 18));
          setMessages((m) => {
            const copy = [...m];
            copy[copy.length - 1] = {
              role: "assistant",
              content: copy[copy.length - 1].content + chunk,
            };
            return copy;
          });
        }
        return;
      }

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages,
          activeApp,
          workspace,
        }),
        signal: ctrl.signal,
      });
      if (!res.ok || !res.body) {
        const errText = await res.text().catch(() => res.statusText);
        throw new Error(errText || `Chat failed (${res.status})`);
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = {
            role: "assistant",
            content: copy[copy.length - 1].content + chunk,
          };
          return copy;
        });
      }
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = {
          role: "assistant",
          content: `⚠ ${(e as Error).message}`,
        };
        return copy;
      });
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }, [input, messages, mode, apiKeyPresent, activeApp, workspace, streaming]);

  const stop = () => abortRef.current?.abort();

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-full text-sm font-semibold glass glow-primary"
        style={{ background: "var(--color-surface)" }}
      >
        ⚡ Claude
      </button>
    );
  }

  return (
    <aside
      className="hidden lg:flex flex-col w-[380px] shrink-0 border-l border-[var(--color-border)] bg-[var(--color-bg)]/60 backdrop-blur"
      style={{ height: "calc(100vh - 57px)", position: "sticky", top: 57 }}
    >
      <div className="px-4 py-3 border-b border-[var(--color-border)] flex items-center gap-3">
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center text-[11px] font-bold"
          style={{ background: "rgba(16,185,129,0.15)", color: "#34D399" }}
        >
          ⚡
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold leading-tight">Claude workspace chat</div>
          <div className="text-[11px] text-[var(--color-text-muted)]">
            Context: {APP_LABELS[activeApp]} · {mode === "ai" ? "AI Mode" : "Demo Mode"}
          </div>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="text-xs text-[var(--color-text-muted)] hover:text-white px-2 py-1 rounded"
          aria-label="Hide Claude panel"
        >
          ×
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-xs text-[var(--color-text-muted)] leading-relaxed space-y-2">
            <p>
              Ask Claude about the current {APP_LABELS[activeApp]} workspace. It sees whatever scope,
              WBS, risks, or estimates you have in progress, so responses stay grounded.
            </p>
            <p>Try:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>&quot;Summarise the current project for the ED.&quot;</li>
              <li>&quot;Which three decisions move the P80 most?&quot;</li>
              <li>&quot;What&apos;s the weakest link in the current plan?&quot;</li>
            </ul>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : ""}>
            <div
              className={`inline-block max-w-[90%] text-sm rounded-lg px-3 py-2 whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-[var(--color-scope)]/25 text-white"
                  : "bg-white/5 text-[var(--color-text)]"
              }`}
            >
              {m.content || (streaming && i === messages.length - 1 ? "…" : "")}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-[var(--color-border)] p-3">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={2}
            placeholder={
              mode === "ai" && apiKeyPresent
                ? "Ask Claude about this workspace…"
                : "Demo Mode — replies are canned"
            }
            className="flex-1 text-sm p-2 rounded-md bg-black/30 border border-white/10 resize-none focus:outline-none focus:border-[var(--color-scope)]"
          />
          {streaming ? (
            <button
              onClick={stop}
              className="px-3 py-2 text-xs font-semibold rounded-md bg-white/10 text-white"
            >
              Stop
            </button>
          ) : (
            <button
              onClick={send}
              disabled={!input.trim()}
              className="px-3 py-2 text-xs font-semibold rounded-md disabled:opacity-40"
              style={{ background: "var(--color-estimator)", color: "#0B1120" }}
            >
              Send
            </button>
          )}
        </div>
        <div className="text-[10px] text-[var(--color-text-muted)] mt-1.5">
          Enter to send · Shift+Enter for newline
        </div>
      </div>
    </aside>
  );
}

function demoReply(app: SuiteApp, workspace: ReturnType<typeof useWorkspace>["workspace"]): string[] {
  const lines: string[] = [];
  lines.push(`Demo Mode summary for ${APP_LABELS[app]}:\n\n`);
  if (workspace.scope) {
    lines.push(`• Scope loaded — "${workspace.scope.projectName}". ${workspace.scope.summary}\n`);
  }
  if (workspace.wbs) {
    lines.push(`• WBS has ${workspace.wbs.tasks.length} tasks. Critical path spans ${workspace.wbs.tasks.filter((t) => t.critical).length} items.\n`);
  }
  if (workspace.risks) {
    lines.push(`• ${workspace.risks.newRisks.length} new risks detected. Portfolio insight: ${workspace.risks.portfolioInsight}\n`);
  }
  if (workspace.estimate) {
    lines.push(`• P50 cost USD ${workspace.estimate.costUSDm.likely.toFixed(1)}m; contingency ${workspace.estimate.contingencyPct}%.\n`);
  }
  if (lines.length === 1) {
    lines.push("No workspace data yet. Switch to AI Mode or run a flow in one of the three tabs to seed context.");
  }
  // Break into chunks so the UI looks like it's streaming.
  return lines.flatMap((l) => l.match(/.{1,18}/g) ?? [l]);
}
