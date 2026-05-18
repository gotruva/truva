import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { getCreditCards } from '@/lib/credit-cards';
import { CreditCardCatalog } from '@/components/credit-cards/CreditCardCatalog';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { AffiliateDisclosure } from '@/components/credit-cards/shared/AffiliateDisclosure';

export const metadata: Metadata = {
  title: 'Browse all credit cards | Truva',
  description:
    'Browse every Philippine credit card in plain English — yearly fees, rewards, and requirements. The guided finder is the faster way to a shortlist.',
  alternates: { canonical: '/credit-cards/all' },
};

const VALID_PILLS = new Set([
  'all',
  'first-card',
  'naffl',
  'cashback',
  'travel',
  'points',
]);

interface Props {
  searchParams: Promise<Record<string, string>>;
}

function resolvePill(filter: string | undefined): string {
  if (!filter) return 'all';
  // Fallback option deep-links here; "beginner" maps to the first-card pill.
  if (filter === 'beginner') return 'first-card';
  return VALID_PILLS.has(filter) ? filter : 'all';
}

export default async function BrowseAllCreditCardsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const cards = await getCreditCards();
  const initialPill = resolvePill(sp.filter);

  return (
    <div className="min-h-screen bg-brand-surface dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <Breadcrumbs
          items={[
            { label: 'Credit Cards', href: '/credit-cards' },
            { label: 'Browse all', href: '/credit-cards/all' },
          ]}
        />

        <div className="mt-4 flex flex-col gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-brand-textPrimary dark:text-white sm:text-3xl">
              Browse all credit cards
            </h1>
            <p className="mt-1 text-sm text-brand-textSecondary dark:text-gray-400">
              {cards.length} cards · plain-English details · check the bank&apos;s
              site before applying
            </p>
          </div>

          {/* The guided finder stays the primary path */}
          <div className="flex items-center gap-3 rounded-2xl border border-brand-primary/15 bg-brand-primaryLight px-4 py-3.5 dark:bg-brand-primary/10">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-primary text-white">
              <Sparkles className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-brand-textPrimary dark:text-white">
                Not sure which to compare?
              </p>
              <p className="text-xs text-brand-textSecondary dark:text-gray-300">
                Answer a few questions and we&apos;ll show cards that may fit you.
              </p>
            </div>
            <Link
              href="/credit-cards"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-brand-primary px-3.5 py-2 text-xs font-bold text-white transition-colors hover:bg-brand-primaryDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
            >
              Start finder
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        <div className="mt-6">
          <CreditCardCatalog cards={cards} initialPill={initialPill} key={initialPill} />
        </div>

        <AffiliateDisclosure size="footer" className="mt-8" />
      </div>
    </div>
  );
}
