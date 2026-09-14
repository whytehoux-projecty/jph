"use client";

import { useState } from "react";
import { updateLimits } from "@/app/actions/cards";
import { toast } from "@/lib/toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { Shield, Clock, Calendar, ShoppingCart, Building2, Check, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface CardLimitsControlProps {
  cardId: string;
  currentLimits?: {
    dailySpend: number;
    monthlySpend: number;
    atmWithdrawal: number;
    onlinePurchase: number;
  };
}

export function CardLimitsControl({
  cardId,
  currentLimits,
}: CardLimitsControlProps) {
  const [limits, setLimits] = useState({
    dailySpend:     currentLimits?.dailySpend     || 2000,
    monthlySpend:   currentLimits?.monthlySpend   || 10000,
    onlinePurchase: currentLimits?.onlinePurchase || 5000,
  });

  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleLimitChange = (key: keyof typeof limits, value: number) => {
    setLimits((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
    setSaved(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateLimits(cardId, {
        dailyLimit: limits.dailySpend,
        monthlyLimit: limits.monthlySpend,
      });
      setIsDirty(false);
      setSaved(true);
      toast.success({ title: "Spending limits updated", description: "Changes take effect immediately." });
      setTimeout(() => setSaved(false), 3000);
    } catch {
      toast.error({ title: "Failed to save limits", description: "Please try again." });
    } finally {
      setIsSaving(false);
    }
  };

  interface SliderProps {
    label: string;
    sublabel?: string;
    value: number;
    max: number;
    step?: number;
    field: keyof typeof limits;
    icon: any;
    iconColor?: string;
  }

  const LimitSlider = ({ label, sublabel, value, max, step = 100, field, icon: Icon, iconColor = "text-charcoal/60 bg-gray-50" }: SliderProps) => {
    const pct = Math.round((value / max) * 100);
    return (
      <div className="space-y-2.5 pt-1">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className={cn("p-2 rounded-lg", iconColor)}>
              <Icon size={15} />
            </div>
            <div>
              <p className="text-sm font-medium text-charcoal leading-none">{label}</p>
              {sublabel && <p className="text-[11px] text-muted-foreground mt-0.5">{sublabel}</p>}
            </div>
          </div>
          <div className="text-right">
            <span className="text-base font-bold text-vintage-green font-mono">
              ${value.toLocaleString()}
            </span>
            <p className="text-[10px] text-muted-foreground text-right">{pct}% of max</p>
          </div>
        </div>
        <div className="space-y-1">
          <input
            type="range"
            aria-label={label}
            title={label}
            min="0"
            max={max}
            step={step}
            value={value}
            onChange={(e) => handleLimitChange(field, parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-vintage-green focus:outline-none focus:ring-2 focus:ring-vintage-green/20"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
            <span>$0</span>
            <span>${(max / 2).toLocaleString()}</span>
            <span>${max.toLocaleString()}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-vintage-green" />
              Spending Limits
            </CardTitle>
            <CardDescription>
              Dynamic controls for this card. Changes apply immediately.
            </CardDescription>
          </div>
          {isDirty && (
            <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 shrink-0">
              Unsaved
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6 divide-y divide-gray-100">
        <LimitSlider
          label="Daily Spend Limit"
          sublabel="Resets midnight each day"
          value={limits.dailySpend}
          max={10000}
          field="dailySpend"
          icon={Clock}
          iconColor="text-blue-600 bg-blue-50"
        />
        <LimitSlider
          label="Monthly Spend Limit"
          sublabel="Resets 1st of each month"
          value={limits.monthlySpend}
          max={50000}
          step={500}
          field="monthlySpend"
          icon={Calendar}
          iconColor="text-purple-600 bg-purple-50"
        />
        <LimitSlider
          label="Online Purchase Limit"
          sublabel="Per e-commerce transaction"
          value={limits.onlinePurchase}
          max={20000}
          field="onlinePurchase"
          icon={ShoppingCart}
          iconColor="text-orange-600 bg-orange-50"
        />

        {/* ATM — informational only (branch-managed) */}
        <div className="pt-3 flex items-start gap-3 bg-blue-50/50 rounded-lg p-3 border border-blue-100">
          <Building2 className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-medium text-charcoal">ATM Withdrawal Limit</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              ATM limits are set at the branch level. Visit any branch or call us to adjust your daily ATM allowance.
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t bg-gray-50/50 p-4">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Info size={13} />
          <span>Online purchase limit saved locally until backend support is added.</span>
        </div>
        <Button
          onClick={handleSave}
          disabled={!isDirty || isSaving}
          variant={saved ? "outline" : "primary"}
          className={cn(saved && "text-emerald-600 border-emerald-200 bg-emerald-50")}
        >
          {isSaving ? "Saving…" : saved ? (
            <><Check size={16} className="mr-2" /> Saved</>
          ) : "Update Limits"}
        </Button>
      </CardFooter>
    </Card>
  );
}
