"use client";

import { SlidersHorizontal } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { cn } from "@/lib/utils";

interface SortOption {
  value: string;
  label: string;
}

interface SortSelectProps {
  value: string;
  onChange: (val: string) => void;
  options?: SortOption[];
  className?: string;
}

const defaultOptions: SortOption[] = [
  { value: "balance-desc", label: "Balance (High → Low)" },
  { value: "balance-asc", label: "Balance (Low → High)" },
  { value: "name-asc", label: "Name (A → Z)" },
  { value: "name-desc", label: "Name (Z → A)" },
];

export function SortSelect({ value, onChange, options = defaultOptions, className }: SortSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={cn("w-full md:w-[220px] h-10 bg-slate-50 border-slate-200 hover:bg-white transition-colors focus:ring-1 focus:ring-ink-900 rounded-lg", className)}>
        <SlidersHorizontal className="w-4 h-4 mr-2 stroke-2 text-muted-foreground" />
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        {options.map(opt => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
