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

export default async function BankingPage() {
  const rates = await getPublicRates();
  const latestDate = getLatestVerifiedDate(rates);
  const lastVerified = latestDate ? formatVerifiedDate(latestDate) : '';

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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Suspense fallback={<div className="h-screen" />}>
        <SavingsLandingClient rates={rates} lastVerified={lastVerified} />
      </Suspense>
      <div className="mx-auto max-w-4xl px-4 pb-12 sm:px-6">
        <SavingsFAQ />
      </div>
    </>
  );
}
