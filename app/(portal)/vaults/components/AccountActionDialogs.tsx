"use client";

import * as React from "react";
import { ArrowLeft, Globe2, Landmark, PiggyBank, TrendingUp, Wallet } from "lucide-react";
import { FlowDialog, FlowDone, ReviewList } from "@/components/ui/flow-dialog";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { Alert } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { formatAmount, maskAccountNumber } from "@/lib/format";
import { toast } from "@/lib/toast";
import { userFacingError } from "@/lib/errors";
import { VAULT_TYPES, type VaultType, normalizeVaultType, determinePrimaryStatus } from "@/lib/vault-rules";
import { linkExternalVault, openNewVault, requestAccountSwap } from "@/app/actions/accounts";

const TYPE_ICONS: Record<VaultType, React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>> = {
  SAVINGS: PiggyBank,
  CURRENT: Landmark,
  DCA: Wallet,
  INVESTMENT: TrendingUp,
  OFFSHORE: Globe2,
};

const CURRENCIES = [
  { code: "USD", label: "US dollar (USD)" },
  { code: "EUR", label: "Euro (EUR)" },
  { code: "GBP", label: "British pound (GBP)" },
  { code: "CHF", label: "Swiss franc (CHF)" },
];

interface DialogAccount {
  id: string;
  accountType: string;
  accountNumber: string;
  balance?: number;
  currency?: string;
  institutionName?: string;
}

function accountLabel(a: DialogAccount) {
  const def = VAULT_TYPES[normalizeVaultType(a.accountType)];
  const name = a.institutionName ? `${a.institutionName} ${def?.label ?? a.accountType}` : def?.label ?? a.accountType;
  return `${name} ${maskAccountNumber(a.accountNumber)}`;
}

const errorMessage = userFacingError;

