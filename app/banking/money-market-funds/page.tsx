import Link from 'next/link';
import { AlertTriangle, ArrowRight, BarChart2, CheckCircle2, RefreshCw, Shield, Zap } from 'lucide-react';
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

  const latestDate = latestRateDate ? formatPhtDate(latestRateDate) : null;

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-primary px-4 py-20 text-white dark:bg-slate-950">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(147,197,253,0.28),transparent_52%)] opacity-90 dark:bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.18),transparent_52%)]" />
        <div className="relative mx-auto max-w-3xl flex flex-col items-center text-center z-10">
          {latestDate && (
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm font-semibold backdrop-blur-md">
              <CheckCircle2 className="w-4 h-4 text-green-300" />
              <span className="text-blue-50">Rates verified {latestDate}</span>
            </div>
          )}

          <h1 className="mb-4 text-4xl font-extrabold leading-[1.08] tracking-tight md:text-[3.25rem]">
            Your money,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-blue-400 dark:from-blue-300 dark:to-blue-500">
              working harder.
            </span>
            <br />
            <span className="text-[0.88em]">Compare funds by what you actually keep.</span>
          </h1>

          <p className="mb-8 max-w-xl text-lg font-medium text-blue-100/90 dark:text-gray-300">
            Liquid investing — redeem in 1–5 business days. Net yield shown after 20% withholding tax and trust fees.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8 w-full max-w-md">
            <a
              href="#mmf-table"
              className="inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-white px-6 text-[15px] font-semibold text-brand-primary shadow-lg shadow-black/10 transition-all hover:-translate-y-0.5 hover:shadow-xl"
            >
              See all funds
              <ArrowRight className="w-4 h-4" />
            </a>
            <Link
              href="/guides"
              className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-xl border border-white/25 bg-white/10 px-6 text-[15px] font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/15"
            >
              What is a money market fund?
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { icon: Zap, label: 'Liquid — redeem in 1–5 days' },
              { icon: Shield, label: 'Not PDIC-insured' },
              { icon: BarChart2, label: 'Net yield after tax & fees' },
            ].map((pill) => {
              const Icon = pill.icon;
              return (
                <span
                  key={pill.label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm font-medium text-blue-50 backdrop-blur-md"
                >
                  <Icon className="h-3.5 w-3.5 text-blue-200" />
                  {pill.label}
                </span>
              );
            })}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Benchmark metrics */}
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

      {/* Section header above the table */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-brand-textPrimary dark:text-white">
            Ranked by net yield
          </h2>
          <p className="mt-1 text-sm text-brand-textSecondary dark:text-gray-400">
            {phpFunds.length} PHP funds · after 20% tax + trust fees
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-brand-border bg-brand-surface px-3 py-1.5 text-sm font-semibold text-brand-textSecondary dark:border-white/10 dark:bg-white/[0.05] dark:text-gray-300">
          Returns for ₱100,000
        </span>
      </div>

      <div id="mmf-table">
        <MmfView phpFunds={phpFunds} usdFunds={usdFunds} usdBenchmark={usdBenchmark} phtDate={phtDate} />
      </div>

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
      </div>
    </main>
  );
}
