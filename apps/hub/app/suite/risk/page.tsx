import { RiskLensWorkspace } from "./components/RiskLensWorkspace";

export default function RiskPage() {
  const apiKeyPresent = Boolean(process.env.ANTHROPIC_API_KEY);
  return <RiskLensWorkspace apiKeyPresent={apiKeyPresent} />;
}
