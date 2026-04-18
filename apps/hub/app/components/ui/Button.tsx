"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "ghost" | "subtle";
type Size = "sm" | "md" | "lg";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  leading?: ReactNode;
  trailing?: ReactNode;
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: "text-xs px-3 py-1.5",
  md: "text-sm px-4 py-2",
  lg: "text-base px-5 py-3",
};

export function Button({
  variant = "primary",
  size = "md",
  leading,
  trailing,
  className = "",
  children,
  ...rest
}: Props) {
  const base =
    variant === "primary"
      ? "btn-primary"
      : variant === "ghost"
        ? "btn-ghost"
        : "inline-flex items-center gap-2 rounded-full text-[var(--color-text-muted)] hover:text-white transition-colors";

  return (
    <button
      {...rest}
      className={`${base} ${SIZE_CLASSES[size]} ${className}`}
    >
      {leading}
      {children}
      {trailing}
    </button>
  );
}
