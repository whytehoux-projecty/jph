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
        gold: "bg-vermilion-600/20 text-vermilion-700 border-vermilion-600/30",
        green: "bg-pine-700/20 text-pine-800 border-pine-700/30",
        "ink-900": "bg-ink-900/10 text-ink-900 border-ink-900/20",
        cream: "bg-paper-50/20 text-paper-50 border-paper-50/30",
    };

    const sizes = {
        sm: "p-2 rounded-lg",
        md: "p-3 rounded-xl",
        lg: "p-4 rounded-2xl",
    };

    const iconSizes = {
        sm: "w-4 h-4",
        md: "w-6 h-6",
        lg: "w-8 h-8",
    };

    return (
        <div className={cn(
            "flex items-center justify-center border backdrop-blur-sm transition-all duration-300 group-hover:scale-110",
            variants[variant],
            sizes[size],
            className
        )}>
            <Icon className={cn(iconSizes[size], "stroke-[1.5]")} />
        </div>
    );
}
