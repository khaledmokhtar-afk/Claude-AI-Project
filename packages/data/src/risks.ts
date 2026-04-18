export type RiskCategory =
  | "HSE"
  | "Schedule"
  | "Cost"
  | "Regulatory"
  | "Supply Chain"
  | "Geopolitical"
  | "Weather"
  | "Technical";

export type RiskStatus = "Open" | "Mitigating" | "Monitored" | "Closed" | "Escalated";

export type Risk = {
  id: string;
  projectId: string;
  title: string;
  category: RiskCategory;
  likelihood: 1 | 2 | 3 | 4 | 5;
  impact: 1 | 2 | 3 | 4 | 5;
  status: RiskStatus;
  owner: string;
  trend: "Rising" | "Stable" | "Falling";
  predicted30d: number;
  predicted60d: number;
  predicted90d: number;
  mitigation?: string;
  description: string;
};

const r = (
  id: string,
  projectId: string,
  title: string,
  category: RiskCategory,
  likelihood: 1 | 2 | 3 | 4 | 5,
  impact: 1 | 2 | 3 | 4 | 5,
  status: RiskStatus,
  owner: string,
  trend: "Rising" | "Stable" | "Falling",
  pred: [number, number, number],
  description: string,
  mitigation?: string,
): Risk => ({
  id,
  projectId,
  title,
  category,
  likelihood,
  impact,
  status,
  owner,
  trend,
  predicted30d: pred[0],
  predicted60d: pred[1],
  predicted90d: pred[2],
  description,
  mitigation,
});

