"use client";

import { cn } from "@/lib/utils";

interface SegmentedControlProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function SegmentedControl({ options, value, onChange, className }: SegmentedControlProps) {
  return (
    <div
      className={cn(
        "inline-flex bg-slate-100/80 p-1 rounded-full items-center",
        className
      )}
    >
      {options.map((option) => {
        const isActive = value === option;
        return (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 capitalize",
              isActive
                ? "bg-[color:var(--heritage-navy)] text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
            )}
          >
            {option === "all" ? "All" : option}
          </button>
        );
      })}
    </div>
  );
}
