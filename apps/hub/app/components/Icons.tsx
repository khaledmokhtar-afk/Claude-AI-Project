import type { SVGProps } from "react";

export function RadarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5.5" />
      <circle cx="12" cy="12" r="2.2" fill="currentColor" stroke="none" />
      <path d="M12 12 L19 5" strokeLinecap="round" />
    </svg>
  );
}

export function BlueprintIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9h18" strokeLinecap="round" />
      <path d="M7 14h6" strokeLinecap="round" />
      <path d="M7 17h10" strokeLinecap="round" />
      <path d="M7 9v11" strokeDasharray="2 2" />
    </svg>
  );
}

export function LedgerIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 10h18" />
      <path d="M9 15l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
