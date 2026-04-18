// Output shapes produced by the AI routes — consumed by the workspace
// components to render WBS, Gantt, risk matrix, and estimate cards.

export type WBSNode = {
  id: string;
  name: string;
  durationDays: number;
  dependsOn?: string[];
  critical?: boolean;
  resource?: string;
};

export type RiskProject = {
  id: string;
  name: string;
  region: string;
  phase: string;
  brief: string;
};

export type Risk = {
  id: string;
  projectId: string;
  title: string;
  category: string;
  likelihood: number; // 1..5
  impact: number;     // 1..5
  trend: string;
  description?: string;
  mitigation?: string;
};
