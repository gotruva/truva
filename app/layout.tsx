import type { Metadata } from 'next';
import { Space_Grotesk, Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/ThemeProvider';
import { GoogleAnalytics } from '@/components/GoogleAnalytics';
import { Analytics } from '@vercel/analytics/react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-sans' });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.gotruva.com';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Best Savings & Time Deposit Rates Philippines | Truva',
    template: '%s | Truva',
  },
  description: 'Compare savings and time deposit rates from Philippine banks. See after-tax returns, important account conditions, and the latest verified rates in one place.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    siteName: 'Truva',
    url: BASE_URL,
    title: 'Truva | Compare Savings Rates in the Philippines',
    description: 'Compare savings and time deposit rates from Philippine banks with after-tax returns and clear account conditions.',
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
    title: 'Truva | Compare Savings Rates in the Philippines',
    description: 'See after-tax savings yields from every major Philippine digital bank, T-Bill, and UITF - all in one place.',
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
          <Navbar />
        </ThemeProvider>
        <main className="flex-1 w-full text-brand-textPrimary dark:text-gray-100">
          {children}
        </main>
        <Footer />
        <GoogleAnalytics />
        <Analytics />
      </body>
    </html>
  );
}
