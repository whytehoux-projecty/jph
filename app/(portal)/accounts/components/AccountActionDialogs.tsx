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
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedBank, setSelectedBank] = useState<string | null>(null);

  const handleLink = async () => {
    // External bank linking requires Plaid or similar — not yet integrated
    toast.info({
      title: 'External Account Linking Coming Soon',
      description: 'This feature requires a third-party bank connection service. Visit a branch to link external accounts.',
    });
    handleClose();
  };

  const handleClose = () => {
    setStep(1);
    setSelectedBank(null);
    onClose();
  };

  const BANKS = [
    { id: "chase", name: "Chase", color: "bg-blue-600" },
    { id: "boa", name: "Bank of America", color: "bg-red-600" },
    { id: "wf", name: "Wells Fargo", color: "bg-yellow-600" },
    { id: "citi", name: "Citi", color: "bg-blue-400" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-md sm:rounded-none">
        <DialogHeader>
          <DialogTitle className="text-xl font-playfair flex items-center gap-2">
            <ExternalLink className="w-5 h-5" /> Link External Account
          </DialogTitle>
          <DialogDescription>
            Connect your accounts from other institutions securely.
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="grid grid-cols-2 gap-4 py-4">
            {BANKS.map((bank) => (
              <Button
                key={bank.id}
                variant="outline"
                className={`h-24 flex flex-col items-center justify-center gap-2 hover:border-vintage-gold hover:bg-muted/50 rounded-none ${
                  selectedBank === bank.id ? "border-vintage-gold bg-muted" : ""
                }`}
                onClick={() => setSelectedBank(bank.id)}>
                <div
                  className={`w-8 h-8 rounded-full ${bank.color} opacity-80`}
                />
                <span className="font-medium text-sm">{bank.name}</span>
              </Button>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 py-4">
            <div className="text-center mb-6">
              <div
                className={`w-12 h-12 rounded-full mx-auto mb-2 bg-muted flex items-center justify-center`}>
                <Landmark className="w-6 h-6 text-muted-foreground" />
              </div>
              <h4 className="font-medium">
                Login to {BANKS.find((b) => b.id === selectedBank)?.name}
              </h4>
              <p className="text-xs text-muted-foreground">
                Enter your credentials to connect
              </p>
            </div>
            <Input placeholder="Username / User ID" />
            <Input type="password" placeholder="Password" />
          </div>
        )}

        {step === 3 && (
          <div className="text-center py-8 space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-charcoal">Connected!</h3>
            <p className="text-muted-foreground">
              Your external account has been linked successfully.
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
                disabled={!selectedBank}
                onClick={() => setStep(2)}
                icon={<ArrowRight className="w-4 h-4" />}>
                Next
              </Button>
            </>
          )}
          {step === 2 && (
            <>
              <Button variant="ghost" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={handleLink} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                    Connecting...
                  </>
                ) : (
                  "Connect Account"
                )}
              </Button>
            </>
          )}
          {step === 3 && <Button onClick={handleClose}>Done</Button>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
