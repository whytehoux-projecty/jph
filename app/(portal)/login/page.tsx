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
import { consumeSignOutReason, type SignOutReason } from "@/lib/sign-out-notice";
import { BRAND } from "@/src/content/facts";
import { ROUTES } from "@/lib/constants";

const AFTER_LOGIN_ROUTE = "/dashboard";

// Same acceptance rules as before: an email address or a 10–12 digit account number.
const ACCOUNT_NUMBER = /^\d{10,12}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const NO_MATCH = "The details you entered don't match our records. Check them and try again.";
const UNAVAILABLE = "We couldn't sign you in just now. Please try again in a few minutes.";

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
      const result = await signIn("credentials", {
        email: userId,
        password: password,
        redirect: false,
      });

      if (result?.error) {
        // auth.ts only raises a custom code after the password has matched,
        // for profiles whose online access an administrator has paused.
        if (result.error === "CredentialsSignin" && result.code && result.code !== "credentials") {
          setSuspendedMessage(result.code);
        } else {
          setFormError(result.error === "Configuration" ? UNAVAILABLE : NO_MATCH);
        }
        setPassword("");
        submitting.current = false;
        setLoading(false);
        return;
      }

      // Stay busy until the dashboard has loaded, so the form can't be resent.
      router.push(AFTER_LOGIN_ROUTE);
      router.refresh();
    } catch {
      setFormError(UNAVAILABLE);
      submitting.current = false;
      setLoading(false);
    }
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
            href={ROUTES.contact}
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
