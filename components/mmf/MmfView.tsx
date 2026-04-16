'use client'

import { useState } from 'react'
import { MoneyMarketFund } from '@/types'
import { MmfTable } from './MmfTable'
import { MmfCard } from './MmfCard'
import { MmfCtaButton } from './MmfCtaButton'

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatPct(val: number | null | undefined) {
  if (val === null || val === undefined) return '—'
  return (val * 100).toFixed(2) + '%'
}

function youEarn(netYield: number | null, currency: string): string {
  if (!netYield) return '—'
  const earned = Math.round(netYield * 10_000)
  const symbol = currency === 'USD' ? '$' : '₱'
  return `${symbol}${earned.toLocaleString()} / yr`
}

function getMoneyLabel(days: number): string {
  if (days === 0) return 'Same day'
  if (days === 1) return 'Next day'
  return `${days} days`
}

function getBadge(fund: MoneyMarketFund, group: MoneyMarketFund[]): string | null {
  const sorted = [...group].sort((a, b) => (b.net_yield ?? 0) - (a.net_yield ?? 0))
  const rank = sorted.findIndex((f) => f.id === fund.id)
  if (rank === 0) return 'Highest return'
  if (fund.redemption_days === 0) return 'Same-day access'
  if (fund.min_initial <= 1000) return 'Low minimum'
  if ((fund.trust_fee_pct ?? 1) <= 0.0015) return 'Lowest fee'
  return null
}

function formatMin(val: number, currency: string): string {
  const symbol = currency === 'USD' ? '$' : '₱'
  return `${symbol}${val.toLocaleString()}`
}

// ─── Badge pill ──────────────────────────────────────────────────────────────

function BadgePill({ label }: { label: string }) {
  const colors: Record<string, string> = {
    'Highest return': 'bg-positive/10 text-positive',
    'Same-day access': 'bg-brand-primary/10 text-brand-primary',
    'Low minimum': 'bg-warning/10 text-warning',
    'Lowest fee': 'bg-purple-500/10 text-purple-500',
  }
  const cls = colors[label] ?? 'bg-brand-surface text-brand-textSecondary'
  return (
    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${cls}`}>
      {label}
    </span>
  )
}

// ─── Simple desktop table ────────────────────────────────────────────────────

function SimpleTable({ funds }: { funds: MoneyMarketFund[] }) {
  return (
    <div className="overflow-x-auto rounded-[1.4rem] border border-brand-border dark:border-white/10">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-brand-border dark:border-white/10 text-brand-textSecondary/60 dark:text-white/40 text-xs">
            <th className="text-left py-3 px-4 font-medium">Fund</th>
            <th className="text-right py-3 px-4 font-medium text-brand-primary">Earn Rate ★</th>
            <th className="text-right py-3 px-4 font-medium">You Earn</th>
            <th className="text-right py-3 px-4 font-medium">Get Money</th>
            <th className="text-right py-3 px-4 font-medium">Minimum</th>
            <th className="text-left py-3 px-4 font-medium">Why Pick</th>
            <th className="py-3 px-4" />
          </tr>
        </thead>
        <tbody>
          {funds.map((fund) => {
            const badge = getBadge(fund, funds)
            return (
              <tr
                key={fund.id}
                className="border-b border-brand-border/50 dark:border-white/[0.06] hover:bg-brand-surface dark:hover:bg-white/[0.03] transition-colors"
              >
                <td className="py-3.5 px-4">
                  <p className="text-brand-textPrimary dark:text-white font-medium">
                    {fund.name}
                  </p>
                  <p className="text-brand-textSecondary/50 dark:text-white/40 text-xs mt-0.5">
                    {fund.provider} · {fund.fund_type}
                  </p>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <span className="text-brand-textPrimary dark:text-white font-bold text-base tabular-nums">
                    {formatPct(fund.net_yield)}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right text-brand-textSecondary dark:text-white/70 tabular-nums">
                  {youEarn(fund.net_yield, fund.currency)}
                  <p className="text-brand-textSecondary/40 dark:text-white/30 text-xs">
                    per {fund.currency === 'USD' ? '$10,000' : '₱10,000'}
                  </p>
                </td>
                <td className="py-3.5 px-4 text-right text-brand-textSecondary dark:text-white/70">
                  {getMoneyLabel(fund.redemption_days)}
                </td>
                <td className="py-3.5 px-4 text-right text-brand-textSecondary dark:text-white/70 tabular-nums">
                  {formatMin(fund.min_initial, fund.currency)}
                </td>
                <td className="py-3.5 px-4">
                  {badge && <BadgePill label={badge} />}
                </td>
                <td className="py-3.5 px-4">
                  <MmfCtaButton url={fund.fund_page_url} provider={fund.provider} compact />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ─── Simple mobile card ──────────────────────────────────────────────────────

function SimpleCard({ fund, group }: { fund: MoneyMarketFund; group: MoneyMarketFund[] }) {
  const badge = getBadge(fund, group)

  return (
    <div className="bg-white dark:bg-white/[0.04] border border-brand-border dark:border-white/10 rounded-[1.4rem] p-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0 pr-2">
          <p className="text-brand-textPrimary dark:text-white font-medium text-sm leading-tight">
            {fund.name}
          </p>
          <p className="text-brand-textSecondary/60 dark:text-white/40 text-xs mt-0.5">
            {fund.provider}
          </p>
        </div>
        {badge && <BadgePill label={badge} />}
      </div>

      {/* Hero: Earn Rate */}
      <div className="mb-1">
        <p className="text-brand-textSecondary/50 dark:text-white/40 text-xs mb-0.5">Earn Rate ★</p>
        <p className="text-brand-textPrimary dark:text-white font-bold text-3xl tabular-nums">
          {formatPct(fund.net_yield)}
        </p>
      </div>

      {/* You Earn subtext */}
      <p className="text-brand-textSecondary/60 dark:text-white/40 text-xs mb-4">
        = {youEarn(fund.net_yield, fund.currency)} per{' '}
        {fund.currency === 'USD' ? '$10,000' : '₱10,000'} invested
      </p>

      {/* Quick facts grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs mb-4">
        <div>
          <p className="text-brand-textSecondary/50 dark:text-white/35 mb-0.5">Get money back</p>
          <p className="text-brand-textPrimary dark:text-white font-medium">
            {getMoneyLabel(fund.redemption_days)}
          </p>
        </div>
        <div>
          <p className="text-brand-textSecondary/50 dark:text-white/35 mb-0.5">Minimum to start</p>
          <p className="text-brand-textPrimary dark:text-white font-medium tabular-nums">
            {formatMin(fund.min_initial, fund.currency)}
          </p>
        </div>
      </div>

      <MmfCtaButton url={fund.fund_page_url} provider={fund.provider} />
    </div>
  )
}

// ─── Mode toggle ─────────────────────────────────────────────────────────────

function ModeToggle({
  mode,
  onChange,
}: {
  mode: 'simple' | 'advanced'
  onChange: (m: 'simple' | 'advanced') => void
}) {
  return (
    <div className="flex items-center gap-1 bg-brand-surface dark:bg-white/[0.06] rounded-full p-1">
      {(['simple', 'advanced'] as const).map((m) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-all capitalize ${
            mode === m
              ? 'bg-brand-primary text-white shadow-sm'
              : 'text-brand-textSecondary dark:text-white/50 hover:text-brand-textPrimary dark:hover:text-white'
          }`}
        >
          {m}
        </button>
      ))}
    </div>
  )
}

