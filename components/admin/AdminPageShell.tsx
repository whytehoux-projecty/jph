import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type StatCardProps = {
  title: string;
  value: string | number;
  icon?: ReactNode;
  subtitle?: string;
  trend?: string;
  trendPositive?: boolean;
};

export function StatCard({ title, value, icon, subtitle, trend, trendPositive }: StatCardProps) {
  return (
    <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm flex flex-col">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-muted-foreground text-sm font-medium">{title}</h3>
        {icon && <div className="text-vintage-gold">{icon}</div>}
      </div>
      <div className="mt-auto">
        <p className="text-2xl font-bold text-charcoal">{value}</p>
        {(subtitle || trend) && (
          <p className="text-xs mt-1 flex items-center gap-1 text-muted-foreground">
            {trend && (
              <span className={trendPositive ? "text-green-600" : "text-red-600"}>
                {trend}
              </span>
            )}
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

type AdminPageShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  stats?: StatCardProps[];
};

export function AdminPageShell({ title, subtitle, children, stats }: AdminPageShellProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div>
        <h2 className="text-2xl font-bold text-charcoal font-playfair tracking-wide">{title}</h2>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>

      {stats && stats.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <StatCard key={i} {...stat} />
          ))}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
