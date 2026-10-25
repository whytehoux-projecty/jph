"use client";

import { ReactNode, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppTopBar } from "@/components/layout/AppTopBar";
import { MobileNavDrawer } from "@/components/layout/MobileNavDrawer";
import { PortalFooter } from "@/components/layout/PortalFooter";
import type { PortalProfile } from "@/components/layout/types";
import { MobileInstallPrompt } from "@/components/layout/MobileInstallPrompt";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { PinSetupModal } from "@/components/portal/PinSetupModal";
import { AutoLogoutProvider } from "@/components/layout/AutoLogoutProvider";
import { getProfile } from "@/app/actions/profile";
import { ToastViewport } from "@/components/ui/toast";
import { getStaffViewState, type StaffViewState } from "@/app/actions/staff-view";

export default function PortalLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [profile, setProfile] = useState<PortalProfile | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [staffView, setStaffView] = useState<StaffViewState | null>(null);

  // Skip portal layout for auth, corporate marketing, and admin pages
  const isPassThrough =
    pathname?.includes("/auth/") ||
    pathname === "/login" ||
    pathname === "/signup" ||
    // First sign-in setup: focused, like sign-in (every other page redirects here until it's done)
    pathname === "/onboarding" ||
    pathname?.startsWith("/register") ||
    pathname?.startsWith("/admin") ||
    // Corporate marketing routes (all routes not under /dashboard, /accounts, etc.)
    pathname === "/" ||
    pathname?.startsWith("/personal-banking") ||
    pathname?.startsWith("/business-banking") ||
    pathname?.startsWith("/wealth") ||
    pathname?.startsWith("/corporate") ||
    pathname?.startsWith("/about") ||
    pathname?.startsWith("/contact") ||
    pathname?.startsWith("/apply") ||
    pathname?.startsWith("/privacy") ||
    pathname?.startsWith("/terms") ||
    pathname?.startsWith("/unavailable") ||
    // Marketing pages that use the corporate layout's own header and footer
    pathname?.startsWith("/account-finder") ||
    pathname?.startsWith("/transparency") ||
    pathname?.startsWith("/security") ||
    pathname?.startsWith("/rates-and-fees") ||
    pathname?.startsWith("/help") ||
    pathname?.startsWith("/locations") ||
    pathname?.startsWith("/accessibility") ||
    pathname?.startsWith("/careers") ||
    pathname?.startsWith("/press") ||
    pathname?.startsWith("/investors") ||
    pathname?.startsWith("/products") ||
    pathname?.startsWith("/status") ||
    pathname?.startsWith("/verification");

  useEffect(() => {
    if (!isPassThrough) {
      getProfile()
        .then((user) => {
          if (user) {
            setProfile({
              id: user.id,
              firstName: user.firstName,
              lastName: user.lastName,
              tier: user.tier,
              pinSetupComplete: user.pinSetupComplete,
              profilePhotoUrl: user.profilePhotoUrl,
              hideBalance: user.hideBalance,
              email: user.email,
              profileType: user.profileType || "PERSONAL",
            });
          }
        })
        .catch(() => {
          // Unauthenticated or error
          setProfile(null);
        });
      getStaffViewState()
        .then(setStaffView)
        .catch(() => setStaffView(null));
    }
  }, [isPassThrough, pathname]);

  if (isPassThrough) {
    return <>{children}</>;
  }

  return (
    <AutoLogoutProvider>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-(--z-skip-link) focus:bg-surface focus:px-4 focus:py-3 focus:text-small focus:font-semibold focus:text-fg focus:outline-2 focus:outline-focus"
      >
        Skip to main content
      </a>
      <div className="min-h-dvh bg-surface-muted">
        <AppSidebar />
        <div className="flex min-h-dvh flex-col lg:pl-64 print:pl-0">
          <AppTopBar profile={profile} staffView={staffView} onOpenMenu={() => setMenuOpen(true)} />
          <main
            id="main-content"
            tabIndex={-1}
            className="mx-auto w-full max-w-(--container-page) flex-1 px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-6 focus:outline-none md:px-6 lg:px-8 lg:pb-12 lg:pt-8"
          >
            {children}
          </main>
          <div className="pb-[calc(4rem+env(safe-area-inset-bottom))] lg:pb-0">
            <PortalFooter />
          </div>
        </div>
        <MobileBottomNav onOpenMenu={() => setMenuOpen(true)} />
        <MobileNavDrawer open={menuOpen} onOpenChange={setMenuOpen} />
        <MobileInstallPrompt />
      </div>

      <ToastViewport />
      {/* Only the customer may set their own transaction PIN — never in staff view. */}
      {profile && !staffView && !profile.pinSetupComplete && <PinSetupModal />}
    </AutoLogoutProvider>
  );
}
