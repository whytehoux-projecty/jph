"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Banknote, Building2, Camera, Wallet } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChoiceCards } from "@/components/portal/flow";
import type {
  BankRoutingDetails,
  CryptoDepositConfig,
  DepositLocation,
  DepositMethod,
  RecentMoneyMovement,
  UserDepositPermissions,
} from "@/app/actions/deposits";
import type { MoneyAccount } from "@/components/portal/money-fields";
import { BankTransferIn } from "./components/BankTransferIn";
import { CashDeposit } from "./components/CashDeposit";
import { ChequeDeposit } from "./components/ChequeDeposit";
import { CryptoDeposit } from "./components/CryptoDeposit";
import { Withdraw } from "./components/Withdraw";
import { RecentMovements } from "./components/RecentMovements";

export type { MoneyAccount };

const DEPOSIT_METHODS: Record<DepositMethod, { label: string; description: string; icon: React.ReactNode; steps: string[] }> = {
  virtual: {
    label: "Bank transfer",
    description: "From another bank by ACH, wire or SWIFT.",
    icon: <Building2 className="size-5" aria-hidden="true" />,
    steps: [
      "Give the sender your account number and our routing details.",
      "Optionally, tell us the transfer is coming.",
      "The money is credited when it arrives.",
    ],
  },
  check: {
    label: "Cheque",
    description: "Photograph both sides of a signed cheque.",
    icon: <Camera className="size-5" aria-hidden="true" />,
    steps: [
      "Sign the back of the cheque.",
      "Photograph the front and back, and enter the amount.",
      "We review it and credit your account. Keep the cheque until then.",
    ],
  },
  cash: {
    label: "Cash at a branch",
    description: "Book a deposit, then hand the cash to a teller.",
    icon: <Banknote className="size-5" aria-hidden="true" />,
    steps: [
      "Choose the branch and amount to get a reference.",
      "Take the cash and the reference to the branch.",
      "The money is credited once the teller has counted it.",
    ],
  },
  crypto: {
    label: "USDC or USDT",
    description: "Send stablecoins to our wallet.",
    icon: <Wallet className="size-5" aria-hidden="true" />,
    steps: [
      "Choose the coin and network, and send to the address shown.",
      "Paste the transaction ID so we can find it.",
      "We confirm it on-chain and credit your account in US dollars.",
    ],
  },
};

const WITHDRAWAL_STEPS = [
  "Choose how you'd like the money and enter the details.",
  "Confirm with your transaction PIN.",
  "Our team checks the request. Your account is debited when it's approved.",
];

function HowItWorks({ steps }: { steps: string[] }) {
  return (
    <>
      <h2 className="font-sans text-h5 text-fg">How it works</h2>
      <ol className="mt-3 flex flex-col gap-2">
        {steps.map((s, i) => (
          <li key={s} className="flex items-start gap-3 text-small text-fg">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-round border border-line-strong text-caption font-semibold tabular-nums text-fg-muted">
              {i + 1}
            </span>
            {s}
          </li>
        ))}
      </ol>
    </>
  );
}

