"use client";

import { useAnimatedNumber } from "@iesl/ui";

export function Metric({
  label,
  value,
  suffix,
  prefix,
  decimals = 0,
  accent = false,
}: {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  accent?: boolean;
}) {
  const v = useAnimatedNumber(value, 800);
  return (
    <div className="flex flex-col gap-1">
      <div className="eyebrow text-[10px]">{label}</div>
      <div
        className="font-display text-4xl leading-none"
        style={{ color: accent ? "var(--suite-accent-soft, var(--color-primary-soft))" : "white" }}
      >
        {prefix}
        {v.toFixed(decimals)}
        {suffix && (
          <span className="text-lg ml-1 text-[var(--color-text-muted)]">{suffix}</span>
        )}
      </div>
    </div>
  );
}
