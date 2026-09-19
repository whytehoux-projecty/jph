import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { AdminPageShell } from "./AdminPageShell";

export type QuickLink = {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
};

type AdminHubPageProps = {
  title: string;
  subtitle: string;
  stats: any[];
  links: QuickLink[];
};

export function AdminHubPage({ title, subtitle, stats, links }: AdminHubPageProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div>
        <h2 className="text-2xl font-bold text-charcoal font-playfair tracking-wide">{title}</h2>
        <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
      </div>

      {stats && stats.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-muted-foreground text-sm font-medium">{stat.title}</h3>
                {stat.icon && <div className="text-vintage-gold">{stat.icon}</div>}
              </div>
              <div className="mt-auto">
                <p className="text-2xl font-bold text-charcoal">{stat.value}</p>
                {(stat.subtitle || stat.trend) && (
                  <p className="text-xs mt-1 flex items-center gap-1 text-muted-foreground">
                    {stat.trend && (
                      <span className={stat.trendPositive ? "text-green-600" : "text-red-600"}>
                        {stat.trend}
                      </span>
                    )}
                    {stat.subtitle}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <h3 className="text-lg font-semibold text-charcoal mb-4 border-b border-neutral-100 pb-4">Management Areas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {links.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              className="bg-neutral-50 p-5 rounded-xl border border-neutral-200 shadow-sm hover:shadow-md hover:border-vintage-gold/50 hover:bg-white transition-all flex items-start gap-4 group"
            >
              <div className="p-3 bg-white rounded-lg text-vintage-gold shadow-sm group-hover:bg-vintage-gold/10 transition-colors">
                {link.icon}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-charcoal flex items-center justify-between">
                  {link.title}
                  <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-10px] group-hover:translate-x-0" />
                </h4>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{link.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
