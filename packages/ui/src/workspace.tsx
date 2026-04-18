"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Mode } from "./types";

const STORAGE_KEY = "iesl:workspace:v1";

export type SuiteApp = "risk" | "scope" | "estimator";

export type WorkspaceScope = {
  projectName: string;
  summary: string;
  text: string;
};

export type WorkspaceWBS = {
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

export type WorkspaceRisks = {
  projectSummary: string;
  portfolioInsight: string;
  newRisks: {
    title: string;
    category: string;
    likelihood: number;
    impact: number;
    trend: string;
    predicted30d: number;
    predicted60d: number;
    predicted90d: number;
    description: string;
    mitigation: string;
  }[];
};

export type WorkspaceEstimate = {
  query: string;
  projectType: string;
  durationMonths: { low: number; likely: number; high: number };
  effortPersonMonths: { low: number; likely: number; high: number };
  costUSDm: { low: number; likely: number; high: number };
  contingencyPct: number;
  contingencyRationale: string;
  assumptions: string[];
  swingFactors: { label: string; lowUSDm: number; highUSDm: number }[];
  narrative: string;
};

export type Workspace = {
  mode: Mode;
  scope?: WorkspaceScope;
  wbs?: WorkspaceWBS;
  risks?: WorkspaceRisks;
  estimate?: WorkspaceEstimate;
};

type Ctx = {
  workspace: Workspace;
  mode: Mode;
  setMode: (m: Mode) => void;
  setScope: (s: WorkspaceScope | undefined) => void;
  setWBS: (w: WorkspaceWBS | undefined) => void;
  setRisks: (r: WorkspaceRisks | undefined) => void;
  setEstimate: (e: WorkspaceEstimate | undefined) => void;
  reset: () => void;
};

const WorkspaceContext = createContext<Ctx | null>(null);

const DEFAULT: Workspace = { mode: "demo" };

function loadInitial(): Workspace {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT;
    const parsed = JSON.parse(raw) as Partial<Workspace>;
    return {
      mode: parsed.mode === "ai" ? "ai" : "demo",
      scope: parsed.scope,
      wbs: parsed.wbs,
      risks: parsed.risks,
      estimate: parsed.estimate,
    };
  } catch {
    return DEFAULT;
  }
}

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [workspace, setWorkspace] = useState<Workspace>(DEFAULT);

  useEffect(() => {
    setWorkspace(loadInitial());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
    } catch {
      // storage quota / private mode — silently ignore
    }
  }, [workspace]);

  const setMode = useCallback((m: Mode) => {
    setWorkspace((w) => ({ ...w, mode: m }));
  }, []);

  const setScope = useCallback((s: WorkspaceScope | undefined) => {
    setWorkspace((w) => ({ ...w, scope: s }));
  }, []);

  const setWBS = useCallback((wbs: WorkspaceWBS | undefined) => {
    setWorkspace((w) => ({ ...w, wbs }));
  }, []);

  const setRisks = useCallback((r: WorkspaceRisks | undefined) => {
    setWorkspace((w) => ({ ...w, risks: r }));
  }, []);

  const setEstimate = useCallback((e: WorkspaceEstimate | undefined) => {
    setWorkspace((w) => ({ ...w, estimate: e }));
  }, []);

  const reset = useCallback(() => {
    setWorkspace({ mode: workspace.mode });
  }, [workspace.mode]);

  const value = useMemo<Ctx>(
    () => ({
      workspace,
      mode: workspace.mode,
      setMode,
      setScope,
      setWBS,
      setRisks,
      setEstimate,
      reset,
    }),
    [workspace, setMode, setScope, setWBS, setRisks, setEstimate, reset],
  );

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace(): Ctx {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error("useWorkspace must be used inside <WorkspaceProvider>");
  }
  return ctx;
}
