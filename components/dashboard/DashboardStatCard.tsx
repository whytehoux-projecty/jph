import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

export interface DashboardStatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  subtitle?: string;
  className?: string;
  animate?: string;
}

export function DashboardStatCard({
  title,
  value,
  icon: Icon,
  change,
  changeType = 'neutral',
  subtitle,
  className,
  animate,
}: DashboardStatCardProps) {
  const changeColor =
    changeType === 'positive'
      ? 'text-emerald-300'
      : changeType === 'negative'
      ? 'text-red-300'
      : 'text-white/80';

  return (
    <Card
      className={cn(
        'shadow-sm hover:shadow-md transition-shadow duration-300 bg-[color:var(--heritage-navy)] border-[color:var(--heritage-navy-mid)] text-white',
        animate,
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        {/* Fix #1: title contrast white/70 → white (full opacity) */}
        <CardTitle className="text-sm font-medium text-white/90">{title}</CardTitle>
        <Icon className="h-4 w-4 text-[color:var(--heritage-gold)]" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold font-playfair">{value}</div>
        {change && <p className={cn('text-xs mt-1 font-medium', changeColor)}>{change}</p>}
        {/* Fix #1: subtitle contrast white/50 → white/75 */}
        {subtitle && <p className="text-xs text-white/75 mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}

