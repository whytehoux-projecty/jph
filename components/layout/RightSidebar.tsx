"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import {
  ShieldCheck,
  PiggyBank,
  Banknote,
  ChevronRight,
  Briefcase,
  Sparkles
} from "lucide-react";
import { VintageIcon } from "@/components/ui/vintage-icon";
import { SIDEBAR_REGISTRY } from "@/lib/sidebar-registry";

export interface UserProfile {
  firstName: string;
  lastName: string;
  id: string;
  tier: string;
  pinSetupComplete: boolean;
  profilePhotoUrl?: string | null;
  sidebarPreferences?: string | null;
}

interface RightSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  profile?: UserProfile | null;
}

const extraServices = [
  {
    name: "Savings & Goals",
    href: "/overview",
    icon: PiggyBank,
    desc: "High-yield savings & goals",
  },
  {
    name: "Personal Loans",
    href: "/support",
    icon: Banknote,
    desc: "Apply via support",
  },
  {
    name: "Business Suite",
    href: "/support",
    icon: Briefcase,
    desc: "For your enterprise",
  },
  {
    name: "Vault Premium +",
    href: "/settings",
    icon: ShieldCheck,
    desc: "Exclusive security features",
  },
];

export function RightSidebar({ isOpen, onToggle, profile }: RightSidebarProps) {
  const avatarSrc = profile?.profilePhotoUrl || "/images/icons/default-avatar.svg";

  const initials = profile?.firstName && profile?.lastName
    ? `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase()
    : 'JD';
  const fullName = profile ? `${profile.firstName} ${profile.lastName}` : 'John Doe';
  const tierLabel = profile?.tier ? `${profile.tier} MEMBER` : 'PREMIUM MEMBER';
  const memberId = profile?.id ? (profile.id.length > 10 ? profile.id.slice(-10).toUpperCase() : profile.id) : '8839-2991-00';

  let prefs: Record<string, boolean> = {};
  if (profile?.sidebarPreferences) {
    try {
      prefs = JSON.parse(profile.sidebarPreferences);
    } catch(e) {}
  }
  const showProfile = prefs['profile-photo'] !== false;
  const showQuickAccess = prefs['quick-access'] !== false;
  const showPromo = prefs['promo'] !== false;

  return (
    <aside
      className={cn(
        "fixed right-0 top-[70px] bottom-0 w-[340px] border-l border-border/40 bg-white/80 backdrop-blur-2xl transform transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] z-40 shadow-[rgba(0,0,0,0.04)_0px_3px_12px]",
        isOpen ? "translate-x-0" : "translate-x-full",
      )}>
      <ScrollArea className="h-full">
        <div className="p-6 pb-12">
          {/* Enhanced Profile Section */}
          {showProfile && (
            <div className="flex flex-col items-center gap-5 mb-8 pt-4 animate-fade-in-up">
              <div className="relative group cursor-pointer">
                {/* Premium Animated Gradient Ring */}
                <div className="absolute -inset-2 rounded-full bg-linear-to-tr from-amber-200 via-yellow-400 to-orange-300 opacity-60 blur-md group-hover:opacity-100 transition duration-700 animate-pulse-slow"></div>
                
                <Avatar className="relative h-32 w-32 border-4 border-white/90 shadow-2xl rounded-full transition-transform duration-500 group-hover:scale-[1.03]">
                  <AvatarImage
                    src={avatarSrc}
                    className="object-cover"
                  />
                  <AvatarFallback className="rounded-full text-4xl bg-linear-to-br from-slate-50 to-slate-200 text-slate-800 font-display font-semibold shadow-inner">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                
                {/* Radar Status Indicator */}
                <div className="absolute bottom-1 right-2 h-7 w-7 bg-emerald-500 rounded-full border-[3px] border-white shadow-md flex items-center justify-center">
                  <div className="absolute h-full w-full rounded-full bg-emerald-400 animate-ping opacity-60" />
                  <div className="h-2 w-2 bg-white rounded-full relative z-10" />
                </div>
              </div>
              
              <div className="text-center space-y-1.5">
                <h3 className="font-display font-extrabold text-2xl text-slate-900 tracking-tight">
                  {fullName}
                </h3>
                <div className="flex items-center justify-center gap-2">
                  <Badge
                    variant="outline"
                    className="text-amber-700 border-amber-200/60 bg-linear-to-r from-amber-50 to-amber-100/50 shadow-sm font-semibold tracking-wider text-[10px] px-3 py-1 rounded-full uppercase">
                    <Sparkles className="w-3 h-3 mr-1 inline-block text-amber-500" />
                    {tierLabel}
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-400 font-mono tracking-widest mt-2 uppercase opacity-80">
                  ID: {memberId}
                </p>
              </div>
            </div>
          )}

          {/* Dynamic Widgets Section */}
          <div className="space-y-4">
            {SIDEBAR_REGISTRY.filter(widget => {
              if (!profile?.sidebarPreferences) return widget.defaultVisibility;
              try {
                const prefs = JSON.parse(profile.sidebarPreferences);
                if (prefs[widget.id] !== undefined) return prefs[widget.id];
              } catch (e) {}
              return widget.defaultVisibility;
            }).map((widget, index) => {
              const WidgetComponent = widget.component;
              return (
                <div 
                  key={widget.id} 
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms`, animationFillMode: "both" }}
                >
                  <WidgetComponent />
                </div>
              );
            })}
          </div>

          {/* Extra Services Menu */}
          {showQuickAccess && (
            <div className="space-y-1 mt-8 animate-fade-in-up">
              <h4 className="text-[10px] font-bold text-slate-400 mb-3 uppercase tracking-[0.2em] pl-2">
                Quick Access
              </h4>
              <div className="space-y-1">
                {extraServices.map((service) => (
                  <Link
                    key={service.name}
                    href={service.href}
                    className="flex items-center gap-4 rounded-2xl p-3 transition-all duration-300 hover:bg-slate-50/80 hover:shadow-[0_4px_15px_rgba(0,0,0,0.03)] hover:scale-[1.01] group border border-transparent hover:border-slate-100">
                    <div className="bg-white p-2.5 rounded-[14px] shadow-sm group-hover:shadow-md transition-all border border-slate-100">
                      <VintageIcon
                        icon={service.icon}
                        size="sm"
                        variant="ink-900"
                      />
                    </div>

                    <div className="flex-1">
                      <h5 className="font-semibold text-[13px] text-slate-800 group-hover:text-primary transition-colors">
                        {service.name}
                      </h5>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {service.desc}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Premium Promo */}
          {showPromo && (
            <div className="mt-8 p-6 rounded-2xl bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black text-white relative overflow-hidden group border border-slate-700/50 shadow-2xl animate-fade-in-up">
               <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700 ease-out">
                 <ShieldCheck className="w-24 h-24" />
               </div>
               
               {/* Glassmorphism shine effect */}
               <div className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

              <h4 className="font-display font-bold text-lg mb-1.5 flex items-center gap-2 text-white/95 relative z-10 tracking-tight">
                Upgrade to Metal
              </h4>
              <p className="text-xs text-slate-300/90 mb-5 font-medium leading-relaxed relative z-10">
                Get 3% cashback and exclusive concierge service worldwide.
              </p>
              <Link href="/support" className="block relative z-10">
                <Button className="w-full h-10 text-xs font-semibold bg-white/10 text-white hover:bg-white hover:text-slate-900 border border-white/20 hover:border-white transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.05)] rounded-xl">
                  Explore Benefits
                </Button>
              </Link>
            </div>
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}
