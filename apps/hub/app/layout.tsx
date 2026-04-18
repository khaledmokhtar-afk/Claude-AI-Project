import type { Metadata } from "next";
import { WorkspaceProvider } from "@iesl/ui";
import "./globals.css";

export const metadata: Metadata = {
  title: "IESL AI Suite — Workshop Edition",
  description:
    "Three AI-powered products for IESL: RiskLens, ScopeSmith, and EstimatorAI. Workshop Edition.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <WorkspaceProvider>{children}</WorkspaceProvider>
      </body>
    </html>
  );
}
