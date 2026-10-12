"use client";

import * as React from "react";
import { Zap, Tv, Wifi, Shield, Droplet, CreditCard, Building2, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

export const CATEGORIES = [
  { id: "UTILITIES", label: "Electricity & Gas", icon: Zap, description: "Power, heating & natural gas" },
  { id: "INTERNET", label: "Internet & Telecom", icon: Wifi, description: "Broadband, fiber & mobile lines" },
  { id: "WATER", label: "Water & Municipal", icon: Droplet, description: "Water boards & wastewater services" },
  { id: "TV", label: "Media & Streaming", icon: Tv, description: "Cable network & subscriptions" },
  { id: "INSURANCE", label: "Insurance Policies", icon: Shield, description: "Property, health & auto underwriting" },
  { id: "CREDIT", label: "Card & Loan Settlement", icon: CreditCard, description: "Revolving lines & financing debts" },
  { id: "EDUCATION", label: "Tuition & Academics", icon: GraduationCap, description: "Universities, colleges & school fees" },
  { id: "COUNCIL", label: "Council & Public Sector", icon: Building2, description: "Municipal tax, rates & licenses" },
];

interface ServiceCategoryGridProps {
  value: string;
  onChange: (value: string) => void;
}

export function ServiceCategoryGrid({ value, onChange }: ServiceCategoryGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
      {CATEGORIES.map((cat) => {
        const Icon = cat.icon;
        const isSelected = value === cat.id;

        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onChange(cat.id)}
            className={cn(
              "group relative p-3.5 text-left rounded-none border transition-all duration-150 outline-none flex items-start gap-3 cursor-pointer",
              "focus-visible:ring-2 focus-visible:ring-ink-900 focus-visible:ring-offset-1",
              isSelected
                ? "bg-white border-ink-900 text-ink-900 shadow-xs ring-1 ring-ink-900"
                : "bg-paper-50 border-paper-300 text-ink-700 hover:bg-paper-100 hover:border-ink-900"
            )}
          >
            <div
              className={cn(
                "p-2 rounded-none shrink-0 transition-colors",
                isSelected ? "bg-ink-900 text-paper-50" : "bg-paper-100 text-ink-900 group-hover:bg-paper-200"
              )}
            >
              <Icon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="block text-small font-semibold leading-tight text-ink-900 truncate">
                {cat.label}
              </span>
              <span className="block text-[11px] text-ink-500 leading-snug mt-0.5 line-clamp-1">
                {cat.description}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
