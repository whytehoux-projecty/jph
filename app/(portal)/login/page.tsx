"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Footer } from "@/components/layout/Footer";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    accountNumber: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    const newErrors: Record<string, string> = {};

    const isAccountNumber = /^\d{10,12}$/.test(formData.accountNumber);
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.accountNumber);

    if (!formData.accountNumber) {
      newErrors.accountNumber = "Username or account number is required";
    } else if (!isAccountNumber && !isEmail) {
      newErrors.accountNumber =
        "Please enter a valid account number or email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      // Fix #20: admin can set 6-char passwords, so minimum must be 6 not 8
      newErrors.password = "Password must be at least 6 characters";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      const result = await signIn("credentials", {
        email: formData.accountNumber,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        // Fix #21: pass through the EXACT error message from auth.ts,
        // which now contains the admin-set custom notification message
        const knownGenericErrors = [
          "CredentialsSignin",
          "Configuration",
        ];
        const isGenericError = knownGenericErrors.includes(result.error);
        setErrors({
          general: isGenericError
            ? "Invalid credentials. Please check your account number/email and password."
            : result.error, // ← show the custom admin message verbatim
        });
        setIsLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Login error:", error);
      setErrors({ general: "An unexpected error occurred. Please try again." });
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full relative flex flex-col overflow-hidden">
      {/* Full Screen Background */}
      <div className="absolute inset-0 z-0 bg-white">
        <Image
          src="/images/login-bg.webp"
          alt="JP Heritage login background"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Fix #6 & #7: Use flex column layout so logo and form stack properly
          on all viewports, no absolute logo that crashes into form */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12 gap-6">

        {/* Logo — flex item, not absolute */}
        <Link href="/" className="relative block shrink-0 w-[280px] h-[90px] sm:w-[360px] sm:h-[110px]">
          <Image
            src="/vault-login-logo.svg"
            alt="JP Heritage"
            fill
            className="object-contain"
            priority
          />
        </Link>

        {/* Login Form */}
        {/* Fix #7: responsive width — full on mobile, fixed on larger screens */}
        <div className="w-full max-w-[360px] bg-white/90 backdrop-blur-md shadow-2xl rounded-sm p-6 border border-[color:var(--heritage-navy)]/20">
          {/* General Error Message */}
          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-sm mb-4">
              <p className="text-xs text-red-700 font-medium flex items-start gap-2">
                {/* Fix #5: use AlertTriangle instead of Shield for error state */}
                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>{errors.general}</span>
              </p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Account Number */}
            <div className="space-y-1">
              <label
                htmlFor="accountNumberInput"
                className="block text-sm font-medium text-gray-700">
                Username or account number
              </label>
              <div className="relative">
                <input
                  id="accountNumberInput"
                  type="text"
                  value={formData.accountNumber}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      accountNumber: e.target.value,
                    })
                  }
                  className="w-full h-10 px-3 rounded-none border-b border-gray-400 bg-transparent text-gray-900 placeholder:text-gray-400 text-base focus:outline-none focus:border-[#1E4B35] focus:border-b-2 transition-colors"
                />
              </div>
              {errors.accountNumber && (
                <p className="text-xs text-red-600 font-medium mt-1">
                  {errors.accountNumber}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label
                htmlFor="passwordInput"
                className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  id="passwordInput"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full h-10 px-3 pr-12 rounded-none border-b border-gray-400 bg-transparent text-gray-900 placeholder:text-gray-400 text-base focus:outline-none focus:border-[#1E4B35] focus:border-b-2 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#1E4B35] hover:text-[#143d2a] text-sm font-semibold transition-colors">
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-600 font-medium mt-1">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        rememberMe: e.target.checked,
                      })
                    }
                    className="peer h-5 w-5 cursor-pointer appearance-none rounded-sm border border-gray-400 checked:border-[#1E4B35] checked:bg-[#1E4B35] transition-all"
                  />
                  <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3.5 w-3.5"
                      viewBox="0 0 20 20"
                      fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                <span className="text-sm text-gray-600 group-hover:text-gray-900">
                  Remember me
                </span>
              </label>
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 bg-[color:var(--heritage-navy)] text-white text-base font-bold rounded-[3px] hover:bg-[color:var(--heritage-navy-mid)] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in...
                  </span>
                ) : "Sign in"}
              </button>

              <div className="flex flex-col gap-2 items-center">
                <Link
                  href="/contact"
                  className="text-sm text-[color:var(--heritage-navy)] hover:underline font-medium flex items-center justify-center gap-1">
                  Forgot username/password? <span className="text-xs">›</span>
                </Link>
                <Link
                  href="/apply"
                  className="text-sm text-[color:var(--heritage-navy)] hover:underline font-medium flex items-center justify-center gap-1">
                  Not enrolled? Sign up now.{" "}
                  <span className="text-xs">›</span>
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Footer */}
      <Footer isAbsolute />
    </main>
  );
}
