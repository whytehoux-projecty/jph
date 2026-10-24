"use client";

import { ReactNode, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { PortalHeader } from "@/components/layout/PortalHeader";
import { PortalSubHeader } from "@/components/layout/PortalSubHeader";
import type { UserProfile } from "@/components/layout/RightSidebar";
import { Footer } from "@/components/layout/Footer";
import { MobileInstallPrompt } from "@/components/layout/MobileInstallPrompt";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { PinSetupModal } from "@/components/portal/PinSetupModal";
import { AutoLogoutProvider } from "@/components/layout/AutoLogoutProvider";
import { getProfile } from "@/app/actions/profile";
import { ToastViewport } from "@/components/ui/toast";

export default function PortalLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Skip portal layout for auth, corporate marketing, and admin pages
  const isPassThrough =
    pathname?.includes("/auth/") ||
    pathname === "/login" ||
    pathname === "/signup" ||
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
              phone: user.phone,
              profileType: (user as any).profileType || "PERSONAL",
              accountNumber: (user as any).accounts?.[0]?.accountNumber,
            });
          }
        })
        .catch(() => {
          // Unauthenticated or error
          setProfile(null);
        });
    }
  }, [isPassThrough, pathname]);

  if (isPassThrough) {
    return <>{children}</>;
  }

  return (
    <AutoLogoutProvider>
      <div className="flex min-h-screen bg-paper-200 relative isolate">
        <MobileInstallPrompt />

      <div className="flex-1 flex flex-col min-w-0 relative z-10 transition-all duration-300 ease-in-out">
        <PortalHeader
          profile={profile}
        />
        <PortalSubHeader profile={profile} accountNumber={profile?.accountNumber} />
        <main
          className={cn(
            "flex-1 px-4 md:px-6 lg:px-8 pt-5 pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-6",
            "transition-all duration-300 ease-in-out",
          )}>
          {children}
        </main>
        <Footer isSlim={true} />
      </div>

      {/* Global Toast Notification Container */}
      <ToastViewport />
      {profile && !profile.pinSetupComplete && <PinSetupModal />}
      
      <MobileBottomNav />
    </div>
    </AutoLogoutProvider>
  );
}
