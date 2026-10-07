"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, ChevronDown, User, ShieldCheck, PiggyBank, Banknote, Briefcase, ChevronRight, LogOut, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { portalTabs } from "@/lib/portal-tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import { VintageIcon } from "@/components/ui/vintage-icon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface PortalSubHeaderProps {
  profile?: {
    id?: string;
    firstName?: string;
    lastName?: string;
    tier?: string;
    email?: string;
    phone?: string | null;
    profilePhotoUrl?: string | null;
    profileType?: string;
  } | null;
  accountNumber?: string;
}



export function PortalSubHeader({ profile }: PortalSubHeaderProps) {
  const pathname = usePathname();
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const loginTimeStr = sessionStorage.getItem("portal_login_time");
      const now = Date.now();
      let loginTime: number;

      if (!loginTimeStr) {
        loginTime = now;
        sessionStorage.setItem("portal_login_time", loginTime.toString());
      } else {
        loginTime = parseInt(loginTimeStr, 10);
      }

      const elapsed = now - loginTime;
      const displayDuration = 30 * 1000;

      if (elapsed < displayDuration) {
        setShowWelcome(true);
        const timeout = setTimeout(() => {
          setShowWelcome(false);
        }, displayDuration - elapsed);
        return () => clearTimeout(timeout);
      } else {
        setShowWelcome(false);
      }
    }
  }, []);

  const firstName = profile?.firstName || "Client";
  const fullNameRaw = `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim() || "Client";
  const fullName = fullNameRaw.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  const tier = profile?.tier ? `${profile.tier} Member` : "Private Client";
  const tierLabel = profile?.tier ? `${profile.tier} MEMBER` : 'PREMIUM MEMBER';
  const avatarSrc = profile?.profilePhotoUrl || "/images/icons/default-avatar.svg";
  const initials = profile?.firstName && profile?.lastName
    ? `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase()
    : 'JD';
  const memberId = profile?.id ? (profile.id.length > 10 ? profile.id.slice(-10).toUpperCase() : profile.id) : '8839-2991-00';

  const extraServices = [
    { name: "Savings & Goals", href: "/savings", icon: PiggyBank, desc: "High-yield savings & goals" },
    { name: "Personal Loans", href: "/support", icon: Banknote, desc: "Apply via support" },
    { name: "Business Suite", href: "/support", icon: Briefcase, desc: "For your enterprise" },
    { name: "Vault Premium +", href: "/settings", icon: ShieldCheck, desc: "Exclusive security features" },
  ];

  return (
    <div className="w-full border-b border-paper-200 bg-paper-50/90 backdrop-blur-xs transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-4 md:px-6 lg:px-8 py-2">
        {/* Left: Personalized greeting or Page Title */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2">
            {pathname === "/dashboard" || pathname === "/" ? (
              <span className="text-sm tracking-tight text-ink-900 leading-snug">
                {showWelcome ? (
                  <>
                    <span className="font-semibold">Welcome back, {firstName}.</span> <span className="hidden lg:inline text-ink-600">Know that Heritage Trust will never ask for your password, PIN, or OTP via email or phone. <Link href="/security" className="underline hover:text-vermilion-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vermilion-600 rounded-sm">Learn more about staying safe</Link></span>
                  </>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="font-semibold tracking-wider hover:opacity-80 transition-opacity flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-900 rounded-sm">
                        {fullName}
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[340px] p-0 border-paper-200 bg-white/95 backdrop-blur-md shadow-lg rounded-xl overflow-hidden mt-2">
                      <div className="p-6">
                        {/* Enhanced Profile Section */}
                        <div className="flex flex-col items-center gap-4 mb-6">
                          <div className="relative group">
                            <Avatar className="h-24 w-24 border-[3px] border-white shadow-sm rounded-full">
                              <AvatarImage src={avatarSrc} className="object-cover" />
                              <AvatarFallback className="rounded-full text-3xl bg-paper-100 text-ink-900 font-display font-semibold shadow-none">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <div className="absolute bottom-1 right-1 h-5 w-5 bg-success rounded-full border-2 border-white flex items-center justify-center">
                              <div className="absolute h-full w-full rounded-full bg-success animate-ping opacity-60" />
                              <div className="h-1.5 w-1.5 bg-white rounded-full relative z-10" />
                            </div>
                          </div>
                          
                          <div className="text-center space-y-1">
                            <h3 className="font-display font-extrabold text-xl text-ink-900 tracking-tight">
                              {fullName}
                            </h3>
                            <div className="flex items-center justify-center gap-2">
                              <Badge variant="outline" className="text-vermilion-700 border-transparent bg-vermilion-100 shadow-none font-semibold tracking-wider text-[10px] px-2 py-0.5 rounded uppercase">
                                <Sparkles className="w-3 h-3 mr-1 inline-block text-vermilion-600" />
                                {tierLabel}
                              </Badge>
                            </div>
                            <p className="text-[11px] text-ink-500 font-mono tracking-widest mt-1 uppercase opacity-80">
                              ID: {memberId}
                            </p>
                          </div>
                        </div>

                        {/* Extra Services Menu */}
                        <div className="space-y-1 mt-4">
                          <h4 className="text-[10px] font-bold text-ink-500 mb-2 uppercase tracking-[0.2em] pl-2">
                            Quick Access
                          </h4>
                          <div className="space-y-1">
                            {extraServices.map((service) => (
                              <DropdownMenuItem key={service.name} asChild className="cursor-pointer">
                                <Link
                                  href={service.href}
                                  className="flex items-center gap-4 rounded p-2.5 transition-colors duration-200 hover:bg-paper-50 group border border-transparent hover:border-paper-200 w-full"
                                >
                                  <div className="bg-paper-50 p-2 rounded border border-transparent group-hover:bg-paper-100 transition-colors">
                                    <VintageIcon icon={service.icon} size="sm" variant="ink-900" />
                                  </div>
                                  <div className="flex-1">
                                    <h5 className="font-semibold text-xs text-ink-900">{service.name}</h5>
                                    <p className="text-[10px] text-ink-500 font-medium">{service.desc}</p>
                                  </div>
                                  <ChevronRight className="w-4 h-4 text-ink-500 group-hover:text-vermilion-600 group-hover:translate-x-1 transition-all" />
                                </Link>
                              </DropdownMenuItem>
                            ))}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-4 pt-4 border-t border-paper-200 flex flex-col gap-2">
                          <DropdownMenuItem asChild className="cursor-pointer">
                            <Link href="/settings" className="w-full flex items-center text-xs font-semibold text-ink-900 hover:bg-paper-50 p-2 rounded">
                              <Settings className="w-4 h-4 mr-2" /> Settings & Preferences
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild className="cursor-pointer">
                            <button 
                              onClick={() => { import('@/app/actions/auth').then(m => m.logoutAction()); }}
                              className="w-full flex items-center text-xs font-semibold text-red-600 hover:bg-red-50 p-2 rounded text-left"
                            >
                              <LogOut className="w-4 h-4 mr-2" /> Sign Out
                            </button>
                          </DropdownMenuItem>
                        </div>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </span>
            ) : (
              <span className="text-sm tracking-tight text-ink-900 leading-snug font-semibold">
                {pathname?.startsWith("/transfer") && "Transfers & Pay Bills"}
                {pathname?.startsWith("/vaults") && "Vaults & Cards"}
                {pathname?.startsWith("/deposit") && "Deposits"}
                {pathname?.startsWith("/savings") && "Savings & Loans"}
                {pathname?.startsWith("/settings") && "Settings & Preferences"}
                {pathname?.startsWith("/support") && "Support Center"}
                {pathname?.startsWith("/activities") && "Activities"}
              </span>
            )}
          </div>
        </div>

        {/* Right: Portal subpage navigation links */}
        <nav className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-0.5" aria-label="Secondary navigation">
          {portalTabs.map((link) => {
            const isActive = pathname?.startsWith(link.route);

            return (
              <Link
                key={link.label}
                href={link.route}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "shrink-0 px-3 py-1.5 rounded-md text-[13px] transition-all duration-150 font-medium whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vermilion-600 focus-visible:ring-offset-1 flex items-center gap-1.5",
                  isActive
                    ? "bg-white text-ink-900 border border-paper-200 shadow-sm font-semibold"
                    : "text-ink-500 hover:text-ink-900 hover:bg-paper-100 border border-transparent"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
