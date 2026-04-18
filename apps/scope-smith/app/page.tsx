import { DEMO_SCOPES } from "@iesl/data";
import { Workspace } from "./components/Workspace";

export default function Page() {
  const apiKeyPresent = Boolean(process.env.ANTHROPIC_API_KEY);
  return <Workspace scopes={DEMO_SCOPES} apiKeyPresent={apiKeyPresent} />;
}
