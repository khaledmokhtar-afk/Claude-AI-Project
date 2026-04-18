import { DEMO_SCOPES } from "@iesl/data";
import { ScopeSmithWorkspace } from "./components/ScopeSmithWorkspace";

export default function ScopePage() {
  return <ScopeSmithWorkspace scopes={DEMO_SCOPES} />;
}
