import { cn } from "@/lib/utils";

type AdminBadgeProps = {
  count: number;
  variant?: "pending" | "urgent" | "neutral";
  className?: string;
};

export function AdminBadge({ count, variant = "neutral", className }: AdminBadgeProps) {
  if (count <= 0) return null;
  
  return (
    <span className={cn(
      "inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-bold rounded-full transition-colors",
      variant === "pending" && "bg-amber-100 text-amber-800",
      variant === "urgent" && "bg-red-100 text-red-800",
      variant === "neutral" && "bg-neutral-200 text-neutral-800",
      className
    )}>
      {count > 99 ? "99+" : count}
    </span>
  );
}
