"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { portalTabs } from "@/lib/portal-tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
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

  const fullNameRaw = `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim() || "Client";
  const fullName = fullNameRaw.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  const avatarSrc = profile?.profilePhotoUrl || "/images/icons/default-avatar.svg";
  const initials = profile?.firstName && profile?.lastName
    ? `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase()
    : 'CL';

  return (
    <div className="w-full border-b border-paper-200 bg-paper-50/90 backdrop-blur-xs transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-end justify-start gap-x-6 gap-y-2 px-4 md:px-6 lg:px-8 pt-3 pb-0">
        {/* Left: Portal subpage navigation links */}
        <nav className="flex items-end gap-1 overflow-x-auto scrollbar-hide w-full sm:w-auto" aria-label="Secondary navigation">
          {portalTabs.map((link) => {
            const isActive = pathname?.startsWith(link.route);

            return (
              <Link
                key={link.label}
                href={link.route}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "shrink-0 px-4 py-2 rounded-t-md text-[13px] transition-all duration-150 font-medium whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vermilion-600 focus-visible:ring-offset-1 flex items-center gap-1.5 -mb-[1px]",
                  isActive
                    ? "bg-paper-200 text-ink-900 border border-paper-200 border-b-paper-200 font-semibold"
                    : "text-ink-500 hover:text-ink-900 hover:bg-paper-100 border border-transparent border-b-transparent"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: User Profile Photo Trigger */}
        <div className="flex items-center gap-2.5 sm:ml-auto pb-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="View Profile Photo"
                title="View Profile Photo"
                className="font-semibold tracking-wider hover:opacity-80 transition-opacity flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-900 rounded-none text-ink-900 py-0.5 px-1 cursor-pointer"
              >
                <span className="relative h-7 w-7 rounded-full overflow-hidden border border-paper-300 bg-paper-100 inline-flex items-center justify-center shrink-0">
                  <img
                    src={avatarSrc}
                    alt={fullName}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                  <span className="font-bold text-[10px] text-ink-700">
                    {initials}
                  </span>
                </span>
                <span className="text-xs sm:text-sm font-semibold">{fullName}</span>
                <ChevronDown className="h-3.5 w-3.5 opacity-50" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-auto p-2 border border-paper-300 bg-white shadow-2xl rounded-none overflow-hidden mt-2 z-50 animate-in fade-in zoom-in-95 duration-150"
            >
              {/* Displays only the Profile photo and nothing else */}
              <div className="relative overflow-hidden bg-paper-100 border border-paper-200">
                <img
                  src={avatarSrc}
                  alt={`${fullName}'s Profile Photo`}
                  className="w-64 h-64 sm:w-80 sm:h-80 object-cover rounded-none"
                  onError={(e) => {
                    e.currentTarget.src = "/images/icons/default-avatar.svg";
                  }}
                />
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
