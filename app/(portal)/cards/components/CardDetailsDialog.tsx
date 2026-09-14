"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, Copy, Lock, Building2 } from "lucide-react";
import { useState } from "react";
import { toast } from "@/lib/toast";

interface CardDetailsDialogProps {
  card: any;
}

export function CardDetailsDialog({ card }: CardDetailsDialogProps) {
  const [showCvv, setShowCvv] = useState(false);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success({ title: `${label} copied`, duration: 2000 }))
      .catch(() => toast.error({ title: "Copy failed — please copy manually" }));
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="small"
          className="gap-2">
          <Eye className="w-4 h-4" /> Card Details
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Card Details</DialogTitle>
          <DialogDescription>
            Securely view your card information.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Card Number</Label>
            <div className="flex gap-2">
              <Input
                readOnly
                value={card.number}
                className="font-mono bg-muted"
              />
              <Button
                size="small"
                variant="outline"
                className="h-9 w-9 p-0"
                onClick={() => handleCopy(card.number, "Card Number")}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Expiry</Label>
              <Input
                readOnly
                value={card.expiry}
                className="font-mono bg-muted"
              />
            </div>
            <div className="grid gap-2">
              <Label>CVV</Label>
              <div className="relative">
                <Input
                  readOnly
                  value={showCvv ? card.cvc : "•••"}
                  className="font-mono bg-muted pr-10"
                />
                <button
                  onClick={() => setShowCvv(!showCvv)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground">
                  {showCvv ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <Lock className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* PIN — never transmitted via API; direct users to branch/ATM */}
          <div className="grid gap-2 border-t pt-4 mt-2">
            <Label className="text-base font-semibold">PIN Management</Label>
            <div className="flex items-center gap-3 bg-blue-50/60 p-3 rounded-md border border-blue-200">
              <Building2 className="h-5 w-5 text-blue-500 shrink-0" />
              <p className="text-sm text-charcoal leading-snug">
                To change your PIN, visit any branch or use an ATM with your card.
              </p>
            </div>
            <p className="text-[10px] text-muted-foreground text-center">
              PINs are never stored or transmitted digitally for your security.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
