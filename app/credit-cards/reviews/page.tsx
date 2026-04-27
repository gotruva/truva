import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  ChevronLeft,
  CreditCard,
  FileSearch,
  Info,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';
import { CreditCardTrustBadges } from '@/components/credit-cards/CreditCardTrustBadges';
import { CreditCardVisual } from '@/components/credit-cards/CreditCardVisual';
import { TrueValueScoreBadge } from '@/components/product/TrueValueScoreBadge';
import { getCreditCards } from '@/lib/credit-cards';
import type { CreditCard as CreditCardType } from '@/types';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Credit Card Detail Pages Philippines',
  description:
    'Browse Philippine credit card detail pages with fees, rewards, income notes, source links, and simple missing-data labels.',
  alternates: {
    canonical: '/credit-cards/reviews',
  },
};

export default async function CreditCardReviewsPage() {
  const cards = await getCreditCards();

  return (
    <>
      <div className="min-h-screen bg-brand-surface pb-24 dark:bg-slate-950">
        <header className="relative overflow-hidden bg-brand-primary px-4 py-10 text-white">
          <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent" />
          <div className="relative z-10 mx-auto max-w-6xl">
            <Link
              href="/credit-cards"
              className="mb-6 inline-flex items-center text-sm text-white/80 transition-colors hover:text-white"
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to card desk
            </Link>
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-white/90">
                  <FileSearch className="h-4 w-4" />
                  Detail pages
                </p>
                <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
                  Inspect each card before you visit the bank site
                </h1>
                <p className="mt-3 max-w-3xl text-base leading-relaxed text-white/80">
                  These pages show the basics in plain English: fees, rewards, income notes, source links, and what is still missing.
                </p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                <TrueValueScoreBadge showReason />
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl space-y-6 px-4 pt-6 sm:-mt-8">
          <section className="grid gap-4 md:grid-cols-3">
            <TrustTile
              icon={CreditCard}
              title={`${cards.length} public rows`}
              description="The directory uses the same current card data as the main comparison page."
            />
            <TrustTile
              icon={Info}
              title="Missing data visible"
              description="Income, waiver, and incomplete reward fields are shown plainly on each detail page."
            />
            <TrustTile
              icon={ShieldCheck}
              title="Bank sources"
              description="Bank-site buttons open source pages with external-link safety attributes."
            />
          </section>

          <section className="grid gap-5 lg:grid-cols-2">
            {cards.map((card) => (
              <DetailDirectoryCard key={card.id} card={card} />
            ))}
          </section>
        </main>
      </div>
    </>
  );
}

function TrustTile({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[1.4rem] border border-brand-border bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/15">
        <Icon className="h-5 w-5" />
      </span>
      <h2 className="mt-4 text-xl font-bold text-brand-textPrimary dark:text-white">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">{description}</p>
    </div>
  );
}

function DetailDirectoryCard({ card }: { card: CreditCardType }) {
  return (
    <article className="rounded-[1.4rem] border border-brand-border bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
      <div className="grid gap-4 sm:grid-cols-[12rem_minmax(0,1fr)]">
        <CreditCardVisual card={card} compact />
        <div className="min-w-0">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary">
                {[card.card_network, card.card_tier].filter(Boolean).join(' / ') || 'Card details'}
              </p>
              <h2 className="mt-2 text-xl font-bold tracking-tight text-brand-textPrimary dark:text-white">
                {card.card_name}
              </h2>
              <p className="mt-1 text-sm text-brand-textSecondary dark:text-gray-300">{card.bank}</p>
            </div>
            <TrueValueScoreBadge compact />
          </div>

          <div className="mt-4">
            <CreditCardTrustBadges card={card} limit={3} />
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <MiniFact label="Annual fee" value={formatAnnualFee(card)} />
        <MiniFact label="Rewards" value={formatRewardType(card.rewards_type)} />
        <MiniFact label="Income" value={card.min_income_monthly === null && card.min_income_annual === null ? 'No public data' : 'Captured'} />
        <MiniFact label="Promos" value={card.active_promo_count > 0 ? `${card.active_promo_count} linked` : 'No active linked'} />
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <Link
          href={`/credit-cards/reviews/${card.normalized_card_key}`}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-primary px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-brand-primary/20 transition-colors hover:bg-brand-primary/90"
        >
          View card details
          <ArrowRight className="h-4 w-4" />
        </Link>
        <a
          href={card.source_url}
          target="_blank"
          rel="nofollow noopener noreferrer"
          className="inline-flex flex-1 items-center justify-center rounded-xl border border-brand-border bg-brand-surface px-4 py-3 text-sm font-semibold text-brand-textPrimary transition-colors hover:border-brand-primary/25 hover:text-brand-primary dark:border-white/10 dark:bg-white/[0.05] dark:text-gray-100"
        >
          Visit bank site
        </a>
      </div>
    </article>
  );
}

function MiniFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-h-[4.75rem] rounded-xl border border-brand-border bg-brand-surface/70 p-3 dark:border-white/10 dark:bg-white/[0.03]">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-textSecondary dark:text-gray-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-bold text-brand-textPrimary dark:text-white">{value}</p>
    </div>
  );
}

function formatAnnualFee(card: CreditCardType): string {
  if (card.naffl) return 'PHP 0 NAFFL';
  if (card.annual_fee_recurring === 0) return 'PHP 0';
  if (card.annual_fee_recurring !== null) return formatPhpAmount(card.annual_fee_recurring);
  if (card.annual_fee_first_year !== null) return `${formatPhpAmount(card.annual_fee_first_year)} first year`;
  return 'Not disclosed';
}

function formatRewardType(rewardType: CreditCardType['rewards_type']) {
  switch (rewardType) {
    case 'cashback':
      return 'Cashback';
    case 'miles':
      return 'Miles';
    case 'points':
      return 'Points';
    default:
      return 'None captured';
  }
}

function formatPhpAmount(amount: number) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
  }).format(amount).replace('PHP', 'PHP ');
}
