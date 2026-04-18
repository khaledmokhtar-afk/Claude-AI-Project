import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ScopeSmith — AI Scoping, Planning & Scheduling",
  description:
    "An IESL AI Workshop product. Paste a scope. Watch an AI build your WBS, Gantt, and critical path.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
