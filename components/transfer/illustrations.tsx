import * as React from "react";

/**
 * Custom, on-brand SVG artwork for the Transfers flow.
 * Palette: ink #14181F, paper, vermilion #D8432B, pine #1F4D3F, brass #B8893B.
 */

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

/* ------------------------------ small icons ------------------------------ */

export const InternalIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <rect x="3" y="7" width="11" height="8" rx="1.5" />
    <rect x="18" y="17" width="11" height="8" rx="1.5" />
    <path d="M14 11h6a3 3 0 0 1 3 3v3" />
    <path d="M20.5 14.5 23 17l2.5-2.5" />
    <path d="M6 11h5" />
  </svg>
);

export const WireIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <path d="M4 12 16 5l12 7" />
    <path d="M6 12v9M12 12v9M20 12v9M26 12v9" />
    <path d="M3 25h26" />
    <path d="M20 28l3-3-3-3" strokeWidth="1.5" />
  </svg>
);

export const WalletIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <path d="M5 9.5h19a3 3 0 0 1 3 3V23a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V9.5Z" />
    <path d="M5 9.5 21 5v4.5" />
    <circle cx="22" cy="17.5" r="2" />
    <path d="M10 17.5h4" />
  </svg>
);

export const P2PIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <circle cx="9.5" cy="10" r="3.5" />
    <circle cx="22.5" cy="22" r="3.5" />
    <path d="M3.5 24c.6-3 3-5 6-5s4 .8 5.2 2" />
    <path d="M17.5 12h8M22.5 8.5 26 12l-3.5 3.5" />
  </svg>
);

export const BillsIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <path d="M8 4h13l4 4v20l-3-2-3 2-3-2-3 2-3-2-3 2V4Z" transform="translate(-1 0)" />
    <path d="M10 11h10M10 16h10M10 21h6" />
  </svg>
);

export const SendIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <path d="M4 16h20" />
    <path d="M17 8l8 8-8 8" />
    <circle cx="6" cy="16" r="2" fill="currentColor" stroke="none" />
  </svg>
);

export const ICONS = {
  internal: InternalIcon,
  wire: WireIcon,
  wallet: WalletIcon,
  p2p: P2PIcon,
} as const;

/* ---------------------------- info-panel artwork ---------------------------- */

const frame = (children: React.ReactNode, label: string, className?: string) => (
  <svg
    viewBox="0 0 280 150"
    className={className}
    role="img"
    aria-label={label}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <pattern id="ledger" width="10" height="10" patternUnits="userSpaceOnUse">
        <path d="M0 10H10" stroke="#D3CBB8" strokeWidth="0.5" />
      </pattern>
    </defs>
    <rect width="280" height="150" rx="6" fill="#F6F1E7" />
    <rect width="280" height="150" rx="6" fill="url(#ledger)" opacity="0.6" />
    {children}
  </svg>
);

export const InternalArt = ({ className }: IconProps) =>
  frame(
    <>
      <rect x="22" y="40" width="96" height="62" rx="6" fill="#14181F" />
      <rect x="22" y="54" width="96" height="10" fill="#2E353B" />
      <rect x="32" y="78" width="30" height="6" rx="2" fill="#B8893B" />
      <rect x="32" y="90" width="50" height="4" rx="2" fill="#5B646C" />
      <rect x="162" y="56" width="96" height="62" rx="6" fill="#1F4D3F" />
      <rect x="162" y="70" width="96" height="10" fill="#2a6150" />
      <rect x="172" y="94" width="30" height="6" rx="2" fill="#F6F1E7" />
      <path d="M124 76h28" stroke="#D8432B" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="1 7" />
      <path d="M146 69l8 7-8 7" stroke="#D8432B" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="138" cy="76" r="14" fill="none" stroke="#D8432B" strokeWidth="1" opacity="0.35" />
    </>,
    "Two accounts connected by a transfer arrow",
    className,
  );

export const WireArt = ({ className }: IconProps) =>
  frame(
    <>
      <path d="M30 78 70 52l40 26Z" fill="#14181F" />
      <rect x="38" y="78" width="64" height="30" fill="#2E353B" />
      <path d="M46 78v30M60 78v30M80 78v30M94 78v30" stroke="#F6F1E7" strokeWidth="3" />
      <rect x="30" y="108" width="80" height="6" fill="#14181F" />
      <path d="M170 78 210 52l40 26Z" fill="#1F4D3F" />
      <rect x="178" y="78" width="64" height="30" fill="#2a6150" />
      <path d="M186 78v30M200 78v30M220 78v30M234 78v30" stroke="#F6F1E7" strokeWidth="3" />
      <rect x="170" y="108" width="80" height="6" fill="#1F4D3F" />
      <path d="M118 92c14-26 28-26 44 0" stroke="#D8432B" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeDasharray="1 6" />
      <circle cx="140" cy="68" r="10" fill="#F6F1E7" stroke="#B8893B" strokeWidth="2" />
      <path d="M135 68h10M140 63v10" stroke="#B8893B" strokeWidth="1.5" />
    </>,
    "Two banks linked by a payment route",
    className,
  );

export const WalletArt = ({ className }: IconProps) =>
  frame(
    <>
      <rect x="28" y="46" width="108" height="70" rx="8" fill="#14181F" />
      <rect x="28" y="46" width="108" height="16" rx="8" fill="#2E353B" />
      <rect x="112" y="76" width="30" height="20" rx="5" fill="#B8893B" />
      <circle cx="124" cy="86" r="3" fill="#14181F" />
      <rect x="40" y="76" width="50" height="6" rx="3" fill="#5B646C" />
      <rect x="40" y="90" width="34" height="6" rx="3" fill="#5B646C" />
      <circle cx="206" cy="82" r="38" fill="#1F4D3F" />
      <circle cx="206" cy="82" r="30" fill="none" stroke="#F6F1E7" strokeWidth="1.5" strokeDasharray="2 4" />
      <path d="M194 70h24M206 70v26" stroke="#F6F1E7" strokeWidth="5" strokeLinecap="round" />
      <path d="M146 96h22" stroke="#D8432B" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="1 6" />
      <path d="M162 90l8 6-8 6" stroke="#D8432B" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </>,
    "A bank card sending value to a stablecoin token",
    className,
  );

export const P2PArt = ({ className }: IconProps) =>
  frame(
    <>
      <circle cx="64" cy="62" r="18" fill="#14181F" />
      <path d="M32 112c2-20 16-28 32-28s30 8 32 28Z" fill="#14181F" />
      <circle cx="216" cy="62" r="18" fill="#1F4D3F" />
      <path d="M184 112c2-20 16-28 32-28s30 8 32 28Z" fill="#1F4D3F" />
      <rect x="106" y="50" width="68" height="34" rx="17" fill="#FBF9F4" stroke="#D8432B" strokeWidth="2" />
      <path d="M124 67h32M148 60l8 7-8 7" stroke="#D8432B" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="118" y="98" width="44" height="6" rx="3" fill="#D3CBB8" />
    </>,
    "Two people exchanging a payment",
    className,
  );

export const ART = {
  internal: InternalArt,
  wire: WireArt,
  wallet: WalletArt,
  p2p: P2PArt,
} as const;
