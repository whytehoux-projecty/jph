import * as React from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Alert — docs/DESIGN_SYSTEM.md#alert
 * Inline, persistent message inside the page flow. For transient feedback
 * after an action use toast (lib/toast.ts).
 *
 * `danger` uses role="alert" (interrupts); the others use role="status".
 */
type AlertVariant = "info" | "success" | "warning" | "danger";

const styles: Record<AlertVariant, { box: string; icon: string; Icon: typeof Info }> = {
  info: { box: "bg-info-subtle border-info", icon: "text-info", Icon: Info },
  success: { box: "bg-success-subtle border-success", icon: "text-success", Icon: CheckCircle2 },
  warning: { box: "bg-warning-subtle border-warning", icon: "text-warning", Icon: AlertTriangle },
  danger: { box: "bg-danger-subtle border-danger", icon: "text-danger", Icon: AlertCircle },
};

export interface AlertProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  variant?: AlertVariant;
  title?: React.ReactNode;
  /** Buttons or links placed under the message. */
  actions?: React.ReactNode;
}

export function Alert({
  variant = "info",
  title,
  actions,
  className,
  children,
  ...props
}: AlertProps) {
  const { box, icon, Icon } = styles[variant];
  return (
    <div
      role={variant === "danger" ? "alert" : "status"}
      className={cn("flex gap-3 rounded-surface border-l-4 p-4 text-fg", box, className)}
      {...props}
    >
      <Icon className={cn("mt-0.5 size-5 shrink-0", icon)} aria-hidden="true" />
      <div className="flex min-w-0 flex-col gap-1">
        {title && <p className="text-body font-semibold">{title}</p>}
        {children && <div className="text-small">{children}</div>}
        {actions && <div className="mt-2 flex flex-wrap gap-2">{actions}</div>}
      </div>
    </div>
  );
}
