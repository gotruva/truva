'use client';

import { Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSavedCards } from './useSavedCards';
import { trackCardSaved, trackCardUnsaved } from '@/lib/analytics/creditCards';

interface Props {
  cardKey: string;
  bank: string;
  /** Where the toggle happened, for analytics (e.g. "credit-card-results"). */
  sourcePage: string;
  /** Icon-only circular button (for dense card headers). */
  compact?: boolean;
  className?: string;
}

/**
 * Toggle that adds/removes a card from the localStorage shortlist (B5).
 * SSR and the pre-hydration client render both show the unsaved state (the
 * store reads empty on the server), so there is no hydration flash.
 */
export function SaveCardButton({ cardKey, bank, sourcePage, compact, className }: Props) {
  const { isSaved, toggle } = useSavedCards();
  const saved = isSaved(cardKey);

  const handleClick = () => {
    const nowSaved = toggle(cardKey);
    if (nowSaved) trackCardSaved({ cardKey, bank, sourcePage });
    else trackCardUnsaved({ cardKey, bank, sourcePage });
  };

  const stateClass = saved
    ? 'border-brand-primary/30 bg-brand-primaryLight text-brand-primary dark:bg-brand-primary/15'
    : 'border-brand-border bg-white text-brand-textSecondary hover:border-brand-primary/30 hover:text-brand-primary dark:border-white/10 dark:bg-white/5 dark:text-gray-300';
  const label = saved ? 'Remove from saved cards' : 'Save this card';

  const focusRing =
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950';

  if (compact) {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={saved}
        aria-label={label}
        title={label}
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-full border transition-colors',
          focusRing,
          stateClass,
          className,
        )}
      >
        <Bookmark className={cn('h-4 w-4', saved && 'fill-current')} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={saved}
      aria-label={label}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
        focusRing,
        stateClass,
        className,
      )}
    >
      <Bookmark className={cn('h-3.5 w-3.5', saved && 'fill-current')} />
      {saved ? 'Saved' : 'Save'}
    </button>
  );
}
