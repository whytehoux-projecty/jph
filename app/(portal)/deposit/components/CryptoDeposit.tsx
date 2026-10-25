"use client";

import * as React from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { StepFooter, StepHeading } from "@/components/portal/flow";
import { submitDeposit, type CryptoDepositConfig } from "@/app/actions/deposits";
import { formatAmount } from "@/lib/format";
import { userFacingError } from "@/lib/errors";
import { AccountField, AmountField, CopyRow, RequestSent, parseAmount, type MoneyAccount } from "@/components/portal/money-fields";

/**
 * Shows the bank's wallet for the chosen stablecoin and network, then lets
 * the customer report the transaction so staff can confirm it on-chain.
 */
export function CryptoDeposit({
  accounts,
  configs,
  locale,
  onSubmitted,
}: {
  accounts: MoneyAccount[];
  configs: CryptoDepositConfig[];
  locale: string;
  onSubmitted: () => void;
}) {
  const tokens = Array.from(new Set(configs.map((c) => c.token)));
  const [token, setToken] = React.useState(tokens[0]);
  const networks = configs.filter((c) => c.token === token);
  const [network, setNetwork] = React.useState(networks[0].network);
  const config = networks.find((c) => c.network === network) ?? networks[0];

  const [accountId, setAccountId] = React.useState(accounts[0].id);
  const account = accounts.find((a) => a.id === accountId) ?? accounts[0];
  const [txHash, setTxHash] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [hashError, setHashError] = React.useState<string | null>(null);
  const [amountError, setAmountError] = React.useState<string | null>(null);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [result, setResult] = React.useState<{ reference: string; id?: string; amount: number } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseAmount(amount);
    const hash = txHash.trim();
    const hashOk = /^[A-Za-z0-9]{32,128}$/.test(hash.replace(/^0x/, ""));
    setHashError(hashOk ? null : "Paste the transaction ID (hash) from your wallet or exchange.");
    let amountMsg: string | null = null;
    if (!value) amountMsg = `Enter the amount of ${token} you sent.`;
    else if (config.minimumDeposit && value < config.minimumDeposit) amountMsg = `The minimum deposit is ${config.minimumDeposit} ${token}.`;
    setAmountError(amountMsg);
    if (!hashOk || amountMsg || !value) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await submitDeposit({
        accountId,
        method: "crypto",
        amount: value,
        currency: "USD",
        description: `${token} deposit (${config.networkLabel})`,
        metadata: { token, network: config.network, txHash: hash, depositAddress: config.address },
      });
      if (res.success && res.reference) {
        setResult({ reference: res.reference, id: res.id, amount: value });
        onSubmitted();
      } else {
        setSubmitError(res.error ?? "We couldn't record this deposit. Try again.");
      }
    } catch (err) {
      setSubmitError(userFacingError(err, "We couldn't record this deposit. Try again."));
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <RequestSent
        title="Deposit reported"
        description="Our team checks the transaction on-chain and credits your account in US dollars once it's confirmed. You'll get a notification."
        rows={[
          ["Reference", <span key="r" className="font-code text-small">{result.reference}</span>],
          ["Sent", `${result.amount} ${token} on ${config.networkLabel}`],
          ["Into", account.label],
          ["Transaction ID", <span key="h" className="break-all font-code text-small">{txHash.trim()}</span>],
        ]}
        transactionId={result.id}
        anotherLabel="Report another deposit"
        onAnother={() => {
          setResult(null);
          setTxHash("");
          setAmount("");
        }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <section aria-labelledby="cr-address" className="flex flex-col gap-5">
        <StepHeading id="cr-address" title="Send to our wallet" description="Choose the coin and network first. Sending on the wrong network can lose your money." />
        <div className="grid max-w-md gap-5 sm:grid-cols-2">
          <FormField label="Coin">
            <NativeSelect
              value={token}
              onChange={(e) => {
                const t = e.target.value as CryptoDepositConfig["token"];
                setToken(t);
                setNetwork(configs.find((c) => c.token === t)!.network);
              }}
            >
              {tokens.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </NativeSelect>
          </FormField>
          <FormField label="Network">
            <NativeSelect value={config.network} onChange={(e) => setNetwork(e.target.value)}>
              {networks.map((c) => (
                <option key={c.network} value={c.network}>
                  {c.networkLabel}
                </option>
              ))}
            </NativeSelect>
          </FormField>
        </div>
        <dl className="divide-y divide-line rounded-surface border border-line">
          <CopyRow label={`${token} deposit address (${config.networkLabel})`} value={config.address} />
          {config.memoOrTag && <CopyRow label="Memo / tag (required)" value={config.memoOrTag} />}
        </dl>
        <Alert variant="warning" title={`Send only ${token} on ${config.networkLabel}`}>
          {[
            config.minimumDeposit ? `Minimum ${config.minimumDeposit} ${token}.` : null,
            config.confirmationsRequired ? `We wait for ${config.confirmationsRequired} network confirmations.` : null,
            config.memoOrTag ? "Include the memo or tag, or we can't match the deposit to you." : null,
          ]
            .filter(Boolean)
            .join(" ") || "Other coins or networks sent to this address can't be recovered."}
        </Alert>
      </section>

      <form onSubmit={submit} noValidate aria-labelledby="cr-report" className="flex flex-col gap-5 border-t border-line pt-6">
        <StepHeading id="cr-report" title="Tell us you've sent it" description="We need the transaction ID to find your deposit on-chain." />
        <div className="flex max-w-md flex-col gap-5">
          <AccountField label="Credit to" accounts={accounts} value={accountId} onChange={setAccountId} locale={locale} />
          <FormField label="Transaction ID (hash)" error={hashError}>
            <Input
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              className="font-code"
              value={txHash}
              onChange={(e) => {
                setTxHash(e.target.value);
                setHashError(null);
              }}
            />
          </FormField>
          <AmountField
            label={`Amount of ${token} sent`}
            currency={token}
            hint={`Credited 1 ${token} = ${formatAmount(1, { currency: "USD", locale })} once confirmed.`}
            value={amount}
            error={amountError}
            onChange={(v) => {
              setAmount(v);
              setAmountError(null);
            }}
          />
        </div>
        {submitError && (
          <Alert variant="danger" title="Not recorded">
            {submitError}
          </Alert>
        )}
        <StepFooter next={<Button loading={submitting} loadingLabel="Recording your deposit">Report deposit</Button>} />
      </form>
    </div>
  );
}
