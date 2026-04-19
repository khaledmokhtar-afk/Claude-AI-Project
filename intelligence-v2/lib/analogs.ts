import type { HistoricalProject } from "./types";
export type { HistoricalProject };

const h = (
  id: string,
  name: string,
  projectType: HistoricalProject["projectType"],
  yearCompleted: number,
  durationMonths: number,
  actualEffortPersonMonths: number,
  budgetUSDm: number,
  actualUSDm: number,
  scopeSummary: string,
  tags: string[],
  contingencyPct: number,
  outcome: HistoricalProject["outcome"],
  lessons: string,
): HistoricalProject => ({
  id,
  name,
  projectType,
  yearCompleted,
  durationMonths,
  actualEffortPersonMonths,
  budgetUSDm,
  actualUSDm,
  scopeSummary,
  tags,
  contingencyPct,
  outcome,
  lessons,
});

export const HISTORICAL_PROJECTS: HistoricalProject[] = [
  h("H-001", "FPSO Beta 2.5y Survey", "FPSO Turnaround", 2022, 3, 210, 18.2, 20.1, "2.5 year class survey of FPSO Beta incl. tank NDT, swivel inspection.", ["fpso", "class-renewal", "offshore", "nigeria"], 12, "Over-budget", "Tank thickness findings exceeded planned ~10%, triggering rescope."),
  h("H-002", "FPSO Gamma 5y Turnaround", "FPSO Turnaround", 2021, 8, 720, 52.0, 58.4, "5 year drydock + swivel overhaul + gas compressor refit.", ["fpso", "drydock", "gas-compression", "lagos"], 15, "Over-budget", "Yard slot slipped 5 weeks; gas compressor parts long-lead."),
  h("H-003", "FPSO Delta Swivel Repair", "FPSO Turnaround", 2020, 2, 95, 8.6, 9.8, "Unplanned swivel seal repair on-station.", ["fpso", "emergency", "swivel"], 10, "Over-budget", "Unplanned dive crew mobilisation premium."),
  h("H-004", "FPSO Epsilon 2.5y Survey", "FPSO Turnaround", 2023, 3, 220, 19.8, 19.2, "2.5y survey with reduced scope; pre-qualified yard.", ["fpso", "class-renewal", "lagos"], 10, "Under-budget", "Pre-qualified yard + early long-lead saved 2 weeks."),
  h("H-005", "FPSO Zeta 5y Turnaround (Deep)", "FPSO Turnaround", 2019, 9, 780, 61.2, 66.0, "Full 5y turnaround deepwater FPSO; swivel + topsides modifications.", ["fpso", "drydock", "deepwater"], 17, "Over-schedule", "Topsides mods added 3 weeks after drydock entry."),
  h("H-006", "Wellhead Platform A Install", "Wellhead Install", 2022, 10, 430, 128.0, 136.4, "Jacket + topsides install, 4-well tie-in.", ["wellhead", "hlv", "offshore"], 12, "On target", "HLV slot aligned on first attempt."),
  h("H-007", "Wellhead Platform B Install", "Wellhead Install", 2021, 11, 470, 131.0, 152.8, "Jacket + topsides, 6-well tie-in, HLV slip.", ["wellhead", "hlv", "offshore", "slip"], 14, "Over-budget", "HLV slip 6 weeks; dive spread on standby."),
  h("H-008", "Unmanned Wellhead C Install", "Wellhead Install", 2023, 7, 280, 84.2, 80.6, "Unmanned wellhead install, pre-fabricated jacket.", ["wellhead", "hlv"], 10, "Under-budget", "Pre-fab approach saved 18 days and 4%."),
  h("H-009", "Wellhead Refit D", "Wellhead Install", 2024, 5, 160, 42.1, 44.0, "Refurbishment + 2-well tie-in on existing jacket.", ["wellhead", "refit"], 10, "On target", ""),
  h("H-010", "Wellhead Deepwater E", "Wellhead Install", 2020, 12, 520, 158.0, 170.0, "Deep-water jacket + topsides install, 8 wells.", ["wellhead", "deepwater", "hlv"], 15, "Over-budget", "Weather window 4 weeks shorter than planned."),
  h("H-011", "Pipeline ND-North 24in 30km", "Subsea Pipeline", 2019, 10, 380, 78.4, 85.0, "24\" subsea crude line 30km, ND North.", ["pipeline", "subsea", "niger-delta"], 13, "Over-budget", "Community access disruption 22 days."),
  h("H-012", "Pipeline ND-South 18in 18km", "Subsea Pipeline", 2021, 8, 290, 54.2, 53.6, "18\" crude line 18km, ND South.", ["pipeline", "subsea", "niger-delta"], 12, "On target", "Community GMoU effective."),
  h("H-013", "Pipeline Export 30in 42km", "Subsea Pipeline", 2018, 14, 520, 112.4, 136.0, "30\" export line 42km, deepwater tie-back.", ["pipeline", "subsea", "export", "deepwater"], 15, "Over-budget", "Weather window + lay barge slippage."),
  h("H-014", "Pipeline Infield 12in 8km", "Subsea Pipeline", 2023, 5, 140, 26.1, 25.2, "12\" infield flowline 8km.", ["pipeline", "subsea", "infield"], 10, "On target", ""),
  h("H-015", "Pipeline Shallow 20in 22km", "Subsea Pipeline", 2022, 9, 320, 64.8, 70.2, "20\" shallow water crude line.", ["pipeline", "subsea", "shallow"], 12, "Over-budget", "Security standby costs 6%."),
  h("H-016", "Pipeline Onshore Crossing", "Subsea Pipeline", 2020, 6, 210, 32.2, 34.8, "Onshore swamp crossing 4km incl. community.", ["pipeline", "onshore", "community"], 12, "Over-budget", "Community permitting extended 3 weeks."),
  h("H-017", "ILI Smart Pig Survey Campaign", "Pipeline Inspection", 2024, 2, 62, 7.8, 7.6, "In-line inspection campaign across 4 lines.", ["ili", "inspection", "integrity"], 8, "On target", ""),
  h("H-018", "ROV Survey Offshore", "Pipeline Inspection", 2023, 3, 90, 9.4, 9.2, "Offshore ROV survey 6 flowlines + risers.", ["rov", "inspection"], 8, "On target", ""),
  h("H-019", "Dive Integrity Campaign", "Pipeline Inspection", 2022, 2, 58, 8.1, 8.4, "Saturation dive integrity campaign.", ["dive", "inspection", "integrity"], 9, "On target", ""),
  h("H-020", "Intelligent Pig 30in", "Pipeline Inspection", 2021, 2, 48, 6.2, 6.4, "Intelligent pig 30\" export line.", ["ili", "inspection"], 8, "On target", ""),
  h("H-021", "CP Survey Multiple Assets", "Pipeline Inspection", 2020, 2, 40, 5.2, 5.1, "CP survey across FPSO + 3 jackets.", ["cp", "inspection"], 8, "Under-budget", "Combined mobilisation saved 9%."),
  h("H-022", "Drilling Campaign 4 Wells DW", "Drilling Campaign", 2022, 14, 880, 280.0, 312.0, "4-well deepwater drilling campaign.", ["drilling", "deepwater"], 18, "Over-budget", "Stuck pipe event +18 days."),
  h("H-023", "Drilling Campaign 6 Wells SH", "Drilling Campaign", 2023, 10, 620, 180.0, 175.0, "6-well shallow water campaign.", ["drilling", "shallow"], 15, "Under-budget", "Rig performance exceeded AFE."),
  h("H-024", "Infill Drilling 3 Wells", "Drilling Campaign", 2024, 6, 360, 96.0, 102.0, "3 infill wells, high-angle reservoir.", ["drilling", "infill"], 15, "Over-budget", "Minor well-control event."),
  h("H-025", "Exploration Well HP/HT", "Drilling Campaign", 2021, 5, 300, 78.0, 94.0, "HP/HT exploration well.", ["drilling", "exploration", "hpht"], 20, "Over-budget", "Bit trips > expected."),
  h("H-026", "Workover 5 Wells", "Drilling Campaign", 2023, 4, 180, 38.0, 39.2, "5-well workover campaign.", ["workover"], 10, "On target", ""),
  h("H-027", "Decom Platform Alpha", "Platform Decommissioning", 2022, 18, 720, 148.0, 172.0, "Full decommissioning incl. topsides lift + jacket removal.", ["decom", "hlv", "offshore"], 18, "Over-budget", "Jacket corrosion worse than survey."),
  h("H-028", "Decom Well Abandonment 6 Wells", "Platform Decommissioning", 2023, 8, 300, 62.0, 61.0, "P&A 6 wells prior to decommissioning.", ["decom", "p-and-a"], 12, "On target", ""),
  h("H-029", "Decom Subsea Flowlines", "Platform Decommissioning", 2021, 10, 340, 74.0, 79.0, "Flowline recovery + disposal.", ["decom", "subsea"], 12, "Over-budget", "Buried sections required excavation."),
  h("H-030", "Decom Pipeline End Terminal", "Platform Decommissioning", 2020, 5, 180, 38.0, 36.8, "PLEM removal + seabed clearance.", ["decom", "plem"], 10, "Under-budget", ""),
  h("H-031", "Topsides Module EPC", "Topsides EPC", 2022, 16, 920, 210.0, 224.0, "Topsides module fabrication & load-out.", ["epc", "topsides"], 12, "Over-budget", "Steel cost escalation 8%."),
  h("H-032", "Topsides Brownfield Tie-in", "Topsides EPC", 2023, 10, 480, 88.0, 86.0, "Brownfield tie-in of new compression module.", ["epc", "brownfield"], 12, "On target", ""),
  h("H-033", "Power Module Retrofit", "Topsides EPC", 2021, 8, 340, 58.0, 62.0, "Power module retrofit incl. turbine swap.", ["epc", "retrofit"], 12, "Over-budget", "Turbine commissioning +2 weeks."),
  h("H-034", "Living Quarters Upgrade", "Topsides EPC", 2024, 12, 520, 98.0, 96.4, "Living quarters upgrade, offshore install.", ["epc", "quarters"], 10, "On target", ""),
  h("H-035", "Flare Tower Replacement", "Topsides EPC", 2020, 10, 400, 72.0, 78.0, "Flare tower replacement.", ["epc", "flare"], 12, "Over-budget", "Weather window exceeded."),
  h("H-036", "SURF Installation Deepwater A", "SURF Installation", 2022, 11, 540, 196.0, 212.0, "Subsea umbilicals, risers, flowlines install deepwater.", ["surf", "deepwater"], 14, "Over-budget", "Installation vessel day-rate up."),
  h("H-037", "SURF Shallow B", "SURF Installation", 2023, 8, 360, 122.0, 118.0, "SURF install in shallow water.", ["surf", "shallow"], 12, "Under-budget", "Good weather window."),
  h("H-038", "SURF Tie-back C", "SURF Installation", 2021, 10, 460, 160.0, 172.0, "SURF tie-back to existing facility.", ["surf", "tie-back"], 14, "Over-budget", "Brownfield interface changes."),
  h("H-039", "SURF Infill D", "SURF Installation", 2024, 7, 300, 108.0, 110.0, "SURF install for infill development.", ["surf", "infill"], 12, "On target", ""),
  h("H-040", "SURF IOR Project E", "SURF Installation", 2020, 9, 420, 138.0, 148.0, "SURF for IOR project incl. water injection.", ["surf", "ior"], 13, "Over-budget", "Water injection risers rework."),
];

// Simple bag-of-tokens embedding substitute for offline demo RAG.
// Real production would use an embeddings model.
const tokenize = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2);

export function scoreAnalog(query: string, project: HistoricalProject): number {
  const qTokens = new Set(tokenize(query));
  const pText = [project.name, project.projectType, project.scopeSummary, ...project.tags].join(" ");
  const pTokens = tokenize(pText);
  let hits = 0;
  for (const tok of pTokens) if (qTokens.has(tok)) hits++;
  const typeBoost = qTokens.has(project.projectType.toLowerCase().split(" ")[0]) ? 3 : 0;
  return hits + typeBoost;
}

export function findAnalogs(query: string, limit = 5): HistoricalProject[] {
  return [...HISTORICAL_PROJECTS]
    .map((p) => ({ p, s: scoreAnalog(query, p) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((x) => x.p);
}
