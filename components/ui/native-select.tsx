"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { controlBase, controlHeight } from "./control-styles";
import { useFieldControlProps } from "./form-field";

/**
 * Native <select> — preferred on mobile and in long forms (the platform
 * picker is the most accessible option). Use Select (Radix) only where the
 * options need custom rendering. docs/DESIGN_SYSTEM.md#select
 */
export const NativeSelect = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => {
  const fieldProps = useFieldControlProps(props);
  return (
    <div className="relative">
      <select
        ref={ref}
        className={cn(controlBase, controlHeight, "appearance-none pr-10", className)}
        {...fieldProps}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2 text-fg-muted"
      />
    </div>
  );
});
NativeSelect.displayName = "NativeSelect";
