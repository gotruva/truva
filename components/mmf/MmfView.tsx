'use client';

import { type ChangeEvent, useMemo, useState } from 'react';
import { Calculator, WalletCards } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { BenchmarkRate, MoneyMarketFund } from '@/types';
import {
  formatEstimatedAnnualEarnings,
  formatMmfMoney,
  formatMmfPercent,
  formatPhtDate,
  getLatestRateDate,
  MMF_DEFAULT_AMOUNT,
} from '@/lib/mmf';
import { MmfTable } from './MmfTable';
import { MmfCard } from './MmfCard';

const AMOUNT_PRESETS = [10000, 50000, 100000];

function sortFunds(funds: MoneyMarketFund[]) {
  return [...funds].sort((left, right) => (right.net_yield ?? -1) - (left.net_yield ?? -1));
}

function FundSection({
  title,
  description,
  funds,
  amount,
  isPrimary = false,
  benchmark,
}: {
  title: string;
  description: string;
  funds: MoneyMarketFund[];
  amount: number;
  isPrimary?: boolean;
  benchmark?: BenchmarkRate | null;
}) {
  const sortedFunds = useMemo(() => sortFunds(funds), [funds]);
  const topFund = sortedFunds[0];
  const latestRateDate = getLatestRateDate(sortedFunds);

  if (sortedFunds.length === 0) {
    return (
      <section className="scroll-mt-32 space-y-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-brand-textPrimary dark:text-white">
            {title}
          </h2>
          <p className="mt-1 text-sm text-brand-textSecondary dark:text-gray-300">
            {description}
          </p>
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
          <h2 className="text-xl font-bold tracking-tight text-brand-textPrimary dark:text-white">
            {title}
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
            {description}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {topFund ? (
            <div className="shrink-0 rounded-2xl border border-brand-primary/15 bg-brand-primaryLight/40 px-4 py-3 text-sm dark:border-brand-primary/20 dark:bg-brand-primary/10">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary">
                Top net yield
              </p>
              <p className="mt-1 font-bold tabular-nums text-brand-textPrimary dark:text-white">
                {formatMmfPercent(topFund.net_yield)} | {formatEstimatedAnnualEarnings(topFund, amount)}
              </p>
              <p className="mt-0.5 text-xs text-brand-textSecondary/60 dark:text-white/40">
                {topFund.provider}
              </p>
            </div>
          ) : null}
          {benchmark ? (
            <div className="shrink-0 rounded-2xl border border-brand-border bg-brand-surface px-4 py-3 text-sm dark:border-white/10 dark:bg-white/[0.04]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-textSecondary/60 dark:text-white/40">
                Benchmark (90-day SOFR)
              </p>
              <p className="mt-1 font-bold tabular-nums text-brand-textPrimary dark:text-white">
                {formatMmfPercent(benchmark.rate)}
              </p>
              <p className="mt-0.5 text-xs text-brand-textSecondary/60 dark:text-white/40">
                US T-Bill proxy · as of {formatPhtDate(benchmark.date)}
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="md:hidden space-y-3">
        {sortedFunds.map((fund) => (
          <MmfCard key={fund.id} fund={fund} amount={amount} expectedRateDate={latestRateDate} />
        ))}
      </div>

      <div className="hidden md:block">
        <MmfTable funds={sortedFunds} amount={amount} expectedRateDate={latestRateDate} />
      </div>

      {isPrimary ? (
        <p className="text-xs leading-relaxed text-brand-textSecondary/60 dark:text-white/35">
          Estimated yearly earnings use each fund&apos;s latest one-year net yield. Actual fund returns can move daily and are not guaranteed.
        </p>
      ) : null}
    </section>
  );
}

export function MmfView({
  phpFunds,
  usdFunds,
  usdBenchmark,
}: {
  phpFunds: MoneyMarketFund[];
  usdFunds: MoneyMarketFund[];
  usdBenchmark?: BenchmarkRate | null;
}) {
  const [amount, setAmount] = useState(MMF_DEFAULT_AMOUNT);

  const handleAmountChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/[^0-9]/g, '');
    setAmount(value ? parseInt(value, 10) : 0);
  };

  return (
    <div className="space-y-9">
      <section className="rounded-[1.5rem] border border-brand-border bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary">
              <Calculator className="h-3.5 w-3.5" />
              Quick earnings estimate
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-brand-textPrimary dark:text-white">
              Type an amount and the table updates instantly.
            </h2>
            <p className="text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
              This is an annual estimate using the latest source-aware net yield. UITFs use published ROI-YOY less tax and trust fees; mutual funds use published one-year NAV return. For USD rows, the same number is treated as USD.
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
        title="Philippine Peso (PHP)"
        description="Primary comparison set. Sorted by net yield so the amount you can actually keep stays first."
        funds={phpFunds}
        amount={amount}
        isPrimary
      />

      <FundSection
        title="US Dollar (USD)"
        description="Secondary set for dollar liquidity. Estimates use the same typed number as USD."
        funds={usdFunds}
        amount={amount}
        benchmark={usdBenchmark}
      />
    </div>
  );
}
