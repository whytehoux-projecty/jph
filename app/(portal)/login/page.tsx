"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { ArrowLeft, CircleAlert, ShieldCheck } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { OtpInput } from "@/components/ui/otp-input";
import { beginSignIn } from "./actions";
import { consumeSignOutReason, type SignOutReason } from "@/lib/sign-out-notice";
import { BRAND } from "@/src/content/facts";
import { ROUTES } from "@/lib/constants";

const AFTER_LOGIN_ROUTE = "/dashboard";

// Same acceptance rules as before: an email address or a 10–12 digit account number.
const ACCOUNT_NUMBER = /^\d{10,12}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const NO_MATCH = "The details you entered don't match our records. Check them and try again.";
const UNAVAILABLE = "We couldn't sign you in just now. Please try again in a few minutes.";
const lockedText = (minutes: number) =>
  `Too many wrong passwords, so sign-in is paused for ${minutes} more minute${minutes === 1 ? "" : "s"}. You can reset your password if you've forgotten it.`;

const NOTICES: Record<SignOutReason, { title: string; body: string }> = {
  "signed-out": {
    title: "You've signed out",
    body: "If you're using a shared or public device, close this browser window as well.",
  },
  idle: {
    title: "We signed you out to protect your account",
    body: `There was no activity in ${BRAND.vault} for 10 minutes. Sign in again to continue.`,
  },
};

function validateUserId(value: string): string | null {
  const v = value.trim();
  if (!v) return "Enter your email address or account number.";
  if (!ACCOUNT_NUMBER.test(v) && !EMAIL.test(v)) {
    return "Enter a valid email address, or an account number of 10 to 12 digits.";
  }
  return null;
}

