'use client';

import { FilterCategory, LiquidityFilter, PayoutFilter } from '@/types';
import { Lock, Unlock, Layers, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
    { label: 'All', value: 'all', icon: <Layers className="h-3.5 w-3.5" /> },
    { label: 'Liquid Only', value: 'liquid', icon: <Unlock className="h-3.5 w-3.5" /> },
    { label: 'Time Locked', value: 'locked', icon: <Lock className="h-3.5 w-3.5" /> },
  ];

  const payoutTabs: { label: string; value: PayoutFilter }[] = [
    { label: 'Any', value: 'all' },
    { label: 'Monthly', value: 'monthly' },
    { label: 'At Maturity', value: 'at_maturity' },
  ];

  const mobileButtonClass = (isActive: boolean) =>
    `flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-center text-[13px] font-semibold transition-all duration-200 active:scale-[0.98] ${
      isActive
        ? 'border-brand-primary bg-brand-primary text-white shadow-md shadow-brand-primary/20'
        : 'border-brand-border bg-white text-brand-textSecondary hover:border-brand-primary/30 hover:bg-brand-surface dark:border-white/10 dark:bg-slate-900 dark:text-gray-300 dark:hover:border-blue-500/30 dark:hover:bg-slate-800'
    }`;

  const desktopPillClass = (isActive: boolean) =>
    `flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-semibold transition-all duration-200 ${
      isActive
        ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900 shadow-sm'
        : 'bg-transparent text-brand-textSecondary dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 border border-transparent hover:border-gray-200 dark:hover:border-white/10'
    }`;

  const liquidityHelp = (
    <TooltipProvider delay={0}>
      <Tooltip>
        <TooltipTrigger
          render={
            <button
              type="button"
              aria-label="Explain cash access filters"
              className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-brand-textSecondary transition-colors hover:text-brand-textPrimary dark:text-gray-400 dark:hover:text-gray-100"
            />
          }
        >
          <Info className="h-3.5 w-3.5" />
        </TooltipTrigger>
        <TooltipContent className="max-w-[280px] border border-gray-200 bg-white p-3 text-left leading-relaxed text-gray-900 shadow-lg dark:border-white/10 dark:bg-slate-800 dark:text-gray-100">
          <span>
            Liquid means you can withdraw anytime. Time Locked means your money stays deposited for a fixed term before you can access it freely.
          </span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div className="sticky top-[76px] z-10 mb-4 border-b border-brand-border bg-white/95 py-3 backdrop-blur-md shadow-[0_1px_4px_rgba(0,0,0,0.02)] transition-colors duration-300 dark:border-white/10 dark:bg-slate-950/95 md:mb-8 md:py-4">
      <div className="mx-auto max-w-5xl px-4 md:px-0">
        <div className="space-y-3 md:hidden">
          <div className="rounded-2xl border border-brand-border bg-[#F8FAFC] p-3 shadow-sm dark:border-white/10 dark:bg-slate-900/80">
            <div className="space-y-3">
              <div className="rounded-xl border border-brand-border/80 bg-white p-3 dark:border-white/10 dark:bg-slate-950">
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-textSecondary dark:text-gray-400">
                  Bank Type
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.value}
                      onClick={() => onChange(tab.value)}
                      className={mobileButtonClass(active === tab.value)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-brand-border/80 bg-white p-3 dark:border-white/10 dark:bg-slate-950">
                <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-textSecondary dark:text-gray-400">
                  <span>Cash Access</span>
                  {liquidityHelp}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {liquidityTabs.map((tab) => (
                    <button
                      key={tab.value}
                      onClick={() => onLiquidityChange(tab.value)}
                      className={mobileButtonClass(activeLiquidity === tab.value)}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>
                <p className="mt-2.5 text-[12px] leading-relaxed text-brand-textSecondary dark:text-gray-400">
                  <span className="font-semibold text-brand-textPrimary dark:text-gray-100">Liquid</span> lets you withdraw anytime.
                  {' '}
                  <span className="font-semibold text-brand-textPrimary dark:text-gray-100">Time Locked</span> means your money stays deposited until the term ends.
                </p>
              </div>

              <div className="rounded-xl border border-brand-border/80 bg-white p-3 dark:border-white/10 dark:bg-slate-950">
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-textSecondary dark:text-gray-400">
                  Interest Payout
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {payoutTabs.map((tab) => (
                    <button
                      key={tab.value}
                      onClick={() => onPayoutFilterChange(tab.value)}
                      className={mobileButtonClass(activePayoutFilter === tab.value)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden rounded-2xl border border-brand-border bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900 md:flex md:flex-col md:gap-4">
          <div className="flex flex-wrap justify-center gap-2 md:flex-nowrap md:justify-start">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => onChange(tab.value)}
                className={`rounded-full px-5 py-2 text-[14.5px] font-bold transition-all duration-300 active:scale-95 md:px-6 md:py-2.5 md:text-[15.5px] ${
                  active === tab.value
                    ? 'border border-brand-primary/20 bg-brand-primary text-white shadow-md shadow-brand-primary/20 dark:bg-blue-600'
                    : 'border border-gray-200 bg-white text-brand-textSecondary hover:border-gray-300 hover:bg-gray-50 hover:text-brand-textPrimary dark:border-white/10 dark:bg-slate-900 dark:text-gray-400 dark:hover:bg-slate-800 dark:hover:text-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 md:flex-nowrap md:justify-start">
            <div className="mr-1 hidden items-center gap-1 md:flex">
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-textSecondary dark:text-gray-500">
                Cash Access:
              </span>
              {liquidityHelp}
            </div>
            {liquidityTabs.map((tab) => (
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
          <p className="hidden text-sm leading-relaxed text-brand-textSecondary dark:text-gray-400 md:block">
            <span className="font-semibold text-brand-textPrimary dark:text-gray-100">Liquid</span> lets you withdraw anytime.
            {' '}
            <span className="font-semibold text-brand-textPrimary dark:text-gray-100">Time Locked</span> means your money stays deposited until the term ends.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 md:flex-nowrap md:justify-start">
            <span className="mr-1 hidden text-xs font-semibold uppercase tracking-wider text-brand-textSecondary dark:text-gray-500 md:block">
              Interest Payout:
            </span>
            {payoutTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => onPayoutFilterChange(tab.value)}
                className={desktopPillClass(activePayoutFilter === tab.value)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
