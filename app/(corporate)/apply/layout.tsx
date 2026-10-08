import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Open an account',
  openGraph: {
    images: ['/assets/apply/og-apply.jpg'],
  },
};

export default function ApplyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
