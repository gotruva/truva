'use client';

import { useState } from 'react';
import { ArrowRight, Calculator, Lock, CheckCircle2 } from 'lucide-react';

interface HeroSectionProps {
  formattedDate?: string;
}

const TRUST_PILLS = [
  { icon: Calculator, label: 'After-tax only' },
  { icon: Lock, label: 'Conditions upfront' },
  { icon: CheckCircle2, label: 'Verified weekly' },
];

export function HeroSection({ formattedDate }: HeroSectionProps) {
  const [rawAmount, setRawAmount] = useState('100000');

  const displayValue = rawAmount
    ? Number(rawAmount).toLocaleString('en-PH')
    : '';

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/[^0-9]/g, '');
    setRawAmount(digits);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(rawAmount || '0', 10);
    if (amount > 0 && typeof window !== 'undefined') {
      try {
        const STORAGE_KEY = 'truva.compare-hub-state.v1';
        const existing = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) || '{}');
        window.sessionStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            ...existing,
            topSection: 'advanced-compare',
            comparisonState: {
              ...(existing.comparisonState || {}),
              amount,
            },
          })
        );
      } catch {
        // sessionStorage unavailable — scroll still works
      }
      document.getElementById('deposit-rates')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative overflow-hidden bg-brand-primary px-4 py-20 text-white transition-colors duration-300 md:px-8 dark:bg-slate-950">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(147,197,253,0.28),transparent_52%)] opacity-90 dark:bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.18),transparent_52%)]" />

      <div className="relative max-w-3xl mx-auto flex flex-col items-center text-center z-10">


        <h1 className="mb-4 text-4xl font-extrabold leading-[1.08] tracking-tight md:text-[3.25rem]">
          Find where your peso{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-blue-400 dark:from-blue-300 dark:to-blue-500">
            earns the most
          </span>
          <br />
          after tax, after conditions
        </h1>

        <p className="mb-8 max-w-xl text-lg font-medium text-blue-100/90 dark:text-gray-300">
          No guessing. No fine print. Just the real number — what you actually keep.
        </p>

        {/* Amount input */}
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-lg mb-6"
        >
          <div className="flex flex-col gap-2 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md p-2 shadow-lg shadow-black/10 dark:bg-white/[0.07] sm:flex-row sm:items-center sm:p-1.5">
            <div className="flex flex-1 items-center gap-2 px-2 py-1 sm:pl-3 sm:py-0">
              <span className="text-[15px] font-medium text-blue-200 shrink-0">I&apos;m saving</span>
              <span className="text-[15px] font-bold text-white shrink-0">₱</span>
              <input
                type="text"
                inputMode="numeric"
                value={displayValue}
                onChange={handleInput}
                placeholder="100,000"
                className="flex-1 min-w-0 bg-transparent text-[15px] font-bold text-white placeholder:text-blue-300/60 outline-none caret-white"
                aria-label="Savings amount in pesos"
              />
            </div>
            <button
              type="submit"
              className="inline-flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 text-[15px] font-semibold text-brand-primary shadow-md shadow-black/10 transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] sm:w-auto"
            >
              See my returns
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Trust pills */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {TRUST_PILLS.map((pill) => {
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
  );
}
