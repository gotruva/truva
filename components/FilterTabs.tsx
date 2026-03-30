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
    <div className="sticky top-16 z-10 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-brand-border dark:border-white/10 py-4 mb-8 shadow-[0_1px_4px_rgba(0,0,0,0.02)] transition-colors duration-300">
      <div className="flex overflow-x-auto hide-scrollbar gap-2 px-4 md:px-0 max-w-5xl mx-auto">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => onChange(tab.value)}
            className={`px-5 py-2.5 rounded-full text-[15px] font-semibold whitespace-nowrap transition-all duration-200 ${
              active === tab.value 
                ? 'bg-brand-primary dark:bg-blue-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-brand-textSecondary dark:text-gray-400 border border-brand-border dark:border-white/10 hover:bg-brand-surface dark:hover:bg-slate-800 hover:text-brand-textPrimary dark:hover:text-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
