'use client'

import { MoneyMarketFund } from '@/types'
import { MmfCtaButton } from './MmfCtaButton'

function formatPct(val: number | null | undefined) {
  if (val === null || val === undefined) return '—'
  return (val * 100).toFixed(2) + '%'
}

function formatMoney(val: number, currency: string) {
  if (currency === 'USD') return `$${val.toLocaleString()}`
  return `₱${val.toLocaleString()}`
}

export function MmfCard({ fund }: { fund: MoneyMarketFund }) {
  const benchmarkDelta = fund.vs_benchmark
  const deltaColor =
    benchmarkDelta === null
      ? 'text-brand-textSecondary/50'
      : benchmarkDelta >= 0
      ? 'text-positive'
      : 'text-danger'
  const deltaSign = benchmarkDelta !== null && benchmarkDelta >= 0 ? '+' : ''

  return (
    <div className="bg-white dark:bg-white/[0.04] border border-brand-border dark:border-white/10 rounded-[1.4rem] p-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 pr-2">
          <p className="text-brand-textPrimary dark:text-white font-medium text-sm leading-tight">
            {fund.name}
          </p>
          <p className="text-brand-textSecondary/60 dark:text-white/40 text-xs mt-0.5">
            {fund.provider}
          </p>
        </div>
        <span className="shrink-0 text-xs bg-brand-surface dark:bg-white/10 text-brand-textSecondary dark:text-white/60 px-2 py-0.5 rounded-full">
          {fund.fund_type}
        </span>
      </div>

      {/* Yield trio — hero numbers */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-brand-surface dark:bg-white/[0.04] rounded-xl p-2.5 text-center">
          <p className="text-brand-textSecondary/60 dark:text-white/40 text-xs mb-1">Gross</p>
          <p className="text-brand-textPrimary dark:text-white font-semibold text-sm tabular-nums">
            {formatPct(fund.gross_yield_1y)}
          </p>
        </div>
        <div className="bg-brand-surface dark:bg-white/[0.04] rounded-xl p-2.5 text-center">
          <p className="text-brand-textSecondary/60 dark:text-white/40 text-xs mb-1">After Tax</p>
          <p className="text-brand-textPrimary dark:text-white font-semibold text-sm tabular-nums">
            {formatPct(fund.after_tax_yield)}
          </p>
        </div>
        <div className="bg-brand-primaryLight dark:bg-brand-primary/10 border border-brand-primary/20 dark:border-brand-primary/30 rounded-xl p-2.5 text-center">
          <p className="text-brand-primary text-xs mb-1 font-medium">Net Yield ★</p>
          <p className="text-brand-textPrimary dark:text-white font-bold text-sm tabular-nums">
            {formatPct(fund.net_yield)}
          </p>
        </div>
      </div>

      {/* vs Benchmark */}
      {fund.vs_benchmark !== null && (
        <div className="flex items-center gap-1.5 mb-3 text-xs">
          <span className="text-brand-textSecondary/60 dark:text-white/40">
            vs {fund.benchmark_label ?? 'Benchmark'}:
          </span>
          <span className={`font-semibold ${deltaColor}`}>
            {deltaSign}{formatPct(fund.vs_benchmark)}
          </span>
        </div>
      )}

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs mb-4">
        <div className="flex justify-between">
          <span className="text-brand-textSecondary/60 dark:text-white/40">Min. investment</span>
          <span className="text-brand-textSecondary dark:text-white/70 tabular-nums">
            {formatMoney(fund.min_initial, fund.currency)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-brand-textSecondary/60 dark:text-white/40">Trust fee</span>
          <span className="text-brand-textSecondary dark:text-white/70 tabular-nums">
            {formatPct(fund.trust_fee_pct)}/yr
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-brand-textSecondary/60 dark:text-white/40">Redemption</span>
          <span className="text-brand-textSecondary dark:text-white/70">
            {fund.redemption_days === 0 ? 'Same day' : `T+${fund.redemption_days}`}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-brand-textSecondary/60 dark:text-white/40">PDIC insured</span>
          <span className={fund.pdic_insured ? 'text-positive font-medium' : 'text-brand-textSecondary/40 dark:text-white/30'}>
            {fund.pdic_insured ? 'Yes' : 'No'}
          </span>
        </div>
      </div>

      {/* Early redemption warning */}
      {fund.early_redemption_fee && (
        <p className="text-xs text-warning bg-warning/5 border border-warning/10 rounded-lg px-3 py-2 mb-3">
          ⚠ {fund.early_redemption_fee}
        </p>
      )}

      {/* Access channels */}
      {fund.access_channels?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {fund.access_channels.map((ch) => (
            <span
              key={ch}
              className="text-xs bg-brand-surface dark:bg-white/[0.06] text-brand-textSecondary/70 dark:text-white/50 px-2 py-0.5 rounded-full"
            >
              {ch}
            </span>
          ))}
        </div>
      )}

      <MmfCtaButton url={fund.fund_page_url} provider={fund.provider} />
    </div>
  )
}
