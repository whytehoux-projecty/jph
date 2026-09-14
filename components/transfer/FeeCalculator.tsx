import { useEffect, useMemo, useState } from "react";
import { AlertCircle, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { UiTransferTypeId } from "@/components/transfer/TransferMethodSelector";
import { getExchangeRate } from "@/app/actions/transfer";
type FeeVariant = "full" | "compact";

interface FeeConfig {
  baseFee?: number;
  percentage?: number;
  minFee?: number;
  maxFee?: number;
  fxSpread?: number;
  expressAvailable?: boolean;
  expressFee?: number;
}

interface FeeBreakdown {
  baseFee: number;
  percentageFee: number;
  fxMarkup: number;
  totalFee: number;
  transferAmount: number;
  totalCost: number;
  recipientReceives: number;
}

const FEE_STRUCTURE: Partial<Record<UiTransferTypeId, FeeConfig>> = {
  internal: {
    baseFee: 0,
  },
  ach: {
    baseFee: 0,
  },
  zelle: {
    baseFee: 0,
  },
  wire_domestic: {
    baseFee: 25,
    expressAvailable: true,
    expressFee: 40,
  },
  wire_international: {
    baseFee: 45,
    fxSpread: 0.01,
    expressAvailable: true,
    expressFee: 60,
  },
  rtp: {
    baseFee: 0.5,
  },
};

interface FeeCalculatorProps {
  methodId: UiTransferTypeId | null;
  amount: number;
  currency?: string;
  targetCurrency?: string;
  variant?: FeeVariant;
  onCompareMethods?: () => void;
}

export function FeeCalculator({
  methodId,
  amount,
  currency = "USD",
  targetCurrency = "USD",
  variant = "full",
  onCompareMethods,
}: FeeCalculatorProps) {
  const [useExpress, setUseExpress] = useState(false);
  const [fxRate, setFxRate] = useState<number | null>(null);
  const [fxRateError, setFxRateError] = useState<string | null>(null);

  useEffect(() => {
    setUseExpress(false);
  }, [methodId]);

  useEffect(() => {
    if (
      !methodId ||
      methodId !== "wire_international" ||
      !currency ||
      !targetCurrency ||
      currency === targetCurrency
    ) {
      setFxRate(null);
      setFxRateError(null);
      return;
    }
    let cancelled = false;
    const run = async () => {
      try {
        const data = await getExchangeRate(currency, targetCurrency);
        const rate =
          typeof (data as any).rate === "number"
            ? (data as any).rate
            : typeof (data as any).fxRate === "number"
              ? (data as any).fxRate
              : typeof (data as any).data?.rate === "number"
                ? (data as any).data.rate
                : null;
        if (!cancelled) {
          if (rate && rate > 0) {
            setFxRate(rate);
            setFxRateError(null);
          } else {
            setFxRate(null);
          }
        }
      } catch {
        if (!cancelled) {
          setFxRate(null);
          setFxRateError("FX rate temporarily unavailable");
        }
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [methodId, currency, targetCurrency]);

  const breakdown = useMemo<FeeBreakdown | null>(() => {
    if (!methodId || !amount || amount <= 0) return null;

    const config = FEE_STRUCTURE[methodId] || {};
    let baseFee = config.baseFee ?? 0;
    if (config.expressAvailable && useExpress && typeof config.expressFee === "number") {
      baseFee = config.expressFee;
    }
    let percentageFee = 0;

    if (config.percentage) {
      percentageFee = amount * config.percentage;
    }

    let totalFee = baseFee + percentageFee;

    if (config.minFee && totalFee < config.minFee) {
      totalFee = config.minFee;
    }

    if (config.maxFee && totalFee > config.maxFee) {
      totalFee = config.maxFee;
    }

    let fxMarkup = 0;
    if (methodId === "wire_international" && targetCurrency !== currency) {
      fxMarkup = amount * (config.fxSpread || 0);
    }

    const effectiveTotalFee = totalFee + fxMarkup;

    return {
      baseFee,
      percentageFee,
      fxMarkup,
      totalFee: effectiveTotalFee,
      transferAmount: amount,
      totalCost: amount + effectiveTotalFee,
      recipientReceives:
        methodId === "wire_international" && fxRate
          ? (amount - fxMarkup) * fxRate
          : amount - fxMarkup,
    };
  }, [amount, currency, methodId, targetCurrency, useExpress, fxRate]);

  if (!breakdown) {
    return null;
  }

  const currencyLabel = currency;
  const wireConfig = FEE_STRUCTURE["wire_domestic"] || {};
  const referenceWireFee = wireConfig.baseFee ?? 0;
  const showSavingsAlert =
    breakdown.totalFee === 0 && referenceWireFee > 0 && methodId !== "wire_domestic";

  if (variant === "compact") {
    return (
      <div className="text-xs space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Transfer amount</span>
          <span className="font-medium">
            {formatCurrency(breakdown.transferAmount, currencyLabel)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Fees</span>
          <span>
            {breakdown.totalFee === 0
              ? "No fee"
              : formatCurrency(breakdown.totalFee, currencyLabel)}
          </span>
        </div>
        <div className="flex items-center justify-between border-t border-slate-200 pt-2 mt-1">
          <span className="text-muted-foreground">Total debited</span>
          <span className="font-semibold">
            {formatCurrency(breakdown.totalCost, currencyLabel)}
          </span>
        </div>
      </div>
    );
  }

  const isFree = breakdown.totalFee === 0;

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ArrowUpRight className="h-4 w-4 text-vintage-green" />
          <span className="text-xs font-semibold text-charcoal">
            Fee breakdown
          </span>
        </div>
        {showSavingsAlert ? (
          <span className="text-[11px] font-medium text-vintage-green">
            No transfer fee. You could save up to{" "}
            {formatCurrency(referenceWireFee, currencyLabel)} vs a wire.
          </span>
        ) : isFree ? (
          <span className="text-[11px] font-medium text-vintage-green">
            No transfer fee for this method
          </span>
        ) : (
          <span className="text-[11px] text-muted-foreground">
            Based on estimated pricing
          </span>
        )}
      </div>

      {fxRateError && (
        <div className="flex items-start gap-1.5 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2 py-1.5">
          <AlertCircle className="h-3.5 w-3.5 mt-0.5" />
          <p>{fxRateError}. We will apply the bank&apos;s rate at the time of processing.</p>
        </div>
      )}

      {methodId &&
        (methodId === "wire_domestic" || methodId === "wire_international") && (
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Delivery speed</span>
            <div className="inline-flex rounded-full bg-slate-100 p-0.5">
              <button
                type="button"
                onClick={() => setUseExpress(false)}
                className={`px-2.5 py-1 rounded-full transition ${
                  !useExpress
                    ? "bg-white text-charcoal shadow-sm"
                    : "text-muted-foreground hover:text-charcoal hover:bg-white/60"
                }`}
              >
                Standard
              </button>
              <button
                type="button"
                onClick={() => setUseExpress(true)}
                className={`px-2.5 py-1 rounded-full transition ${
                  useExpress
                    ? "bg-white text-charcoal shadow-sm"
                    : "text-muted-foreground hover:text-charcoal hover:bg-white/60"
                }`}
              >
                Express
              </button>
            </div>
          </div>
        )}

      <div className="space-y-1.5 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Transfer amount</span>
          <span className="font-medium">
            {formatCurrency(breakdown.transferAmount, currencyLabel)}
          </span>
        </div>
        {!isFree && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Base fee</span>
              <span>
                {formatCurrency(breakdown.baseFee, currencyLabel)}
              </span>
            </div>
            {breakdown.percentageFee > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  Variable fee
                </span>
                <span>
                  {formatCurrency(breakdown.percentageFee, currencyLabel)}
                </span>
              </div>
            )}
            {breakdown.fxMarkup > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">FX markup</span>
                <span>
                  {formatCurrency(breakdown.fxMarkup, currencyLabel)}
                </span>
              </div>
            )}
          </>
        )}
        <div className="flex items-center justify-between border-t border-slate-200 pt-2 mt-1.5">
          <span className="text-muted-foreground">Total fees</span>
          <span className="font-semibold">
            {isFree
              ? "No fee"
              : formatCurrency(breakdown.totalFee, currencyLabel)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Total debited</span>
          <span className="font-semibold">
            {formatCurrency(breakdown.totalCost, currencyLabel)}
          </span>
        </div>
        {breakdown.fxMarkup > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1">
              <ArrowDownRight className="h-3 w-3" />
              Recipient receives
            </span>
            <span>
              {formatCurrency(breakdown.recipientReceives, targetCurrency)}
            </span>
          </div>
        )}
        {fxRate &&
          methodId === "wire_international" &&
          currency !== targetCurrency && (
            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
              <span>Estimated FX rate</span>
              <span>
                1 {currencyLabel} ≈ {fxRate.toFixed(4)} {targetCurrency}
              </span>
            </div>
          )}
      </div>

      {!isFree && (
        <div className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
          <AlertCircle className="h-3.5 w-3.5 mt-0.5" />
          <p>
            Final fees may differ slightly based on processing time and
            destination bank.
          </p>
        </div>
      )}

      {onCompareMethods && (
        <div className="flex items-center justify-between pt-2 border-t border-dashed border-slate-200 mt-1.5">
          <span className="text-[11px] text-muted-foreground">
            Want to explore other options?
          </span>
          <button
            type="button"
            onClick={onCompareMethods}
            className="text-[11px] font-semibold text-[color:var(--heritage-navy)] hover:underline"
          >
            Compare methods
          </button>
        </div>
      )}
    </div>
  );
}
