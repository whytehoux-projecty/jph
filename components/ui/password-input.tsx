"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { controlBase, controlHeight } from "./control-styles";
import { useFieldControlProps } from "./form-field";

export interface PasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {}

/**
 * Password field with a reveal toggle — docs/DESIGN_SYSTEM.md#password-field
 * Reveal state is local to the component and resets on unmount; the toggle
 * is a real button with aria-pressed, so it works from the keyboard.
 */
const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, autoComplete = "current-password", ...props }, ref) => {
    const [visible, setVisible] = React.useState(false);
    const fieldProps = useFieldControlProps(props);
    const generatedId = React.useId();
    const inputId = fieldProps.id ?? `password-${generatedId}`;

    return (
      <div className="relative">
        <input
          ref={ref}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          className={cn(controlBase, controlHeight, "pr-12", className)}
          {...fieldProps}
          id={inputId}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-controls={inputId}
          aria-pressed={visible}
          aria-label={visible ? "Hide password" : "Show password"}
          disabled={fieldProps.disabled}
          className={cn(
            "absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-control text-fg-muted",
            "hover:text-fg focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus",
            "disabled:cursor-not-allowed disabled:text-fg-disabled",
          )}
        >
          {visible ? <EyeOff className="size-5" aria-hidden="true" /> : <Eye className="size-5" aria-hidden="true" />}
        </button>
      </div>
    );
  },
);
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
