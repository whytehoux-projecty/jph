"use client";

import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { NavLinks } from "./NavLinks";

/** Full navigation on phones and tablets, opened from the top bar or the tab bar. */
export function MobileNavDrawer({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="gap-0 px-3 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-4">
        <div className="flex h-11 items-center px-3 pr-12">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logos/heritage-trust-logo.svg" alt="" width={150} height={22} className="h-5 w-auto" />
        </div>
        <SheetTitle className="sr-only">Menu</SheetTitle>
        <SheetDescription className="sr-only">Heritage Vault navigation</SheetDescription>
        <nav aria-label="Main" className="mt-6 flex flex-1 flex-col">
          <NavLinks onNavigate={() => onOpenChange(false)} />
        </nav>
      </SheetContent>
    </Sheet>
  );
}
