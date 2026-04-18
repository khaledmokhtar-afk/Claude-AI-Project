import { ProjectWorkspace } from "./ProjectWorkspace";

export default function SuitePage() {
  const apiKeyPresent = Boolean(process.env.ANTHROPIC_API_KEY);
  return <ProjectWorkspace apiKeyPresent={apiKeyPresent} />;
}
