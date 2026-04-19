// ── Intake ──────────────────────────────────────────────────────────────────

export type Brief = {
  projectBrief: string;
  sector?: string;
  scale?: string;
  horizon?: string;
  budgetCeilingUSDm?: number;
  targetCompletionISO?: string;
  constraints?: string;
};

// ── Plan ────────────────────────────────────────────────────────────────────

export type WBSTask = {
  id: string;
  name: string;
  durationDays: number;
  critical?: boolean;
  dependsOn?: string[];
  resource?: string;
};

export type PlanCore = {
  projectName: string;
  summary: string;
  tasks: WBSTask[];
};

export type Milestone = {
  id: string;
  name: string;
  dayOffset: number;
  type: "gate" | "regulatory" | "delivery" | "commissioning";
  description?: string;
};

export type PhaseSummary = {
  phaseId: string;
  name: string;
  durationDays: number;
  primaryDriver: string;
  resourcesPeak: string[];
  riskFlag: "low" | "medium" | "high";
};

export type ResourceLoad = {
  resource: string;
  totalDays: number;
  peakConcurrency: number;
};

export type ScheduleStrategy = {
  approach: string;
  bufferStrategy: string;
  resourceConstraints: string[];
  schedulingMethod: string;
};

export type PlanExtras = {
  milestones: Milestone[];
  phaseSummaries: PhaseSummary[];
  resourceLoad: ResourceLoad[];
  scheduleStrategy: ScheduleStrategy;
};

// ── Risks ───────────────────────────────────────────────────────────────────

export type ISOReference = {
  standard: string;
  clause?: string;
  application: string;
};

export type RiskControl = {
  type: "preventive" | "detective" | "corrective";
  description: string;
};

export type RiskItem = {
  title: string;
  category: string;
  likelihood: number;
  impact: number;
  trend: "Rising" | "Stable" | "Falling";
  predicted30d: number;
  predicted60d: number;
  predicted90d: number;
  description: string;
  mitigation: string;
  isoStandards: ISOReference[];
  controls: RiskControl[];
  residualLikelihood: number;
  residualImpact: number;
  owner: string;
  dueWithinDays: number;
};

export type RiskRegister = {
  newRisks: RiskItem[];
};

export type IsoFrameworkEntry = {
  standard: string;
  title: string;
  appliesTo: string[];
  whyRelevant: string;
};

export type TopAction = {
  action: string;
  owner: string;
  dueWithinDays: number;
};

export type RiskActions = {
  topActions: TopAction[];
  isoFramework: IsoFrameworkEntry[];
  portfolioInsight: string;
};

// ── Estimate ────────────────────────────────────────────────────────────────

export type Band = { low: number; likely: number; high: number };

export type SwingFactor = {
  label: string;
  lowUSDm: number;
  highUSDm: number;
};

export type EstimateCore = {
  projectType: string;
  durationMonths: Band;
  effortPersonMonths: Band;
  costUSDm: Band;
  contingencyPct: number;
  contingencyRationale: string;
  assumptions: string[];
  narrative: string;
};

export type CostBreakdownItem = {
  category: string;
  amountUSDm: number;
  basis: string;
};

export type PersonnelRole = {
  role: string;
  count: number;
  monthlyRateUSD: number;
  totalPersonMonths: number;
  totalCostUSDm: number;
};

export type MethodologyStep = {
  step: number;
  title: string;
  detail: string;
};

export type AnalogScalingEntry = {
  analogName: string;
  scalingFactor: string;
  contribution: string;
};

export type EstimateTrace = {
  costBreakdown: CostBreakdownItem[];
  personnel: PersonnelRole[];
  methodology: MethodologyStep[];
  analogScaling: AnalogScalingEntry[];
  swingFactors: SwingFactor[];
};

// ── Streaming contract ──────────────────────────────────────────────────────

export type SectionId =
  | "plan-core"
  | "plan-extras"
  | "risk-register"
  | "risk-actions"
  | "estimate-core"
  | "estimate-trace";

export type SectionStatus = "streaming" | "ready" | "failed";

export type SectionEvent =
  | { id: SectionId; status: "streaming" }
  | { id: SectionId; status: "ready"; payload: unknown }
  | { id: SectionId; status: "failed"; error: string };

export type SectionPayloads = {
  "plan-core": PlanCore;
  "plan-extras": PlanExtras;
  "risk-register": RiskRegister;
  "risk-actions": RiskActions;
  "estimate-core": EstimateCore;
  "estimate-trace": EstimateTrace;
};

// ── Historical analogs ──────────────────────────────────────────────────────

export type HistoricalProject = {
  id: string;
  name: string;
  projectType: string;
  yearCompleted: number;
  durationMonths: number;
  actualEffortPersonMonths: number;
  budgetUSDm: number;
  actualUSDm: number;
  scopeSummary: string;
  tags: string[];
  contingencyPct: number;
  outcome: "On target" | "Over-budget" | "Under-budget" | "Over-schedule";
  lessons: string;
};
