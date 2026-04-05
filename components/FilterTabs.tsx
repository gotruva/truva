'use client';

import { FilterCategory, LiquidityFilter, PayoutFilter } from '@/types';
import { Lock, Unlock, Layers } from 'lucide-react';

interface FilterTabsProps {
  active: FilterCategory;
  onChange: (category: FilterCategory) => void;
  activeLiquidity: LiquidityFilter;
  onLiquidityChange: (liquidity: LiquidityFilter) => void;
  activePayoutFilter: PayoutFilter;
  onPayoutFilterChange: (payout: PayoutFilter) => void;
}

export function FilterTabs({ active, onChange, activeLiquidity, onLiquidityChange, activePayoutFilter, onPayoutFilterChange }: FilterTabsProps) {
  const tabs: { label: string; value: FilterCategory }[] = [
    { label: 'All Banks', value: 'banks' },
  ];

  const liquidityTabs: { label: string; value: LiquidityFilter; icon: React.ReactNode }[] = [
    { label: 'All', value: 'all', icon: <Layers className="w-3.5 h-3.5 mr-1" /> },
    { label: 'Liquid Only', value: 'liquid', icon: <Unlock className="w-3.5 h-3.5 mr-1" /> },
    { label: 'Time Locked', value: 'locked', icon: <Lock className="w-3.5 h-3.5 mr-1" /> },
  ];

  const payoutTabs: { label: string; value: PayoutFilter }[] = [
    { label: 'Any', value: 'all' },
    { label: 'Monthly', value: 'monthly' },
    { label: 'At Maturity', value: 'at_maturity' },
  ];

  return (
    <div className="sticky top-[76px] z-10 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-brand-border dark:border-white/10 py-3 mb-6 md:py-4 md:mb-8 shadow-[0_1px_4px_rgba(0,0,0,0.02)] transition-colors duration-300">
      <div className="flex flex-col gap-3 px-4 md:px-0 max-w-5xl mx-auto">
        <div className="flex flex-wrap md:flex-nowrap justify-center md:justify-start gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => onChange(tab.value)}
              className={`px-5 py-2 md:px-6 md:py-2.5 rounded-full text-[14.5px] md:text-[15.5px] font-bold transition-all duration-300 active:scale-95 ${
                active === tab.value
                  ? 'bg-brand-primary dark:bg-blue-600 text-white shadow-lg shadow-brand-primary/25 border-transparent ring-1 ring-brand-primary ring-offset-2 dark:ring-offset-slate-950 scale-[1.03]'
                  : 'bg-white dark:bg-slate-900 text-brand-textSecondary dark:text-gray-400 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-brand-textPrimary hover:border-gray-300 dark:hover:text-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap md:flex-nowrap justify-center md:justify-start gap-2 items-center">
          <span className="text-xs font-semibold text-brand-textSecondary dark:text-gray-500 uppercase tracking-wider mr-1 hidden md:block">Cash Access:</span>
          {liquidityTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => onLiquidityChange(tab.value)}
              className={`flex items-center px-3.5 py-1.5 rounded-full text-[13px] font-semibold transition-all duration-200 ${
                activeLiquidity === tab.value
                  ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                  : 'bg-transparent text-brand-textSecondary dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 border border-transparent hover:border-gray-200 dark:hover:border-white/10'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap md:flex-nowrap justify-center md:justify-start gap-2 items-center">
          <span className="text-xs font-semibold text-brand-textSecondary dark:text-gray-500 uppercase tracking-wider mr-1 hidden md:block">Interest Payout:</span>
          {payoutTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => onPayoutFilterChange(tab.value)}
              className={`flex items-center px-3.5 py-1.5 rounded-full text-[13px] font-semibold transition-all duration-200 ${
                activePayoutFilter === tab.value
                  ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                  : 'bg-transparent text-brand-textSecondary dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 border border-transparent hover:border-gray-200 dark:hover:border-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