export const DEMO_RISKS: Risk[] = [
  // FPSO Aurora
  r("fpso-aurora-r1", "fpso-aurora", "Turret swivel leak during live-on-station inspection", "HSE", 3, 5, "Mitigating", "HSE Lead", "Rising", [0.62, 0.74, 0.81],
    "Historical data from analog 5-year turnarounds shows a 21% incidence of seal failure on live swivel inspections at age >8 years. Unplanned shutdown cost: USD 3.4m/day.",
    "Pre-inspection NDT of upper swivel bearings; stage 2 response team on standby; revised permit-to-work."),
  r("fpso-aurora-r2", "fpso-aurora", "Drydock slot slippage at Lagos yard", "Schedule", 4, 4, "Open", "Project Controls", "Rising", [0.55, 0.68, 0.78],
    "Yard utilization at 94% in Q2. Analog projects slipped 3-6 weeks in similar congestion.",
    "Secondary yard option under MoU; critical items pre-fabricated."),
  r("fpso-aurora-r3", "fpso-aurora", "Gas compressor spare obsolescence", "Supply Chain", 3, 4, "Monitored", "Procurement", "Stable", [0.40, 0.45, 0.50],
    "OEM announced end-of-life for GT-10 control cards; lead time 26 weeks.",
    "Long-lead order placed; local OEM support letter obtained."),
  r("fpso-aurora-r4", "fpso-aurora", "Harmattan dust ingress during turret maintenance", "Weather", 4, 2, "Open", "Offshore Superintendent", "Rising", [0.70, 0.65, 0.40],
    "Dec–Feb dust storms reduce crane visibility 28% of days.",
    "Sealed-enclosure work tents; schedule lifts outside Harmattan peak."),
  r("fpso-aurora-r5", "fpso-aurora", "Class society non-conformance on ballast tanks", "Regulatory", 2, 5, "Mitigating", "Integrity Lead", "Stable", [0.30, 0.38, 0.42],
    "Prior 2.5-year survey flagged 11 tanks with thickness < 85% nominal.",
    "UT survey scheduled pre-drydock; class-approved repair procedure filed."),
  r("fpso-aurora-r6", "fpso-aurora", "Experienced technician attrition to GCC projects", "Cost", 3, 3, "Open", "HR Business Partner", "Rising", [0.45, 0.58, 0.66],
    "8 senior technicians approached by Saudi project; retention premium likely.",
    "Retention bonus programme in ExCo review."),

  // Niger Delta Pipeline
  r("nd-pipeline-ph-r1", "nd-pipeline-ph", "Community access disruption at Kula shoreline", "Geopolitical", 4, 5, "Mitigating", "Community Relations", "Rising", [0.68, 0.76, 0.80],
    "Analog projects in the same cluster lost 22-41 days to community negotiations.",
    "Enhanced GMoU signed; local content plan approved by youth council."),
  r("nd-pipeline-ph-r2", "nd-pipeline-ph", "Wet-season barge mobilisation slippage", "Weather", 5, 4, "Open", "Marine Lead", "Rising", [0.72, 0.81, 0.74],
    "June-Sept sea-state exceeds HS 2.0m on 61% of days; lay-barge spread not qualified.",
    "Contract negotiated for 2.5m HS spread; backup window Dec-Feb."),
  r("nd-pipeline-ph-r3", "nd-pipeline-ph", "Pipeline tampering / third-party interference", "HSE", 3, 5, "Monitored", "Security Coordinator", "Rising", [0.48, 0.55, 0.64],
    "Regional incident rate +17% YoY.",
    "Community watch + fibre intrusion sensors; multi-agency response MoU."),
  r("nd-pipeline-ph-r4", "nd-pipeline-ph", "DPR/NUPRC permit delay on crossing variation", "Regulatory", 3, 3, "Open", "Regulatory Lead", "Stable", [0.42, 0.48, 0.52],
    "Average permit turnaround 12 weeks vs planned 6.",
    "Pre-submission workshop with NUPRC scheduled."),
  r("nd-pipeline-ph-r5", "nd-pipeline-ph", "FX exposure on imported line pipe", "Cost", 4, 4, "Mitigating", "Finance", "Stable", [0.55, 0.58, 0.60],
    "USD/NGN volatility +9% over last quarter; 60% of pipe is imported.",
    "50% FX hedge placed with two banks; milestone payments NGN-denominated."),
  r("nd-pipeline-ph-r6", "nd-pipeline-ph", "Local welder qualification backlog", "Schedule", 3, 3, "Open", "QA/QC Lead", "Rising", [0.40, 0.52, 0.60],
    "Only 14 of 22 required welders hold valid API 1104.",
    "On-site qualification school contracted; 8 welders in pipeline."),

  // Egina Wellhead
  r("whp-egina-r1", "whp-egina", "Heavy-lift vessel slot slippage", "Schedule", 4, 5, "Mitigating", "Marine Lead", "Rising", [0.64, 0.72, 0.78],
    "HLV global demand up 38% vs. 2025; analog lift slots slipped 4-8 weeks.",
    "Secondary vessel on option; weather-window contingency 14 days."),
  r("whp-egina-r2", "whp-egina", "Topsides steel cost escalation", "Cost", 4, 4, "Open", "Finance", "Rising", [0.60, 0.67, 0.70],
    "HRC prices +12% QoQ.",
    "70% of steel procured on fixed price; rate-fall clause negotiated on remainder."),
  r("whp-egina-r3", "whp-egina", "Diver decompression incident risk", "HSE", 2, 5, "Monitored", "Dive Superintendent", "Stable", [0.20, 0.22, 0.24],
    "Saturation dive programme critical for tie-ins.",
    "Class-IV dive spread, fatigue management plan, independent medical officer."),
  r("whp-egina-r4", "whp-egina", "Subsea tie-in spool misalignment", "Technical", 3, 4, "Open", "Subsea Engineering", "Stable", [0.38, 0.44, 0.48],
    "Out-of-straightness on two flowlines from prior phase measured > tolerance.",
    "As-built metrology rerun; spool re-optioning in FEED."),
  r("whp-egina-r5", "whp-egina", "Certification delay on topsides crane", "Regulatory", 3, 3, "Mitigating", "HSE Lead", "Stable", [0.35, 0.42, 0.48],
    "OEM re-cert paperwork incomplete.",
    "Independent lifting appointed person engaged; parallel certification path."),
  r("whp-egina-r6", "whp-egina", "Currency exposure on EU-sourced subsea controls", "Cost", 3, 3, "Monitored", "Finance", "Falling", [0.40, 0.35, 0.32],
    "EUR/USD moved favourably; forward rates locked 70%.",
    "Hedge in place; balance of payments scheduled at milestones."),
];

export const risksForProject = (projectId: string) =>
  DEMO_RISKS.filter((risk) => risk.projectId === projectId);
