'use client';

import { useState } from 'react';
import { ArrowRight, Calculator, ShieldCheck, Layers } from 'lucide-react';

const TRUST_FEATURES = [
  {
    icon: Calculator,
    title: 'After-tax comparisons',
    desc: "Cut through advertised rates and see what you'll really earn after tax.",
  },
  {
    icon: ShieldCheck,
    title: 'Conditions upfront',
    desc: 'Know the lock-in, balance, and payout rules before you choose.',
  },
  {
    icon: Layers,
    title: 'Easy side-by-side view',
    desc: 'Compare savings accounts, time deposits, and money market funds in one view.',
  },
];

interface HeroSectionProps {
  verifiedDate?: string;
}

export function HeroSection({ verifiedDate }: HeroSectionProps) {
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

        {/* Trust verification pill */}
        {verifiedDate && (
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[13px] font-semibold text-blue-100 backdrop-blur-md">
            <span className="text-[#12B76A]">✓</span>
            Rates verified {verifiedDate}
          </div>
        )}

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
          className="w-full max-w-lg mb-8"
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
            <div className="flex gap-3 flex-wrap">
              <button
                type="submit"
                className="flex-1 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 text-[15px] font-bold text-brand-primary shadow-md shadow-black/10 transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98]"
              >
                Check my earnings
                <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href="#deposit-rates"
                className="inline-flex h-12 items-center justify-center px-6 rounded-xl bg-white/10 border border-white/25 backdrop-blur-md text-white text-[15px] font-semibold transition-all hover:-translate-y-0.5 hover:bg-white/15 active:scale-[0.98] whitespace-nowrap"
              >
                Compare all rates
              </a>
            </div>
          </div>
        </form>

        {/* Trust feature cards */}
        <div className="grid grid-cols-1 gap-3 w-full max-w-[800px] sm:grid-cols-3">
          {TRUST_FEATURES.map((feat) => (
            <div
              key={feat.title}
              className="rounded-2xl border border-white/15 bg-white/10 p-4 text-left backdrop-blur-md"
            >
              <div className="mb-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
                <feat.icon className="h-4 w-4 text-white" />
              </div>
              <p className="mb-1 text-[14px] font-semibold text-white">{feat.title}</p>
              <p className="text-[13px] leading-snug text-blue-100/85">{feat.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
