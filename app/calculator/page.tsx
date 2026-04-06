import { getPublicRates } from '@/lib/rates';
import { YieldCalculator } from '@/components/YieldCalculator';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Savings Interest Calculator Philippines',
  description: 'Estimate how much your savings could earn after tax. Compare Philippine digital bank, T-Bill, and UITF rates with our free after-tax savings calculator.',
  alternates: {
    canonical: '/calculator',
  },
  openGraph: {
    title: 'Savings Interest Calculator Philippines | Truva',
    description: 'Estimate how much your savings could earn after tax. Compare Philippine digital bank, T-Bill, and UITF rates in one place.',
    url: '/calculator',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Savings Interest Calculator Philippines | Truva',
    description: 'Free after-tax savings calculator for Philippine banks, T-Bills, and UITFs.',
  },
};

export default async function CalculatorPage() {
  const rates = await getPublicRates();

  return (
    <div className="bg-[#F8F9FB] dark:bg-slate-950 min-h-screen pt-12 md:pt-20 pb-24 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-10 md:mb-16">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-brand-textPrimary dark:text-gray-100 mb-5 bg-clip-text text-transparent bg-gradient-to-r from-brand-textPrimary to-gray-500 dark:from-white dark:to-gray-400">
                Savings Interest <span className="text-brand-primary dark:text-blue-400">Calculator</span>
            </h1>
            <p className="text-[17px] md:text-[19px] text-brand-textSecondary dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                Enter your amount and timeline to compare what you could earn after tax across Philippine bank savings and time deposit options.
            </p>
        </div>
        
        <YieldCalculator rates={rates} />
      </div>
    </div>
  );
}
