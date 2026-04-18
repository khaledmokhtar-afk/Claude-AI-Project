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

const STORAGE_KEY = "iesl:workspace:v2";
const BACKLOG_CAP = 20;
const INPUT_BYTES_CAP = 2048;

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

export type Submission<T = unknown> = {
  id: string;
  kind: SuiteApp;
  title: string;
  input: string;
  meta?: Record<string, string>;
  output?: T;
  createdAt: number;
  updatedAt: number;
};

export type Backlog = {
  risk: Submission[];
  scope: Submission[];
  estimator: Submission[];
};

export type ActiveMap = {
  risk?: string;
  scope?: string;
  estimator?: string;
};

export type Workspace = {
  backlog: Backlog;
  active: ActiveMap;
  scope?: WorkspaceScope;
  wbs?: WorkspaceWBS;
  risks?: WorkspaceRisks;
  estimate?: WorkspaceEstimate;
};

type Ctx = {
  workspace: Workspace;
  backlog: Backlog;
  active: ActiveMap;
  activeSubmission: (kind: SuiteApp) => Submission | undefined;
  createSubmission: (
    kind: SuiteApp,
    input: string,
    meta?: Record<string, string>,
  ) => Submission;
  setActive: (kind: SuiteApp, id: string | undefined) => void;
  updateSubmissionOutput: <T>(kind: SuiteApp, id: string, output: T) => void;
  deleteSubmission: (kind: SuiteApp, id: string) => void;
  clearActive: (kind: SuiteApp) => void;
  setScope: (s: WorkspaceScope | undefined) => void;
  setWBS: (w: WorkspaceWBS | undefined) => void;
  setRisks: (r: WorkspaceRisks | undefined) => void;
  setEstimate: (e: WorkspaceEstimate | undefined) => void;
  reset: () => void;
};

const WorkspaceContext = createContext<Ctx | null>(null);

const EMPTY_BACKLOG: Backlog = { risk: [], scope: [], estimator: [] };

const DEFAULT: Workspace = {
  backlog: EMPTY_BACKLOG,
  active: {},
};

function titleOf(input: string): string {
  const firstLine = input.split("\n").find((l) => l.trim().length > 0) ?? "";
  return firstLine.trim().slice(0, 80) || "Untitled submission";
}

function truncateInput(input: string): string {
  if (input.length <= INPUT_BYTES_CAP) return input;
  return input.slice(0, INPUT_BYTES_CAP);
}

function makeId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `sub_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}

function loadInitial(): Workspace {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT;
    const parsed = JSON.parse(raw) as Partial<Workspace>;
    return {
      backlog: {
        risk: Array.isArray(parsed.backlog?.risk) ? parsed.backlog!.risk : [],
        scope: Array.isArray(parsed.backlog?.scope) ? parsed.backlog!.scope : [],
        estimator: Array.isArray(parsed.backlog?.estimator)
          ? parsed.backlog!.estimator
          : [],
      },
      active: parsed.active ?? {},
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

  const createSubmission = useCallback(
    (kind: SuiteApp, input: string, meta?: Record<string, string>) => {
      const now = Date.now();
      const sub: Submission = {
        id: makeId(),
        kind,
        title: titleOf(input),
        input: truncateInput(input),
        meta,
        createdAt: now,
        updatedAt: now,
      };
      setWorkspace((w) => {
        const next = [sub, ...w.backlog[kind]].slice(0, BACKLOG_CAP);
        return {
          ...w,
          backlog: { ...w.backlog, [kind]: next },
          active: { ...w.active, [kind]: sub.id },
        };
      });
      return sub;
    },
    [],
  );

  const setActive = useCallback((kind: SuiteApp, id: string | undefined) => {
    setWorkspace((w) => ({ ...w, active: { ...w.active, [kind]: id } }));
  }, []);

  const updateSubmissionOutput = useCallback(
    <T,>(kind: SuiteApp, id: string, output: T) => {
      setWorkspace((w) => ({
        ...w,
        backlog: {
          ...w.backlog,
          [kind]: w.backlog[kind].map((s) =>
            s.id === id ? { ...s, output, updatedAt: Date.now() } : s,
          ),
        },
      }));
    },
    [],
  );

  const deleteSubmission = useCallback((kind: SuiteApp, id: string) => {
    setWorkspace((w) => {
      const nextList = w.backlog[kind].filter((s) => s.id !== id);
      const nextActive: ActiveMap = { ...w.active };
      if (nextActive[kind] === id) delete nextActive[kind];
      return {
        ...w,
        backlog: { ...w.backlog, [kind]: nextList },
        active: nextActive,
      };
    });
  }, []);

  const clearActive = useCallback((kind: SuiteApp) => {
    setWorkspace((w) => {
      const nextActive: ActiveMap = { ...w.active };
      delete nextActive[kind];
      return { ...w, active: nextActive };
    });
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
    setWorkspace(DEFAULT);
  }, []);

  const activeSubmission = useCallback(
    (kind: SuiteApp) => {
      const id = workspace.active[kind];
      if (!id) return undefined;
      return workspace.backlog[kind].find((s) => s.id === id);
    },
    [workspace.active, workspace.backlog],
  );

  const value = useMemo<Ctx>(
    () => ({
      workspace,
      backlog: workspace.backlog,
      active: workspace.active,
      activeSubmission,
      createSubmission,
      setActive,
      updateSubmissionOutput,
      deleteSubmission,
      clearActive,
      setScope,
      setWBS,
      setRisks,
      setEstimate,
      reset,
    }),
    [
      workspace,
      activeSubmission,
      createSubmission,
      setActive,
      updateSubmissionOutput,
      deleteSubmission,
      clearActive,
      setScope,
      setWBS,
      setRisks,
      setEstimate,
      reset,
    ],
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
