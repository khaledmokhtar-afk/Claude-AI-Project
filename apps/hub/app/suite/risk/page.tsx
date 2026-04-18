import { DEMO_PROJECTS, DEMO_RISKS } from "@iesl/data";
import { RiskLensWorkspace } from "./components/RiskLensWorkspace";

export default function RiskPage() {
  return <RiskLensWorkspace projects={DEMO_PROJECTS} risks={DEMO_RISKS} />;
}
