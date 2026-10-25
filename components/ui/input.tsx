"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { controlBase, controlHeight } from "./control-styles"
import { useFieldControlProps } from "./form-field"

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> { }

/** Text input — docs/DESIGN_SYSTEM.md#inputs. Wrap in FormField for a label. */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, ...props }, ref) => {
        const fieldProps = useFieldControlProps(props)
        return (
            <input
                type={type}
                className={cn(
                    controlBase,
                    controlHeight,
                    "file:mr-3 file:border-0 file:bg-transparent file:text-small file:font-semibold file:text-fg",
                    className
                )}
                ref={ref}
                {...fieldProps}
            />
        )
    }
)
Input.displayName = "Input"

export { Input }
