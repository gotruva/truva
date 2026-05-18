'use client';

import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { trackApplyClick, type SourcePage } from '@/lib/analytics/creditCards';
import type { ResultRole } from '@/lib/creditCardFinder/rank';

interface Props {
  /** Bank's public apply/info URL (CreditCard.source_url). */
  href: string;
  bank: string;
  cardKey: string;
  /** Where this CTA lives — standardizes the `cc_apply_click` payload. */
  sourcePage: SourcePage;
  placement?: string;
  rank?: number;
  resultRole?: ResultRole;
  label?: string;
  className?: string;
}

/**
 * Isolated apply click handler. Today it links directly to the bank's
 * `source_url` because there is no credit-card affiliate redirect route yet
 * (`/go/[slug]` is rates-only). Keeping the click logic in one component
 * means it can be upgraded to a tracked `/go/cc/[key]` route in one place
 * without touching every result/detail surface (Mardil amendment 6).
 *
 * Fires `cc_apply_click` with standardized keys via the analytics util.
 */
export function ApplyOnBankSiteButton({
  href,
  bank,
  cardKey,
  sourcePage,
  placement = 'credit-card-finder',
  rank,
  resultRole,
  label,
  className,
}: Props) {
  return (
    <a
      href={href}
      target="_blank"
      rel="nofollow noopener noreferrer"
      onClick={() =>
        trackApplyClick({
          cardKey,
          bank,
          placement,
          sourcePage,
          rank,
          resultRole,
        })
      }
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-primary px-4 text-sm font-semibold text-white shadow-sm shadow-brand-primary/20 transition-colors hover:bg-brand-primaryDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950',
        className,
      )}
    >
      {label ?? `Apply on ${bank} site`}
      <ArrowRight className="h-3.5 w-3.5" />
    </a>
  );
}
