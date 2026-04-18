"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { StreamState } from "./types";

/**
 * Consumes a text/event-stream from a Next.js API route where the server
 * flushes Claude tokens as plain text. Designed for the shared
 * StreamingResponse component in each app.
 */
export function useTextStream(endpoint: string) {
  const [state, setState] = useState<StreamState>({
    text: "",
    isStreaming: false,
    error: null,
    done: false,
  });
  const abortRef = useRef<AbortController | null>(null);

  const start = useCallback(
    async (body: unknown) => {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      setState({ text: "", isStreaming: true, error: null, done: false });
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: ctrl.signal,
        });
        if (!res.ok || !res.body) {
          const errText = await res.text().catch(() => res.statusText);
          throw new Error(errText || `Stream failed (${res.status})`);
        }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          setState((prev) => ({ ...prev, text: prev.text + chunk }));
        }
        setState((prev) => ({ ...prev, isStreaming: false, done: true }));
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setState({
          text: "",
          isStreaming: false,
          error: (err as Error).message,
          done: false,
        });
      }
    },
    [endpoint],
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
    setState((prev) => ({ ...prev, isStreaming: false }));
  }, []);

  return { ...state, start, stop };
}

/**
 * Animate from 0 to the target value — used to give numbers a "counting up"
 * feel when the AI produces them. Respects reduced-motion.
 */
export function useAnimatedNumber(target: number, durationMs = 800): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setValue(target);
      return;
    }
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const elapsed = t - start;
      const progress = Math.min(1, elapsed / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(target * eased);
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);
  return value;
}
