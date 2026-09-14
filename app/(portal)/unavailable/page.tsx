"use client";

import Image from "next/image";
import Link from "next/link";
import { WifiOff, RefreshCw, Home, Phone, Mail } from "lucide-react";
import { useState, useEffect } from "react";

export default function ServiceUnavailablePage() {
  const [retryCount, setRetryCount] = useState(0);
  const [isChecking, setIsChecking] = useState(false);

  const checkServiceStatus = async () => {
    setIsChecking(true);
    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_API_URL
          ? `${process.env.NEXT_PUBLIC_API_URL}/health`
          : "http://localhost:3001/health",
      );
      if (response.ok) {
        // Service is back online, redirect to login
        window.location.href = "/";
      }
    } catch {
      console.log("Service still unavailable");
    } finally {
      setIsChecking(false);
      setRetryCount((prev) => prev + 1);
    }
  };

  useEffect(() => {
    // Auto-check every 30 seconds
    const interval = setInterval(checkServiceStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-off-white">
      {/* Header */}
      <header className="bg-white border-b border-faded-gray-light sticky top-0 z-50 backdrop-blur-sm bg-white/95">
        <nav
          className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8"
          aria-label="Global">
          <div className="flex lg:flex-1">
            <Link
              href={
                process.env.NEXT_PUBLIC_CORPORATE_URL || "http://localhost:3000"
              }
              className="-m-1.5 p-1.5 flex items-center gap-3">
              <Image
                src="/portal-logo.svg"
                alt="JP Heritage"
                width={180}
                height={60}
                className="h-12 w-auto"
                priority
              />
            </Link>
          </div>
          <div className="flex gap-4">
            <Link
              href={
                process.env.NEXT_PUBLIC_CORPORATE_URL || "http://localhost:3000"
              }
              className="inline-flex items-center justify-center h-10 px-6 text-sm font-semibold rounded-lg bg-transparent text-vintage-green border-2 border-vintage-green hover:bg-vintage-green hover:text-white transition-all">
              <Home className="w-4 h-4 mr-2" />
              Back to Website
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          {/* Service Unavailable Card */}
          <div className="bg-white rounded-xl shadow-2xl border border-faded-gray-light p-8 md:p-12 text-center">
            {/* Icon */}
            <div className="mb-8 flex justify-center">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center">
                  <WifiOff className="w-12 h-12 text-red-600" />
                </div>
                <div className="absolute inset-0 w-24 h-24 rounded-full bg-red-100 animate-ping opacity-20" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-playfair font-bold text-charcoal mb-4">
              Service Temporarily Unavailable
            </h1>

            {/* Description */}
            <p className="text-lg text-charcoal-light mb-8 max-w-xl mx-auto">
              We're sorry, but the E-Banking Portal is currently unavailable.
              Our team is working to restore service as quickly as possible.
            </p>

            {/* Status Info */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
              <div className="flex items-start gap-3">
                <WifiOff className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="text-left flex-1">
                  <h3 className="font-semibold text-red-900 mb-2">
                    Portal Status: Offline
                  </h3>
                  <p className="text-sm text-red-700">
                    The E-Banking Portal is currently undergoing maintenance or
                    experiencing technical difficulties. Please check back
                    shortly or contact our support team for assistance.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <button
                onClick={checkServiceStatus}
                disabled={isChecking}
                className="inline-flex items-center justify-center h-12 px-6 text-base font-semibold rounded-lg bg-vintage-green text-white hover:bg-vintage-green-dark transition-all shadow-vintage hover:shadow-vintage-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                <RefreshCw
                  className={`w-5 h-5 mr-2 ${isChecking ? "animate-spin" : ""}`}
                />
                {isChecking ? "Checking..." : "Check Status"}
              </button>
              <Link
                href={
                  process.env.NEXT_PUBLIC_CORPORATE_URL ||
                  "http://localhost:3000"
                }
                className="inline-flex items-center justify-center h-12 px-6 text-base font-semibold rounded-lg bg-transparent text-vintage-green border-2 border-vintage-green hover:bg-vintage-green hover:text-white transition-all">
                <Home className="w-5 h-5 mr-2" />
                Return to Homepage
              </Link>
            </div>

            {/* Retry Count */}
            {retryCount > 0 && (
              <p className="text-xs text-gray-500 mb-6">
                Status checked {retryCount}{" "}
                {retryCount === 1 ? "time" : "times"}
              </p>
            )}

            {/* Alternative Options */}
            <div className="border-t border-faded-gray-light pt-8">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
                Need Immediate Assistance?
              </h3>
              <div className="grid md:grid-cols-2 gap-4 text-left">
                <div className="flex items-start gap-3 p-4 bg-off-white rounded-lg">
                  <Phone className="w-5 h-5 text-vintage-green mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-charcoal mb-1">
                      Call Us
                    </h4>
                    <p className="text-sm text-charcoal-light">
                      1-800-JP-HERIT
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Available 24/7</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-off-white rounded-lg">
                  <Mail className="w-5 h-5 text-vintage-green mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-charcoal mb-1">
                      Email Support
                    </h4>
                    <p className="text-sm text-charcoal-light">
                      support@jpheritage.com
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Response within 24 hours
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-6 text-center bg-white/60 backdrop-blur-lg rounded-xl p-6 border border-faded-gray-light">
            <p className="text-sm text-charcoal-light">
              <strong className="text-charcoal">Service Updates:</strong> For
              real-time status updates and announcements, please visit our{" "}
              <a
                href={`${process.env.NEXT_PUBLIC_CORPORATE_URL || "http://localhost:3000"}/about`}
                className="text-vintage-green hover:text-vintage-green-dark font-semibold transition-colors">
                main website
              </a>{" "}
              or follow us on social media.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-charcoal text-warm-cream py-12 border-t border-charcoal-light">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Company Info */}
            <div className="md:col-span-2">
              <Image
                src="/portal-logo.svg"
                alt="JP Heritage"
                width={180}
                height={60}
                className="h-12 w-auto mb-4"
              />
              <p className="text-sm text-warm-cream/80 mb-4">
                Private Banking, Redefined since 1888
              </p>
              <p className="text-xs text-warm-cream/60">
                © {new Date().getFullYear()} JP Heritage. All rights reserved.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href={`${process.env.NEXT_PUBLIC_CORPORATE_URL || "http://localhost:3000"}/about`}
                    className="text-warm-cream/80 hover:text-soft-gold transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href={`${process.env.NEXT_PUBLIC_CORPORATE_URL || "http://localhost:3000"}/contact`}
                    className="text-warm-cream/80 hover:text-soft-gold transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-warm-cream/80">
                <li>1-800-JP-HERIT</li>
                <li>support@jpheritage.com</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-warm-cream/20 pt-8 text-center">
            <p className="text-xs text-warm-cream/60">
              FDIC Insured • Equal Housing Lender • Member FDIC
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
