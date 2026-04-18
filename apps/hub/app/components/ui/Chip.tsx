"use client";

import type { ReactNode } from "react";

export function Chip({
  children,
  active = false,
  onClick,
  as = "span",
}: {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
  as?: "span" | "button";
}) {
  const Tag = as;
  return (
    <Tag
      onClick={onClick}
      className={`chip ${onClick ? "cursor-pointer hover:brightness-125" : ""}`}
      style={
        active
          ? {
              background:
                "color-mix(in srgb, var(--suite-accent, var(--color-primary)) 22%, transparent)",
              color: "white",
              borderColor:
                "color-mix(in srgb, var(--suite-accent, var(--color-primary)) 60%, transparent)",
            }
          : undefined
      }
    >
      {children}
    </Tag>
  );
}
