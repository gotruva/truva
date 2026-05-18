import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AFFILIATE_DISCLOSURE } from '@/lib/creditCardFinder/copy';

type Size = 'compact' | 'card' | 'footer';

/**
 * The single source of truth for the affiliate disclosure (handoff §4).
 * Required next to every Apply CTA — see TRUVA_MASTER non-negotiable #5.
 *  - compact: tight line directly above/under a CTA
 *  - card:    sectioned block on the results page
 *  - footer:  muted page-bottom note
 */
export function AffiliateDisclosure({
  size = 'compact',
  className,
}: {
  size?: Size;
  className?: string;
}) {
  if (size === 'footer') {
    return (
      <p
        className={cn(
          'text-[11px] leading-relaxed text-brand-textSecondary dark:text-gray-500',
          className,
        )}
      >
        {AFFILIATE_DISCLOSURE.footer}
      </p>
    );
  }

  if (size === 'card') {
    return (
      <div
        className={cn(
          'rounded-xl border border-brand-border bg-white p-4 dark:border-white/10 dark:bg-white/5',
          className,
        )}
      >
        <p className="text-xs leading-relaxed text-brand-textSecondary dark:text-gray-300">
          <strong className="text-brand-textPrimary dark:text-white">
            {AFFILIATE_DISCLOSURE.cardLead}
          </strong>{' '}
          {AFFILIATE_DISCLOSURE.cardBody}
        </p>
      </div>
    );
  }

  return (
    <p
      className={cn(
        'flex items-start gap-1.5 text-[11px] leading-relaxed text-brand-textSecondary dark:text-gray-400',
        className,
      )}
    >
      <Info className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
      <span>{AFFILIATE_DISCLOSURE.compact}</span>
    </p>
  );
}
