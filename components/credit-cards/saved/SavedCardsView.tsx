'use client';

import { useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { Bookmark, ChevronLeft, ExternalLink, Trash2, X } from 'lucide-react';
import type { CreditCard } from '@/types';
import { cn } from '@/lib/utils';
import { useSavedCards } from '../shared/useSavedCards';
import { CreditCardVisual } from '../CreditCardVisual';
import { AffiliateDisclosure } from '../shared/AffiliateDisclosure';
import {
  deriveAnnualFeeLabel,
  deriveBestForLabel,
  deriveMinIncomeLabel,
} from '@/lib/creditCardFinder/rank';
import { trackSavedPageViewed } from '@/lib/analytics/creditCards';

export function SavedCardsView({ cards }: { cards: CreditCard[] }) {
  const { saved, hydrated, remove, clear } = useSavedCards();
  const viewedRef = useRef(false);

  // Keep the user's save order; ignore keys that no longer resolve to a card.
  const savedCards = useMemo(() => {
    const order = new Map(saved.map((k, i) => [k, i] as const));
    return cards
      .filter((c) => order.has(c.normalized_card_key))
      .sort(
        (a, b) =>
          (order.get(a.normalized_card_key) ?? 0) -
          (order.get(b.normalized_card_key) ?? 0),
      );
  }, [cards, saved]);

  useEffect(() => {
    if (hydrated && !viewedRef.current) {
      viewedRef.current = true;
      trackSavedPageViewed({ count: saved.length });
    }
  }, [hydrated, saved.length]);

  return (
    <div className="min-h-screen bg-brand-surface dark:bg-slate-950">
      <div className="border-b border-brand-border bg-white px-4 pb-6 pt-3 dark:border-white/10 dark:bg-slate-950">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/credit-cards"
            className="-ml-1 inline-flex items-center gap-1 text-sm font-semibold text-brand-textSecondary transition-colors hover:text-brand-primary dark:text-gray-400"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to card finder
          </Link>
          <div className="mt-3 flex items-start justify-between gap-4">
            <h1 className="text-2xl font-bold tracking-tight text-brand-textPrimary dark:text-white sm:text-3xl">
              Your saved cards
            </h1>
            {hydrated && savedCards.length > 0 && (
              <button
                type="button"
                onClick={clear}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-semibold text-brand-textSecondary transition-colors hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary dark:text-gray-400"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear all
              </button>
            )}
          </div>
          <p className="mt-2 text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
            Saved only on this device — no account needed. Clearing your browser data removes them.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-6">
        {!hydrated ? (
          <p className="py-12 text-center text-sm text-brand-textSecondary dark:text-gray-400">
            Loading your saved cards…
          </p>
        ) : savedCards.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-4">
            {savedCards.map((card) => (
              <SavedCardItem
                key={card.id}
                card={card}
                onRemove={() => remove(card.normalized_card_key)}
              />
            ))}
            <p className="px-1 pt-2 text-[11px] leading-relaxed text-brand-textSecondary dark:text-gray-500">
              This is not financial advice.
            </p>
            <AffiliateDisclosure size="footer" />
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-brand-border bg-white p-8 text-center dark:border-white/10 dark:bg-white/[0.04]">
      <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-primaryLight text-brand-primary dark:bg-brand-primary/15">
        <Bookmark className="h-5 w-5" />
      </span>
      <h2 className="text-base font-bold text-brand-textPrimary dark:text-white">
        No saved cards yet
      </h2>
      <p className="mx-auto mt-1 max-w-sm text-sm text-brand-textSecondary dark:text-gray-400">
        Tap the bookmark on any card to save it here and compare later.
      </p>
      <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
        <Link
          href="/credit-cards"
          className="inline-flex items-center justify-center rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
        >
          Find a card
        </Link>
        <Link
          href="/credit-cards/all"
          className="inline-flex items-center justify-center rounded-xl border border-brand-border bg-white px-5 py-2.5 text-sm font-semibold text-brand-textPrimary transition-colors hover:bg-brand-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary dark:border-white/10 dark:bg-white/5 dark:text-white"
        >
          Browse all cards
        </Link>
      </div>
    </div>
  );
}

function SavedCardItem({
  card,
  onRemove,
}: {
  card: CreditCard;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-2xl border border-brand-border bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
      <div className="flex gap-4">
        <div className="w-24 shrink-0 sm:w-28">
          <CreditCardVisual card={card} compact />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-brand-textSecondary dark:text-gray-400">
                {card.bank}
              </p>
              <h3 className="text-base font-bold leading-tight tracking-tight text-brand-textPrimary dark:text-white">
                {card.card_name}
              </h3>
            </div>
            <button
              type="button"
              onClick={onRemove}
              aria-label={`Remove ${card.card_name} from saved`}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-brand-border text-brand-textSecondary transition-colors hover:border-red-300 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary dark:border-white/10 dark:text-gray-400"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <dl className="mt-3 grid grid-cols-2 gap-y-2.5 border-t border-dashed border-brand-border pt-3 dark:border-white/10">
            <Fact label="Yearly fee" value={deriveAnnualFeeLabel(card)} />
            <Fact label="Min. income" value={deriveMinIncomeLabel(card)} />
            <Fact label="Good for" value={deriveBestForLabel(card)} span />
          </dl>
        </div>
      </div>

      <AffiliateDisclosure size="compact" className="mt-3" />

      <div className="mt-2 flex gap-2">
        <Link
          href={`/credit-cards/reviews/${encodeURIComponent(card.normalized_card_key)}`}
          className="inline-flex flex-1 items-center justify-center rounded-xl bg-brand-primaryLight px-4 py-2.5 text-sm font-semibold text-brand-primary transition-colors hover:bg-brand-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 dark:bg-brand-primary/15 dark:focus-visible:ring-offset-slate-950"
        >
          See details
        </Link>
        <a
          href={card.source_url}
          target="_blank"
          rel="nofollow noopener noreferrer"
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
        >
          Apply on bank site
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}

function Fact({
  label,
  value,
  span = false,
}: {
  label: string;
  value: string;
  span?: boolean;
}) {
  return (
    <div className={cn('px-1', span && 'col-span-2')}>
      <dt className="text-[10px] font-semibold uppercase tracking-[0.05em] text-brand-textSecondary dark:text-gray-400">
        {label}
      </dt>
      <dd className="mt-0.5 text-[13px] font-semibold leading-snug text-brand-textPrimary dark:text-white">
        {value}
      </dd>
    </div>
  );
}
