import type { ReactNode } from "react";
import { Shell } from "../components/Shell";
import { ClaudePanel } from "../components/ClaudePanel";
import { SuiteFrame } from "./SuiteFrame";

export default function SuiteLayout({ children }: { children: ReactNode }) {
  const apiKeyPresent = Boolean(process.env.ANTHROPIC_API_KEY);
  return (
    <Shell apiKeyPresent={apiKeyPresent} side={<ClaudePanel apiKeyPresent={apiKeyPresent} />}>
      <SuiteFrame>{children}</SuiteFrame>
    </Shell>
  );
}
