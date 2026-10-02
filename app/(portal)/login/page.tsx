"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

/* ------------------------------------------------------------------
   EASY SETTINGS - Heritage Trust Vault Configuration
------------------------------------------------------------------- */
// Authentic 1888 Heritage Trust bank stone facade at twilight with illuminated arched windows
const SIDE_IMAGE = "/images/hero/hero-3-desktop.webp";
const AFTER_LOGIN_ROUTE = "/dashboard";
const SUPPORT_PHONE = "1-800-437-4824";

export default function LoginPage() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!userId.trim() || !password) {
      setError("Enter your username or account number and your password.");
      return;
    }

    setLoading(true);
    try {
      const isAccountNumber = /^\d{10,12}$/.test(userId);
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userId);
      
      if (!isAccountNumber && !isEmail) {
        setError("Please enter a valid account number or email address");
        setLoading(false);
        return;
      }

      if (password.length < 6) {
        setError("Password must be at least 6 characters");
        setLoading(false);
        return;
      }

      const result = await signIn("credentials", {
        email: userId,
        password: password,
        redirect: false,
      });

      if (result?.error) {
        const knownGenericErrors = ["CredentialsSignin", "Configuration"];
        const isGenericError = knownGenericErrors.includes(result.error);
        setError(
          isGenericError
            ? "Invalid credentials. Please check your account number/email and password."
            : result.error
        );
        setLoading(false);
        return;
      }

      router.push(AFTER_LOGIN_ROUTE);
      router.refresh();
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-[#FAF8F3] text-[#14181F] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      {/* ---------------- LEFT: brand panel (hidden on mobile) ---------------- */}
      <aside
        className="relative hidden flex-col justify-between overflow-hidden bg-[#14181C] p-12 text-[#FAF8F3] lg:flex"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(20,24,28,.82) 0%, rgba(20,24,28,.62) 42%, rgba(20,24,28,.94) 100%), url(${SIDE_IMAGE})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div>
          <Link href="/" className="inline-flex items-center" aria-label="Heritage Trust home">
            {/* Official Horizontal Reversed Logo for Ink / dark scrim */}
            <img
              src="/images/logos/heritage-trust-logo-reversed.svg"
              alt="Heritage Trust"
              className="h-9 w-auto object-contain"
            />
          </Link>
        </div>

        <div className="max-w-md py-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-mono text-[#F4724A] backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[#E8532B] animate-pulse" />
            Heritage Vault
          </div>
          <h1 className="mt-4 text-4xl xl:text-5xl font-semibold leading-[1.08] tracking-tight font-display text-white">
            Your accounts, kept the way we have kept them since 1888.
          </h1>
          <p className="mt-4 text-sm text-white/70 leading-relaxed">
            Institutional custody, bespoke treasury management, and private banking built on enduring trust and cryptographic security.
          </p>
        </div>

        <ul className="grid max-w-md gap-3.5 border-t border-white/15 pt-6 text-sm text-white/80">
          <li className="flex items-center gap-3">
            <Tick />
            <span>Deposits insured up to $250,000 by the FDIC</span>
          </li>
          <li className="flex items-center gap-3">
            <Tick />
            <span>256-bit AES encryption on all data in transit and at rest</span>
          </li>
          <li className="flex items-center gap-3">
            <Tick />
            <span>Fraud monitoring around the clock, with zero-liability protection</span>
          </li>
        </ul>
      </aside>

      {/* ---------------- RIGHT: sign-in section ---------------- */}
      <section className="flex min-h-screen flex-col justify-between px-6 py-8 sm:px-12">
        <div className="flex items-center justify-between">
          {/* Mobile view brand logo */}
          <Link href="/" className="inline-flex items-center lg:hidden" aria-label="Heritage Trust home">
            <img
              src="/images/logos/heritage-trust-logo.svg"
              alt="Heritage Trust"
              className="h-7 w-auto object-contain"
            />
          </Link>

          <Link
            href="/"
            className="ml-auto text-sm text-[#5B646C] underline-offset-4 hover:text-[#14181F] hover:underline"
          >
            Back to heritagetrust.com
          </Link>
        </div>

        <div className="mx-auto flex w-full max-w-[410px] flex-1 flex-col justify-center py-10">
          {/* Subtle Vault emblem badge */}
          <div className="mb-3 inline-flex items-center gap-2">
            <img
              src="/images/logos/heritage-trust-mark.svg"
              alt=""
              className="h-6 w-6 object-contain"
              aria-hidden="true"
            />
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#C8401A]">
              Heritage Vault
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#14181F]">
            Sign in
          </h2>
          <p className="mt-2 text-sm text-[#5B646C]">
            Access your secure personal and commercial banking portal
          </p>

          <form onSubmit={handleSubmit} noValidate className="mt-8 grid gap-5">
            {error && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-md border-l-4 border-[#C8401A] bg-[#FBEAE4] px-4 py-3 text-sm text-[#7A2410]"
              >
                <svg className="h-5 w-5 shrink-0 text-[#C8401A]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="userId" className="mb-2 block text-sm font-medium text-[#14181F]">
                Username or account number
              </label>
              <input
                id="userId"
                name="userId"
                type="text"
                autoComplete="username"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="e.g. 10-digit account or email"
                className={`vault-input h-[52px] w-full rounded-md border bg-white px-4 text-base outline-none transition focus:border-[#14181F] focus:ring-2 focus:ring-[#C8401A]/30 ${
                  error ? "border-[#C8401A]" : "border-[#CFC8B8]"
                }`}
              />
            </div>

            <div>
              <div className="mb-2 flex items-baseline justify-between">
                <label htmlFor="password" className="text-sm font-medium text-[#14181F]">
                  Password
                </label>
                <Link
                  href="/contact"
                  className="text-xs sm:text-sm font-medium text-[#C8401A] underline-offset-4 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your vault password"
                  className={`vault-input h-[52px] w-full rounded-md border bg-white pl-4 pr-20 text-base outline-none transition focus:border-[#14181F] focus:ring-2 focus:ring-[#C8401A]/30 ${
                    error ? "border-[#C8401A]" : "border-[#CFC8B8]"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-pressed={showPassword}
                  className="absolute right-1 top-1 h-[44px] rounded px-3 text-xs font-semibold uppercase tracking-wider text-[#5B646C] hover:bg-[#F3EEE3] hover:text-[#14181F] focus:outline-none focus:ring-2 focus:ring-[#C8401A]/30"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-3 text-sm text-[#14181F]">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-[#CFC8B8] accent-[#14181F]"
              />
              <span>Remember my username on this device</span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="flex h-[52px] w-full items-center justify-center gap-2 rounded-md bg-[#C8401A] text-base font-semibold text-white shadow-sm transition hover:bg-[#A62F0E] focus:outline-none focus:ring-2 focus:ring-[#14181F] focus:ring-offset-2 focus:ring-offset-[#FAF8F3] disabled:cursor-wait disabled:opacity-75"
            >
              {loading ? (
                <>
                  <svg className="h-5 w-5 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Signing in securely...</span>
                </>
              ) : (
                <>
                  <Lock />
                  <span>Sign in securely</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 grid gap-2.5 border-t border-[#E3DCCB] pt-6 text-sm text-[#5B646C]">
            <p>
              Have an account but no online access?{" "}
              <Link href="/apply" className="font-medium text-[#14181F] underline underline-offset-4 hover:text-[#C8401A]">
                Enroll in online banking
              </Link>
            </p>
            <p>
              New to Heritage Trust?{" "}
              <Link href="/apply" className="font-medium text-[#14181F] underline underline-offset-4 hover:text-[#C8401A]">
                Open an account
              </Link>
            </p>
          </div>

          <div className="mt-8 flex items-start gap-3 rounded-md border border-[#E3DCCB] bg-[#F3EEE3]/70 p-3.5 text-[13px] leading-relaxed text-[#5B646C]">
            <ShieldCheck />
            <p>
              <strong className="font-medium text-[#14181F]">Security notice:</strong> Heritage Trust will never ask for your password, PIN, or one-time passcode by email or unsolicited call.
            </p>
          </div>
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-xs text-[#5B646C] pt-6">
          <span>&copy; {new Date().getFullYear()} Heritage Trust Bank, N.A. Member FDIC. Equal Housing Lender.</span>
          <nav className="flex flex-wrap gap-x-5 gap-y-1" aria-label="Legal">
            <Link href="/privacy" className="hover:underline">Privacy</Link>
            <Link href="/terms" className="hover:underline">Terms</Link>
            <Link href="/accessibility" className="hover:underline">Accessibility</Link>
            <Link href="/security" className="hover:underline">Security</Link>
            <a href={`tel:${SUPPORT_PHONE.replace(/-/g, "")}`} className="hover:underline">{SUPPORT_PHONE}</a>
          </nav>
        </footer>
      </section>

      {/* Prevent autofill styling clash */}
      <style>{`
        .vault-input:-webkit-autofill,
        .vault-input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px #fff inset;
          -webkit-text-fill-color: #14181F;
        }
      `}</style>
    </main>
  );
}

/* ---------- Brand Icons ---------- */

function Tick() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" className="shrink-0">
      <circle cx="9" cy="9" r="8" fill="#E8532B" fillOpacity="0.2" />
      <path d="M5.5 9.5l2.5 2.5 5-5" stroke="#F4724A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Lock() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <rect x="3.5" y="8" width="11" height="7.5" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M6 8V6a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function ShieldCheck() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1F4D3F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

