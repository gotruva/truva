'use client';

import { ArrowRight, BadgeCheck, ShieldCheck, Sparkles } from 'lucide-react';
import { CreditCardHeroCarousel } from './CreditCardHeroCarousel';
import { SavedCardsEntry } from './shared/SavedCardsEntry';
import { LANDING } from '@/lib/creditCardFinder/copy';
import type { CreditCard as CreditCardType } from '@/types';

interface Props {
  cards: CreditCardType[];
  onStart: () => void;
  onBrowse: () => void;
  hasResume?: boolean;
  onResume?: () => void;
}

const TRUST_ICONS = [BadgeCheck, ShieldCheck, Sparkles];

export function CreditCardHero({
  cards,
  onStart,
  onBrowse,
  hasResume = false,
  onResume,
}: Props) {
  return (
    <section className="relative overflow-hidden bg-white dark:bg-slate-950">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute -left-[5%] -top-[10%] h-[55%] w-[40%] rounded-full bg-brand-primary/5 blur-[120px] dark:bg-brand-primary/10" />
        <div className="absolute -bottom-[10%] -right-[5%] h-[55%] w-[40%] rounded-full bg-emerald-500/5 blur-[120px] dark:bg-emerald-500/10" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-12 md:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Copy column */}
          <div className="flex flex-col items-start">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-primary/10 bg-brand-primaryLight px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-brand-primary dark:bg-brand-primary/10">
              {LANDING.eyebrow}
            </span>

            <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-brand-textPrimary dark:text-white md:text-4xl lg:text-5xl">
              {LANDING.h1}
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-brand-textSecondary dark:text-gray-300 md:text-lg">
              {LANDING.sub}
            </p>

            <div className="mt-7 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <button
                type="button"
                onClick={onStart}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-primary px-7 text-[15px] font-bold text-white shadow-lg shadow-brand-primary/20 transition-all hover:bg-brand-primaryDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
              >
                {LANDING.primaryCta}
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={onBrowse}
                className="inline-flex h-12 items-center justify-center rounded-xl border border-brand-border bg-white px-7 text-[15px] font-bold text-brand-textPrimary transition-colors hover:bg-brand-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 dark:focus-visible:ring-offset-slate-950"
              >
                {LANDING.secondaryCta}
              </button>
            </div>

            {hasResume && onResume && (
              <button
                type="button"
                onClick={onResume}
                className="mt-3 text-sm font-semibold text-brand-primary underline-offset-4 hover:underline"
              >
                {LANDING.resumeCta} →
              </button>
            )}

            <SavedCardsEntry className="mt-3" />

            {/* Trust block */}
            <div className="mt-9 w-full">
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.12em] text-brand-textSecondary dark:text-gray-400">
                {LANDING.trustHeading}
              </p>
              <div className="space-y-3">
                {LANDING.trust.map((t, i) => {
                  const Icon = TRUST_ICONS[i] ?? Sparkles;
                  return (
                    <div key={t.title} className="flex items-start gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-primaryLight text-brand-primary dark:bg-brand-primary/15">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-sm font-bold text-brand-textPrimary dark:text-white">
                          {t.title}
                        </p>
                        <p className="mt-0.5 text-xs leading-relaxed text-brand-textSecondary dark:text-gray-400">
                          {t.body}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Visual column */}
          <div className="lg:order-last">
            <CreditCardHeroCarousel cards={cards} />
          </div>
        </div>
      </div>
    </section>
  );
}
