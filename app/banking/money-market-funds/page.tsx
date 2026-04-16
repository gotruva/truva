import { createClient } from '@/utils/supabase/server'
import { MmfView } from '@/components/mmf/MmfView'
import { MoneyMarketFund, BenchmarkRate } from '@/types'

export const revalidate = 3600 // ISR: rebuild hourly

export const metadata = {
  title: 'Best Money Market Funds Philippines 2026 | Truva',
  description:
    'Compare after-tax net yields on Philippine UITFs and mutual funds. Sorted by net yield after 20% FWT and trust fees. PHP and USD funds.',
}

export default async function MoneyMarketFundsPage() {
  let funds: MoneyMarketFund[] = []
  let benchmark: BenchmarkRate | null = null

  try {
    const supabase = await createClient()

    const [fundsResult, benchmarkResult] = await Promise.all([
      supabase.from('mmf_current').select('*'),
      supabase
        .from('benchmark_rates')
        .select('*')
        .eq('key', 'BTR_91D')
        .order('date', { ascending: false })
        .limit(1)
        .single(),
    ])

    if (fundsResult.data) funds = fundsResult.data as MoneyMarketFund[]
    if (benchmarkResult.data) benchmark = benchmarkResult.data as BenchmarkRate
  } catch {
    // Supabase not configured or tables not created yet — render empty state
  }

  const phpFunds = funds.filter((f) => f.currency === 'PHP')
  const usdFunds = funds.filter((f) => f.currency === 'USD')

  return (
    <main className="px-4 py-6 max-w-6xl mx-auto">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-brand-textPrimary dark:text-white">
          Money Market Funds
        </h1>
        <p className="text-brand-textSecondary dark:text-white/50 text-sm mt-1">
          All yields shown after 20% Final Withholding Tax and management fees.
          Sorted by net yield, highest first.
        </p>
      </div>

      {/* Benchmark context bar */}
      {benchmark && (
        <div className="bg-brand-surface dark:bg-white/[0.04] border border-brand-border dark:border-white/10 rounded-xl p-4 mb-6 text-sm">
          <span className="text-brand-textSecondary/60 dark:text-white/40">
            Current benchmark ·{' '}
          </span>
          <span className="text-brand-textPrimary dark:text-white font-medium">
            91-day T-Bill: {(benchmark.rate * 100).toFixed(2)}%
          </span>
          <span className="text-brand-textSecondary/40 dark:text-white/30 ml-2">
            (BTr auction, updated weekly)
          </span>
        </div>
      )}

      <MmfView phpFunds={phpFunds} usdFunds={usdFunds} />

      {/* Disclaimer */}
      <p className="text-xs text-brand-textSecondary/40 dark:text-white/25 mt-6 border-t border-brand-border dark:border-white/10 pt-6">
        Truva earns referral fees when you open an account via our links. This does not affect
        our rankings. Yields are historical and not guaranteed. UITFs and mutual funds are{' '}
        <strong>not PDIC-insured</strong>. Past performance does not guarantee future results.
      </p>
    </main>
  )
}
