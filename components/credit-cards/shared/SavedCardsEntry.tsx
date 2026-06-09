'use client';

import Link from 'next/link';
import { Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSavedCards } from './useSavedCards';

/**
 * "Saved cards (N)" link to the shortlist. Renders nothing until hydrated and
 * only when the user has at least one saved card, so it never flashes an empty
 * state or causes a hydration mismatch.
 */
export function SavedCardsEntry({ className }: { className?: string }) {
  const { count, hydrated } = useSavedCards();
  if (!hydrated || count === 0) return null;

  return (
    <Link
      href="/credit-cards/saved"
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-brand-primary/20 bg-brand-primaryLight px-3 py-1.5 text-xs font-semibold text-brand-primary transition-colors hover:bg-brand-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 dark:bg-brand-primary/15 dark:focus-visible:ring-offset-slate-950',
        className,
      )}
    >
      <Bookmark className="h-3.5 w-3.5 fill-current" />
      Saved cards ({count})
    </Link>
  );
}
