"use client";

import { useState, useEffect } from "react";
import { X, Smartphone, Download, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import Image from "next/image";

export function MobileInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [installProgress, setInstallProgress] = useState(0);
  const [installStatus, setInstallStatus] = useState<
    "idle" | "installing" | "success"
  >("idle");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if running on client side
    if (typeof window === 'undefined') return;

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isMobileDevice = /iphone|ipad|ipod|android|blackberry|windows phone/g.test(
      userAgent,
    );
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    
    // Check if already installed (standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         (window.navigator as any).standalone || 
                         document.referrer.includes('android-app://');

    setIsMobile(isMobileDevice && !isStandalone);
    setIsIOS(isIOSDevice);

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Only show if mobile and not already installed
      if (isMobileDevice && !isStandalone) {
        // Delay showing to not be intrusive immediately
        setTimeout(() => setIsVisible(true), 3000);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Fallback for iOS or if event doesn't fire but we detect mobile web
    if (isMobileDevice && !isStandalone && !deferredPrompt) {
        // Longer delay for fallback detection
        setTimeout(() => setIsVisible(true), 5000);
    }

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
    };
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    setShowInstallModal(true);
    setInstallStatus("installing");
    setInstallProgress(0);

    // Simulate download progress
    const interval = setInterval(() => {
      setInstallProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // Wait for simulation to finish
    await new Promise((resolve) => setTimeout(resolve, 2500));

    setInstallStatus("success");

    // If we have the native prompt (Android/Desktop), trigger it now
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      setDeferredPrompt(null);
    }

    // Hide the banner
    setIsVisible(false);

    // Close modal after success message
    if (!isIOS) {
        setTimeout(() => {
          setShowInstallModal(false);
          setInstallStatus("idle");
        }, 2000);
    }
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Slide-out Header Notification */}
      <div
        className={cn(
          "fixed top-0 left-0 w-full z-[100] bg-gradient-to-r from-[#1E4B35] to-[#2a6649] text-white shadow-lg transform transition-transform duration-500 ease-in-out",
          isVisible ? "translate-y-0" : "-translate-y-full",
        )}>
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
              <Smartphone className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm">
                Install JPHeritage Mobile
              </span>
              <span className="text-xs text-white/80">
                Get the full banking experience
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="small"
              onClick={handleInstallClick}
              className="bg-white text-[#1E4B35] hover:bg-white/90 border-none font-semibold text-xs h-8 px-3">
              Install
            </Button>
            <button
              onClick={() => setIsVisible(false)}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Installation Simulation Modal */}
      <Dialog
        open={showInstallModal}
        onOpenChange={(open) => {
          if (!open && installStatus === "success") setShowInstallModal(false);
        }}>
        <DialogContent className="sm:max-w-xs text-center p-6 rounded-xl border-none shadow-2xl bg-white/95 backdrop-blur-xl">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-center text-[#1E4B35] flex flex-col items-center gap-2">
              {installStatus === "success" ? (
                <CheckCircle className="h-12 w-12 text-green-600 mb-2 animate-in zoom-in duration-300" />
              ) : (
                <div className="relative h-16 w-16 mb-2">
                  <Image
                    src="/portal-logo.svg"
                    alt="App Icon"
                    fill
                    className="object-contain animate-pulse"
                  />
                </div>
              )}
              <span>
                {installStatus === "success"
                  ? "Installation Complete"
                  : "Installing JPHeritage..."}
              </span>
            </DialogTitle>
            <DialogDescription className="text-center">
              {installStatus === "success"
                ? "The app has been added to your home screen."
                : "Please wait while we set up your secure banking environment."}
            </DialogDescription>
          </DialogHeader>

          {installStatus === "installing" && (
            <div className="space-y-2">
              <Progress
                value={installProgress}
                className="h-2 bg-gray-100"
                indicatorClassName="bg-[#1E4B35]"
              />
              <p className="text-xs text-muted-foreground">
                {installProgress}%
              </p>
            </div>
          )}

          {installStatus === "success" && isIOS && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-left text-muted-foreground space-y-2">
              <p className="font-medium text-center text-[#1E4B35]">
                iOS Installation
              </p>
              <div className="flex items-center gap-2">
                <span>1. Tap the Share button</span>
                <Image
                  src="/images/icons/ios-share.svg"
                  width={16}
                  height={16}
                  alt="Share"
                  className="inline-block"
                />
              </div>
              <div className="flex items-center gap-2">
                <span>2. Select "Add to Home Screen"</span>
                <div className="h-4 w-4 border border-gray-400 rounded-sm flex items-center justify-center text-[10px]">
                  +
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
