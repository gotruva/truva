'use client';

import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Banknote } from 'lucide-react';
import type { RateProduct } from '@/types';
import { formatRate } from '@/utils/yieldEngine';

interface SavingsPick {
  product: RateProduct;
}

interface SavingsRouterCardProps {
  rates: RateProduct[];
}

const STORAGE_KEY = 'truva.compare-hub-state.v1';
const HUB_STATE_EVENT = 'truva:hub-state-update';
const DEFAULT_AMOUNT = 50000;
const DEFAULT_MONTHS = 12;

function getBestSavingsPick(rates: RateProduct[]): SavingsPick | null {
  const ranked = rates
    .filter((rate) => rate.category === 'banks' && rate.headlineRate > 0)
    .map((product) => ({ product }))
    .sort((left, right) => right.product.headlineRate - left.product.headlineRate);

  return ranked[0] ?? null;
}

export function SavingsRouterCard({ rates }: SavingsRouterCardProps) {
  const router = useRouter();
  const [amount, setAmount] = useState(DEFAULT_AMOUNT);
  const savingsPick = useMemo(() => getBestSavingsPick(rates), [rates]);

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
    router.push('/banking');
  };

  const handleAmountChange = (event: ChangeEvent<HTMLInputElement>) => {
    const digits = event.target.value.replace(/[^0-9]/g, '');
    setAmount(digits ? Number.parseInt(digits, 10) : 0);
  };

  return (
    <article className="relative overflow-hidden rounded-2xl border border-brand-border bg-white shadow-[0_24px_70px_-55px_rgba(15,23,42,0.45)] transition-transform duration-200 hover:-translate-y-1 motion-reduce:hover:translate-y-0 dark:border-white/10 dark:bg-white/[0.04]">
      <span className="absolute inset-x-0 top-0 h-1 bg-brand-primary" aria-hidden="true" />
      <form onSubmit={handleSubmit} className="flex h-full flex-col p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primaryLight text-brand-primary dark:bg-brand-primary/15 dark:text-blue-300">
            <Banknote className="h-6 w-6" aria-hidden="true" />
          </div>
          <span className="rounded-full bg-positive/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-positive">
            Live
          </span>
        </div>

        <h2 className="mt-5 text-xl font-black leading-tight text-brand-textPrimary dark:text-white">
          Savings &amp; Deposits
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-brand-textSecondary dark:text-gray-400">
          Bank savings · Time deposits
        </p>

        <div className="mt-5 rounded-xl bg-brand-primaryLight p-4 dark:bg-brand-primary/15">
          {savingsPick ? (
            <>
              <p className="text-[32px] font-black leading-none tabular-nums text-brand-primary">
                {formatRate(savingsPick.product.headlineRate)}
              </p>
              <p className="mt-1 text-xs text-brand-textSecondary dark:text-gray-300">
                top rate · as advertised
              </p>
              <p className="mt-2 text-[11px] leading-snug text-brand-textSecondary dark:text-gray-400">
                Current pick: {savingsPick.product.provider} — {savingsPick.product.name}.
              </p>
            </>
          ) : (
            <>
              <p className="text-xl font-black text-brand-textPrimary dark:text-white">
                Live preview unavailable
              </p>
              <p className="mt-2 text-[11px] leading-snug text-brand-textSecondary dark:text-gray-400">
                The rate desk still opens with the full comparison table.
              </p>
            </>
          )}
        </div>

        <div className="mt-5">
          <label
            htmlFor="landing-savings-amount"
            className="text-xs font-bold uppercase tracking-[0.06em] text-brand-textSecondary dark:text-gray-400"
          >
            Your amount to compare
          </label>
          <div className="mt-2 flex h-11 items-center rounded-lg border border-brand-border bg-white px-3 dark:border-white/10 dark:bg-slate-950">
            <span className="pr-2 text-sm font-bold text-brand-textSecondary dark:text-gray-400">
              ₱
            </span>
            <input
              id="landing-savings-amount"
              inputMode="numeric"
              value={amount ? amount.toLocaleString('en-PH') : ''}
              onChange={handleAmountChange}
              className="h-full min-w-0 flex-1 bg-transparent text-sm font-bold tabular-nums text-brand-textPrimary outline-none placeholder:text-gray-400 dark:text-white"
              placeholder="50,000"
            />
          </div>
        </div>

        <button
          type="submit"
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-primary px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-primaryDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
        >
          Compare savings
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </form>
    </article>
  );
}
