import { HISTORICAL_PROJECTS } from "@iesl/data";
import { EstimatorAiWorkspace } from "./components/EstimatorAiWorkspace";

export default function EstimatorPage() {
  const apiKeyPresent = Boolean(process.env.ANTHROPIC_API_KEY);
  return (
    <EstimatorAiWorkspace
      apiKeyPresent={apiKeyPresent}
      historical={HISTORICAL_PROJECTS}
    />
  );
}
