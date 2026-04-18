import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EstimatorAI — Historical Intelligence for Effort & Cost",
  description:
    "IESL Workshop Edition. RAG-powered effort and cost estimation from historical project data.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
