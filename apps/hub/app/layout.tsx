import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IESL AI Suite — Workshop Edition",
  description:
    "Three AI-powered products for IESL: RiskLens, ScopeSmith, and EstimatorAI. Workshop Edition.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