/** Account-type picker: native radios drawn as cards. Held types are disabled. */
function TypePicker({
  value,
  onChange,
  held,
  heldNote,
}: {
  value: VaultType | null;
  onChange: (t: VaultType) => void;
  held: VaultType[];
  heldNote: string;
}) {
  return (
    <fieldset>
      <legend className="mb-3 text-small font-semibold text-fg">Account type</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {(Object.keys(VAULT_TYPES) as VaultType[]).map((type) => {
          const def = VAULT_TYPES[type];
          const Icon = TYPE_ICONS[type];
          const isHeld = held.includes(type);
          return (
            <label
              key={type}
              className={cn(
                "relative flex cursor-pointer gap-3 rounded-surface border border-line bg-surface p-4 transition-colors",
                "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus",
                "has-[:checked]:border-action has-[:checked]:bg-action-subtle",
                isHeld ? "cursor-not-allowed bg-surface-muted" : "hover:border-line-strong",
              )}
            >
              <input
                type="radio"
                name="account-type"
                value={type}
                checked={value === type}
                disabled={isHeld}
                onChange={() => onChange(type)}
                className="sr-only"
                aria-describedby={`type-${type}-desc`}
              />
              <Icon className={cn("mt-0.5 size-5 shrink-0", isHeld ? "text-fg-disabled" : "text-fg-action")} aria-hidden />
              <span className="flex flex-col gap-1">
                <span className={cn("text-body font-semibold", isHeld ? "text-fg-disabled" : "text-fg")}>{def.label}</span>
                <span id={`type-${type}-desc`} className="text-small text-fg-muted">
                  {isHeld ? heldNote : def.shortDesc}
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

// ─── 1. Open an account ─────────────────────────────────────────────────────

interface OpenAccountDialogProps {
  isOpen: boolean;
  onClose: () => void;
  existingAccounts?: DialogAccount[];
  onSuccess?: () => void;
}

const OPEN_STEPS = ["Account type", "Details", "Review", "Done"];

export function OpenAccountDialog({ isOpen, onClose, existingAccounts = [], onSuccess }: OpenAccountDialogProps) {
  const [step, setStep] = React.useState(0);
  const [selectedType, setSelectedType] = React.useState<VaultType | null>(null);
  const [currency, setCurrency] = React.useState("USD");
  const [initialDeposit, setInitialDeposit] = React.useState("");
  const [fundingAccountId, setFundingAccountId] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [errors, setErrors] = React.useState<{ deposit?: string; funding?: string }>({});
  const [loading, setLoading] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [created, setCreated] = React.useState<any>(null);

  const held = React.useMemo(() => existingAccounts.map((a) => normalizeVaultType(a.accountType)), [existingAccounts]);
  const def = selectedType ? VAULT_TYPES[selectedType] : null;
  const willBePrimary = selectedType ? determinePrimaryStatus(existingAccounts.length, selectedType) : false;
  const depositNum = Number.parseFloat(initialDeposit) || 0;
  const fundingAccount = existingAccounts.find((a) => a.id === fundingAccountId);

  const close = () => {
    setStep(0);
    setSelectedType(null);
    setCurrency("USD");
    setInitialDeposit("");
    setFundingAccountId("");
    setNotes("");
    setErrors({});
    setSubmitError(null);
    setCreated(null);
    onClose();
  };

  const toReview = () => {
    const next: typeof errors = {};
    if (depositNum < 0) next.deposit = "Enter an amount of zero or more.";
    if (depositNum > 0 && existingAccounts.length > 0 && !fundingAccountId) next.funding = "Choose the account to take the opening deposit from.";
    setErrors(next);
    if (Object.keys(next).length === 0) setStep(2);
  };

  const submit = async () => {
    if (!selectedType) return;
    setLoading(true);
    setSubmitError(null);
    try {
      const res = await openNewVault({
        vaultType: selectedType,
        currency,
        initialDeposit: depositNum,
        fundingAccountId: fundingAccountId || undefined,
        notes,
      });
      setCreated(res);
      setStep(3);
      onSuccess?.();
    } catch (err) {
      setSubmitError(errorMessage(err, "We couldn't open the account. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const footer =
    step === 0 ? (
      <>
        <Button variant="tertiary" onClick={close}>Cancel</Button>
        <Button disabled={!selectedType || held.includes(selectedType)} onClick={() => setStep(1)}>Continue</Button>
      </>
    ) : step === 1 ? (
      <>
        <Button variant="tertiary" icon={<ArrowLeft aria-hidden="true" />} onClick={() => setStep(0)}>Back</Button>
        <Button onClick={toReview}>Review</Button>
      </>
    ) : step === 2 ? (
      <>
        <Button variant="tertiary" icon={<ArrowLeft aria-hidden="true" />} onClick={() => setStep(1)} disabled={loading}>Back</Button>
        <Button onClick={submit} loading={loading} loadingLabel="Opening account">Open account</Button>
      </>
    ) : (
      <Button fullWidth onClick={close}>Done</Button>
    );

  return (
    <FlowDialog
      open={isOpen}
      onClose={close}
      title="Open an account"
      description="You can hold one account of each type."
      steps={OPEN_STEPS}
      step={step}
      footer={footer}
      busy={loading}
    >
      {step === 0 && (
        <TypePicker
          value={selectedType}
          onChange={setSelectedType}
          held={held}
          heldNote="You already have this type of account."
        />
      )}

      {step === 1 && def && (
        <>
          <Alert variant="info">
            {willBePrimary
              ? `This will be your primary account.`
              : `This will be an additional account. Your primary account doesn't change.`}
          </Alert>
          <FormField label="Currency">
            <NativeSelect value={currency} onChange={(e) => setCurrency(e.target.value)}>
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>{c.label}</option>
              ))}
            </NativeSelect>
          </FormField>
          <FormField label="Opening deposit" optional hint={`In ${currency}. You can leave this empty and add money later.`} error={errors.deposit}>
            <Input
              type="text"
              inputMode="decimal"
              autoComplete="off"
              placeholder="0.00"
              value={initialDeposit}
              onChange={(e) => setInitialDeposit(e.target.value.replace(/[^\d.]/g, ""))}
              className="tabular-nums"
            />
          </FormField>
          {depositNum > 0 && existingAccounts.length > 0 && (
            <FormField label="Take the deposit from" error={errors.funding} required>
              <NativeSelect value={fundingAccountId} onChange={(e) => setFundingAccountId(e.target.value)}>
                <option value="">Choose an account</option>
                {existingAccounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {accountLabel(a)}
                    {typeof a.balance === "number" ? ` — ${formatAmount(a.balance, { currency: a.currency || "USD" })} available` : ""}
                  </option>
                ))}
              </NativeSelect>
            </FormField>
          )}
          <FormField label="Nickname" optional hint="Helps you tell your accounts apart, for example “Tax reserve”.">
            <Input value={notes} maxLength={60} onChange={(e) => setNotes(e.target.value)} />
          </FormField>
        </>
      )}

      {step === 2 && def && (
        <>
          <p className="text-body text-fg-muted">Check the details below, then open the account.</p>
          <ReviewList
            rows={[
              ["Account type", def.label],
              ["Role", willBePrimary ? "Primary account" : "Additional account"],
              ["Currency", currency],
              ["Opening deposit", formatAmount(depositNum, { currency }) ?? "—"],
              ...(depositNum > 0 && fundingAccount ? ([["Taken from", accountLabel(fundingAccount)]] as Array<[string, React.ReactNode]>) : []),
              ...(notes ? ([["Nickname", notes]] as Array<[string, React.ReactNode]>) : []),
            ]}
          />
          {submitError && <Alert variant="danger" title="The account wasn't opened">{submitError}</Alert>}
        </>
      )}

      {step === 3 && created && (
        <FlowDone title="Your account is open">
          <ReviewList
            rows={[
              ["Account number", maskAccountNumber(created.account?.accountNumber)],
              ["Role", created.account?.isPrimary ? "Primary account" : "Additional account"],
              ["Opening balance", formatAmount(Number(created.account?.balance || 0), { currency: created.account?.currency || currency }) ?? "—"],
            ]}
          />
          {created.message && <p className="text-small text-fg-muted">{created.message}</p>}
        </FlowDone>
      )}
    </FlowDialog>
  );
}

// ─── 2. Link an external account ────────────────────────────────────────────

interface LinkExternalAccountDialogProps {
  isOpen: boolean;
  onClose: () => void;
  existingAccounts?: DialogAccount[];
  onSuccess?: () => void;
}

const LINK_STEPS = ["Account type", "Bank details", "Review", "Done"];

export function LinkExternalAccountDialog({ isOpen, onClose, existingAccounts = [], onSuccess }: LinkExternalAccountDialogProps) {
  const [step, setStep] = React.useState(0);
  const [selectedType, setSelectedType] = React.useState<VaultType | null>(null);
  const [institutionName, setInstitutionName] = React.useState("");
  const [accountNumber, setAccountNumber] = React.useState("");
  const [routingOrSwift, setRoutingOrSwift] = React.useState("");
  const [accountHolderName, setAccountHolderName] = React.useState("");
  const [currency, setCurrency] = React.useState("USD");
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<any>(null);

  const held = React.useMemo(() => existingAccounts.map((a) => normalizeVaultType(a.accountType)), [existingAccounts]);
  const def = selectedType ? VAULT_TYPES[selectedType] : null;

  const close = () => {
    setStep(0);
    setSelectedType(null);
    setInstitutionName("");
    setAccountNumber("");
    setRoutingOrSwift("");
    setAccountHolderName("");
    setCurrency("USD");
    setErrors({});
    setSubmitError(null);
    setResult(null);
    onClose();
  };

  const toReview = () => {
    const next: Record<string, string> = {};
    if (!institutionName.trim()) next.institution = "Enter the name of the bank where the account is held.";
    if (!accountNumber.trim()) next.number = "Enter the account number or IBAN.";
    if (!routingOrSwift.trim()) next.routing = "Enter the routing number or SWIFT/BIC code.";
    setErrors(next);
    if (Object.keys(next).length === 0) setStep(2);
  };

  const submit = async () => {
    if (!selectedType) return;
    setLoading(true);
    setSubmitError(null);
    try {
      const res = await linkExternalVault({
        vaultType: selectedType,
        institutionName,
        accountNumber,
        routingOrSwift,
        accountHolderName,
        currency,
      });
      setResult(res);
      setStep(3);
      onSuccess?.();
    } catch (err) {
      setSubmitError(errorMessage(err, "We couldn't link the account. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const footer =
    step === 0 ? (
      <>
        <Button variant="tertiary" onClick={close}>Cancel</Button>
        <Button disabled={!selectedType || held.includes(selectedType)} onClick={() => setStep(1)}>Continue</Button>
      </>
    ) : step === 1 ? (
      <>
        <Button variant="tertiary" icon={<ArrowLeft aria-hidden="true" />} onClick={() => setStep(0)}>Back</Button>
        <Button onClick={toReview}>Review</Button>
      </>
    ) : step === 2 ? (
      <>
        <Button variant="tertiary" icon={<ArrowLeft aria-hidden="true" />} onClick={() => setStep(1)} disabled={loading}>Back</Button>
        <Button onClick={submit} loading={loading} loadingLabel="Linking account">Link account</Button>
      </>
    ) : (
      <Button fullWidth onClick={close}>Done</Button>
    );

  return (
    <FlowDialog
      open={isOpen}
      onClose={close}
      title="Link an account held elsewhere"
      description="See an account you hold at another bank alongside your Heritage Trust accounts."
      steps={LINK_STEPS}
      step={step}
      footer={footer}
      busy={loading}
    >
      {step === 0 && (
        <TypePicker value={selectedType} onChange={setSelectedType} held={held} heldNote="You already have this type of account." />
      )}

      {step === 1 && (
        <>
          <FormField label="Bank name" error={errors.institution} required>
            <Input autoComplete="organization" value={institutionName} onChange={(e) => setInstitutionName(e.target.value)} />
          </FormField>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Account number or IBAN" error={errors.number} required>
              <Input autoComplete="off" spellCheck={false} value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
            </FormField>
            <FormField label="Routing number or SWIFT/BIC" error={errors.routing} required>
              <Input autoComplete="off" spellCheck={false} value={routingOrSwift} onChange={(e) => setRoutingOrSwift(e.target.value)} />
            </FormField>
          </div>
          <FormField label="Account holder name" optional hint="As shown on the account at the other bank.">
            <Input autoComplete="name" value={accountHolderName} onChange={(e) => setAccountHolderName(e.target.value)} />
          </FormField>
          <FormField label="Currency">
            <NativeSelect value={currency} onChange={(e) => setCurrency(e.target.value)}>
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>{c.label}</option>
              ))}
            </NativeSelect>
          </FormField>
        </>
      )}

      {step === 2 && def && (
        <>
          <p className="text-body text-fg-muted">Check the details below, then link the account.</p>
          <ReviewList
            rows={[
              ["Account type", def.label],
              ["Bank", institutionName],
              ["Account number", maskAccountNumber(accountNumber)],
              ["Routing or SWIFT/BIC", routingOrSwift],
              ...(accountHolderName ? ([["Account holder", accountHolderName]] as Array<[string, React.ReactNode]>) : []),
              ["Currency", currency],
            ]}
          />
          {submitError && <Alert variant="danger" title="The account wasn't linked">{submitError}</Alert>}
        </>
      )}

      {step === 3 && result && (
        <FlowDone title="Account linked">
          {result.message && <p className="text-body text-fg-muted">{result.message}</p>}
        </FlowDone>
      )}
    </FlowDialog>
  );
}

// ─── 3. Replace an account (swap request) ───────────────────────────────────

interface AccountSwapDialogProps {
  isOpen: boolean;
  onClose: () => void;
  existingAccounts: DialogAccount[];
  preselectedAccountId?: string;
  onSuccess?: () => void;
}

const SWAP_STEPS = ["Details", "Review", "Sent"];

export function AccountSwapDialog({ isOpen, onClose, existingAccounts, preselectedAccountId, onSuccess }: AccountSwapDialogProps) {
  const [step, setStep] = React.useState(0);
  const [targetAccountId, setTargetAccountId] = React.useState(preselectedAccountId || "");
  const [institutionName, setInstitutionName] = React.useState("");
  const [accountNumber, setAccountNumber] = React.useState("");
  const [routingOrSwift, setRoutingOrSwift] = React.useState("");
  const [reason, setReason] = React.useState("");
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<any>(null);

  React.useEffect(() => {
    if (preselectedAccountId) setTargetAccountId(preselectedAccountId);
    else if (existingAccounts[0]) setTargetAccountId(existingAccounts[0].id);
  }, [preselectedAccountId, existingAccounts]);

  const target = existingAccounts.find((a) => a.id === targetAccountId);

  const close = () => {
    setStep(0);
    setInstitutionName("");
    setAccountNumber("");
    setRoutingOrSwift("");
    setReason("");
    setErrors({});
    setSubmitError(null);
    setResult(null);
    onClose();
  };

  const toReview = () => {
    const next: Record<string, string> = {};
    if (!target) next.target = "Choose the account to replace.";
    if (!institutionName.trim()) next.institution = "Enter the name of the bank that holds the new account.";
    if (!accountNumber.trim()) next.number = "Enter the new account number or IBAN.";
    setErrors(next);
    if (Object.keys(next).length === 0) setStep(1);
  };

  const submit = async () => {
    if (!target) return;
    setLoading(true);
    setSubmitError(null);
    try {
      const res = await requestAccountSwap({
        existingAccountId: target.id,
        targetAccountType: normalizeVaultType(target.accountType),
        institutionName,
        accountNumber,
        routingOrSwift,
        reason,
      });
      setResult(res);
      setStep(2);
      onSuccess?.();
      toast.success({ title: "Request sent" });
    } catch (err) {
      setSubmitError(errorMessage(err, "We couldn't send your request. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const footer =
    step === 0 ? (
      <>
        <Button variant="tertiary" onClick={close}>Cancel</Button>
        <Button onClick={toReview}>Review</Button>
      </>
    ) : step === 1 ? (
      <>
        <Button variant="tertiary" icon={<ArrowLeft aria-hidden="true" />} onClick={() => setStep(0)} disabled={loading}>Back</Button>
        <Button onClick={submit} loading={loading} loadingLabel="Sending request">Send request</Button>
      </>
    ) : (
      <Button fullWidth onClick={close}>Done</Button>
    );

  return (
    <FlowDialog
      open={isOpen}
      onClose={close}
      title="Replace an account"
      description="Ask us to replace one of your accounts with another. Our team reviews every request before anything changes."
      steps={SWAP_STEPS}
      step={step}
      footer={footer}
      busy={loading}
    >
      {step === 0 && (
        <>
          <FormField label="Account to replace" error={errors.target} required>
            <NativeSelect value={targetAccountId} onChange={(e) => setTargetAccountId(e.target.value)}>
              {existingAccounts.map((a) => (
                <option key={a.id} value={a.id}>{accountLabel(a)}</option>
              ))}
            </NativeSelect>
          </FormField>
          <FormField label="New account's bank" error={errors.institution} required>
            <Input autoComplete="organization" value={institutionName} onChange={(e) => setInstitutionName(e.target.value)} />
          </FormField>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="New account number or IBAN" error={errors.number} required>
              <Input autoComplete="off" spellCheck={false} value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
            </FormField>
            <FormField label="Routing number or SWIFT/BIC" optional>
              <Input autoComplete="off" spellCheck={false} value={routingOrSwift} onChange={(e) => setRoutingOrSwift(e.target.value)} />
            </FormField>
          </div>
          <FormField label="Reason" optional hint="For example, you've moved your everyday banking.">
            <Textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />
          </FormField>
        </>
      )}

      {step === 1 && target && (
        <>
          <p className="text-body text-fg-muted">Check the details below, then send your request.</p>
          <ReviewList
            rows={[
              ["Account to replace", accountLabel(target)],
              ["New account's bank", institutionName],
              ["New account number", maskAccountNumber(accountNumber)],
              ...(routingOrSwift ? ([["Routing or SWIFT/BIC", routingOrSwift]] as Array<[string, React.ReactNode]>) : []),
              ...(reason ? ([["Reason", reason]] as Array<[string, React.ReactNode]>) : []),
            ]}
          />
          {submitError && <Alert variant="danger" title="Your request wasn't sent">{submitError}</Alert>}
        </>
      )}

      {step === 2 && result && (
        <FlowDone title="Request sent">
          <p className="text-body text-fg-muted">
            {result.message || "We'll review your request and let you know the outcome. Your current account stays open until then."}
          </p>
        </FlowDone>
      )}
    </FlowDialog>
  );
}
