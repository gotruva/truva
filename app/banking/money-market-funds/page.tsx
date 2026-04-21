import Link from 'next/link';
import { AlertTriangle, ArrowLeft, RefreshCw, TrendingUp } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';
import { MmfView } from '@/components/mmf/MmfView';
import { BenchmarkRate, MoneyMarketFund } from '@/types';
import {
  formatMmfPercent,
  formatPhtDate,
  formatPhtDateTime,
  getLatestCheckedAt,
  getLatestRateDate,
  getPhtDateString,
} from '@/lib/mmf';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Best Money Market Funds Philippines 2026 | Truva',
  description:
    'Compare after-tax net yields on Philippine UITFs and mutual funds. Sorted by net yield after 20% FWT and trust fees. PHP and USD funds.',
};

export default async function MoneyMarketFundsPage() {
  let funds: MoneyMarketFund[] = [];
  let benchmark: BenchmarkRate | null = null;
  let usdBenchmark: BenchmarkRate | null = null;
  let loadError: string | null = null;

  try {
    const supabase = await createClient();

    const [fundsResult, benchmarkResult, usdBenchmarkResult] = await Promise.all([
      supabase.from('mmf_current').select('*'),
      supabase
        .from('benchmark_rates')
        .select('*')
        .eq('key', 'BTR_91D')
        .order('date', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('benchmark_rates')
        .select('*')
        .eq('key', 'US_TBILL_90D')
        .order('date', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    if (fundsResult.error) {
      loadError = 'Live money market fund data is temporarily unavailable.';
      console.error('[mmf] Failed to load mmf_current', fundsResult.error);
    } else if (fundsResult.data) {
      funds = fundsResult.data as MoneyMarketFund[];
    }

    if (benchmarkResult.error) {
      console.error('[mmf] Failed to load BTR_91D benchmark', benchmarkResult.error);
    } else if (benchmarkResult.data) {
      benchmark = benchmarkResult.data as BenchmarkRate;
    }

    if (usdBenchmarkResult.error) {
      console.error('[mmf] Failed to load US_TBILL_90D benchmark', usdBenchmarkResult.error);
    } else if (usdBenchmarkResult.data) {
      usdBenchmark = usdBenchmarkResult.data as BenchmarkRate;
    }
  } catch (error) {
    loadError = 'Live money market fund data is temporarily unavailable.';
    console.error('[mmf] Failed to load Supabase data', error);
  }

  const phpFunds = funds.filter((fund) => fund.currency === 'PHP');
  const usdFunds = funds.filter((fund) => fund.currency === 'USD');
  const phpUitfFunds = phpFunds.filter((fund) => fund.fund_type === 'UITF');
  const phtDate = getPhtDateString();
  const latestCheckedAt = getLatestCheckedAt(phpUitfFunds) ?? getLatestCheckedAt(funds);
  const latestRateDate = getLatestRateDate(phpUitfFunds) ?? getLatestRateDate(funds);

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-6">
        <Link
          href="/banking"
          className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-primary transition-colors hover:text-brand-primaryDark"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to banking
        </Link>

        <div className="max-w-3xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-brand-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary">
            <TrendingUp className="h-3.5 w-3.5" />
            Money market funds
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-brand-textPrimary dark:text-white sm:text-4xl">
            Compare liquid funds by the yield you can actually keep.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300 sm:text-base">
            Net yield comes first: gross one-year yield, less 20% Final Withholding Tax and each fund&apos;s trust fee. Type your amount below to estimate annual earnings directly in the table.
          </p>
        </div>
      </div>

      <section className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-brand-border bg-brand-surface p-4 dark:border-white/10 dark:bg-white/[0.04]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-textSecondary/60 dark:text-white/40">
            Funds tracked
          </p>
          <p className="mt-2 text-2xl font-bold tabular-nums text-brand-textPrimary dark:text-white">
            {funds.length}
          </p>
          <p className="mt-1 text-xs text-brand-textSecondary/60 dark:text-white/40">
            {phpFunds.length} PHP · {usdFunds.length} USD
          </p>
        </div>

        <div className="rounded-2xl border border-brand-border bg-brand-surface p-4 dark:border-white/10 dark:bg-white/[0.04]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-textSecondary/60 dark:text-white/40">
            91-day T-Bill
          </p>
          <p className="mt-2 text-2xl font-bold tabular-nums text-brand-textPrimary dark:text-white">
            {benchmark ? formatMmfPercent(benchmark.rate) : '-'}
          </p>
          <p className="mt-1 text-xs text-brand-textSecondary/60 dark:text-white/40">
            Raw BTr rate date: {formatPhtDate(benchmark?.date)}
          </p>
        </div>

        <div className="rounded-2xl border border-brand-border bg-brand-surface p-4 dark:border-white/10 dark:bg-white/[0.04]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-textSecondary/60 dark:text-white/40">
            90-day SOFR (USD)
          </p>
          <p className="mt-2 text-2xl font-bold tabular-nums text-brand-textPrimary dark:text-white">
            {usdBenchmark ? formatMmfPercent(usdBenchmark.rate) : '-'}
          </p>
          <p className="mt-1 text-xs text-brand-textSecondary/60 dark:text-white/40">
            US T-Bill proxy date: {formatPhtDate(usdBenchmark?.date)}
          </p>
        </div>

        <div className="rounded-2xl border border-brand-border bg-brand-surface p-4 dark:border-white/10 dark:bg-white/[0.04]">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-brand-primary/10 p-2 text-brand-primary">
              <RefreshCw className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-textSecondary/60 dark:text-white/40">
                Data last updated
              </p>
              <p className="mt-2 text-base font-bold text-brand-textPrimary dark:text-white">
                {formatPhtDateTime(latestCheckedAt)}
              </p>
              <p className="mt-1 text-xs text-brand-textSecondary/60 dark:text-white/40">
                PHP rates as of {formatPhtDate(latestRateDate)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {loadError && (
        <div className="mb-6 rounded-2xl border border-danger/20 bg-danger/5 p-4 text-sm text-danger">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <p>{loadError} The page will recover automatically when the live data service responds.</p>
          </div>
        </div>
      )}

      <MmfView phpFunds={phpFunds} usdFunds={usdFunds} usdBenchmark={usdBenchmark} phtDate={phtDate} />

      <div className="mt-8 space-y-3 border-t border-brand-border pt-6 dark:border-white/10">
        <p className="text-xs leading-relaxed text-brand-textSecondary/55 dark:text-white/35">
          Truva may earn referral fees when you open an account via our links. This does not affect our rankings. Yields are historical and not guaranteed. UITFs and mutual funds are <strong>not PDIC-insured</strong>. Past performance does not guarantee future results.
        </p>
        <p className="text-xs leading-relaxed text-brand-textSecondary/55 dark:text-white/35">
          PHP UITF yield data sourced from{' '}
          <a
            href="https://uitf.com.ph"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-brand-textSecondary dark:hover:text-white/60"
          >
            uitf.com.ph
          </a>
          . Truva is not affiliated with or endorsed by uitf.com.ph.
        </p>
      </div>
    </main>
  );
}
