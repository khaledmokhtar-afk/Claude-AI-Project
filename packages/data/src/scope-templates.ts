export type DemoScopeTemplate = {
  id: string;
  label: string;
  summary: string;
  scope: string;
  demoWBS: DemoWBSNode[];
};

export type DemoWBSNode = {
  id: string;
  name: string;
  durationDays: number;
  dependsOn?: string[];
  critical?: boolean;
  resource?: string;
};

export const DEMO_SCOPES: DemoScopeTemplate[] = [
  {
    id: "deepwater-wellhead",
    label: "Deepwater wellhead maintenance campaign",
    summary: "6-week offshore campaign on two unmanned wellhead platforms.",
    scope: `IESL will execute a six-week maintenance campaign on two unmanned wellhead platforms in OML 130 (Egina cluster). The campaign covers: mobilisation of a multi-purpose support vessel (MSV) with saturation dive spread and 250t crane; replacement of four production choke valves across both platforms; xmas tree seal refurbishment on six wells; flowline isolation test and MEG line flushing; cathodic-protection survey on both jackets; certified lifting equipment renewal. Campaign must include offshore permit-to-work, HSE induction, 24-hour simops with nearby FPSO, and 5-day weather contingency. Deliverables include a certified hand-back dossier and an integrity report.`,
    demoWBS: [
      { id: "1", name: "Mobilisation", durationDays: 5, resource: "Marine", critical: true },
      { id: "1.1", name: "MSV crew change + HSE induction", durationDays: 2, dependsOn: ["1"], resource: "HSE" },
      { id: "1.2", name: "Dive spread commissioning", durationDays: 3, dependsOn: ["1"], resource: "Dive Team" },
      { id: "2", name: "Platform A works", durationDays: 14, dependsOn: ["1.1", "1.2"], critical: true, resource: "Offshore Crew" },
      { id: "2.1", name: "Choke valve R&R (2 of 4)", durationDays: 5, dependsOn: ["2"], resource: "Mechanical" },
      { id: "2.2", name: "Xmas tree seal refurb (3 wells)", durationDays: 6, dependsOn: ["2.1"], resource: "Well Services" },
      { id: "2.3", name: "CP survey platform A", durationDays: 3, dependsOn: ["2"], resource: "Inspection" },
      { id: "3", name: "Platform B works", durationDays: 13, dependsOn: ["2.1"], critical: true, resource: "Offshore Crew" },
      { id: "3.1", name: "Choke valve R&R (2 of 4)", durationDays: 5, dependsOn: ["3"], resource: "Mechanical" },
      { id: "3.2", name: "Xmas tree seal refurb (3 wells)", durationDays: 6, dependsOn: ["3.1"], resource: "Well Services" },
      { id: "3.3", name: "MEG line flush + isolation test", durationDays: 4, dependsOn: ["3.2"], resource: "Process" },
      { id: "4", name: "Integrity & Close-Out", durationDays: 6, dependsOn: ["3.3", "2.3"], critical: true, resource: "Engineering" },
      { id: "4.1", name: "Certified lifting renewal", durationDays: 2, dependsOn: ["4"], resource: "HSE" },
      { id: "4.2", name: "Hand-back dossier + integrity report", durationDays: 4, dependsOn: ["4.1"], resource: "Project Controls" },
    ],
  },
  {
    id: "pipeline-replacement",
    label: "Subsea pipeline 5km replacement — wet season window",
    summary: "5 km subsea crude line replacement during a restricted weather window.",
    scope: `IESL will plan and execute the replacement of a 5km 18" subsea crude pipeline in the Niger Delta. Work covers pre-installation survey, route re-optimisation for free-span minimisation, procurement of line pipe and bend fittings, pipe-lay using anchored lay barge, two tie-in spools (PLET and riser base), in-line commissioning pigging, hydrotest, and community engagement. The campaign must complete within a 90-day weather-and-security window between Dec and Feb.`,
    demoWBS: [
      { id: "1", name: "Pre-installation survey", durationDays: 10, resource: "Survey", critical: true },
      { id: "2", name: "Long-lead procurement", durationDays: 30, resource: "Procurement", critical: true },
      { id: "2.1", name: "Line pipe manufacture", durationDays: 30, dependsOn: ["2"], resource: "Procurement" },
      { id: "2.2", name: "Bend fittings + spool forgings", durationDays: 20, dependsOn: ["2"], resource: "Procurement" },
      { id: "3", name: "Community GMoU + security plan", durationDays: 15, resource: "Community Relations" },
      { id: "4", name: "Pipe-lay mobilisation", durationDays: 7, dependsOn: ["1", "2.1"], resource: "Marine", critical: true },
      { id: "5", name: "Pipe-lay execution", durationDays: 22, dependsOn: ["4"], resource: "Lay Crew", critical: true },
      { id: "6", name: "PLET tie-in spool", durationDays: 6, dependsOn: ["5"], resource: "Dive Team", critical: true },
      { id: "7", name: "Riser-base tie-in spool", durationDays: 6, dependsOn: ["6"], resource: "Dive Team", critical: true },
      { id: "8", name: "Pre-commissioning pigging + hydrotest", durationDays: 5, dependsOn: ["7"], resource: "Commissioning", critical: true },
      { id: "9", name: "Hand-over & community close-out", durationDays: 4, dependsOn: ["8", "3"], resource: "Project Controls" },
    ],
  },
];

export const findScopeTemplate = (id: string) => DEMO_SCOPES.find((s) => s.id === id);
