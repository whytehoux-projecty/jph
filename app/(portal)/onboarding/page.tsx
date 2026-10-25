"use client";

import * as React from "react";
import { Check, Circle } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignOutButton } from "@/components/auth/SignOutDialog";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Stepper } from "@/components/ui/stepper";
import { BackButton, StepFooter } from "@/components/portal/flow";
import { PASSWORD_RULES, meetsPasswordPolicy, pinProblem } from "@/lib/password-policy";
import { BRAND } from "@/src/content/facts";
import { userFacingError } from "@/lib/errors";
import { completeOnboarding } from "./actions";

/**
 * First sign-in: the customer replaces their temporary password and sets the
 * transaction PIN used to approve payments. Every other portal page redirects
 * here until this is done (middleware.ts).
 */
export default function OnboardingPage() {
  const [step, setStep] = React.useState<0 | 1>(0);
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [pin, setPin] = React.useState("");
  const [confirmPin, setConfirmPin] = React.useState("");
  const [errors, setErrors] = React.useState<Partial<Record<"password" | "confirm" | "pin" | "confirmPin", string>>>({});
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const headingRef = React.useRef<HTMLHeadingElement>(null);

  React.useEffect(() => headingRef.current?.focus(), [step]);

  const focusFirstError = () =>
    requestAnimationFrame(() => (document.querySelector('[aria-invalid="true"]') as HTMLElement | null)?.focus());

  const next = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!meetsPasswordPolicy(password)) errs.password = "Your password needs to meet every rule in the list.";
    if (confirm !== password) errs.confirm = "The passwords don't match.";
    setErrors(errs);
    if (Object.keys(errs).length) return focusFirstError();
    setStep(1);
  };

  const finish = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    const problem = pinProblem(pin);
    if (problem) errs.pin = problem;
    if (confirmPin !== pin) errs.confirmPin = "The PINs don't match.";
    setErrors(errs);
    if (Object.keys(errs).length) return focusFirstError();

    setBusy(true);
    setSubmitError(null);
    try {
      const res = await completeOnboarding({ password, transactionPin: pin });
      if (res.success) {
        // A full load, so the refreshed session cookie is used from here on.
        window.location.assign("/dashboard");
        return;
      }
      if (res.field === "password") {
        setStep(0);
        setErrors({ password: res.error });
      } else {
        setErrors({ pin: res.error });
      }
      setBusy(false);
    } catch (err) {
      setSubmitError(userFacingError(err, "We couldn't finish setting up your account. Try again."));
      setBusy(false);
    }
  };

  return (
    <AuthShell skipLabel="Skip to account setup">
      <div className="flex flex-col gap-6">
        <div>
          <p className="text-label uppercase text-fg-muted">Welcome to {BRAND.vault}</p>
          <h1 ref={headingRef} tabIndex={-1} className="mt-2 font-display text-h1 text-fg focus:outline-none">
            {step === 0 ? "Choose your password" : "Set your transaction PIN"}
          </h1>
          <p className="mt-2 text-body text-fg-muted">
            {step === 0
              ? "Replace the temporary password we sent you with one only you know."
              : "You'll use this PIN to approve transfers, withdrawals and bill payments. It's separate from your password."}
          </p>
        </div>

        <Stepper steps={["Password", "Transaction PIN"]} current={step} />

        {step === 0 ? (
          <form onSubmit={next} noValidate className="flex flex-col gap-5">
            <FormField label="New password" error={errors.password}>
              <PasswordInput
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-describedby="password-rules"
              />
            </FormField>
            <ul id="password-rules" className="grid gap-1.5 text-small sm:grid-cols-2" aria-label="Password rules">
              {PASSWORD_RULES.map((r) => {
                const met = r.test(password);
                return (
                  <li key={r.id} className={met ? "flex items-center gap-2 text-success" : "flex items-center gap-2 text-fg-muted"}>
                    {met ? <Check className="size-4" aria-hidden="true" /> : <Circle className="size-4" aria-hidden="true" />}
                    {r.label}
                    <span className="sr-only">{met ? "(done)" : "(not yet)"}</span>
                  </li>
                );
              })}
            </ul>
            <FormField label="Confirm new password" error={errors.confirm}>
              <PasswordInput autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            </FormField>
            <StepFooter next={<Button size="lg">Continue</Button>} />
          </form>
        ) : (
          <form onSubmit={finish} noValidate className="flex flex-col gap-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label="Transaction PIN" hint="4 to 6 digits" error={errors.pin}>
                <Input
                  type="password"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                  className="tracking-[0.4em]"
                />
              </FormField>
              <FormField label="Confirm PIN" error={errors.confirmPin}>
                <Input
                  type="password"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={6}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
                  className="tracking-[0.4em]"
                />
              </FormField>
            </div>
            <p className="text-small text-fg-muted">Avoid your birthday, repeated digits or a run like 1234.</p>
            {submitError && (
              <Alert variant="danger" title="Setup isn't finished">
                {submitError}
              </Alert>
            )}
            <StepFooter
              back={<BackButton label="Back to password" onClick={() => setStep(0)} disabled={busy} />}
              next={
                <Button size="lg" loading={busy} loadingLabel="Finishing your setup">
                  Finish setup
                </Button>
              }
            />
          </form>
        )}

        <p className="border-t border-line pt-5 text-small text-fg-muted">
          Not you, or want to finish later?{" "}
          <SignOutButton className="font-semibold text-fg-action underline underline-offset-[3px]">Sign out</SignOutButton>
        </p>
      </div>
    </AuthShell>
  );
}
