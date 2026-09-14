"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Shield,
} from "lucide-react";
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

    // Validation
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
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      // Use NextAuth signIn() — handles CSRF tokens automatically
      const result = await signIn("credentials", {
        email: formData.accountNumber,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setErrors({
          general:
            result.error === "Online access pending approval."
              ? "Your internet banking access is pending approval. Please contact support."
              : "Invalid credentials. Please check your account number/email and password.",
        });
        setIsLoading(false);
        return;
      }

      // Success — redirect to dashboard
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Login error:", error);
      setErrors({ general: "An unexpected error occurred. Please try again." });
      setIsLoading(false);
    }
  };

  return (
    <main className="h-screen w-full relative flex overflow-hidden">
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

      {/* Logo — anchored near top of page */}
      <div className="absolute top-[100px] left-1/2 -translate-x-1/2 z-20">
        <Link href="/" className="relative h-[130px] w-[403px] block">
          <Image
            src="/vault-login-logo.svg"
            alt="JP Heritage"
            fill
            className="object-contain"
            priority
          />
        </Link>
      </div>

      {/* Content Container */}
      <div className="relative z-10 h-full w-full flex items-center justify-center px-6">

        <div className="flex flex-col items-center">
          {/* Login Form */}
          <div className="relative z-30">
          {/* Explicitly sized container: 320px x auto - Sharper edges (rounded-sm) */}
          <div className="w-[320px] h-auto bg-white/90 backdrop-blur-md shadow-2xl rounded-sm p-6 border border-[color:var(--heritage-navy)]/20 flex flex-col justify-center">
            {/* General Error Message */}
            {errors.general && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-sm mb-4">
                <p className="text-xs text-red-600 font-medium flex items-center gap-2">
                  <Shield className="w-3 h-3" />
                  {errors.general}
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
                    className="w-full h-10 px-3 rounded-none border-b border-gray-400 bg-transparent text-gray-900 placeholder:text-gray-400 text-base focus:outline-none focus:border-[#1E4B35] focus:border-b-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                    className="w-full h-10 px-3 pr-12 rounded-none border-b border-gray-400 bg-transparent text-gray-900 placeholder:text-gray-400 text-base focus:outline-none focus:border-[#1E4B35] focus:border-b-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                      className="peer h-5 w-5 cursor-pointer appearance-none rounded-sm border border-gray-400 checked:border-[#1E4B35] checked:bg-[#1E4B35] transition-all disabled:opacity-50"
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
                  {isLoading ? "Signing in..." : "Sign in"}
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
        </div>
      </div>

      {/* Footer */}
      <Footer isAbsolute />
    </main>
  );
}
