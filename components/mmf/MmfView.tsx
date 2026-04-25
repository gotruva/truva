'use client';

import { type ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Calculator, WalletCards } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { MoneyMarketFund } from '@/types';
import {
  formatMmfMoney,
  MMF_DEFAULT_AMOUNT,
} from '@/lib/mmf';
import { MmfTable, type MmfSortCol, type MmfSortDir } from './MmfTable';
import { MmfCard } from './MmfCard';

const AMOUNT_PRESETS = [10000, 50000, 100000];

type FundTypeFilter = 'all' | 'UITF' | 'Mutual Fund';
type LiquidityFilter = 'all' | 'same-day' | '1-2d' | '3+';

function sortFunds(
  funds: MoneyMarketFund[],
  col: MmfSortCol,
  dir: MmfSortDir,
): MoneyMarketFund[] {
  return [...funds].sort((a, b) => {
    const av = a[col] ?? (dir === 'asc' ? Infinity : -Infinity);
    const bv = b[col] ?? (dir === 'asc' ? Infinity : -Infinity);
    return dir === 'asc' ? (av as number) - (bv as number) : (bv as number) - (av as number);
  });
}

function filterFunds(
  funds: MoneyMarketFund[],
  fundType: FundTypeFilter,
  liquidity: LiquidityFilter,
): MoneyMarketFund[] {
  return funds.filter((f) => {
    if (fundType !== 'all' && f.fund_type !== fundType) return false;
    if (liquidity === 'same-day' && f.redemption_days !== 0) return false;
    if (liquidity === '1-2d' && (f.redemption_days < 1 || f.redemption_days > 2)) return false;
    if (liquidity === '3+' && f.redemption_days < 3) return false;
    return true;
  });
}

const pillBase =
  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[13px] font-semibold transition-all duration-200 hover:-translate-y-0.5';
const pillActive = 'border-slate-800 bg-slate-800 text-white dark:border-white dark:bg-white dark:text-slate-900';
const pillInactive =
  'border-brand-border bg-transparent text-brand-textSecondary hover:border-brand-primary/30 hover:bg-brand-surface dark:border-white/10 dark:text-gray-400 dark:hover:bg-white/5';

function FilterPills<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { label: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-textSecondary/50 dark:text-white/35">
        {label}
      </span>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`${pillBase} ${value === opt.value ? pillActive : pillInactive}`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

const FUND_TYPE_OPTIONS: { label: string; value: FundTypeFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'UITF', value: 'UITF' },
  { label: 'Mutual Fund', value: 'Mutual Fund' },
];

const LIQUIDITY_OPTIONS: { label: string; value: LiquidityFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Same day', value: 'same-day' },
  { label: '1–2 days', value: '1-2d' },
  { label: '3+ days', value: '3+' },
];

function FundSection({
  title,
  description,
  funds,
  amount,
  isPrimary = false,
}: {
  title: string;
  description: string;
  funds: MoneyMarketFund[];
  amount: number;
  isPrimary?: boolean;
}) {
  const [sortCol, setSortCol] = useState<MmfSortCol>('net_yield');
  const [sortDir, setSortDir] = useState<MmfSortDir>('desc');
  const [fundType, setFundType] = useState<FundTypeFilter>('all');
  const [liquidity, setLiquidity] = useState<LiquidityFilter>('all');

  const handleSort = (col: MmfSortCol) => {
    if (col === sortCol) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortCol(col);
      setSortDir(col === 'net_yield' || col === 'vs_benchmark' ? 'desc' : 'asc');
    }
  };

  const displayFunds = useMemo(
    () => sortFunds(filterFunds(funds, fundType, liquidity), sortCol, sortDir),
    [funds, fundType, liquidity, sortCol, sortDir],
  );

  if (funds.length === 0) {
    return (
      <section className="scroll-mt-32 space-y-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-brand-textPrimary dark:text-white">{title}</h2>
          <p className="mt-1 text-sm text-brand-textSecondary dark:text-gray-300">{description}</p>
        </div>
        <div className="rounded-2xl border border-brand-border bg-white p-6 text-center text-sm text-brand-textSecondary dark:border-white/10 dark:bg-white/[0.04] dark:text-gray-300">
          No fund data is available yet.
        </div>
      </section>
    );
  }

  return (
    <section className="scroll-mt-32 space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-brand-textPrimary dark:text-white">{title}</h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
            {description}
          </p>
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
        <FilterPills label="Type" options={FUND_TYPE_OPTIONS} value={fundType} onChange={setFundType} />
        <FilterPills label="Cash access" options={LIQUIDITY_OPTIONS} value={liquidity} onChange={setLiquidity} />
      </div>

      {displayFunds.length === 0 ? (
        <div className="rounded-2xl border border-brand-border bg-white p-6 text-center text-sm text-brand-textSecondary dark:border-white/10 dark:bg-white/[0.04] dark:text-gray-300">
          No funds match your filters.{' '}
          <button
            type="button"
            onClick={() => { setFundType('all'); setLiquidity('all'); }}
            className="underline underline-offset-2 hover:text-brand-primary"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <>
          <div className="md:hidden space-y-3">
            {displayFunds.map((fund) => (
              <MmfCard key={fund.id} fund={fund} amount={amount} />
            ))}
          </div>
          <div className="hidden md:block">
            <MmfTable
              funds={displayFunds}
              amount={amount}
              sortCol={sortCol}
              sortDir={sortDir}
              onSort={handleSort}
            />
          </div>
        </>
      )}

      {isPrimary ? (
        <p className="text-xs leading-relaxed text-brand-textSecondary/60 dark:text-white/35">
          Estimated yearly earnings are based on each fund&apos;s latest net yield. Actual returns change daily and are not guaranteed.
        </p>
      ) : null}
    </section>
  );
}

