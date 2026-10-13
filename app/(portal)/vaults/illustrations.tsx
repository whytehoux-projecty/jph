import * as React from "react";

type IconProps = { className?: string };

const base = {
  viewBox: "0 0 32 32",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

/**
 * VaultsIcon: Architectural bank vault door with dial wheel, locking bolts, and precision security rivets.
 */
export const VaultsIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <rect x="4" y="4" width="24" height="24" rx="2.5" />
    <circle cx="16" cy="16" r="6" />
    <circle cx="16" cy="16" r="1.5" fill="currentColor" stroke="none" />
    <path d="M16 10v2M16 20v2M10 16h2M20 16h2" />
    <path d="M28 10v3M28 19v3" />
    <circle cx="7" cy="7" r="1" fill="currentColor" stroke="none" />
    <circle cx="7" cy="25" r="1" fill="currentColor" stroke="none" />
  </svg>
);

/**
 * CardsIcon: Overlapping institutional cards with EMV chip and security strip.
 */
export const CardsIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <rect x="3" y="9" width="24" height="16" rx="2" />
    <path d="M3 14h24" />
    <rect x="6" y="18" width="5" height="3.5" rx="0.5" />
    <path d="M15 19.75h5" />
    <path d="M7 6h18a2 2 0 0 1 2 2v1" />
  </svg>
);
