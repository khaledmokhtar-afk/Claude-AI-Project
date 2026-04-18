import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RiskLens — AI Risk Intelligence Command Center",
  description: "IESL Workshop Edition. Predictive risk analytics for energy-sector projects.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
