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

export type UiTransferTypeId = string;

interface TransferMethodConfig {
  id: string;
  methodId: string;
  displayName: string;
  description: string;
  isEnabled: boolean;
  isVisibleToUser: boolean;
  badge: string | null;
  processingTime: string;
  feeLabel: string;
  baseFee: number;
  percentageFee: number;
  dailyLimit: number;
  perTransferLimit: number;
  formConfig: string;
  sortOrder: number;
}

export const getIconForMethod = (methodId: string): LucideIcon => {
  switch (methodId) {
    case "internal": return ArrowRightLeft;
    case "ach": return Building2;
    case "wire_domestic": return Building2;
    case "wire_international": return Globe2;
    case "zelle": return Smartphone;
    case "crypto": return Wallet;
    case "fednow": return ArrowRightLeft;
    case "cashapp": return Smartphone;
    case "venmo": return Smartphone;
    default: return Building2;
  }
};

interface TransferMethodSelectorProps {
  selectedTypeId: UiTransferTypeId | null;
  onSelect: (id: UiTransferTypeId) => void;
  transferMethods: TransferMethodConfig[];
}

export function TransferMethodSelector({
  selectedTypeId,
  onSelect,
  transferMethods,
}: TransferMethodSelectorProps) {
  return (
    <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-3" aria-label="Transfer Method">
      {transferMethods.map((type) => {
        const Icon = getIconForMethod(type.methodId);
        const isActive = selectedTypeId === type.methodId;
        const isDisabled = !type.isEnabled;

        return (
          <label
            key={type.methodId}
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
              value={type.methodId}
              checked={isActive}
              onChange={() => {
                if (!isDisabled) onSelect(type.methodId);
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
                    {type.displayName}
                  </span>
                  {type.badge && (
                    <span className="shrink-0 rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700">
                      {type.badge}
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-muted-foreground truncate">
                  {type.feeLabel === "$0.00" ? "Free" : type.feeLabel} • {type.processingTime}
                </span>
              </div>
            </div>
            
            {/* Expandable description only shown when active to save space */}
            {isActive && (
              <div className="mt-3 text-[11px] text-muted-foreground animate-in fade-in slide-in-from-top-1">
                {type.description}
              </div>
            )}
          </label>
        );
      })}
    </fieldset>
  );
}