export default function LoginPage() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [userIdError, setUserIdError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [suspendedMessage, setSuspendedMessage] = useState<string | null>(null);
  const [notice, setNotice] = useState<SignOutReason | null>(null);
  const [capsLock, setCapsLock] = useState(false);
  const [loading, setLoading] = useState(false);
  // Step two, when an emailed code is needed. Kept in memory only.
  const [codeStep, setCodeStep] = useState<{ challenge: string; sentTo: string } | null>(null);
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);
  const codeHeadingRef = useRef<HTMLHeadingElement>(null);

  const submitting = useRef(false);
  const userIdRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const formErrorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("portal_login_time");
    }
    setNotice(consumeSignOutReason());
  }, []);

  useEffect(() => {
    if (formError) formErrorRef.current?.focus();
  }, [formError]);

  useEffect(() => {
    if (codeStep) codeHeadingRef.current?.focus();
  }, [codeStep]);

  function trackCapsLock(e: KeyboardEvent<HTMLInputElement>) {
    setCapsLock(e.getModifierState?.("CapsLock") ?? false);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting.current) return;

    setFormError(null);
    setNotice(null);

    const idError = validateUserId(userId);
    const pwError = password ? null : "Enter your password.";
    setUserIdError(idError);
    setPasswordError(pwError);
    if (idError || pwError) {
      (idError ? userIdRef : passwordRef).current?.focus();
      return;
    }

    // No account can have a password this short; answer exactly as for any
    // other mismatch so the response reveals nothing about the account.
    if (password.length < 6) {
      setFormError(NO_MATCH);
      return;
    }

    submitting.current = true;
    setLoading(true);
    try {
      const res = await beginSignIn({ userId, password });
      setPassword("");
      if (res.status === "ready") return await finish(res.challenge);
      if (res.status === "code-sent") {
        setCodeStep({ challenge: res.challenge, sentTo: res.sentTo });
      } else if (res.status === "paused") {
        setSuspendedMessage(res.message);
      } else if (res.status === "locked") {
        setFormError(lockedText(res.minutes));
      } else if (res.status === "temp-expired") {
        setFormError("Your temporary password has expired. Contact us and we'll send you a new one.");
      } else {
        setFormError(NO_MATCH);
      }
    } catch {
      setFormError(UNAVAILABLE);
    }
    submitting.current = false;
    setLoading(false);
  }

  /** Step two: hands the challenge (and code, when one was emailed) to NextAuth. */
  async function finish(challenge: string, enteredCode?: string) {
    const result = await signIn("credentials", { challenge, code: enteredCode ?? "", redirect: false });
    if (result?.error) {
      const c = typeof result.code === "string" ? result.code : "";
      if (c.startsWith("CODE_WRONG:")) {
        const left = Number(c.slice(11));
        setCodeError(`That code isn't right. ${left} ${left === 1 ? "try" : "tries"} left.`);
        setCode("");
      } else {
        // Expired, used up or already used: start again from the password.
        setCodeStep(null);
        setCode("");
        setFormError(c === "CODE_USED_UP" ? "Too many wrong codes. Sign in again to get a new one." : "That sign-in has expired. Sign in again.");
      }
      submitting.current = false;
      setLoading(false);
      return;
    }
    // Stay busy until the dashboard has loaded, so nothing can be resent.
    router.push(AFTER_LOGIN_ROUTE);
    router.refresh();
  }

  async function submitCode(e?: FormEvent, value = code) {
    e?.preventDefault();
    if (!codeStep || submitting.current) return;
    if (!/^\d{6}$/.test(value)) {
      setCodeError("Enter the 6-digit code from the email.");
      return;
    }
    setCodeError(null);
    submitting.current = true;
    setLoading(true);
    try {
      await finish(codeStep.challenge, value);
    } catch {
      setCodeError(UNAVAILABLE);
      submitting.current = false;
      setLoading(false);
    }
  }

  if (codeStep) {
    return (
      <AuthShell>
        <p className="text-label uppercase text-fg-muted">{BRAND.vault}</p>
        <h1 ref={codeHeadingRef} tabIndex={-1} className="mt-2 font-display text-h1 text-fg focus:outline-none">
          Check your email
        </h1>
        <p className="mt-2 text-body text-fg-muted">
          We sent a 6-digit code to <span className="font-semibold text-fg">{codeStep.sentTo}</span>. It works for 10 minutes.
        </p>
        <form onSubmit={submitCode} noValidate aria-busy={loading} className="mt-8 flex flex-col gap-5">
          <FormField label="Sign-in code" error={codeError}>
            <OtpInput length={6} value={code} onChange={(v) => { setCode(v); setCodeError(null); }} onComplete={(v) => void submitCode(undefined, v)} />
          </FormField>
          <Button type="submit" size="lg" fullWidth loading={loading} loadingLabel="Checking the code">
            Continue
          </Button>
          <Button
            type="button"
            variant="tertiary"
            fullWidth
            icon={<ArrowLeft aria-hidden="true" />}
            onClick={() => {
              setCodeStep(null);
              setCode("");
              setCodeError(null);
            }}
            disabled={loading}
          >
            Didn&apos;t get it? Sign in again
          </Button>
        </form>
        <p className="mt-6 text-small text-fg-muted">
          We will never ask you for this code. If you didn&apos;t just try to sign in, someone may know your password.{" "}
          <Link href="/forgot-password" className="font-semibold text-fg-action underline underline-offset-[3px]">Reset it</Link>.
        </p>
      </AuthShell>
    );
  }

  if (suspendedMessage) {
    return (
      <AuthShell>
        <SuspendedAccess
          message={suspendedMessage}
          onBack={() => {
            setSuspendedMessage(null);
            setUserId("");
          }}
        />
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <p className="text-label uppercase text-fg-muted">{BRAND.vault}</p>
      <h1 className="mt-2 font-display text-h1 text-fg">Sign in</h1>
      <p className="mt-2 text-body text-fg-muted">Personal and business online banking.</p>

      {notice && (
        <Alert variant="info" title={NOTICES[notice].title} className="mt-6">
          {NOTICES[notice].body}
        </Alert>
      )}

      <form onSubmit={handleSubmit} noValidate aria-busy={loading} className="mt-8 flex flex-col gap-5">
        {formError && (
          <div ref={formErrorRef} tabIndex={-1} className="focus:outline-none">
            <Alert variant="danger">{formError}</Alert>
          </div>
        )}

        <FormField
          label="Email or account number"
          hint="The email address you registered with, or your 10 to 12 digit account number."
          error={userIdError}
          required
        >
          <Input
            ref={userIdRef}
            name="username"
            type="text"
            inputMode="email"
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            value={userId}
            onChange={(e) => {
              setUserId(e.target.value);
              if (userIdError) setUserIdError(null);
            }}
            onBlur={() => userId && setUserIdError(validateUserId(userId))}
          />
        </FormField>

        <FormField label="Password" error={passwordError} required>
          <PasswordInput
            ref={passwordRef}
            name="password"
            autoComplete="current-password"
            value={password}
            aria-describedby={capsLock ? "caps-lock-warning" : undefined}
            onChange={(e) => {
              setPassword(e.target.value);
              if (passwordError) setPasswordError(null);
            }}
            onKeyDown={trackCapsLock}
            onKeyUp={trackCapsLock}
            onBlur={() => setCapsLock(false)}
          />
          <div aria-live="polite">
            {capsLock && (
              <p id="caps-lock-warning" className="flex items-center gap-1.5 text-small text-warning">
                <CircleAlert className="size-4 shrink-0" aria-hidden="true" />
                Caps Lock is on.
              </p>
            )}
          </div>
        </FormField>

        <div className="-mt-2 flex justify-end">
          <Link
            href="/forgot-password"
            className="inline-flex min-h-11 items-center text-small font-semibold text-fg-action underline decoration-1 underline-offset-[3px] hover:decoration-2"
          >
            Forgotten your password?
          </Link>
        </div>

        <Button type="submit" size="lg" fullWidth loading={loading} loadingLabel="Signing in">
          {loading ? "Signing in" : "Sign in"}
        </Button>
      </form>

      <div className="mt-8 flex flex-col gap-2 border-t border-line pt-6 text-small text-fg-muted">
        <p>
          Have an account but no online access?{" "}
          <Link href={ROUTES.apply} className="font-semibold text-fg-action underline decoration-1 underline-offset-[3px] hover:decoration-2">
            Enroll in online banking
          </Link>
        </p>
        <p>
          New to {BRAND.shortName}?{" "}
          <Link href={ROUTES.apply} className="font-semibold text-fg-action underline decoration-1 underline-offset-[3px] hover:decoration-2">
            Open an account
          </Link>
        </p>
      </div>

      <aside aria-label="Security notice" className="mt-8 flex gap-3 rounded-surface bg-surface-muted p-4">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-fg-action" aria-hidden="true" />
        <div className="text-small text-fg-muted">
          <p>
            <span className="font-semibold text-fg">We will never ask for your password, PIN or one-time code</span>{" "}
            by phone, text or email, and we never ask you to move money to a &ldquo;safe account&rdquo;.
          </p>
          <Link
            href={`${ROUTES.security}#verify`}
            className="mt-1 inline-flex min-h-11 items-center font-semibold text-fg-action underline decoration-1 underline-offset-[3px] hover:decoration-2"
          >
            Check that a call or email is really us
          </Link>
        </div>
      </aside>
    </AuthShell>
  );
}

function SuspendedAccess({ message, onBack }: { message: string; onBack: () => void }) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => headingRef.current?.focus(), []);

  return (
    <div>
      <p className="text-label uppercase text-fg-muted">{BRAND.vault}</p>
      <h1 ref={headingRef} tabIndex={-1} className="mt-2 font-display text-h1 text-fg focus:outline-none">
        Online access is paused
      </h1>
      <p className="mt-3 text-body text-fg-muted">
        Your details are correct, but online banking for this profile isn&rsquo;t available at the moment. Your
        accounts and the money in them are not affected.
      </p>

      <Alert variant="warning" title="Message from Heritage Trust" className="mt-6">
        {message}
      </Alert>

      <div className="mt-8 flex flex-col gap-3">
        <Button asChild size="lg" fullWidth>
          <Link href={ROUTES.contact}>Contact us</Link>
        </Button>
        <Button variant="tertiary" size="lg" fullWidth onClick={onBack} icon={<ArrowLeft aria-hidden="true" />}>
          Back to sign in
        </Button>
      </div>
    </div>
  );
}
