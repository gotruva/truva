import type { Metadata } from 'next';
import { Space_Grotesk, Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/ThemeProvider';
import { GoogleAnalytics } from '@next/third-parties/google';
import { Analytics } from '@vercel/analytics/react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { PublicChrome } from '@/components/PublicChrome';

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-sans' });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

import { BASE_URL } from '@/lib/constants';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Truva — Philippines' Financial Comparison Platform",
    template: '%s | Truva',
  },
  description:
    'The free comparison platform for Filipino savers. Compare savings, money market funds, credit cards, and more — all after-tax.',
  openGraph: {
    type: 'website',
    siteName: 'Truva',
    url: BASE_URL,
    title: "Truva — Philippines' Financial Comparison Platform",
    description:
      'The free comparison platform for Filipino savers. Compare savings, funds, credit cards, and more — all after-tax.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Truva - Best Savings Rates Philippines',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Truva — Philippines' Financial Comparison Platform",
    description:
      'Compare savings, funds, credit cards, and more after-tax. The free comparison platform for Filipino savers.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn('font-sans antialiased text-brand-textPrimary', spaceGrotesk.variable, inter.variable)}>
      <body className="flex flex-col min-h-screen bg-brand-surface dark:bg-slate-950 overflow-x-hidden transition-colors duration-300">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <PublicChrome><Navbar /></PublicChrome>
          <main className="flex-1 w-full text-brand-textPrimary dark:text-gray-100">
            {children}
          </main>
          <PublicChrome><Footer /></PublicChrome>
        </ThemeProvider>
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        )}
        <Analytics />
      </body>
    </html>
  );
}
