import type { Metadata } from "next";
import "./globals.css";
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SecurityNoticeBanner } from '@/components/commercial/SecurityNoticeBanner';

export const metadata: Metadata = {
  title: {
    default: "JP Heritage Bank — Trusted for Generations. Built for Tomorrow.",
    template: "%s | JP Heritage Bank",
  },
  description: "JP Heritage Bank has served families, businesses, and institutions since 1888. Experience world-class banking with Heritage Vault — our secure digital banking platform.",
  keywords: ["JP Heritage Bank", "Heritage Vault", "digital banking", "personal banking", "business banking", "wealth management", "FDIC insured"],
  icons: {
    icon: '/images/logos/jp-heritage-icon.png',
  },
  openGraph: {
    siteName: "JP Heritage Bank",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-full scroll-smooth font-inter antialiased flex flex-col min-h-screen bg-off-white text-charcoal">
      <SecurityNoticeBanner />
      <Header />
      <div className="flex-grow">
        {children}
      </div>
      <Footer />
    </div>
  );
}
