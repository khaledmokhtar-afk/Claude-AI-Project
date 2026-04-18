import type { ReactNode } from "react";
import { Shell } from "../components/Shell";
import { ClaudePanel } from "../components/ClaudePanel";

export default function SuiteLayout({ children }: { children: ReactNode }) {
  const apiKeyPresent = Boolean(process.env.ANTHROPIC_API_KEY);
  return (
    <Shell apiKeyPresent={apiKeyPresent} side={<ClaudePanel apiKeyPresent={apiKeyPresent} />}>
      {/* data-suite activates the CSS mesh + accent tokens in globals.css */}
      <div data-suite="project" className="min-h-full">
        {children}
      </div>
    </Shell>
  );
}
