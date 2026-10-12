"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { portalTabs } from "@/lib/portal-tabs";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
    <div className="w-full border-b border-paper-300 bg-paper-50 transition-colors">
      <div className="flex flex-col-reverse sm:flex-row sm:items-end justify-between gap-x-6 gap-y-2 px-4 md:px-6 lg:px-8 pt-2 sm:pt-2.5">
        {/* Left: Portal subpage navigation links in module tabbed style */}
        <nav
          className="flex items-end gap-1 overflow-x-auto scrollbar-hide -mb-[1px] relative"
          aria-label="Secondary navigation"
        >
          {portalTabs.map((link) => {
            const Icon = link.icon;
            const isActive = link.route === "/dashboard"
              ? pathname === "/dashboard" || pathname === "/"
              : link.route === "/transfer"
              ? pathname?.startsWith("/transfer") || pathname?.startsWith("/bills")
              : pathname?.startsWith(link.route);

            return (
              <Link
                key={link.label}
                href={link.route}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "shrink-0 px-4 py-2 sm:px-5 sm:py-2.5 rounded-t-sm rounded-b-none text-xs sm:text-[13px] font-medium transition-all duration-150 flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-900 border -mb-[1px]",
                  isActive
                    ? "bg-paper-200 text-ink-900 border-paper-300 border-b-paper-200 font-semibold shadow-none relative z-10"
                    : "bg-transparent text-ink-600 hover:text-ink-900 hover:bg-paper-100/90 border-transparent hover:border-paper-200 border-b-paper-300"
                )}
              >
                {Icon && (
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-colors",
                      isActive ? "text-ink-900" : "text-ink-500"
                    )}
                  />
                )}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right: User Profile Photo Trigger */}
        <div className="flex items-center gap-2.5 sm:ml-auto pb-1.5 sm:pb-2 self-end sm:self-center">
          <Dialog>
            <DialogTrigger asChild>
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
              </button>
            </DialogTrigger>
            <DialogContent
              overlayClassName="bg-black/60 backdrop-blur-md"
              className="max-w-xs sm:max-w-sm md:max-w-md p-3 sm:p-4 bg-white border border-paper-300 rounded-none shadow-2xl"
            >
              <div className="flex items-center justify-between pb-2 pr-6 border-b border-paper-200">
                <div>
                  <DialogTitle className="text-sm font-semibold text-ink-900 tracking-tight">
                    {fullName}
                  </DialogTitle>
                  <p className="text-[11px] text-ink-500 font-mono tracking-wider uppercase">
                    Profile Photo
                  </p>
                </div>
              </div>
              <div className="relative overflow-hidden bg-paper-100 border border-paper-200">
                <img
                  src={avatarSrc}
                  alt={`${fullName}'s Profile Photo`}
                  className="w-full h-auto max-h-[75vh] object-contain rounded-none"
                  onError={(e) => {
                    e.currentTarget.src = "/images/icons/default-avatar.svg";
                  }}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
