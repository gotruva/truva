'use client';

import { FilterCategory } from '@/types';

interface FilterTabsProps {
  active: FilterCategory;
  onChange: (category: FilterCategory) => void;
}

export function FilterTabs({ active, onChange }: FilterTabsProps) {
  const tabs: { label: string; value: FilterCategory }[] = [
    { label: 'All', value: 'all' },
    { label: 'Banks', value: 'banks' },
    { label: 'Govt. Bonds', value: 'govt' },
    { label: 'UITFs', value: 'uitfs' },
    { label: 'DeFi Options', value: 'defi' },
  ];

  return (
    <div className="sticky top-[76px] z-10 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-brand-border dark:border-white/10 py-3 mb-6 md:py-4 md:mb-8 shadow-[0_1px_4px_rgba(0,0,0,0.02)] transition-colors duration-300">
      <div className="flex flex-wrap md:flex-nowrap justify-center md:justify-start gap-2 px-4 md:px-0 max-w-5xl mx-auto">
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
    </div>
  );
}
