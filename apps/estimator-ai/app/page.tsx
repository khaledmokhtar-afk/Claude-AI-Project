import { HISTORICAL_PROJECTS } from "@iesl/data";
import { EstimatorWorkspace } from "./components/EstimatorWorkspace";

export default function Page() {
  const apiKeyPresent = Boolean(process.env.ANTHROPIC_API_KEY);
  return (
    <EstimatorWorkspace
      historical={HISTORICAL_PROJECTS}
      apiKeyPresent={apiKeyPresent}
    />
  );
}
