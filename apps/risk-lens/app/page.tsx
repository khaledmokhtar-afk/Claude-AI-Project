import { DEMO_PROJECTS, DEMO_RISKS } from "@iesl/data";
import { CommandCenter } from "./components/CommandCenter";

export default function Page() {
  const apiKeyPresent = Boolean(process.env.ANTHROPIC_API_KEY);
  return (
    <CommandCenter
      projects={DEMO_PROJECTS}
      risks={DEMO_RISKS}
      apiKeyPresent={apiKeyPresent}
    />
  );
}
