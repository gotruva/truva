import type { Metadata } from 'next';
import { Space_Grotesk, Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/ThemeProvider';
import { GoogleAnalytics } from '@/components/GoogleAnalytics';
import { Analytics } from '@vercel/analytics/react';
import { Navbar } from '@/components/Navbar';
import { PartnerCTA } from '@/components/PartnerCTA';

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-sans' });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

const BASE_URL = 'https://www.gotruva.com';

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
  const verificationCopy = 'Rates are checked and verified regularly. Returns shown after 20% Final Withholding Tax unless marked tax-exempt. This is not financial advice.';

  return (
    <html lang="en" suppressHydrationWarning className={cn('font-sans antialiased text-brand-textPrimary', spaceGrotesk.variable, inter.variable)}>
      <body className="flex flex-col min-h-screen bg-brand-surface dark:bg-slate-950 overflow-x-hidden transition-colors duration-300">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <Navbar />
        </ThemeProvider>
        <main className="flex-1 w-full text-brand-textPrimary dark:text-gray-100">
          {children}
        </main>
          <footer className="bg-white dark:bg-slate-950 border-t border-brand-border dark:border-white/10 mt-auto pt-12 pb-8 px-4 md:px-8 text-center text-[13px] text-brand-textSecondary dark:text-gray-400 transition-colors duration-300">
            <div className="max-w-3xl mx-auto flex flex-col gap-3">
              <p>{verificationCopy}</p>
              <p className="font-semibold text-brand-textPrimary dark:text-gray-200">
                Links go directly to each institution&apos;s website. Truva does not currently earn referral fees — all rate comparisons are unbiased. We may earn commissions in the future, which will always be disclosed.
              </p>

              <PartnerCTA />

              <p className="mt-4">
                &copy; {new Date().getFullYear()} Truva. All rights reserved.
              </p>
            </div>
          </footer>
        <GoogleAnalytics />
        <Analytics />
      </body>
    </html>
  );
}
