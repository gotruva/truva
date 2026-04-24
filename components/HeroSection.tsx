'use client';

import { useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export function HeroSection() {
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
          Find the best place for your{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-blue-400 dark:from-blue-300 dark:to-blue-500">
            savings in the Philippines
          </span>
        </h1>

        <p className="mb-8 max-w-xl text-lg font-medium text-blue-100/90 dark:text-gray-300">
          We compare the latest bank rates and conditions so you see exactly what you actually keep.
        </p>

        {/* Amount input */}
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-lg mb-6"
        >
          <div className="flex flex-col gap-3 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md p-4 shadow-lg shadow-black/10 dark:bg-white/[0.07]">
            <div className="text-left">
              <label htmlFor="savings-amount" className="text-[13px] font-bold uppercase tracking-wider text-blue-200/80 mb-1 block">
                How much do you want to save?
              </label>
              <div className="flex items-center gap-2 py-1">
                <span className="text-[28px] font-bold text-white shrink-0">₱</span>
                <input
                  id="savings-amount"
                  type="text"
                  inputMode="numeric"
                  value={displayValue}
                  onChange={handleInput}
                  placeholder="100,000"
                  className="flex-1 min-w-0 bg-transparent text-[28px] font-bold text-white placeholder:text-blue-300/60 outline-none caret-white"
                  aria-label="Savings amount in pesos"
                />
              </div>
            </div>
            <button
              type="submit"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white px-6 text-[15px] font-bold text-brand-primary shadow-md shadow-black/10 transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98]"
            >
              Check my earnings
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        <p className="text-sm font-medium text-blue-100/60 transition-colors dark:text-gray-400">
          <CheckCircle2 className="inline-block w-4 h-4 mb-0.5 mr-1" />
          Transparent rates and conditions, updated weekly
        </p>
      </div>
    </section>
  );
}
