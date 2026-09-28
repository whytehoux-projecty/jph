import type { CSSProperties, KeyboardEvent } from "react";
import {
  ArrowRightLeft,
  Building2,
  Smartphone,
  Globe2,
  Wallet,
  CheckCircle2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type UiTransferTypeId =
  | "internal"
  | "wire_domestic"
  | "ach"
  | "zelle"
  | "wire_international"
  | "crypto";

interface TransferTypeOption {
  id: UiTransferTypeId;
  name: string;
  description: string;
  icon: LucideIcon;
  processingTime: string;
  fee: string;
  limit: number;
  deliveryEstimate: string;
  badge?: "NEW" | "BETA" | "COMING SOON";
  available?: boolean;
}

const transferTypes: TransferTypeOption[] = [
  {
    id: "internal",
    name: "Internal Transfer",
    description: "Between your JP Heritage accounts",
    icon: ArrowRightLeft,
    processingTime: "Instant",
    fee: "$0.00",
    limit: 50000,
    deliveryEstimate: "Instant, usually within seconds",
    available: true,
  },
  {
    id: "ach",
    name: "ACH / Domestic Wire",
    description: "To any US bank account",
    icon: Building2,
    processingTime: "1-3 days",
    fee: "Free - $25",
    limit: 100000,
    deliveryEstimate: "Typically 1–3 business days",
    available: true,
  },
  {
    id: "wire_international",
    name: "International Wire",
    description: "Send money worldwide (SWIFT)",
    icon: Globe2,
    processingTime: "1-5 days",
    fee: "From $45.00",
    limit: 250000,
    deliveryEstimate: "1–5 business days depending on destination",
    available: true,
  },
  {
    id: "zelle",
    name: "Zelle",
    description: "Send to email or phone number",
    icon: Smartphone,
    processingTime: "Instant",
    fee: "$0.00",
    limit: 2500,
    deliveryEstimate: "Instant in most cases",
    available: true,
  },
  {
    id: "crypto",
    name: "Crypto Wallet",
    description: "Bank-to-wallet transfer",
    icon: Wallet,
    processingTime: "Instant",
    fee: "Network fee",
    limit: 25000,
    deliveryEstimate: "Instant depending on network congestion",
    badge: "NEW",
    available: true,
  }
];

export const transferTypeOptions = transferTypes;

interface TransferMethodSelectorProps {
  selectedTypeId: UiTransferTypeId | null;
  onSelect: (id: UiTransferTypeId) => void;
}

export function TransferMethodSelector({
  selectedTypeId,
  onSelect,
}: TransferMethodSelectorProps) {
  return (
    <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-3" aria-label="Transfer Method">
      {transferTypes.map((type) => {
        const Icon = type.icon;
        const isActive = selectedTypeId === type.id;
        const isDisabled = type.available === false;

        return (
          <label
            key={type.id}
            className={cn(
              "relative flex flex-col items-start rounded-lg border p-3 text-left cursor-pointer transition-all min-h-[64px]",
              isActive
                ? "border-[color:var(--heritage-gold)] bg-[#FDFBF7] shadow-sm ring-1 ring-[color:var(--heritage-gold)]"
                : "border-slate-200 bg-white hover:border-[color:var(--heritage-navy)]/30 hover:bg-slate-50",
              isDisabled && "opacity-60 cursor-not-allowed",
              "focus-within:ring-2 focus-within:ring-[color:var(--heritage-navy)] focus-within:ring-offset-2"
            )}
            aria-disabled={isDisabled}
          >
            <input
              type="radio"
              name="transfer_method"
              value={type.id}
              checked={isActive}
              onChange={() => {
                if (!isDisabled) onSelect(type.id);
              }}
              disabled={isDisabled}
              className="sr-only"
            />
            {isActive && (
              <CheckCircle2 className="absolute top-3 right-3 h-4 w-4 text-[color:var(--heritage-gold)]" />
            )}
            <div className="flex items-center gap-3 w-full pr-6">
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors",
                  isActive
                    ? "bg-[color:var(--heritage-gold)]/10 text-[color:var(--heritage-gold)]"
                    : "bg-[color:var(--heritage-navy)]/5 text-[color:var(--heritage-navy)]"
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[color:var(--heritage-navy)] truncate">
                    {type.name}
                  </span>
                  {type.badge && (
                    <span className="shrink-0 rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700">
                      {type.badge}
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-muted-foreground truncate">
                  {type.fee === "$0.00" ? "Free" : type.fee} • {type.processingTime}
                </span>
              </div>
            </div>
            
            {/* Expandable description only shown when active to save space */}
            {isActive && (
              <div className="mt-3 text-[11px] text-muted-foreground animate-in fade-in slide-in-from-top-1">
                {type.description}. {type.deliveryEstimate}.
              </div>
            )}
          </label>
        );
      })}
    </fieldset>
  );
}
