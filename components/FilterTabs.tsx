'use client';

import { useEffect, useState } from 'react';
import { LiquidityFilter } from '@/types';
import { Lock, Unlock, Layers, ChevronDown, SlidersHorizontal } from 'lucide-react';

interface FilterTabsProps {
  activeLiquidity: LiquidityFilter;
  onLiquidityChange: (liquidity: LiquidityFilter) => void;
}

export function FilterTabs({ activeLiquidity, onLiquidityChange }: FilterTabsProps) {
  const [isMobileCondensed, setIsMobileCondensed] = useState(false);
  const [isMobileExpanded, setIsMobileExpanded] = useState(true);

  const tabs: { label: string; value: LiquidityFilter; icon: React.ReactNode; sub: string }[] = [
    { label: 'All Products', value: 'all', icon: <Layers className="h-3.5 w-3.5" />, sub: 'Savings + time deposits' },
    { label: 'Savings', value: 'liquid', icon: <Unlock className="h-3.5 w-3.5" />, sub: 'Withdraw anytime' },
    { label: 'Time Deposits', value: 'locked', icon: <Lock className="h-3.5 w-3.5" />, sub: 'Fixed-term, higher rates' },
  ];

  const mobileButtonClass = (isActive: boolean) =>
    `flex min-h-[44px] w-full flex-col items-center justify-center gap-0.5 rounded-xl border px-2 py-2.5 text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm active:scale-[0.98] ${
      isActive
        ? 'border-brand-primary bg-brand-primary text-white shadow-md shadow-brand-primary/20'
        : 'border-brand-border bg-white text-brand-textSecondary hover:border-brand-primary/30 hover:bg-brand-surface dark:border-white/10 dark:bg-slate-900 dark:text-gray-300 dark:hover:border-blue-500/30 dark:hover:bg-slate-800'
    }`;

  const desktopPillClass = (isActive: boolean) =>
    `flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-semibold transition-all duration-200 hover:-translate-y-0.5 ${
      isActive
        ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900 shadow-sm'
        : 'bg-transparent text-brand-textSecondary dark:text-gray-400 hover:bg-gray-100 hover:shadow-sm dark:hover:bg-white/5 border border-transparent hover:border-gray-200 dark:hover:border-white/10'
    }`;

  const activeLabel = tabs.find((t) => t.value === activeLiquidity)?.label ?? 'All Products';

  useEffect(() => {
    const handleScroll = () => {
      const nextCondensed = window.scrollY > 260;
      setIsMobileCondensed((prev) => {
        if (prev !== nextCondensed) setIsMobileExpanded(!nextCondensed);
        return nextCondensed;
      });
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`sticky top-[76px] z-10 mb-4 border-b border-brand-border bg-[#F8F9FB]/95 backdrop-blur-md shadow-[0_1px_4px_rgba(0,0,0,0.02)] transition-all duration-300 dark:border-white/10 dark:bg-slate-950/95 md:mb-8 md:py-4 ${
      isMobileCondensed ? 'py-2' : 'py-3'
    }`}>
      <div className="mx-auto max-w-5xl px-4 md:px-0">

        {/* Mobile */}
        <div className="space-y-3 md:hidden">
          <div className={`rounded-2xl border border-brand-border bg-white shadow-sm transition-all duration-300 dark:border-white/10 dark:bg-slate-900 ${
            isMobileCondensed ? 'p-2' : 'p-2.5'
          }`}>
            {isMobileCondensed && (
              <button
                type="button"
                onClick={() => setIsMobileExpanded((prev) => !prev)}
                className="flex w-full items-center gap-2 rounded-xl border border-brand-border/80 bg-white px-3 py-2.5 text-left transition-all dark:border-white/10 dark:bg-slate-950"
                aria-expanded={isMobileExpanded}
                aria-label="Toggle filter controls"
              >
                <div className="flex shrink-0 items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-textSecondary dark:text-gray-400">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  <span>Show</span>
                </div>
                <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden">
                  <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-brand-textSecondary dark:bg-white/10 dark:text-gray-300">
                    {activeLabel}
                  </span>
                </div>
                <ChevronDown
                  className={`ml-auto h-4 w-4 shrink-0 text-brand-textSecondary transition-transform duration-200 dark:text-gray-400 ${
                    isMobileExpanded ? 'rotate-180' : ''
                  }`}
                />
              </button>
            )}

            {isMobileExpanded && (
              <div className={`grid grid-cols-3 gap-2 ${isMobileCondensed ? 'mt-2' : ''}`}>
                {tabs.map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => onLiquidityChange(tab.value)}
                    className={mobileButtonClass(activeLiquidity === tab.value)}
                  >
                    <span className="flex items-center gap-1">{tab.icon} <span className="text-[13px] font-semibold">{tab.label}</span></span>
                    <span className={`text-[10px] font-medium leading-tight ${activeLiquidity === tab.value ? 'text-white/80' : 'text-brand-textSecondary/70 dark:text-gray-500'}`}>{tab.sub}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Desktop */}
        <div className="hidden rounded-2xl border border-brand-border bg-white px-4 py-3 shadow-sm dark:border-white/10 dark:bg-slate-900 md:flex md:items-center md:gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-textSecondary dark:text-gray-500 mr-1">
            Show
          </span>
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => onLiquidityChange(tab.value)}
              className={desktopPillClass(activeLiquidity === tab.value)}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