// ─── Currency section ─────────────────────────────────────────────────────────

function FundSection({
  title,
  funds,
  mode,
}: {
  title: string
  funds: MoneyMarketFund[]
  mode: 'simple' | 'advanced'
}) {
  if (funds.length === 0) {
    return (
      <section className="mb-10">
        <h2 className="text-lg font-medium text-brand-textPrimary dark:text-white mb-4">{title}</h2>
        <p className="text-brand-textSecondary/50 dark:text-white/30 text-sm py-8 text-center">
          No fund data yet. Run the Supabase seed SQL to populate.
        </p>
      </section>
    )
  }

  return (
    <section className="mb-10">
      <h2 className="text-lg font-medium text-brand-textPrimary dark:text-white mb-4">{title}</h2>

      {mode === 'simple' ? (
        <>
          {/* Mobile */}
          <div className="md:hidden space-y-3">
            {funds.map((fund) => (
              <SimpleCard key={fund.id} fund={fund} group={funds} />
            ))}
          </div>
          {/* Desktop */}
          <div className="hidden md:block">
            <SimpleTable funds={funds} />
          </div>
        </>
      ) : (
        <>
          {/* Mobile */}
          <div className="md:hidden space-y-3">
            {funds.map((fund) => (
              <MmfCard key={fund.id} fund={fund} />
            ))}
          </div>
          {/* Desktop */}
          <div className="hidden md:block">
            <MmfTable funds={funds} />
          </div>
        </>
      )}
    </section>
  )
}

// ─── Main export ─────────────────────────────────────────────────────────────

export function MmfView({
  phpFunds,
  usdFunds,
}: {
  phpFunds: MoneyMarketFund[]
  usdFunds: MoneyMarketFund[]
}) {
  const [mode, setMode] = useState<'simple' | 'advanced'>('simple')

  return (
    <div>
      {/* Toggle */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-brand-textSecondary/60 dark:text-white/40 text-xs">
          {mode === 'simple'
            ? 'Showing plain-language view'
            : 'Showing full financial data'}
        </p>
        <ModeToggle mode={mode} onChange={setMode} />
      </div>

      <FundSection title="Philippine Peso (PHP)" funds={phpFunds} mode={mode} />
      <FundSection title="US Dollar (USD)" funds={usdFunds} mode={mode} />
    </div>
  )
}
