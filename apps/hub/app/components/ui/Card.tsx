"use client";

import type { HTMLAttributes, ReactNode } from "react";

type Props = HTMLAttributes<HTMLDivElement> & {
  accent?: boolean;
  children: ReactNode;
};

export function Card({
  accent = false,
  className = "",
  children,
  ...rest
}: Props) {
  return (
    <div
      {...rest}
      className={`${accent ? "glass-accent" : "glass"} ${className}`}
    >
      {children}
    </div>
  );
}
