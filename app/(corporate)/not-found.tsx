import Link from 'next/link';
import type { Metadata } from 'next';
import { BRAND } from '@/src/content/facts';
import { ROUTES } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Page Not Found | Heritage Trust Bank',
  robots: { index: false },
};

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="min-h-[60vh] flex flex-col items-center justify-center px-6 py-24 text-center"
    >
      <p className="label-mono text-vermilion-600 mb-4">404</p>

      <h1 className="font-display text-h1 text-ink-900 mb-3">
        Page not found
      </h1>

      <p className="text-body-lg text-ink-500 mb-10 max-w-[42ch]">
        The page you requested could not be found. It may have moved,
        or the link may be incorrect.
      </p>

      <nav aria-label="Recovery links" className="flex flex-col sm:flex-row gap-4">
        <Link
          href={ROUTES.home}
          className="
            inline-flex items-center justify-center px-6 py-3
            bg-vermilion-600 text-paper-50 font-sans font-medium text-small
            rounded hover:bg-vermilion-700 transition-colors
            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-900
          "
        >
          Back to home
        </Link>

        <Link
          href={ROUTES.contact}
          className="
            inline-flex items-center justify-center px-6 py-3
            border border-ink-900 text-ink-900 font-sans font-medium text-small
            rounded hover:bg-paper-100 transition-colors
            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-900
          "
        >
          Contact us
        </Link>

        <Link
          href={ROUTES.help}
          className="
            inline-flex items-center justify-center px-6 py-3
            text-ink-700 font-sans font-medium text-small underline
            hover:text-ink-900 transition-colors
            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-900
          "
        >
          Help centre
        </Link>
      </nav>
    </main>
  );
}
