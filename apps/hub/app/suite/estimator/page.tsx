import { HISTORICAL_PROJECTS } from "@iesl/data";
import { EstimatorAiWorkspace } from "./components/EstimatorAiWorkspace";

export default function EstimatorPage() {
  return <EstimatorAiWorkspace historical={HISTORICAL_PROJECTS} />;
}
