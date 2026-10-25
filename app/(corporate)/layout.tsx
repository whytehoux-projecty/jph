import type { Metadata, Viewport } from 'next';
import { sourceSerif, sourceSans, sourceCode } from '@/app/fonts';
import './globals.css';
import './isobath.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ConsentBanner } from '@/components/commercial/ConsentBanner';
import { auth } from '@/auth';

// Faces are shared with the portal — see app/fonts.ts.

export const metadata: Metadata = {
  title: {
    default: 'Heritage Trust — banking since 1988',
    template: '%s | Heritage Trust',
  },
  description:
    'Heritage Trust has served families, businesses and institutions since 1988. ' +
    'Member FDIC. Personal banking, business banking, wealth management and Heritage Vault digital banking.',
  keywords: ['Heritage Trust', 'Heritage Vault', 'personal banking', 'business banking', 'wealth management', 'FDIC insured'],
  metadataBase: new URL('https://heritagetrust.com'),
  // Deliberate: the prototype stays out of search while it is under review
  // (UI/UX review, accessibility and UX patterns — "Indexing").
  robots: { index: false, follow: false },
  openGraph: {
    siteName: 'Heritage Trust',
    type: 'website',
    images: [{ url: '/images/og-default.png', width: 1200, height: 630, alt: 'Heritage Trust' }],
  },
  twitter: {
    card: 'summary_large_image',
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/favicons/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#FFFFFF', // Isobath white
  width: 'device-width',
  initialScale: 1,
};

export default async function CorporateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const isLoggedIn = !!session?.user;
  return (
    <div
      className={`
        ${sourceSerif.variable}
        ${sourceSans.variable}
        ${sourceCode.variable}
        ht-site h-full scroll-smooth antialiased flex flex-col min-h-screen
        bg-paper-50 text-ink-900 font-sans
      `}
    >
      {/* Skip link — must be the first focusable element */}
      <a
        href="#main-content"
        className="
          sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-100
          focus:px-4 focus:py-3 focus:bg-paper-50 focus:text-ink-900
          focus:border focus:border-petrol focus:text-small focus:font-semibold
        "
      >
        Skip to main content
      </a>
      <Header isLoggedIn={isLoggedIn} />

      <main id="main-content" className="grow">
        {children}
      </main>

      <Footer />
      <ConsentBanner />
    </div>
  );
}
