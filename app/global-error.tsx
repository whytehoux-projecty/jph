"use client";

import "./globals.css";
import { fontVariables } from "./fonts";

/**
 * Last-resort error page, used only if the root layout itself fails.
 * It replaces the whole document, so it carries its own <html> and <body>.
 */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en" className={fontVariables}>
      <body className="bg-surface-muted text-fg">
        <main className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-4 py-12">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logos/heritage-trust-logo.svg" alt="Heritage Trust" width={190} height={28} className="h-7 w-auto self-start" />
          <h1 className="mt-10 font-display text-h1">Heritage Vault is temporarily unavailable</h1>
          <p className="mt-3 text-body text-fg-muted">
            This is usually resolved quickly. Your money is not affected. Please try again in a moment.
          </p>
          <div className="mt-8 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={reset}
              className="inline-flex h-11 items-center justify-center rounded-control bg-action px-5 text-small font-semibold text-fg-on-action hover:bg-action-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            >
              Try again
            </button>
            <a
              href="/"
              className="inline-flex h-11 items-center justify-center rounded-control border border-fg bg-surface px-5 text-small font-semibold text-fg hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            >
              Go to heritagetrust.com
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
