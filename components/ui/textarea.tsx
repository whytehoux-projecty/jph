"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { controlBase } from "./control-styles"
import { useFieldControlProps } from "./form-field"

export interface TextareaProps
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement> { }

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, ...props }, ref) => {
        const fieldProps = useFieldControlProps(props)
        return (
            <textarea
                className={cn(controlBase, "min-h-24 px-3 py-2.5", className)}
                ref={ref}
                {...fieldProps}
            />
        )
    }
)
Textarea.displayName = "Textarea"

export { Textarea }