export default function DepositClient({
  holderName,
  locale,
  hideBalances,
  accounts,
  routingDetails,
  cryptoConfigs,
  locations,
  recent,
  permissions,
}: {
  holderName: string;
  locale: string;
  hideBalances: boolean;
  accounts: MoneyAccount[];
  routingDetails: BankRoutingDetails | null;
  cryptoConfigs: CryptoDepositConfig[];
  locations: DepositLocation[];
  recent: RecentMoneyMovement[];
  permissions: UserDepositPermissions;
}) {
  const router = useRouter();
  const refresh = React.useCallback(() => router.refresh(), [router]);

  // A method is offered when an administrator allows it for this customer
  // and the bank has supplied what it needs (details, branches, wallets).
  const configured: Record<DepositMethod, boolean> = {
    virtual: !!routingDetails,
    check: true,
    cash: locations.length > 0,
    crypto: cryptoConfigs.length > 0,
  };
  const allowed = (m: DepositMethod) => permissions.enabled && permissions.methods[m] !== false;
  const methods = (Object.keys(DEPOSIT_METHODS) as DepositMethod[]).filter((m) => allowed(m) && configured[m]);
  const someNotOnline = (Object.keys(DEPOSIT_METHODS) as DepositMethod[]).some((m) => allowed(m) && !configured[m]);

  const [mode, setMode] = React.useState<"deposit" | "withdraw">("deposit");
  const [method, setMethod] = React.useState<DepositMethod | undefined>(methods[0]);

  const supportLink = (
    <Button asChild variant="secondary">
      <Link href="/support">Contact support</Link>
    </Button>
  );

  return (
    <>
      <PageHeader title="Deposit and withdraw" description="Add money to your accounts, or request a withdrawal. Our team checks every request before it's processed." />

      {accounts.length === 0 ? (
        <Card>
          <EmptyState
            title="You need an active account first"
            description="Once you have an active account, you can add money to it or withdraw from it here."
            action={
              <Button asChild>
                <Link href="/vaults">Go to Accounts</Link>
              </Button>
            }
          />
        </Card>
      ) : (
        <Tabs value={mode} onValueChange={(v) => setMode(v as "deposit" | "withdraw")}>
          <TabsList aria-label="Deposit or withdraw">
            <TabsTrigger value="deposit">Deposit</TabsTrigger>
            <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
          </TabsList>

          <TabsContent value="deposit" className="mt-6">
            {!permissions.enabled ? (
              <Card>
                <EmptyState
                  title="Deposits are turned off for your profile"
                  description="Contact us and we'll help you add money to your account."
                  action={supportLink}
                />
              </Card>
            ) : methods.length === 0 || !method ? (
              <Card>
                <EmptyState
                  title="Online deposits aren't available for your profile"
                  description="Contact us and we'll tell you how to add money to your account."
                  action={supportLink}
                />
              </Card>
            ) : (
              <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
                <Card className="flex flex-col gap-6 p-5 sm:p-6 lg:col-span-8">
                  <ChoiceCards
                    legend="How are you adding money?"
                    name="deposit-method"
                    value={method}
                    options={methods.map((m) => ({ value: m, label: DEPOSIT_METHODS[m].label, description: DEPOSIT_METHODS[m].description }))}
                    icon={(m) => DEPOSIT_METHODS[m as DepositMethod].icon}
                    onChange={(m) => setMethod(m as DepositMethod)}
                  />
                  <div className="border-t border-line pt-6">
                    {method === "virtual" && routingDetails && (
                      <BankTransferIn accounts={accounts} details={routingDetails} holderName={holderName} locale={locale} onSubmitted={refresh} />
                    )}
                    {method === "check" && <ChequeDeposit accounts={accounts} locale={locale} onSubmitted={refresh} />}
                    {method === "cash" && <CashDeposit accounts={accounts} locations={locations} locale={locale} onSubmitted={refresh} />}
                    {method === "crypto" && <CryptoDeposit accounts={accounts} configs={cryptoConfigs} locale={locale} onSubmitted={refresh} />}
                  </div>
                </Card>
                <aside aria-label={`About ${DEPOSIT_METHODS[method].label}`} className="flex flex-col gap-5 lg:col-span-4">
                  <Card variant="muted" className="p-5">
                    <HowItWorks steps={DEPOSIT_METHODS[method].steps} />
                  </Card>
                  {someNotOnline && (
                    <Alert variant="info" title="Need another way to add money?">
                      <Link href="/support" className="underline underline-offset-[3px]">
                        Contact us
                      </Link>{" "}
                      and we&apos;ll tell you how.
                    </Alert>
                  )}
                </aside>
              </div>
            )}
          </TabsContent>

          <TabsContent value="withdraw" className="mt-6">
            <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
              <Card className="p-5 sm:p-6 lg:col-span-8">
                <Withdraw accounts={accounts} locations={locations} locale={locale} hideBalances={hideBalances} onSubmitted={refresh} />
              </Card>
              <aside aria-label="About withdrawals" className="lg:col-span-4">
                <Card variant="muted" className="p-5">
                  <HowItWorks steps={WITHDRAWAL_STEPS} />
                  <p className="mt-4 border-t border-line pt-4 text-small text-fg-muted">
                    To pay someone or move money between your accounts, use{" "}
                    <Link href="/transfer" className="text-fg-action underline underline-offset-[3px]">
                      Transfers
                    </Link>
                    .
                  </p>
                </Card>
              </aside>
            </div>
          </TabsContent>
        </Tabs>
      )}

      <RecentMovements items={recent} locale={locale} />
    </>
  );
}
