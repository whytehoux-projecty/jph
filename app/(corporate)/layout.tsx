import type { Metadata, Viewport } from 'next';
import { Familjen_Grotesk, Public_Sans, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CookieModal } from '@/components/commercial/CookieModal';

/**
 * Ledger fonts — loaded via next/font/google (auto-self-hosted at build time,
 * zero runtime request to Google). These CSS variables are applied to the
 * marketing layout wrapper below.
 */
const familjenGrotesk = Familjen_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['500', '600', '700'],
  display: 'swap',
});

const publicSans = Public_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500', '600'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Heritage Trust Bank — Trusted Since 1888',
    template: '%s | Heritage Trust Bank',
  },
  description:
    'Heritage Trust Bank has served families, businesses, and institutions since 1888. ' +
    'Member FDIC. Personal banking, business banking, wealth management, and Heritage Vault digital banking.',
  keywords: ['Heritage Trust Bank', 'Heritage Vault', 'personal banking', 'business banking', 'wealth management', 'FDIC insured', 'New York bank'],
  metadataBase: new URL('https://heritagetrust.com'),
  robots: { index: false, follow: false }, // private while site is in review
  openGraph: {
    siteName: 'Heritage Trust Bank',
    type: 'website',
    images: [{ url: '/images/og-default.png', width: 1200, height: 630, alt: 'Heritage Trust Bank' }],
  },
  twitter: {
    card: 'summary_large_image',
  },
  icons: {
    icon: '/favicons/favicon-32x32.png',
    apple: '/favicons/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#FBF9F4', // Ledger paper-50
  width: 'device-width',
  initialScale: 1,
};

export default function CorporateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className={`
        ${familjenGrotesk.variable}
        ${publicSans.variable}
        ${ibmPlexMono.variable}
        h-full scroll-smooth antialiased flex flex-col min-h-screen
        bg-paper-50 text-ink-900 font-sans
      `}
    >
      {/* Skip link — must be the first focusable element */}
      <a
        href="#main-content"
        className="
          sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-100
          focus:px-4 focus:py-2 focus:bg-paper-50 focus:text-ink-900
          focus:border focus:border-ink-900 focus:text-sm focus:font-medium
        "
      >
        Skip to main content
      </a>
      <Header />

      <main id="main-content" className="grow">
        {children}
      </main>

      <Footer />
      <CookieModal />
    </div>
  );
}