export function MmfView({
  phpFunds,
  usdFunds,
}: {
  phpFunds: MoneyMarketFund[];
  usdFunds: MoneyMarketFund[];
}) {
  const [amount, setAmount] = useState(MMF_DEFAULT_AMOUNT);
  const [stickyVisible, setStickyVisible] = useState(false);
  const calculatorRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = calculatorRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setStickyVisible(!entry.isIntersecting),
      { threshold: 0, rootMargin: '-76px 0px 0px 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleAmountChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/[^0-9]/g, '');
    setAmount(value ? parseInt(value, 10) : 0);
  };

  return (
    <div className="space-y-9">
      {/* Sticky amount bar — appears when calculator scrolls out of view */}
      <div
        className={`sticky top-[76px] z-20 -mx-4 border-b border-brand-border bg-[#F8F9FB]/95 px-4 py-2.5 backdrop-blur-md dark:border-white/10 dark:bg-slate-950/95 ${
          stickyVisible ? 'block' : 'hidden'
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <span className="shrink-0 text-xs font-semibold uppercase tracking-[0.16em] text-brand-textSecondary/50 dark:text-white/35">
            Amount
          </span>
          <div className="relative w-48 shrink-0">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-brand-textSecondary dark:text-gray-300">
              PHP
            </span>
            <Input
              aria-label="Investment amount"
              inputMode="numeric"
              type="text"
              value={amount ? new Intl.NumberFormat('en-US').format(amount) : ''}
              onChange={handleAmountChange}
              className="h-8 rounded-lg border-brand-border bg-white pl-10 text-sm font-bold shadow-inner focus-visible:ring-brand-primary dark:border-white/20 dark:bg-slate-900"
            />
          </div>
          <div className="flex gap-1.5">
            {AMOUNT_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(preset)}
                className="inline-flex items-center rounded-full border border-brand-border bg-white px-2.5 py-0.5 text-xs font-semibold text-brand-textSecondary transition-colors hover:border-brand-primary/20 hover:text-brand-primary dark:border-white/10 dark:bg-white/[0.05] dark:text-gray-300"
              >
                {formatMmfMoney(preset, 'PHP')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Calculator card */}
      <section
        ref={calculatorRef}
        className="rounded-[1.5rem] border border-brand-border bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]"
      >
        <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary">
              <Calculator className="h-3.5 w-3.5" />
              Earnings calculator
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-brand-textPrimary dark:text-white">
              How much could you earn?
            </h2>
            <p className="text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
              Enter an amount below — every fund in the table updates instantly to show your estimated yearly earnings after taxes and fees.
            </p>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-semibold text-brand-textSecondary dark:text-gray-300">
              Investment amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-brand-textSecondary dark:text-gray-300">
                PHP
              </span>
              <Input
                aria-label="Investment amount"
                inputMode="numeric"
                type="text"
                value={amount ? new Intl.NumberFormat('en-US').format(amount) : ''}
                onChange={handleAmountChange}
                className="h-14 rounded-xl border-brand-border bg-brand-surface pl-14 text-xl font-bold shadow-inner focus-visible:ring-brand-primary dark:border-white/20 dark:bg-slate-950"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {AMOUNT_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(preset)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-brand-border bg-brand-surface px-3 py-1.5 text-xs font-semibold text-brand-textSecondary transition-colors hover:border-brand-primary/20 hover:text-brand-primary dark:border-white/10 dark:bg-white/[0.05] dark:text-gray-300"
                >
                  <WalletCards className="h-3.5 w-3.5" />
                  {formatMmfMoney(preset, 'PHP')}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <FundSection
        title="🇵🇭 Peso Funds (PHP)"
        description="Sorted by net yield — what you keep after the 20% tax and management fees."
        funds={phpFunds}
        amount={amount}
        isPrimary
      />

      <FundSection
        title="💵 Dollar Funds (USD)"
        description="For dollar liquidity. The entered amount is treated as USD for these rows."
        funds={usdFunds}
        amount={amount}
      />
    </div>
  );
}
