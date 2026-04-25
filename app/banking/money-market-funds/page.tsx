import Link from 'next/link';
import { AlertTriangle, ArrowRight, BarChart2, Info, Shield, Zap } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';
import { MmfView } from '@/components/mmf/MmfView';
import { BenchmarkRate, MoneyMarketFund } from '@/types';
import {
  formatMmfPercent,
  formatPhtDate,
} from '@/lib/mmf';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Best Money Market Funds Philippines 2026 | Truva',
  description:
    'Compare money market funds in the Philippines. See the actual yield you keep after taxes and fees, sorted from highest to lowest. PHP and USD funds.',
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

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-primary px-4 py-16 md:py-20 text-white dark:bg-slate-950">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(147,197,253,0.28),transparent_52%)] opacity-90 dark:bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.18),transparent_52%)]" />
        <div className="relative mx-auto max-w-3xl flex flex-col items-center text-center z-10">

          <h1 className="mb-4 text-4xl font-extrabold leading-[1.08] tracking-tight md:text-[3.25rem]">
            Your money,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-blue-400 dark:from-blue-300 dark:to-blue-500">
              working harder.
            </span>
          </h1>

          <p className="mb-8 max-w-xl text-lg font-medium text-blue-100/90 dark:text-gray-300">
            We&apos;ve done the math — taxes and fees are already deducted. What you see is what you actually keep.
          </p>

          <div className="flex justify-center mb-8 w-full max-w-md">
            <a
              href="#mmf-table"
              className="inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-white px-6 text-[15px] font-semibold text-brand-primary shadow-lg shadow-black/10 transition-all hover:-translate-y-0.5 hover:shadow-xl"
            >
              Compare funds
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { icon: Zap, label: 'Withdraw in 1–5 days' },
              { icon: Shield, label: 'Not PDIC-insured' },
              { icon: BarChart2, label: 'Yields shown after tax' },
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

        {/* MMF Explainer — simple, for newbies */}
        <section className="mb-6 rounded-2xl border border-brand-primary/15 bg-brand-primaryLight/30 p-5 dark:border-brand-primary/20 dark:bg-brand-primary/[0.06]">
          <h2 className="text-base font-bold text-brand-textPrimary dark:text-white">What is a Money Market Fund?</h2>
          <p className="mt-2 text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
            Think of it like a savings account with higher returns. Your money is pooled with other investors and placed in safe, short-term assets like government bonds. You can withdraw in 1–5 business days — no lock-in period.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800 dark:bg-green-500/15 dark:text-green-400">Low risk</span>
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800 dark:bg-blue-500/15 dark:text-blue-400">Liquid — no lock-in</span>
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-500/15 dark:text-amber-400">Not PDIC-insured</span>
          </div>
        </section>

        {/* Benchmark metrics */}
        <section className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
            PH Govt Benchmark
          </p>
          <p className="mt-2 text-2xl font-bold tabular-nums text-brand-textPrimary dark:text-white">
            {benchmark ? formatMmfPercent(benchmark.rate) : '-'}
          </p>
          <p className="mt-1 text-xs text-brand-textSecondary/60 dark:text-white/40">
            91-day T-Bill · {formatPhtDate(benchmark?.date)}
          </p>
        </div>

        <div className="rounded-2xl border border-brand-border bg-brand-surface p-4 dark:border-white/10 dark:bg-white/[0.04]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-textSecondary/60 dark:text-white/40">
            US Dollar Benchmark
          </p>
          <p className="mt-2 text-2xl font-bold tabular-nums text-brand-textPrimary dark:text-white">
            {usdBenchmark ? formatMmfPercent(usdBenchmark.rate) : '-'}
          </p>
          <p className="mt-1 text-xs text-brand-textSecondary/60 dark:text-white/40">
            90-day US T-Bill · {formatPhtDate(usdBenchmark?.date)}
          </p>
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

      {/* Risk disclosure banner */}
      <div className="mb-6 flex gap-3 rounded-2xl border border-warning/25 bg-warning/10 px-4 py-3 text-sm dark:border-warning/20 dark:bg-warning/[0.06]">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
        <p className="break-words leading-relaxed text-brand-textSecondary dark:text-gray-300">
          <strong className="font-semibold text-brand-textPrimary dark:text-white">Not PDIC-insured</strong> — unlike savings accounts, these funds are not covered by government deposit insurance. Want zero risk? Try a{' '}
          <Link href="/" className="underline underline-offset-2 hover:text-brand-primary">
            high-yield savings account
          </Link>{' '}
          instead.
        </p>
      </div>

      <div id="mmf-table">
        <MmfView phpFunds={phpFunds} usdFunds={usdFunds} />
      </div>

      <div className="mt-8 space-y-2 border-t border-brand-border pt-6 dark:border-white/10">
        <p className="text-xs leading-relaxed text-brand-textSecondary/55 dark:text-white/35">
          Truva may earn referral fees via our links — this never affects rankings. Past yields are not guaranteed. UITFs and mutual funds are <strong>not PDIC-insured</strong>.
        </p>
        <p className="text-xs leading-relaxed text-brand-textSecondary/55 dark:text-white/35">
          Data sourced from{' '}
          <a href="https://uitf.com.ph" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-brand-textSecondary dark:hover:text-white/60">uitf.com.ph</a>{' '}
          and PIFA. Truva is not affiliated with or endorsed by these providers.
        </p>
      </div>
      </div>
    </main>
  );
}
