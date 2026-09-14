import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VintageIconProps {
    icon: LucideIcon;
    variant?: 'gold' | 'green' | 'charcoal' | 'cream';
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
        gold: "bg-soft-gold/20 text-soft-gold-dark border-soft-gold/30",
        green: "bg-vintage-green/20 text-vintage-green-dark border-vintage-green/30",
        charcoal: "bg-charcoal/10 text-charcoal border-charcoal/20",
        cream: "bg-off-white/20 text-off-white border-off-white/30",
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
