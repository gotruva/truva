'use client';

import { useState } from 'react';
import { CreditCardHero } from './CreditCardHero';
import { CreditCardQuiz } from './CreditCardQuiz';
import { CreditCardCategoryChips } from './CreditCardCategoryChips';
import { CreditCardCatalog } from './CreditCardCatalog';
import { CreditCardLabelExplainer } from './CreditCardLabelExplainer';
import { CreditCardMethodologySection } from './CreditCardMethodologySection';
import { CreditCardHowItWorks } from './CreditCardHowItWorks';
import { CreditCardStatsStrip } from './CreditCardStatsStrip';
import { CreditCardTrustGrid } from './CreditCardTrustGrid';
import { EducationalGuidesSection } from './EducationalGuidesSection';
import { NewsletterSignup } from '@/components/NewsletterSignup';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import type { CreditCard as CreditCardType } from '@/types';
import Link from 'next/link';

export function CreditCardClientPage({ cards }: { cards: CreditCardType[] }) {
  const [activePill, setActivePill] = useState('all');

  const handleSelectCategory = (id: string) => {
    setActivePill(id);
    document.getElementById('cards')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-white dark:bg-slate-950">
      {/* Hero Section */}
      <CreditCardHero cards={cards} />

      {/* Breadcrumbs */}
      <div className="mx-auto max-w-7xl px-4 py-4">
        <Breadcrumbs items={[{ label: 'Credit Cards', href: '/credit-cards' }]} />
      </div>

      {/* How it works — sets expectations before the quiz */}
      <CreditCardHowItWorks />

      {/* Quiz Section */}
      <section className="bg-brand-surface/30 dark:bg-white/5 py-12">
        <div className="mx-auto max-w-3xl text-center px-4 mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-brand-textPrimary dark:text-white">
            Not sure where to start?
          </h2>
          <p className="mt-4 text-lg text-brand-textSecondary dark:text-gray-400">
            Answer a few quick questions and we&apos;ll show you the best matches for your lifestyle.
          </p>
        </div>
        <CreditCardQuiz />
      </section>

      {/* Category Chips */}
      <section className="py-8 border-b border-brand-border dark:border-white/10">
        <CreditCardCategoryChips activeId={activePill} onSelect={handleSelectCategory} />
      </section>

      {/* Stats strip — honest numbers from live data */}
      <CreditCardStatsStrip cards={cards} />

      {/* Main Catalog Table */}
      <div className="bg-[#F8F9FB] dark:bg-slate-950 py-16">
        <div className="mx-auto max-w-7xl px-4">
          <CreditCardCatalog cards={cards} initialPill={activePill} key={activePill} />
        </div>
      </div>

      {/* Trust grid — addresses Filipino user anxieties */}
      <div className="border-t border-brand-border dark:border-white/10">
        <CreditCardTrustGrid />
      </div>

      {/* Fee Explainer / Label */}
      <CreditCardLabelExplainer />

      {/* Methodology Block */}
      <div className="bg-brand-surface/30 dark:bg-white/5">
        <CreditCardMethodologySection />
      </div>

      {/* Educational Guides */}
      <EducationalGuidesSection />

      {/* Partner Disclosure */}
      <section className="mx-auto max-w-7xl px-4 py-16 border-t border-brand-border dark:border-white/10">
        <div className="rounded-3xl bg-slate-900 p-8 text-center text-white dark:bg-slate-800 md:p-12">
          <h2 className="text-2xl font-bold md:text-3xl">Partner Disclosure</h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-300">
            Truva is free for everyone. We may earn a referral fee from some of the banks listed on this page when you apply through our links. This does not change the data we show or how we score products. Our mission is to provide the most accurate after-tax and reward-adjusted data for Filipinos.
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

      {/* Newsletter Signup */}
      <div className="bg-white dark:bg-slate-950 border-t border-brand-border dark:border-white/10">
        <NewsletterSignup />
      </div>
    </div>
  );
}
