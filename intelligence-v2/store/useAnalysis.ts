"use client";

import { create } from "zustand";
import type { Brief, SectionId, SectionPayloads } from "@/lib/types";

type SectionState<K extends SectionId = SectionId> =
  | { status: "idle" }
  | { status: "streaming" }
  | { status: "ready"; payload: SectionPayloads[K] }
  | { status: "failed"; error: string };

type Sections = {
  [K in SectionId]: SectionState<K>;
};

type Store = {
  brief: Brief | null;
  sections: Sections;
  activeTab: "plan" | "risks" | "estimate";
  startedAt: number | null;
  elapsedMs: number | null;

  setBrief: (b: Brief) => void;
  reset: () => void;
  setTab: (t: Store["activeTab"]) => void;

  markStreaming: (id: SectionId) => void;
  markReady: <K extends SectionId>(id: K, payload: SectionPayloads[K]) => void;
  markFailed: (id: SectionId, error: string) => void;
  markDone: (elapsedMs: number) => void;
};

const INITIAL_SECTIONS: Sections = {
  "plan-core": { status: "idle" },
  "plan-extras": { status: "idle" },
  "risk-register": { status: "idle" },
  "risk-actions": { status: "idle" },
  "estimate-core": { status: "idle" },
  "estimate-trace": { status: "idle" },
};

export const useAnalysis = create<Store>((set) => ({
  brief: null,
  sections: INITIAL_SECTIONS,
  activeTab: "plan",
  startedAt: null,
  elapsedMs: null,

  setBrief: (brief) =>
    set({
      brief,
      sections: INITIAL_SECTIONS,
      startedAt: Date.now(),
      elapsedMs: null,
    }),
  reset: () =>
    set({
      brief: null,
      sections: INITIAL_SECTIONS,
      startedAt: null,
      elapsedMs: null,
      activeTab: "plan",
    }),
  setTab: (activeTab) => set({ activeTab }),

  markStreaming: (id) =>
    set((s) => ({ sections: { ...s.sections, [id]: { status: "streaming" } } })),
  markReady: (id, payload) =>
    set((s) => ({
      sections: { ...s.sections, [id]: { status: "ready", payload } as SectionState },
    })),
  markFailed: (id, error) =>
    set((s) => ({ sections: { ...s.sections, [id]: { status: "failed", error } } })),
  markDone: (elapsedMs) => set({ elapsedMs }),
}));
