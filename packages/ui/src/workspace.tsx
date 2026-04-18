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

const STORAGE_KEY = "iesl:workspace:v3";
const PROJECTS_CAP = 20;
const INPUT_BYTES_CAP = 3000;

// ── Shared cross-tab context (kept for Claude panel compat) ──────────────────

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

// ── Unified project submission ────────────────────────────────────────────────

export type ProjectMeta = {
  sector?: string;
  scale?: string;
  horizon?: string;
};

export type WBSTask = {
  id: string;
  name: string;
  durationDays: number;
  critical?: boolean;
  dependsOn?: string[];
  resource?: string;
};

export type RiskItem = {
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
};

export type SwingFactor = {
  label: string;
  lowUSDm: number;
  highUSDm: number;
};

export type ProjectAnalysis = {
  projectName: string;
  summary: string;
  plan: {
    projectName: string;
    summary: string;
    tasks: WBSTask[];
  };
  risks: {
    newRisks: RiskItem[];
    portfolioInsight: string;
  };
  estimate: {
    projectType: string;
    durationMonths: { low: number; likely: number; high: number };
    effortPersonMonths: { low: number; likely: number; high: number };
    costUSDm: { low: number; likely: number; high: number };
    contingencyPct: number;
    contingencyRationale: string;
    assumptions: string[];
    swingFactors: SwingFactor[];
    narrative: string;
  };
};

export type ProjectSubmission = {
  id: string;
  title: string;
  input: string;
  meta: ProjectMeta;
  analysis?: ProjectAnalysis;
  createdAt: number;
  updatedAt: number;
};

// ── Workspace state ──────────────────────────────────────────────────────────

export type Workspace = {
  projects: ProjectSubmission[];
  activeId?: string;
  scope?: WorkspaceScope;
  wbs?: WorkspaceWBS;
  risks?: WorkspaceRisks;
  estimate?: WorkspaceEstimate;
};

type Ctx = {
  workspace: Workspace;
  projects: ProjectSubmission[];
  activeProject: ProjectSubmission | undefined;
  createProject: (input: string, meta: ProjectMeta) => ProjectSubmission;
  setActiveId: (id: string | undefined) => void;
  updateAnalysis: (id: string, analysis: ProjectAnalysis) => void;
  deleteProject: (id: string) => void;
  clearActive: () => void;
  // Claude panel compat
  setScope: (s: WorkspaceScope | undefined) => void;
  setWBS: (w: WorkspaceWBS | undefined) => void;
  setRisks: (r: WorkspaceRisks | undefined) => void;
  setEstimate: (e: WorkspaceEstimate | undefined) => void;
  reset: () => void;
};

const WorkspaceContext = createContext<Ctx | null>(null);

const DEFAULT: Workspace = { projects: [] };

function titleOf(input: string): string {
  const firstLine = input.split("\n").find((l) => l.trim().length > 0) ?? "";
  return firstLine.trim().slice(0, 80) || "Untitled project";
}

function makeId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `proj_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}

function truncate(input: string): string {
  return input.length <= INPUT_BYTES_CAP ? input : input.slice(0, INPUT_BYTES_CAP);
}

function loadInitial(): Workspace {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT;
    const parsed = JSON.parse(raw) as Partial<Workspace>;
    return {
      projects: Array.isArray(parsed.projects) ? parsed.projects : [],
      activeId: parsed.activeId,
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
      // quota / private mode
    }
  }, [workspace]);

  const createProject = useCallback((input: string, meta: ProjectMeta) => {
    const now = Date.now();
    const proj: ProjectSubmission = {
      id: makeId(),
      title: titleOf(input),
      input: truncate(input),
      meta,
      createdAt: now,
      updatedAt: now,
    };
    setWorkspace((w) => ({
      ...w,
      projects: [proj, ...w.projects].slice(0, PROJECTS_CAP),
      activeId: proj.id,
    }));
    return proj;
  }, []);

  const setActiveId = useCallback((id: string | undefined) => {
    setWorkspace((w) => ({ ...w, activeId: id }));
  }, []);

  const updateAnalysis = useCallback((id: string, analysis: ProjectAnalysis) => {
    setWorkspace((w) => ({
      ...w,
      projects: w.projects.map((p) =>
        p.id === id ? { ...p, analysis, updatedAt: Date.now() } : p,
      ),
    }));
  }, []);

  const deleteProject = useCallback((id: string) => {
    setWorkspace((w) => ({
      ...w,
      projects: w.projects.filter((p) => p.id !== id),
      activeId: w.activeId === id ? undefined : w.activeId,
    }));
  }, []);

  const clearActive = useCallback(() => {
    setWorkspace((w) => ({ ...w, activeId: undefined }));
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

  const reset = useCallback(() => setWorkspace(DEFAULT), []);

  const activeProject = useMemo(
    () => workspace.projects.find((p) => p.id === workspace.activeId),
    [workspace.projects, workspace.activeId],
  );

  const value = useMemo<Ctx>(
    () => ({
      workspace,
      projects: workspace.projects,
      activeProject,
      createProject,
      setActiveId,
      updateAnalysis,
      deleteProject,
      clearActive,
      setScope,
      setWBS,
      setRisks,
      setEstimate,
      reset,
    }),
    [
      workspace,
      activeProject,
      createProject,
      setActiveId,
      updateAnalysis,
      deleteProject,
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
  if (!ctx) throw new Error("useWorkspace must be used inside <WorkspaceProvider>");
  return ctx;
}
