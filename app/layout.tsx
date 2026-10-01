import "./globals.css";
import type { Metadata, Viewport } from "next";
import PortalLayout from "./PortalLayout";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: {
    default: "Heritage Vault | JP Heritage Bank",
    template: "%s | Heritage Vault",
  },
  description:
    "Heritage Vault — secure digital banking by JP Heritage Bank. Manage accounts, transfer funds, pay bills, and more.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicons/favicon-48x48.png", sizes: "48x48", type: "image/png" },
    ],
    apple: [
      {
        url: "/favicons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Heritage Trust',
  },
};

export const viewport: Viewport = {
  // Heritage Trust brand colour on Ledger identity
  themeColor: '#FBF9F4',
  width: 'device-width',
  initialScale: 1,
  // maximumScale removed — blocking pinch-zoom is a WCAG failure (A6 fix)
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <PortalLayout>{children}</PortalLayout>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
