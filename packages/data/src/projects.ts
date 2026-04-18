export type DemoProject = {
  id: string;
  name: string;
  client: string;
  location: string;
  type: "FPSO Turnaround" | "Pipeline" | "Wellhead" | "Decommissioning" | "Drilling" | "Inspection" | "EPC";
  durationMonths: number;
  budgetUSDm: number;
  status: "Active" | "Planning" | "Closing";
  startDate: string;
  summary: string;
};

export const DEMO_PROJECTS: DemoProject[] = [
  {
    id: "fpso-aurora",
    name: "FPSO Aurora 5-Year Turnaround",
    client: "IESL / Field Partner Co.",
    location: "OML 130, Offshore Nigeria",
    type: "FPSO Turnaround",
    durationMonths: 7,
    budgetUSDm: 48.6,
    status: "Active",
    startDate: "2026-02-10",
    summary:
      "Planned 5-year major overhaul of FPSO Aurora including turret swivel inspection, gas compression module refurbishment, and class-renewal drydock. Critical HSE and schedule exposure; single-point mooring downtime costs USD 3.4m/day.",
  },
  {
    id: "nd-pipeline-ph",
    name: "Niger Delta Subsea Pipeline Replacement (PH-East)",
    client: "IESL / NAPL Operator",
    location: "Niger Delta, Rivers State",
    type: "Pipeline",
    durationMonths: 11,
    budgetUSDm: 86.2,
    status: "Planning",
    startDate: "2026-05-01",
    summary:
      "Replacement of 28 km of aging 24\" subsea crude line. Community engagement, security, and wet-season weather windows dominate the risk profile. EPCI contract with local content requirements.",
  },
  {
    id: "whp-egina",
    name: "Egina Wellhead Platform Installation",
    client: "IESL / Deepwater JV",
    location: "OML 130, Deepwater",
    type: "Wellhead",
    durationMonths: 9,
    budgetUSDm: 134.0,
    status: "Active",
    startDate: "2026-03-18",
    summary:
      "Installation of unmanned wellhead platform jacket, topsides lift, tie-in of 4 production wells. Heavy-lift vessel availability is the critical path driver.",
  },
];

export const findProject = (id: string) => DEMO_PROJECTS.find((p) => p.id === id);
