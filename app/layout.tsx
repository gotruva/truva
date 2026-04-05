import type { Metadata } from 'next';
import { Space_Grotesk, Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/ThemeProvider';
import { GoogleAnalytics } from '@/components/GoogleAnalytics';
import { Navbar } from '@/components/Navbar';

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-sans' });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'PH Savings Rate Comparison | Truva — Earn More After Tax',
  description: 'Compare savings rates from Maya, Tonik, GoTyme and more. See after-tax returns — the real rate, not the gross number. Updated weekly.',
  openGraph: {
    title: 'Truva - Earn More After Tax',
    description: 'Compare savings rates from Philippines digital banks.',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <html lang="en" suppressHydrationWarning className={cn('font-sans antialiased text-brand-textPrimary', spaceGrotesk.variable, inter.variable)}>
      <body className="flex flex-col min-h-screen bg-brand-surface dark:bg-slate-950 overflow-x-hidden transition-colors duration-300">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <Navbar />
          <main className="flex-1 w-full text-brand-textPrimary dark:text-gray-100">
            {children}
          </main>
          <footer className="bg-white dark:bg-slate-950 border-t border-brand-border dark:border-white/10 mt-auto pt-12 pb-8 px-4 md:px-8 text-center text-[13px] text-brand-textSecondary dark:text-gray-400 transition-colors duration-300">
            <div className="max-w-3xl mx-auto flex flex-col gap-3">
              <p>
                Rates verified as of {currentDate}. All figures shown after 20% Final Withholding Tax unless marked tax-exempt. This is not financial advice.
              </p>
              <p className="font-semibold text-brand-textPrimary dark:text-gray-200">
                We earn a referral fee if you open an account through our links. This does not affect the rates we show.
              </p>
              <p className="mt-6">
                &copy; {new Date().getFullYear()} Truva. All rights reserved.
              </p>
            </div>
          </footer>
        </ThemeProvider>
        <GoogleAnalytics />
      </body>
    </html>
  );
}
