"use client"

import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

/** Switch — immediate on/off settings only. docs/DESIGN_SYSTEM.md#switch */
const Switch = React.forwardRef<
    React.ElementRef<typeof SwitchPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
    <SwitchPrimitive.Root
        className={cn(
            "peer relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-round border border-transparent",
            "transition-colors duration-(--duration-fast) ease-standard",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
            "data-[state=checked]:bg-action data-[state=unchecked]:bg-line-strong",
            "disabled:cursor-not-allowed disabled:data-[state=checked]:bg-fg-disabled disabled:data-[state=unchecked]:bg-line",
            // 44 px hit area without changing the drawn size
            "before:absolute before:-inset-x-1 before:-inset-y-2.5",
            className
        )}
        {...props}
        ref={ref}
    >
        <SwitchPrimitive.Thumb
            className={cn(
                "pointer-events-none block size-5 rounded-round bg-surface shadow-raised ring-0",
                "transition-transform duration-(--duration-fast) ease-standard",
                "data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0.5"
            )}
        />
    </SwitchPrimitive.Root>
))
Switch.displayName = SwitchPrimitive.Root.displayName

export { Switch }
