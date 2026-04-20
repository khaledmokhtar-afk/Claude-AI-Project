"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useWorkspace } from "@iesl/ui";

type ChatMessage = { role: "user" | "assistant"; content: string };

export function ClaudePanel({ apiKeyPresent }: { apiKeyPresent: boolean }) {
  const { workspace, activeProject } = useWorkspace();

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
    if (!prompt || streaming || !apiKeyPresent) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: prompt }];
    setMessages(nextMessages);
    setInput("");
    setStreaming(true);
    setMessages((m) => [...m, { role: "assistant", content: "" }]);

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages,
          workspace,
          activeProject,
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
  }, [input, messages, apiKeyPresent, workspace, activeProject, streaming]);

  const stop = () => abortRef.current?.abort();

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 btn-primary"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 11V3l4 2.5L10 3v8L6 8.5 2 11z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
        Ask Claude
      </button>
    );
  }

  return (
    <aside
      className="hidden lg:flex flex-col w-[380px] shrink-0 border-l border-[var(--color-line)] bg-[var(--color-bg-soft)]"
      style={{ height: "calc(100vh - 62px)", position: "sticky", top: 62 }}
    >
      <div className="px-4 py-3.5 border-b border-[var(--color-line)] flex items-center gap-3 bg-[var(--color-card)]">
        <div className="w-8 h-8 rounded-lg grid place-items-center shrink-0"
             style={{ background: "var(--color-brand-soft)" }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color: "var(--color-brand-ink)" }}>
            <path d="M2 11V3l4 2.5L10 3v8L6 8.5 2 11z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[14px] font-medium leading-tight text-[var(--color-ink)]">
            Claude workspace chat
          </div>
          <div className="text-[10.5px] text-[var(--color-ink-4)] uppercase tracking-[0.16em] font-mono mt-0.5 truncate">
            {activeProject ? `${activeProject.title.slice(0, 28)} · ` : ""}
            {apiKeyPresent ? "Live" : "Offline"}
          </div>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="text-[var(--color-ink-4)] hover:text-[var(--color-ink)] transition-colors w-7 h-7 grid place-items-center rounded-md hover:bg-[var(--color-card-soft)]"
          aria-label="Hide Claude panel"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-auto px-4 py-4 space-y-3">
        {!apiKeyPresent && (
          <div className="text-[12.5px] leading-relaxed space-y-2 p-4 rounded-xl card">
            <div className="font-medium text-[var(--color-bad)]">Claude is offline</div>
            <p className="text-[var(--color-ink-3)]">
              Add <code className="font-mono text-[var(--color-ink)] px-1 rounded bg-[var(--color-card-soft)]">ANTHROPIC_API_KEY</code> to{" "}
              <code className="font-mono text-[var(--color-ink)] px-1 rounded bg-[var(--color-card-soft)]">apps/hub/.env.local</code> and restart{" "}
              <code className="font-mono text-[var(--color-ink)] px-1 rounded bg-[var(--color-card-soft)]">pnpm dev</code>.
            </p>
          </div>
        )}
        {apiKeyPresent && messages.length === 0 && (
          <div className="text-[13px] text-[var(--color-ink-3)] leading-[1.6] space-y-2.5">
            <p>
              Ask Claude anything about the current project. It sees the plan, risks, and estimate
              so responses stay grounded in your brief.
            </p>
            <p className="text-[var(--color-ink-4)] uppercase tracking-wider text-[10px] font-mono">Try</p>
            <ul className="space-y-1.5">
              {[
                "Summarise the current project for the ED.",
                "Which three decisions move the P80 most?",
                "What's the weakest link in the current plan?",
              ].map((s) => (
                <li key={s} className="pl-3 border-l-2 border-[var(--color-line-strong)]">&ldquo;{s}&rdquo;</li>
              ))}
            </ul>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : "flex"}>
            <div
              className={`max-w-[90%] text-[13.5px] leading-[1.55] rounded-xl px-3.5 py-2.5 whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-[var(--color-ink)] text-[#FAFAF7]"
                  : "card text-[var(--color-ink)]"
              }`}
            >
              {m.content || (streaming && i === messages.length - 1 ? <span className="cursor-blink">▍</span> : "")}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-[var(--color-line)] p-3 bg-[var(--color-card)]">
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
            disabled={!apiKeyPresent}
            placeholder={
              apiKeyPresent
                ? "Ask Claude about this project…"
                : "Set ANTHROPIC_API_KEY to enable chat"
            }
            className="textarea flex-1 resize-none text-[13px]"
          />
          {streaming ? (
            <button onClick={stop} className="btn-ghost">Stop</button>
          ) : (
            <button
              onClick={send}
              disabled={!input.trim() || !apiKeyPresent}
              className="btn-primary"
            >
              Send
            </button>
          )}
        </div>
        <div className="text-[10.5px] text-[var(--color-ink-4)] mt-2 font-mono">
          Enter to send · Shift+Enter for newline
        </div>
      </div>
    </aside>
  );
}
