import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getCreditCards } from '@/lib/credit-cards';
import { CreditCardCatalog } from '@/components/credit-cards/CreditCardCatalog';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { AffiliateDisclosure } from '@/components/credit-cards/shared/AffiliateDisclosure';
import { isLikelyConsumerCard } from '@/lib/credit-cards-display';
import type { CreditCard as CreditCardType } from '@/types';

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
  if (filter === 'beginner') return 'first-card';
  return VALID_PILLS.has(filter) ? filter : 'all';
}

function newestSourceDate(cards: CreditCardType[]): string | null {
  let newest: number | null = null;
  for (const c of cards) {
    if (!c.last_scraped_at) continue;
    const t = new Date(c.last_scraped_at).getTime();
    if (!Number.isFinite(t)) continue;
    if (newest === null || t > newest) newest = t;
  }
  if (newest === null) return null;
  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(newest));
}

export default async function BrowseAllCreditCardsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const allCards = await getCreditCards();
  const displayed = allCards.filter(isLikelyConsumerCard);
  const initialPill = resolvePill(sp.filter);

  const bankCount = new Set(displayed.map((c) => c.bank)).size;
  const latestCheck = newestSourceDate(displayed);

  return (
    <div className="min-h-screen bg-brand-surface dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <Breadcrumbs
          items={[
            { label: 'Credit Cards', href: '/credit-cards' },
            { label: 'Browse all', href: '/credit-cards/all' },
          ]}
        />

        <div className="mt-4 space-y-3">
          <h1 className="text-2xl font-bold tracking-tight text-brand-textPrimary dark:text-white sm:text-3xl">
            See the fees, rewards, and catches before you apply
          </h1>
          <p className="text-sm text-brand-textSecondary dark:text-gray-300">
            <span className="font-semibold text-brand-textPrimary dark:text-white">
              {displayed.length} cards
            </span>{' '}
            ·{' '}
            <span className="font-semibold text-brand-textPrimary dark:text-white">
              {bankCount} banks
            </span>
            {latestCheck && (
              <>
                {' '}
                · Latest source check:{' '}
                <span className="font-semibold text-brand-textPrimary dark:text-white">
                  {latestCheck}
                </span>
              </>
            )}
          </p>
          <AffiliateDisclosure size="compact" />
          <p className="text-xs text-brand-textSecondary dark:text-gray-400">
            Or try the{' '}
            <Link
              href="/credit-cards"
              className="inline-flex items-center gap-0.5 font-semibold text-brand-primary hover:underline"
            >
              guided finder
              <ArrowRight className="h-3 w-3" />
            </Link>{' '}
            — a few questions and we&apos;ll show cards that may fit you.
          </p>
        </div>

        <div className="mt-6">
          <CreditCardCatalog cards={displayed} initialPill={initialPill} key={initialPill} />
        </div>

        <AffiliateDisclosure size="footer" className="mt-8" />
      </div>
    </div>
  );
}
