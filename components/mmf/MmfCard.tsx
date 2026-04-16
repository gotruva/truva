'use client';

import { MoneyMarketFund } from '@/types';
import {
  formatEstimatedAnnualEarnings,
  formatMmfMoney,
  formatMmfPercent,
  redemptionLabel,
} from '@/lib/mmf';
import { MmfCtaButton } from './MmfCtaButton';

export function MmfCard({
  fund,
  amount,
}: {
  fund: MoneyMarketFund;
  amount: number;
}) {
  const benchmarkDelta = fund.vs_benchmark;
  const deltaPositive = (benchmarkDelta ?? 0) >= 0;
  const deltaColor =
    benchmarkDelta === null || benchmarkDelta === undefined
      ? 'text-brand-textSecondary/50'
      : deltaPositive
        ? 'text-positive'
        : 'text-danger';

  return (
    <div className="rounded-[1.4rem] border border-brand-border bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-tight text-brand-textPrimary dark:text-white">
            {fund.name}
          </p>
          <p className="mt-1 text-xs text-brand-textSecondary/60 dark:text-white/40">
            {fund.provider} | {fund.fund_type}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-brand-surface px-2 py-0.5 text-xs font-medium text-brand-textSecondary dark:bg-white/10 dark:text-white/60">
          {fund.currency}
        </span>
      </div>

      <div className="mb-4 rounded-2xl border border-brand-primary/15 bg-brand-primaryLight/50 p-4 dark:border-brand-primary/20 dark:bg-brand-primary/10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary">
          Net yield
        </p>
        <div className="mt-2 flex items-end justify-between gap-3">
          <p className="text-3xl font-bold tabular-nums text-brand-textPrimary dark:text-white">
            {formatMmfPercent(fund.net_yield)}
          </p>
          <div className="text-right">
            <p className="text-xs text-brand-textSecondary/60 dark:text-white/45">
              Est. yearly
            </p>
            <p className="font-semibold tabular-nums text-brand-textPrimary dark:text-white">
              {formatEstimatedAnnualEarnings(fund, amount)}
            </p>
          </div>
        </div>
        <p className="mt-2 text-xs text-brand-textSecondary/55 dark:text-white/35">
          Based on {formatMmfMoney(amount, fund.currency)}
        </p>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 text-xs">
        <div>
          <p className="text-brand-textSecondary/55 dark:text-white/35">Minimum</p>
          <p className="mt-1 font-semibold tabular-nums text-brand-textPrimary dark:text-white">
            {formatMmfMoney(fund.min_initial, fund.currency)}
          </p>
        </div>
        <div>
          <p className="text-brand-textSecondary/55 dark:text-white/35">Cash access</p>
          <p className="mt-1 font-semibold text-brand-textPrimary dark:text-white">
            {redemptionLabel(fund.redemption_days)}
          </p>
        </div>
        <div>
          <p className="text-brand-textSecondary/55 dark:text-white/35">vs benchmark</p>
          <p className={`mt-1 font-semibold tabular-nums ${deltaColor}`}>
            {benchmarkDelta === null || benchmarkDelta === undefined
              ? '-'
              : `${deltaPositive ? '+' : ''}${formatMmfPercent(benchmarkDelta)}`}
          </p>
        </div>
        <div>
          <p className="text-brand-textSecondary/55 dark:text-white/35">Gross yield</p>
          <p className="mt-1 font-semibold tabular-nums text-brand-textPrimary dark:text-white">
            {formatMmfPercent(fund.gross_yield_1y)}
          </p>
        </div>
      </div>

      {fund.early_redemption_fee && (
        <p className="mb-3 rounded-lg border border-warning/10 bg-warning/5 px-3 py-2 text-xs text-warning">
          Early redemption: {fund.early_redemption_fee}
        </p>
      )}

      {fund.access_channels?.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {fund.access_channels.map((channel) => (
            <span
              key={channel}
              className="rounded-full bg-brand-surface px-2 py-0.5 text-xs text-brand-textSecondary/70 dark:bg-white/[0.06] dark:text-white/50"
            >
              {channel}
            </span>
          ))}
        </div>
      )}

      <MmfCtaButton url={fund.fund_page_url} provider={fund.provider} />
    </div>
  );
}
