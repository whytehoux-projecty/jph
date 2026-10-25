"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Check, Circle } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { OtpInput } from "@/components/ui/otp-input";
import { PasswordInput } from "@/components/ui/password-input";
import { PASSWORD_RULES, meetsPasswordPolicy } from "@/lib/password-policy";
import { BRAND } from "@/src/content/facts";
import { ROUTES } from "@/lib/constants";
import { requestPasswordReset, resetPassword } from "./actions";

const UNAVAILABLE = "Something went wrong on our side. Please try again in a few minutes.";

/**
 * Forgotten password: the customer asks for a code by email, then enters it
 * with a new password. A code (not a link) keeps anything secret out of URLs.
 */
export default function ForgotPasswordPage() {
  const [step, setStep] = React.useState<"email" | "reset" | "done">("email");
  const [email, setEmail] = React.useState("");
  const [code, setCode] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [errors, setErrors] = React.useState<Partial<Record<"email" | "code" | "password" | "confirm", string>>>({});
  const [formError, setFormError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const headingRef = React.useRef<HTMLHeadingElement>(null);

  React.useEffect(() => headingRef.current?.focus(), [step]);

  const sendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrors({ email: "Enter the email address you registered with." });
      return;
    }
    setErrors({});
    setBusy(true);
    try {
      const res = await requestPasswordReset(email);
      if (res.ok) setStep("reset");
      else setFormError(res.error);
    } catch {
      setFormError(UNAVAILABLE);
    } finally {
      setBusy(false);
    }
  };

  const reset = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const next: typeof errors = {};
    if (!/^\d{8}$/.test(code)) next.code = "Enter the 8-digit code from the email.";
    if (!meetsPasswordPolicy(password)) next.password = "Your password needs to meet every rule in the list.";
    if (confirm !== password) next.confirm = "The passwords don't match.";
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    try {
      const res = await resetPassword({ email, code, password });
      if (res.ok) {
        setPassword("");
        setConfirm("");
        setStep("done");
      } else {
        setErrors({ [res.field]: res.error });
        if (res.field === "code") setCode("");
      }
    } catch {
      setFormError(UNAVAILABLE);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell skipLabel="Skip to password reset">
      <p className="text-label uppercase text-fg-muted">{BRAND.vault}</p>
      <h1 ref={headingRef} tabIndex={-1} className="mt-2 font-display text-h1 text-fg focus:outline-none">
        {step === "email" ? "Reset your password" : step === "reset" ? "Choose a new password" : "Password changed"}
      </h1>

      {formError && (
        <Alert variant="danger" className="mt-6">
          {formError}
        </Alert>
      )}

      {step === "email" && (
        <form onSubmit={sendCode} noValidate className="mt-6 flex flex-col gap-5">
          <p className="text-body text-fg-muted">Enter the email address you registered with. If it matches an account with online banking, we&apos;ll email you a code.</p>
          <FormField label="Email address" error={errors.email}>
            <Input type="email" inputMode="email" autoComplete="email" autoCapitalize="none" spellCheck={false} value={email} onChange={(e) => setEmail(e.target.value)} />
          </FormField>
          <Button size="lg" fullWidth loading={busy} loadingLabel="Sending the code">
            Send code
          </Button>
        </form>
      )}

      {step === "reset" && (
        <form onSubmit={reset} noValidate className="mt-6 flex flex-col gap-5">
          <p className="text-body text-fg-muted">
            If <span className="font-semibold text-fg">{email.trim()}</span> has online banking, we&apos;ve sent it an 8-digit code. It works for 15 minutes. Check your spam folder too.
          </p>
          <FormField label="Code from the email" error={errors.code}>
            <OtpInput length={8} value={code} onChange={(v) => setCode(v)} />
          </FormField>
          <FormField label="New password" error={errors.password}>
            <PasswordInput autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} aria-describedby="reset-rules" />
          </FormField>
          <ul id="reset-rules" className="grid gap-1.5 text-small sm:grid-cols-2" aria-label="Password rules">
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
          <Button size="lg" fullWidth loading={busy} loadingLabel="Changing your password">
            Change password
          </Button>
          <Button
            type="button"
            variant="tertiary"
            fullWidth
            icon={<ArrowLeft aria-hidden="true" />}
            onClick={() => {
              setStep("email");
              setCode("");
              setErrors({});
            }}
            disabled={busy}
          >
            Use a different email or get a new code
          </Button>
        </form>
      )}

      {step === "done" && (
        <div className="mt-6 flex flex-col gap-5">
          <Alert variant="success">Your password has been changed. Sign in with your new password.</Alert>
          <Button asChild size="lg" fullWidth>
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      )}

      {step !== "done" && (
        <p className="mt-8 border-t border-line pt-5 text-small text-fg-muted">
          Signing in for the first time, or no access to that email?{" "}
          <Link href={ROUTES.contact} className="font-semibold text-fg-action underline underline-offset-[3px]">
            Contact us
          </Link>
          . Remembered it?{" "}
          <Link href="/login" className="font-semibold text-fg-action underline underline-offset-[3px]">
            Sign in
          </Link>
          .
        </p>
      )}
    </AuthShell>
  );
}
