"use client";

import { useState } from "react";
import { format } from "date-fns";
import { X, CheckCircle2, XCircle, AlertTriangle, ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

type TransactionWithUser = {
  id: string;
  reference: string;
  transactionType: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  description: string;
  metadata: string | null;
  methodId: string | null;
  createdAt: Date;
  account: {
    accountNumber: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
};

export function TransferReviewDrawer({
  tx,
  onClose,
  onApprove,
  onReject,
}: {
  tx: TransactionWithUser;
  onClose: () => void;
  onApprove: (formData: FormData) => void;
  onReject: (formData: FormData) => void;
}) {
  const [rejectReason, setRejectReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);
  const [adminNote, setAdminNote] = useState("");
  const [modifiedAmount, setModifiedAmount] = useState(tx.amount.toString());

  const metadata = tx.metadata ? JSON.parse(tx.metadata) : {};

  // Method specific field renderer
  const renderMethodSpecificDetails = () => {
    const method = tx.methodId || tx.transactionType;

    switch (method) {
      case "crypto":
        return (
          <div className="grid grid-cols-2 gap-4">
            <DetailItem label="Asset" value={metadata.asset || "USDT"} />
            <DetailItem label="Network" value={metadata.network || "ERC-20"} />
            <div className="col-span-2">
              <DetailItem label="Destination Wallet Address" value={metadata.walletAddress} isCode />
            </div>
          </div>
        );
      case "wire_international":
        return (
          <div className="grid grid-cols-2 gap-4">
            <DetailItem label="SWIFT / BIC" value={metadata.swiftCode} isCode />
            <DetailItem label="IBAN" value={metadata.iban} isCode />
            <DetailItem label="Purpose Code" value={metadata.purposeCode} />
            <DetailItem label="Intermediary Bank" value={metadata.intermediaryBank || "None"} />
            <div className="col-span-2">
              <DetailItem label="Recipient Address" value={metadata.recipientAddress} />
            </div>
          </div>
        );
      case "ach":
      case "wire_domestic":
        return (
          <div className="grid grid-cols-2 gap-4">
            <DetailItem label="Routing Number" value={metadata.routingNumber} isCode />
            <DetailItem label="Account Number" value={metadata.accountNumber} isCode />
            <DetailItem label="Account Type" value={metadata.accountType || "Checking"} />
          </div>
        );
      case "zelle":
        return (
          <div className="grid grid-cols-2 gap-4">
            <DetailItem label="Zelle Identifier (Email/Phone)" value={metadata.zelleIdentifier} />
          </div>
        );
      case "internal":
        return (
          <div className="grid grid-cols-2 gap-4">
            <DetailItem label="To Account Number" value={metadata.toAccountId || metadata.accountNumber} isCode />
          </div>
        );
      default:
        return (
          <div className="text-sm text-muted-foreground">
            No specific metadata available for this method.
          </div>
        );
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-charcoal/40 backdrop-blur-sm z-40" 
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <div>
            <h2 className="text-xl font-playfair font-bold text-charcoal flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-vintage-gold" />
              Transfer Review
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Reference: <span className="font-mono text-charcoal">{tx.reference}</span>
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-muted-foreground hover:bg-neutral-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Customer Overview */}
          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Customer Information</h3>
            <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 flex items-start gap-4">
              <div className="w-10 h-10 bg-charcoal text-white rounded-full flex items-center justify-center font-bold">
                {tx.account.user.firstName[0]}{tx.account.user.lastName[0]}
              </div>
              <div>
                <p className="font-semibold text-charcoal">{tx.account.user.firstName} {tx.account.user.lastName}</p>
                <p className="text-sm text-muted-foreground">{tx.account.user.email}</p>
                <p className="text-sm font-mono mt-1 text-charcoal">From Account: {tx.account.accountNumber}</p>
              </div>
            </div>
          </section>

          {/* Transfer Details */}
          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Transfer Specifics</h3>
            <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm space-y-5">
              <div className="flex justify-between items-end border-b border-neutral-100 pb-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Requested Amount</p>
                  <p className="text-3xl font-playfair font-bold text-charcoal tabular-nums">
                    ${tx.amount.toFixed(2)} <span className="text-sm text-muted-foreground font-sans font-normal uppercase">{tx.currency}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">Method</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 uppercase">
                    {tx.methodId || tx.transactionType}
                  </span>
                </div>
              </div>

              {renderMethodSpecificDetails()}

              <div>
                <DetailItem label="User Description" value={tx.description} />
              </div>
            </div>
          </section>

          {/* Admin Modifications */}
          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Admin Controls</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">
                  Modify Approved Amount (Optional)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <input 
                    type="number" 
                    step="0.01"
                    className="w-full pl-8 pr-4 py-2 border border-neutral-300 rounded-md text-charcoal focus:ring-vintage-gold focus:border-vintage-gold"
                    value={modifiedAmount}
                    onChange={(e) => setModifiedAmount(e.target.value)}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Adjust if partial approval is required.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">
                  Internal Admin Note (Hidden from user)
                </label>
                <textarea 
                  className="w-full p-3 border border-neutral-300 rounded-md text-charcoal focus:ring-vintage-gold focus:border-vintage-gold"
                  rows={2}
                  placeholder="E.g. Verified via phone call at 10:30 AM"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                />
              </div>
            </div>
          </section>

          {isRejecting && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-xl animate-in slide-in-from-bottom-2">
              <label className="block text-sm font-semibold text-red-900 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Reason for Rejection
              </label>
              <textarea 
                className="w-full p-3 border border-red-200 rounded-md bg-white focus:ring-red-500 focus:border-red-500"
                rows={3}
                placeholder="This will be sent to the user in a notification..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                autoFocus
              />
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-neutral-200 bg-neutral-50 flex items-center gap-3 justify-end shrink-0">
          {!isRejecting ? (
            <>
              <Button 
                variant="outline" 
                onClick={() => setIsRejecting(true)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
              >
                Reject Transfer
              </Button>
              <form action={async (formData) => { await onApprove(formData); onClose(); }}>
                <input type="hidden" name="id" value={tx.id} />
                <input type="hidden" name="adminNote" value={adminNote} />
                <input type="hidden" name="modifiedAmount" value={modifiedAmount} />
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[140px]">
                  <CheckCircle2 className="w-4 h-4 mr-2" /> Approve
                </Button>
              </form>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setIsRejecting(false)}>Cancel</Button>
              <form action={async (formData) => { await onReject(formData); onClose(); }}>
                <input type="hidden" name="id" value={tx.id} />
                <input type="hidden" name="rejectionReason" value={rejectReason} />
                <Button type="submit" disabled={!rejectReason} className="bg-red-600 hover:bg-red-700 text-white">
                  <XCircle className="w-4 h-4 mr-2" /> Confirm Rejection
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
}

function DetailItem({ label, value, isCode }: { label: string, value: string | undefined, isCode?: boolean }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className={`text-sm text-charcoal ${isCode ? "font-mono bg-neutral-100 px-2 py-1 rounded" : "font-medium"}`}>
        {value}
      </p>
    </div>
  );
}
