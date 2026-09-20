"use client";

import { ReactNode, useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { PortalHeader } from "@/components/layout/PortalHeader";
import { LeftSidebar } from "@/components/layout/LeftSidebar";
import { RightSidebar, type UserProfile } from "@/components/layout/RightSidebar";
import { Footer } from "@/components/layout/Footer";
import { MobileInstallPrompt } from "@/components/layout/MobileInstallPrompt";
import { PinSetupModal } from "@/components/portal/PinSetupModal";
import { getProfile } from "@/app/actions/profile";
import type { ToastItem } from "@/lib/toast";

const VARIANT_STYLES: Record<ToastItem["variant"], string> = {
  success: "border-l-vintage-green",
  error: "border-l-red-500",
  warning: "border-l-soft-gold",
  info: "border-l-blue-500",
};

const VARIANT_ICONS: Record<ToastItem["variant"], React.ReactNode> = {
  success: <CheckCircle2 className="h-4 w-4 text-vintage-green shrink-0" />,
  error: <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />,
  warning: <AlertTriangle className="h-4 w-4 text-soft-gold shrink-0" />,
  info: <Info className="h-4 w-4 text-blue-500 shrink-0" />,
};

function ToastContainer() {
  const [toasts, setToasts] = useState<(ToastItem & { exiting?: boolean })[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)),
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const item = (e as CustomEvent<ToastItem>).detail;
      setToasts((prev) => [...prev, item]);
      setTimeout(() => dismiss(item.id), item.duration ?? 4000);
    };
    window.addEventListener("av:toast", handler);
    return () => window.removeEventListener("av:toast", handler);
  }, [dismiss]);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="alert"
          className={cn(
            "flex items-start gap-3 bg-white border-l-4 rounded-sm px-4 py-3 shadow-vintage-md pointer-events-auto",
            "animate-slide-in-right",
            VARIANT_STYLES[t.variant],
            t.exiting && "toast-exit",
          )}>
          <span className="mt-0.5">{VARIANT_ICONS[t.variant]}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-charcoal leading-snug">
              {t.title}
            </p>
            {t.description && (
              <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                {t.description}
              </p>
            )}
          </div>
          <button
            onClick={() => dismiss(t.id)}
            aria-label="Dismiss notification"
            className="mt-0.5 text-muted-foreground hover:text-charcoal transition-colors shrink-0">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

export default function EBankingLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
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
    pathname?.startsWith("/about") ||
    pathname?.startsWith("/contact") ||
    pathname?.startsWith("/apply") ||
    pathname?.startsWith("/privacy") ||
    pathname?.startsWith("/terms") ||
    pathname?.startsWith("/unavailable");

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
    <div className="flex min-h-screen bg-white relative isolate">
      {/* Background Image Layer */}
      <div className="fixed inset-0 z-[-1] bg-white">
        <Image
          src="/images/portal-bg.webp"
          alt="JP Heritage portal background"
          fill
          className="object-cover opacity-95"
          priority
        />
      </div>

      <MobileInstallPrompt />

      <LeftSidebar
        isOpen={leftSidebarOpen}
        onToggle={() => setLeftSidebarOpen(!leftSidebarOpen)}
      />

      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <PortalHeader
          onToggleRightSidebar={() =>
            setIsRightSidebarOpen(!isRightSidebarOpen)
          }
          isRightSidebarOpen={isRightSidebarOpen}
        />
        <main
          className={cn(
            "flex-1 px-4 py-6 md:px-8",
            "transition-all duration-300 ease-in-out",
          )}>
          {children}
        </main>
        <Footer />
      </div>

      <RightSidebar
        isOpen={isRightSidebarOpen}
        onToggle={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
        profile={profile}
      />

      {/* Global Toast Notification Container */}
      <ToastContainer />
      {profile && !profile.pinSetupComplete && <PinSetupModal />}
    </div>
  );
}
