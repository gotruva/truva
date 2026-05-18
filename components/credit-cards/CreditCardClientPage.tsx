'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { FinderFlow } from './finder/FinderFlow';
import { CreditCardLabelExplainer } from './CreditCardLabelExplainer';
import { CreditCardMethodologySection } from './CreditCardMethodologySection';
import { EducationalGuidesSection } from './EducationalGuidesSection';
import { NewsletterSignup } from '@/components/NewsletterSignup';
import { CreditCardHero } from './CreditCardHero';
import type { CreditCard as CreditCardType } from '@/types';

function FinderFallback({ cards }: { cards: CreditCardType[] }) {
  // Rendered until the client reads the URL step param. The hero is the
  // landing state, so this is a faithful, non-flashing placeholder.
  return (
    <CreditCardHero
      cards={cards}
      onStart={() => {}}
      onBrowse={() => {}}
    />
  );
}

export function CreditCardClientPage({ cards }: { cards: CreditCardType[] }) {
  return (
    <div className="bg-white dark:bg-slate-950">
      {/* Guided finder: landing → 5-question quiz → matching */}
      <Suspense fallback={<FinderFallback cards={cards} />}>
        <FinderFlow cards={cards} />
      </Suspense>

      {/* Below-the-fold context — unchanged from the previous page */}
      <CreditCardLabelExplainer />

      <div className="bg-brand-surface/30 dark:bg-white/5">
        <CreditCardMethodologySection />
      </div>

      <EducationalGuidesSection />

      <section className="mx-auto max-w-7xl border-t border-brand-border px-4 py-16 dark:border-white/10">
        <div className="rounded-3xl bg-slate-900 p-8 text-center text-white dark:bg-slate-800 md:p-12">
          <h2 className="text-2xl font-bold md:text-3xl">Partner Disclosure</h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-300">
            Truva is free for everyone. We may earn a referral fee from some of the banks listed on
            this page when you apply through our links. This does not change the data we show or how
            we score products. Our mission is to provide accurate, plain-English comparison data for
            Filipinos.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/methodology/editorial-integrity"
              className="text-sm font-semibold underline underline-offset-4 transition-colors hover:text-brand-primary"
            >
              Read our Editorial Integrity
            </Link>
            <span className="text-slate-700">|</span>
            <Link
              href="/terms"
              className="text-sm font-semibold underline underline-offset-4 transition-colors hover:text-brand-primary"
            >
              Terms of Use
            </Link>
          </div>
        </div>
      </section>

      <div className="border-t border-brand-border bg-white dark:border-white/10 dark:bg-slate-950">
        <NewsletterSignup />
      </div>
    </div>
  );
}
