import { Suspense } from 'react';
import type { Metadata } from 'next';

import { getPublicRates, getLatestVerifiedDate, formatVerifiedDate } from '@/lib/rates';
import { SavingsLandingClient } from '@/components/banking/SavingsLandingClient';
import { SavingsFAQ } from '@/components/banking/SavingsFAQ';
import { FAQ_ITEMS } from '@/components/banking/faq-data';

export const metadata: Metadata = {
  title: 'Best Savings Accounts & Time Deposits Philippines 2025 — Truva',
  description:
    'Find the highest-paying savings account or time deposit for your amount and timeline. Compare rates from Maya, GoTyme, Tonik, SeaBank, UNO, and more — plus Pag-IBIG MP2.',
  alternates: {
    canonical: '/banking',
  },
};

export const dynamic = 'force-dynamic';

// Static — no await needed, computed once at module level
const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_ITEMS.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.a,
    },
  })),
};

// Async shell that fetches rates and passes them to the client component.
// Keeping this separate from BankingPage lets Next.js stream the fallback
// skeleton immediately while this component resolves the Supabase call.
async function BankingContent() {
  const rates = await getPublicRates();
  const latestDate = getLatestVerifiedDate(rates);
  const lastVerified = latestDate ? formatVerifiedDate(latestDate) : '';
  return <SavingsLandingClient rates={rates} lastVerified={lastVerified} />;
}

export default function BankingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Suspense
        fallback={
          <div className="mx-auto max-w-4xl px-4 py-8 space-y-10 sm:px-6">
            <section aria-labelledby="form-heading">
              <div className="rounded-2xl border border-brand-border bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03] space-y-6">
                <div>
                  <h1
                    id="form-heading"
                    className="text-2xl font-bold tracking-tight text-brand-textPrimary dark:text-white sm:text-3xl"
                  >
                    Find your best savings home in 30 seconds.
                  </h1>
                  <p className="mt-2 text-sm text-brand-textSecondary dark:text-white/60">
                    Three questions. We match you to the highest-paying option that fits.
                  </p>
                </div>
                <div className="h-48 rounded-xl bg-gray-100 dark:bg-white/5" />
              </div>
            </section>
          </div>
        }
      >
        <BankingContent />
      </Suspense>
      <div className="mx-auto max-w-4xl px-4 pb-12 sm:px-6">
        <SavingsFAQ />
      </div>
    </>
  );
}
