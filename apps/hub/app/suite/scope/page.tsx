import { ScopeSmithWorkspace } from "./components/ScopeSmithWorkspace";

export default function ScopePage() {
  const apiKeyPresent = Boolean(process.env.ANTHROPIC_API_KEY);
  return <ScopeSmithWorkspace apiKeyPresent={apiKeyPresent} />;
}
