"use client";

import { useState } from "react";
import { logoutAction } from "@/app/actions/auth";
import { setSignOutReason } from "@/lib/sign-out-notice";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * Signs the customer out through the existing logoutAction (→ /login) and
 * leaves a note so the sign-in screen can confirm it.
 */
export async function signOutNow() {
  setSignOutReason("signed-out");
  await logoutAction();
}

/**
 * Confirmation before signing out. Controlled, so it can be opened from a
 * dropdown item, a footer link or a nav button.
 */
export function SignOutDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [pending, setPending] = useState(false);

  return (
    <Dialog open={open} onOpenChange={(next) => !pending && onOpenChange(next)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sign out of Heritage Vault?</DialogTitle>
          <DialogDescription>
            Any payment you haven&rsquo;t submitted yet won&rsquo;t be saved.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={pending}>
            Stay signed in
          </Button>
          <Button
            loading={pending}
            loadingLabel="Signing out"
            onClick={async () => {
              setPending(true);
              await signOutNow();
            }}
          >
            Sign out
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** A plain button that opens the sign-out confirmation. */
export function SignOutButton({ className, children }: { className?: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {children}
      </button>
      <SignOutDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
