import { getLiveRates } from '@/lib/rates';
import { YieldCalculator } from '@/components/YieldCalculator';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Personal Earnings Calculator | Truva',
  description: 'Estimate how much your savings could earn after tax and compare the highest earning bank options for your deposit.',
};

export default async function CalculatorPage() {
  const rates = await getLiveRates();

  return (
    <div className="bg-[#F8F9FB] dark:bg-slate-950 min-h-screen pt-12 md:pt-20 pb-24 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-10 md:mb-16">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-brand-textPrimary dark:text-gray-100 mb-5 bg-clip-text text-transparent bg-gradient-to-r from-brand-textPrimary to-gray-500 dark:from-white dark:to-gray-400">
                Personal <span className="text-brand-primary dark:text-blue-400">Earnings Calculator</span>
            </h1>
            <p className="text-[17px] md:text-[19px] text-brand-textSecondary dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                Stop guessing your returns. Input your principal and duration to see exactly how much cash you'll net after taxes across the top Philippine digital banks.
            </p>
        </div>
        
        <YieldCalculator rates={rates} />
      </div>
    </div>
  );
}
