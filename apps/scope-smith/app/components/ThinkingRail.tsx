"use client";

export function ThinkingRail({ text, isStreaming }: { text: string; isStreaming: boolean }) {
  return (
    <div className="glass p-6 animate-fade-up">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full bg-[var(--color-accent)] cursor-blink" />
        <div className="text-xs uppercase tracking-wider text-[var(--color-accent)] font-medium">
          Reasoning
        </div>
      </div>
      <pre className="text-sm text-[var(--color-text)] whitespace-pre-wrap font-[var(--font-mono)] leading-relaxed">
        {text}
        {isStreaming && <span className="cursor-blink">▊</span>}
      </pre>
    </div>
  );
}
