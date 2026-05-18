'use client';

import { ArrowRight } from 'lucide-react';
import { sendGAEvent } from '@next/third-parties/google';
import { cn } from '@/lib/utils';

interface Props {
  /** Bank's public apply/info URL (CreditCard.source_url). */
  href: string;
  bank: string;
  cardKey: string;
  label?: string;
  className?: string;
}

/**
 * Isolated apply click handler. Today it links directly to the bank's
 * `source_url` because there is no credit-card affiliate redirect route yet
 * (`/go/[slug]` is rates-only). Keeping the click logic in one component
 * means it can be upgraded to a tracked `/go/cc/[key]` route in one place
 * without touching every result/detail surface (Mardil amendment 6).
 */
export function ApplyOnBankSiteButton({
  href,
  bank,
  cardKey,
  label,
  className,
}: Props) {
  return (
    <a
      href={href}
      target="_blank"
      rel="nofollow noopener noreferrer"
      onClick={() =>
        sendGAEvent({
          event: 'cc_apply_click',
          product: cardKey,
          provider: bank,
          placement: 'credit-card-finder',
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
