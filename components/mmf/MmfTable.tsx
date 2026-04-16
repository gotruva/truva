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

export function MmfTable({ funds }: { funds: MoneyMarketFund[] }) {
  return (
    <div className="overflow-x-auto rounded-[1.4rem] border border-brand-border dark:border-white/10">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-brand-border dark:border-white/10 text-brand-textSecondary/60 dark:text-white/40 text-xs">
            <th className="text-left py-3 px-4 font-medium">Fund</th>
            <th className="text-right py-3 px-4 font-medium">Gross</th>
            <th className="text-right py-3 px-4 font-medium">After Tax</th>
            <th className="text-right py-3 px-4 font-medium text-brand-primary">
              Net Yield ★
            </th>
            <th className="text-right py-3 px-4 font-medium">vs Benchmark</th>
            <th className="text-right py-3 px-4 font-medium">Trust Fee</th>
            <th className="text-right py-3 px-4 font-medium">Min. Inv.</th>
            <th className="text-right py-3 px-4 font-medium">Redeem</th>
            <th className="text-right py-3 px-4 font-medium">PDIC</th>
            <th className="py-3 px-4" />
          </tr>
        </thead>
        <tbody>
          {funds.map((fund) => {
            const deltaPositive = (fund.vs_benchmark ?? 0) >= 0
            const deltaColor =
              fund.vs_benchmark === null
                ? 'text-brand-textSecondary/40 dark:text-white/30'
                : deltaPositive
                ? 'text-positive'
                : 'text-danger'

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
                <td className="py-3.5 px-4 text-right text-brand-textSecondary/70 dark:text-white/50 tabular-nums">
                  {formatPct(fund.gross_yield_1y)}
                </td>
                <td className="py-3.5 px-4 text-right text-brand-textSecondary dark:text-white/70 tabular-nums">
                  {formatPct(fund.after_tax_yield)}
                </td>
                <td className="py-3.5 px-4 text-right font-semibold text-brand-textPrimary dark:text-white tabular-nums">
                  {formatPct(fund.net_yield)}
                </td>
                <td className={`py-3.5 px-4 text-right font-medium tabular-nums ${deltaColor}`}>
                  {fund.vs_benchmark === null
                    ? '—'
                    : `${deltaPositive ? '+' : ''}${formatPct(fund.vs_benchmark)}`}
                </td>
                <td className="py-3.5 px-4 text-right text-brand-textSecondary/70 dark:text-white/50 tabular-nums">
                  {formatPct(fund.trust_fee_pct)}/yr
                </td>
                <td className="py-3.5 px-4 text-right text-brand-textSecondary/70 dark:text-white/50 tabular-nums">
                  {formatMoney(fund.min_initial, fund.currency)}
                </td>
                <td className="py-3.5 px-4 text-right text-brand-textSecondary/70 dark:text-white/50">
                  {fund.redemption_days === 0 ? 'Same day' : `T+${fund.redemption_days}`}
                </td>
                <td className="py-3.5 px-4 text-right">
                  <span
                    className={`text-xs font-medium ${
                      fund.pdic_insured
                        ? 'text-positive'
                        : 'text-brand-textSecondary/30 dark:text-white/25'
                    }`}
                  >
                    {fund.pdic_insured ? '✓' : '✗'}
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <MmfCtaButton
                    url={fund.fund_page_url}
                    provider={fund.provider}
                    compact
                  />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
