"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeftToLine, ChevronDown, LifeBuoy, LogOut, UserRound } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SignOutDialog } from "@/components/auth/SignOutDialog";
import { endStaffView } from "@/app/actions/staff-view";
import type { PortalProfile } from "./types";

function displayName(profile: PortalProfile | null) {
  if (!profile) return "";
  return `${profile.firstName} ${profile.lastName}`
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export function UserMenu({ profile, staffView = false }: { profile: PortalProfile | null; staffView?: boolean }) {
  const [signOutOpen, setSignOutOpen] = useState(false);
  const name = displayName(profile);
  const initials = profile ? `${profile.firstName?.[0] ?? ""}${profile.lastName?.[0] ?? ""}`.toUpperCase() : "";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className="flex min-h-11 items-center gap-2 rounded-control px-1.5 text-small text-fg transition-colors hover:bg-surface-muted focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus sm:px-2"
          aria-label={name ? `Account menu for ${name}` : "Account menu"}
        >
          <Avatar className="size-8">
            {profile?.profilePhotoUrl && <AvatarImage src={profile.profilePhotoUrl} alt="" />}
            <AvatarFallback className="text-caption">{initials}</AvatarFallback>
          </Avatar>
          <span className="hidden max-w-40 truncate font-semibold md:inline">{name}</span>
          <ChevronDown className="hidden size-4 text-fg-muted md:block" aria-hidden="true" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel className="px-3 py-2">
            <p className="truncate text-small font-semibold text-fg">{name}</p>
            {profile?.email && <p className="truncate text-caption font-normal text-fg-muted">{profile.email}</p>}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/settings">
              <UserRound aria-hidden="true" />
              Profile and settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/support">
              <LifeBuoy aria-hidden="true" />
              Help and support
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {staffView ? (
            <DropdownMenuItem onSelect={() => endStaffView()}>
              <ArrowLeftToLine aria-hidden="true" />
              Return to admin
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onSelect={() => setSignOutOpen(true)}>
              <LogOut aria-hidden="true" />
              Sign out
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <SignOutDialog open={signOutOpen} onOpenChange={setSignOutOpen} />
    </>
  );
}
