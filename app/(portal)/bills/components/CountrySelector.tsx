"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Globe } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { BILL_REGIONS } from "@/lib/bill-constants";

export const REGIONS = BILL_REGIONS.filter(r => r.value !== "all");

interface CountrySelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function CountrySelector({ value, onChange }: CountrySelectorProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-11 rounded-none border-paper-300 bg-white hover:border-ink-900 text-left font-normal px-3.5 text-small text-ink-900 transition-colors"
        >
          <div className="flex items-center gap-2.5 truncate">
            <Globe className="w-4 h-4 text-ink-500 shrink-0" />
            <span className="truncate">
              {value
                ? REGIONS.find((r) => r.value === value)?.label || value.toUpperCase()
                : "Select Region or Country..."}
            </span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0 rounded-none border border-paper-300 shadow-xl bg-white" align="start">
        <Command>
          <CommandInput placeholder="Search region or country..." className="text-small rounded-none" />
          <CommandList>
            <CommandEmpty className="text-small text-ink-500 py-3 text-center">No region found.</CommandEmpty>
            <CommandGroup heading="Supported Billing Jurisdictions" className="text-ink-900 font-sans">
              {REGIONS.map((region) => (
                <CommandItem
                  key={region.value}
                  value={region.value}
                  onSelect={(currentValue) => {
                    onChange(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                  className="rounded-none cursor-pointer text-small hover:bg-paper-100 py-2.5"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 text-vermilion-600",
                      value === region.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span>{region.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
