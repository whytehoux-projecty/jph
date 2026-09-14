import type { CSSProperties, KeyboardEvent } from "react";
import {
  ArrowRightLeft,
  Zap,
  Building2,
  Smartphone,
  Globe2,
  Clock3,
  DollarSign,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type UiTransferTypeId =
  | "internal"
  | "wire_domestic"
  | "ach"
  | "zelle"
  | "wire_international"
  | "rtp";

interface TransferTypeOption {
  id: UiTransferTypeId;
  name: string;
  description: string;
  icon: LucideIcon;
  processingTime: string;
  fee: string;
  limit: number;
  color: string;
  deliveryEstimate: string;
  isNew?: boolean;
  beta?: boolean;
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
    color: "#10B981",
    deliveryEstimate: "Instant, usually within seconds",
    available: true,
  },
  {
    id: "wire_domestic",
    name: "Domestic Wire",
    description: "To any US bank account",
    icon: Zap,
    processingTime: "Same day",
    fee: "$25.00",
    limit: 100000,
    color: "#3B82F6",
    deliveryEstimate: "Same business day when sent before cutoff",
    available: true,
  },
  {
    id: "ach",
    name: "ACH Transfer",
    description: "To external bank accounts",
    icon: Building2,
    processingTime: "1-3 business days",
    fee: "$0.00",
    limit: 25000,
    color: "#8B5CF6",
    deliveryEstimate: "Typically 1–3 business days",
    isNew: true,
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
    color: "#6366F1",
    deliveryEstimate: "Instant in most cases",
    isNew: true,
    available: true,
  },
  {
    id: "wire_international",
    name: "International Wire",
    description: "Send money worldwide (SWIFT)",
    icon: Globe2,
    processingTime: "1-5 business days",
    fee: "From $45.00",
    limit: 250000,
    color: "#EC4899",
    deliveryEstimate: "1–5 business days depending on destination",
    isNew: true,
    available: true,
  },
  {
    id: "rtp",
    name: "Real-Time Payments",
    description: "Instant transfer to RTP-enabled banks",
    icon: Zap,
    processingTime: "Instant",
    fee: "$0.50",
    limit: 25000,
    color: "#F59E0B",
    deliveryEstimate: "Instant when supported by recipient bank",
    isNew: true,
    beta: true,
    available: false,
  },
];

export const transferTypeOptions = transferTypes;

interface TransferMethodSelectorProps {
  selectedTypeId: UiTransferTypeId;
  onSelect: (id: UiTransferTypeId) => void;
}

export function TransferMethodSelector({
  selectedTypeId,
  onSelect,
}: TransferMethodSelectorProps) {
  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    const key = event.key;
    if (
      key !== "ArrowRight" &&
      key !== "ArrowLeft" &&
      key !== "ArrowDown" &&
      key !== "ArrowUp"
    ) {
      return;
    }
    event.preventDefault();
    const direction = key === "ArrowRight" || key === "ArrowDown" ? 1 : -1;
    let targetIndex = index;
    for (let i = 0; i < transferTypes.length; i += 1) {
      targetIndex =
        (targetIndex + direction + transferTypes.length) % transferTypes.length;
      const candidate = transferTypes[targetIndex];
      if (candidate.available === false) {
        continue;
      }
      onSelect(candidate.id);
      const element = document.getElementById(
        `transfer-type-${candidate.id}`,
      ) as HTMLButtonElement | null;
      if (element) {
        element.focus();
      }
      break;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {transferTypes.map((type, index) => {
        const Icon = type.icon;
        const isActive = selectedTypeId === type.id;
        const isDisabled = type.available === false;

        return (
          <button
            key={type.id}
            id={`transfer-type-${type.id}`}
            type="button"
            onClick={() => {
              if (!isDisabled) onSelect(type.id);
            }}
            className={`flex flex-col items-start rounded-lg border p-4 text-left transition ${
              isActive
                ? "border-[color:var(--heritage-navy)] bg-soft-gold/10 shadow-md"
                : "border-slate-200 hover:border-soft-gold/60 hover:shadow-sm"
            } ${
              isDisabled ? "opacity-60 cursor-not-allowed" : ""
            } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--heritage-navy)] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50`}
            style={{ "--type-color": type.color } as CSSProperties}
            disabled={isDisabled}
            tabIndex={isDisabled ? -1 : isActive ? 0 : -1}
            onKeyDown={(event) => handleKeyDown(event, index)}>
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-md"
                style={{ backgroundColor: `${type.color}26` }}>
                <Icon className="h-5 w-5" style={{ color: type.color }} />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-charcoal">
                    {type.name}
                  </span>
                  {type.isNew && (
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-800">
                      NEW
                    </span>
                  )}
                  {type.beta && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                      BETA
                    </span>
                  )}
                  {isDisabled && (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                      COMING SOON
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {type.description}
                </span>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground w-full">
              <div className="flex items-center gap-1">
                <Clock3 className="h-3 w-3" />
                <span>{type.processingTime}</span>
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                <span>{type.fee}</span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
