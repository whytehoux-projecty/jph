import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VintageIconProps {
    icon: LucideIcon;
    variant?: 'gold' | 'green' | 'ink-900' | 'cream';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function VintageIcon({
    icon: Icon,
    variant = 'gold',
    size = 'md',
    className
}: VintageIconProps) {

    const variants = {
        gold: "bg-action-subtle text-fg-action border-transparent",
        green: "bg-success-subtle text-success border-transparent",
        "ink-900": "bg-surface-muted text-fg border-line",
        cream: "bg-transparent text-fg-inverse border-line-inverse",
    };

    const sizes = {
        sm: "p-2 rounded-control",
        md: "p-2.5 rounded-control",
        lg: "p-3 rounded-surface",
    };

    const iconSizes = {
        sm: "size-4",
        md: "size-5",
        lg: "size-6",
    };

    return (
        <div className={cn(
            "flex shrink-0 items-center justify-center border",
            variants[variant],
            sizes[size],
            className
        )}>
            <Icon className={iconSizes[size]} strokeWidth={1.5} aria-hidden="true" />
        </div>
    );
}
