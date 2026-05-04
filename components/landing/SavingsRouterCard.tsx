'use client';

import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, BarChart3, Landmark } from 'lucide-react';
import type { RateProduct } from '@/types';
import { computeEffectiveRate, computeReturn, formatPHP, formatRate } from '@/utils/yieldEngine';

interface SavingsPick {
  product: RateProduct;
  effectiveRate: number;
  projectedReturn: number;
}

interface SavingsRouterCardProps {
  rates: RateProduct[];
}

const STORAGE_KEY = 'truva.compare-hub-state.v1';
const HUB_STATE_EVENT = 'truva:hub-state-update';
const DEFAULT_AMOUNT = 100000;
const DEFAULT_MONTHS = 12;

function getBestSavingsPick(rates: RateProduct[], amount: number): SavingsPick | null {
  const bankRates = rates.filter((rate) => rate.category === 'banks');
  const ranked = bankRates
    .map((product) => ({
      product,
      effectiveRate: computeEffectiveRate(amount, product),
      projectedReturn: computeReturn(amount, product, DEFAULT_MONTHS),
    }))
    .filter((pick) => pick.effectiveRate > 0)
    .sort((left, right) => right.projectedReturn - left.projectedReturn);

  return ranked[0] ?? null;
}

export function SavingsRouterCard({ rates }: SavingsRouterCardProps) {
  const router = useRouter();
  const [amount, setAmount] = useState(DEFAULT_AMOUNT);
  const savingsPick = useMemo(() => getBestSavingsPick(rates, amount || DEFAULT_AMOUNT), [amount, rates]);

  const saveSavingsPrefill = () => {
    if (typeof window === 'undefined') return;

    const safeAmount = amount > 0 ? amount : DEFAULT_AMOUNT;
    try {
      window.sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          topSection: 'advanced-compare',
          quickMatchAnswers: null,
          comparisonState: {
            amount: safeAmount,
            months: DEFAULT_MONTHS,
            liquidityFilter: 'all',
            payoutFilter: 'all',
            includePdicOnly: false,
          },
        })
      );
      window.dispatchEvent(new CustomEvent(HUB_STATE_EVENT));
    } catch {
      // Session storage is optional; the rate desk still works without the prefill.
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    saveSavingsPrefill();
    router.push('/banking/rates#rate-desk');
  };

  const handleAmountChange = (event: ChangeEvent<HTMLInputElement>) => {
    const digits = event.target.value.replace(/[^0-9]/g, '');
    setAmount(digits ? Number.parseInt(digits, 10) : 0);
  };

  return (
    <article className="rounded-lg border border-brand-primary/20 bg-white p-5 shadow-[0_24px_70px_-50px_rgba(0,82,255,0.55)] transition-transform duration-200 hover:-translate-y-1 motion-reduce:hover:translate-y-0 dark:border-brand-primary/25 dark:bg-white/[0.06] sm:col-span-2 lg:col-span-1">
      <form onSubmit={handleSubmit} className="flex h-full flex-col">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-primary text-white">
              <Landmark className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-semibold text-brand-primary">Live rate desk</p>
              <h2 className="text-xl font-black leading-tight text-brand-textPrimary dark:text-white">
                Savings & deposits
              </h2>
            </div>
          </div>
          <BarChart3 className="h-5 w-5 shrink-0 text-brand-primary" aria-hidden="true" />
        </div>

        <div className="mt-5 rounded-md border border-brand-border bg-brand-surface p-4 dark:border-white/10 dark:bg-slate-950/60">
          <p className="text-xs font-semibold text-brand-textSecondary dark:text-gray-500">
            Best preview for your amount
          </p>
          {savingsPick ? (
            <>
              <p className="mt-2 text-3xl font-black tabular-nums text-brand-textPrimary dark:text-white">
                {formatRate(savingsPick.effectiveRate)}
              </p>
              <p className="mt-1 text-sm font-semibold text-brand-primary">
                {formatPHP(savingsPick.projectedReturn)} projected in 12 months after tax
              </p>
              <p className="mt-2 text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
                Current top match: {savingsPick.product.provider}, {savingsPick.product.name}.
              </p>
            </>
          ) : (
            <>
              <p className="mt-2 text-2xl font-black text-brand-textPrimary dark:text-white">
                Live preview unavailable
              </p>
              <p className="mt-2 text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
                The rate desk still opens with the full comparison table.
              </p>
            </>
          )}
        </div>

        <div className="mt-5">
          <label htmlFor="landing-savings-amount" className="text-sm font-semibold text-brand-textPrimary dark:text-gray-100">
            Amount to compare
          </label>
          <div className="mt-2 flex h-12 items-center rounded-md border border-brand-border bg-white px-3 shadow-inner dark:border-white/10 dark:bg-slate-950">
            <span className="pr-2 text-sm font-semibold text-brand-textSecondary dark:text-gray-400">PHP</span>
            <input
              id="landing-savings-amount"
              inputMode="numeric"
              value={amount ? amount.toLocaleString('en-PH') : ''}
              onChange={handleAmountChange}
              className="h-full min-w-0 flex-1 bg-transparent text-base font-bold tabular-nums text-brand-textPrimary outline-none placeholder:text-gray-400 dark:text-white"
              placeholder="100,000"
            />
          </div>
          <p className="mt-2 text-xs leading-relaxed text-brand-textSecondary dark:text-gray-400">
            This prefills the bank rate desk. No login needed.
          </p>
        </div>

        <button
          type="submit"
          className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-brand-primary px-4 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-brand-primaryDark active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 motion-reduce:hover:translate-y-0 dark:focus-visible:ring-offset-slate-950"
        >
          Compare savings
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </form>
    </article>
  );
}
