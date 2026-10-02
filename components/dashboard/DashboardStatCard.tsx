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
  return (
    <Card
      className={cn(
        'group relative overflow-hidden bg-white border border-paper-200 text-ink-900 rounded-sm shadow-none transition-all duration-200 hover:border-ink-900/30',
        animate,
        className
      )}
    >
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-paper-200 group-hover:bg-vermilion-600 transition-colors" />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-5 px-5">
        <CardTitle className="text-xs font-mono font-medium uppercase tracking-wider text-ink-500">
          {title}
        </CardTitle>
        <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-paper-50 border border-paper-200/60 text-ink-700">
          <Icon className="h-3.5 w-3.5" />
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        <div className="text-2xl font-bold font-mono tabular-nums tracking-tight text-ink-900">
          {value}
        </div>
        <div className="mt-1.5 flex items-center justify-between text-xs">
          {change && (
            <span
              className={cn(
                'inline-flex items-center gap-1 font-mono font-medium px-1.5 py-0.5 rounded-sm text-[11px]',
                changeType === 'positive'
                  ? 'bg-success-bg text-success'
                  : changeType === 'negative'
                  ? 'bg-error-bg text-error'
                  : 'bg-paper-100 text-ink-500'
              )}
            >
              {change}
            </span>
          )}
          {subtitle && (
            <span className="text-[12px] text-ink-500 truncate" title={subtitle}>
              {subtitle}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}


