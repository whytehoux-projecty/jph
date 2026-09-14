"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Landmark,
  CreditCard,
  PiggyBank,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Lock,
} from "lucide-react";
import { VintageIcon } from "@/components/ui/vintage-icon";
import { sendContactMessage } from "@/app/actions/support";
import { toast } from "@/lib/toast";

interface OpenAccountDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OpenAccountDialog({ isOpen, onClose }: OpenAccountDialogProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!selectedType) return;
    setLoading(true);
    try {
      // Account opening from portal triggers a request — admin reviews and creates the account
      // POST /api/contact as an account opening request (no direct account creation from portal)
      await sendContactMessage({
        subject: `Account Opening Request — ${selectedType}`,
        category: 'account',
        message: `I would like to open a new ${selectedType} account. Please process this request.`,
      });
      setStep(3);
    } catch {
      toast.error({ title: 'Request failed', description: 'Please try again or contact support.' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setSelectedType(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl sm:rounded-none">
        <DialogHeader>
          <DialogTitle className="text-2xl font-playfair">
            Open New Account
          </DialogTitle>
          <DialogDescription>
            Choose the type of account you'd like to open with us.
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
            <Card
              className={`cursor-pointer hover:border-vintage-gold transition-all rounded-none ${
                selectedType === "checking"
                  ? "border-vintage-gold bg-warm-cream/20"
                  : ""
              }`}
              onClick={() => setSelectedType("checking")}>
              <CardContent className="p-6 text-center space-y-4">
                <VintageIcon
                  icon={CreditCard}
                  variant="charcoal"
                  className="mx-auto"
                />
                <h3 className="font-semibold text-charcoal">Checking</h3>
                <p className="text-xs text-muted-foreground">
                  Everyday spending with no monthly fees.
                </p>
              </CardContent>
            </Card>
            <Card
              className={`cursor-pointer hover:border-vintage-gold transition-all rounded-none ${
                selectedType === "savings"
                  ? "border-vintage-gold bg-warm-cream/20"
                  : ""
              }`}
              onClick={() => setSelectedType("savings")}>
              <CardContent className="p-6 text-center space-y-4">
                <VintageIcon
                  icon={PiggyBank}
                  variant="gold"
                  className="mx-auto"
                />
                <h3 className="font-semibold text-charcoal">Savings</h3>
                <p className="text-xs text-muted-foreground">
                  High-yield savings with 4.20% APY.
                </p>
              </CardContent>
            </Card>
            <Card
              className={`cursor-pointer hover:border-vintage-gold transition-all rounded-none ${
                selectedType === "cd"
                  ? "border-vintage-gold bg-warm-cream/20"
                  : ""
              }`}
              onClick={() => setSelectedType("cd")}>
              <CardContent className="p-6 text-center space-y-4">
                <VintageIcon
                  icon={Landmark}
                  variant="green"
                  className="mx-auto"
                />
                <h3 className="font-semibold text-charcoal">CD</h3>
                <p className="text-xs text-muted-foreground">
                  Fixed rates for guaranteed returns.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 py-4">
            <div className="bg-muted/30 p-4 rounded-none border border-border">
              <h4 className="font-semibold mb-2">Review Terms</h4>
              <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                <li>Minimum opening deposit: $0.00</li>
                <li>Monthly maintenance fee: $0.00</li>
                <li>Overdraft protection included</li>
                <li>FDIC Insured up to $250,000</li>
              </ul>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              <span>Secure application processing</span>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center py-8 space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-charcoal">
              Account Opened Successfully!
            </h3>
            <p className="text-muted-foreground">
              Your new {selectedType} account is ready to use.
            </p>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t">
          {step === 1 && (
            <>
              <Button variant="ghost" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                disabled={!selectedType}
                onClick={() => setStep(2)}
                icon={<ArrowRight className="w-4 h-4" />}>
                Continue
              </Button>
            </>
          )}
          {step === 2 && (
            <>
              <Button variant="ghost" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                    Processing...
                  </>
                ) : (
                  "Confirm & Open"
                )}
              </Button>
            </>
          )}
          {step === 3 && <Button onClick={handleClose}>Go to Dashboard</Button>}
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface LinkExternalAccountDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LinkExternalAccountDialog({
  isOpen,
  onClose,
}: LinkExternalAccountDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md sm:rounded-none">
        <DialogHeader>
          <DialogTitle className="text-xl font-playfair flex items-center gap-2">
            <ExternalLink className="w-5 h-5" /> Link External Account
          </DialogTitle>
          <DialogDescription>
            Connect your accounts from other institutions securely.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          <div className="p-6 rounded-lg border border-dashed border-muted-foreground/30 text-center bg-muted/30">
            <Lock className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm font-medium">Identity Verification Required</p>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              To link an external account, please visit a branch or call our support line.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
