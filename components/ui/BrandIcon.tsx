import * as React from "react";
import { cn } from "@/lib/utils";

export type BrandIconKey =
  | "cashapp"
  | "usdc"
  | "usdt"
  | "venmo"
  | "zelle"
  | "zellepay"
  | "crypto";

const BRAND_ICONS: Record<string, { src: string; alt: string }> = {
  cashapp: { src: "/icons/cashapp.png", alt: "Cash App" },
  usdc: { src: "/icons/usdc.png", alt: "USD Coin (USDC)" },
  usdt: { src: "/icons/usdt.png", alt: "Tether USD (USDT)" },
  venmo: { src: "/icons/venmo.png", alt: "Venmo" },
  zelle: { src: "/icons/zellepay.png", alt: "Zelle" },
  zellepay: { src: "/icons/zellepay.png", alt: "Zelle" },
};

export function getBrandIconSrc(name?: string | null): string | null {
  if (!name) return null;
  const key = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (key.includes("cashapp") || key === "cash") return BRAND_ICONS.cashapp.src;
  if (key.includes("usdc")) return BRAND_ICONS.usdc.src;
  if (key.includes("usdt")) return BRAND_ICONS.usdt.src;
  if (key.includes("venmo")) return BRAND_ICONS.venmo.src;
  if (key.includes("zelle")) return BRAND_ICONS.zelle.src;
  return null;
}

interface BrandIconProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  name: string;
  size?: number;
}

export function BrandIcon({ name, size = 20, className, ...props }: BrandIconProps) {
  const src = getBrandIconSrc(name);
  if (!src) return null;

  return (
    <img
      src={src}
      alt={name}
      width={size}
      height={size}
      className={cn("inline-block shrink-0 object-contain rounded-none", className)}
      {...props}
    />
  );
}
