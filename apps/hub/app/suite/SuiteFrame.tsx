"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function SuiteFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const suite = pathname.includes("/suite/risk")
    ? "risk"
    : pathname.includes("/suite/scope")
      ? "scope"
      : pathname.includes("/suite/estimator")
        ? "estimator"
        : undefined;
  return (
    <div data-suite={suite} className="relative">
      {children}
    </div>
  );
}
