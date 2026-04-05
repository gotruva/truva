'use client';

import { useEffect, useRef, useState } from 'react';
import { FilterCategory, LiquidityFilter, PayoutFilter } from '@/types';
import { Lock, Unlock, Layers, Info, ChevronDown, SlidersHorizontal } from 'lucide-react';

interface FilterTabsProps {
  active: FilterCategory;
  onChange: (category: FilterCategory) => void;
  activeLiquidity: LiquidityFilter;
  onLiquidityChange: (liquidity: LiquidityFilter) => void;
  activePayoutFilter: PayoutFilter;
  onPayoutFilterChange: (payout: PayoutFilter) => void;
}

export function FilterTabs({ active, onChange, activeLiquidity, onLiquidityChange, activePayoutFilter, onPayoutFilterChange }: FilterTabsProps) {
  const [isMobileCondensed, setIsMobileCondensed] = useState(false);
  const [isMobileExpanded, setIsMobileExpanded] = useState(true);
  const [infoOpen, setInfoOpen] = useState(false);
  const infoRef = useRef<HTMLDivElement>(null);

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
    `flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-center text-[13px] font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm active:scale-[0.98] ${
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

  const liquidityHelp = (
    <div ref={infoRef} className="relative inline-block">
      <button
        type="button"
        aria-label="Explain cash access filters"
        onClick={() => setInfoOpen((o) => !o)}
        className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-brand-textSecondary transition-colors hover:text-brand-textPrimary dark:text-gray-400 dark:hover:text-gray-100"
      >
        <Info className="h-3.5 w-3.5" />
      </button>
      {infoOpen && (
        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50 w-max max-w-[280px] rounded-md border border-gray-200 bg-white p-3 text-left leading-relaxed text-gray-900 shadow-lg dark:border-white/10 dark:bg-slate-800 dark:text-gray-100">
          <span>
            Liquid means you can withdraw anytime. Time Locked means your money stays deposited for a fixed term before you can access it freely.
          </span>
        </div>
      )}
    </div>
  );

  const activeCategoryLabel = tabs.find((tab) => tab.value === active)?.label ?? 'All Banks';
  const activeLiquidityLabel = liquidityTabs.find((tab) => tab.value === activeLiquidity)?.label ?? 'All';
  const activePayoutLabel = payoutTabs.find((tab) => tab.value === activePayoutFilter)?.label ?? 'Any';

  useEffect(() => {
    if (!infoOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (infoRef.current && !infoRef.current.contains(e.target as Node)) {
        setInfoOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [infoOpen]);

  useEffect(() => {
    const handleScroll = () => {
      const nextCondensed = window.scrollY > 260;

      setIsMobileCondensed((prev) => {
        if (prev !== nextCondensed) {
          setIsMobileExpanded(!nextCondensed);
        }
        return nextCondensed;
      });
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className={`sticky top-[76px] z-10 mb-4 border-b border-brand-border bg-[#F8F9FB]/95 backdrop-blur-md shadow-[0_1px_4px_rgba(0,0,0,0.02)] transition-all duration-300 dark:border-white/10 dark:bg-slate-950/95 md:mb-8 md:py-4 ${
      isMobileCondensed ? 'py-2' : 'py-3'
    }`}>
      <div className="mx-auto max-w-5xl px-4 md:px-0">
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
                  <span>Filters</span>
                </div>
                <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden">
                  <span className="shrink-0 rounded-full bg-brand-primary/10 px-2 py-0.5 text-[11px] font-semibold text-brand-primary dark:bg-brand-primary/20 dark:text-blue-300">
                    {activeCategoryLabel}
                  </span>
                  <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-brand-textSecondary dark:bg-white/10 dark:text-gray-300">
                    {activeLiquidityLabel}
                  </span>
                  <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-brand-textSecondary dark:bg-white/10 dark:text-gray-300">
                    {activePayoutLabel}
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
              <div className={`space-y-3 ${isMobileCondensed ? 'mt-2' : ''}`}>
                <div>
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

                <div className="border-t border-brand-border/50 pt-3 dark:border-white/8">
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
                </div>

                <div className="border-t border-brand-border/50 pt-3 dark:border-white/8">
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
            )}
          </div>
        </div>

        <div className="hidden rounded-2xl border border-brand-border bg-white px-4 py-3 shadow-sm dark:border-white/10 dark:bg-slate-900 md:flex md:items-center md:gap-3">
          {/* Bank type */}
          <div className="flex items-center gap-1.5">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => onChange(tab.value)}
                className={`rounded-full px-4 py-1.5 text-[13.5px] font-bold transition-all duration-200 active:scale-95 ${
                  active === tab.value
                    ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20 dark:bg-blue-600'
                    : 'border border-gray-200 bg-white text-brand-textSecondary hover:border-gray-300 hover:bg-gray-50 hover:text-brand-textPrimary dark:border-white/10 dark:bg-slate-900 dark:text-gray-400 dark:hover:bg-slate-800 dark:hover:text-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="h-5 w-px shrink-0 bg-brand-border dark:bg-white/10" />

          {/* Cash access */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-textSecondary dark:text-gray-500">
                Cash Access
              </span>
              {liquidityHelp}
            </div>
            <div className="flex items-center gap-1">
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
          </div>

          <div className="h-5 w-px shrink-0 bg-brand-border dark:bg-white/10" />

          {/* Interest payout */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-textSecondary dark:text-gray-500">
              Payout
            </span>
            <div className="flex items-center gap-1">
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
    </div>
  );
}
