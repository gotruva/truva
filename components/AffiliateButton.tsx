'use client';

import { useEffect, useRef, useState } from 'react';
import { sendGAEvent } from '@next/third-parties/google';

import { buttonVariants } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { buildTrackedAffiliateHref, trackAffiliateImpression } from '@/lib/affiliate-analytics';
import { cn } from '@/lib/utils';
import type { AffiliatePlacement } from '@/types';

interface AffiliateButtonProps {
  amount: number;
  productId: string;
  provider: string;
  category: string;
  placement: AffiliatePlacement;
  label?: string;
  className?: string;
}

export function AffiliateButton({
  amount,
  productId,
  provider,
  category,
  placement,
  label = 'Open Account',
  className,
}: AffiliateButtonProps) {
  const anchorRef = useRef<HTMLAnchorElement | null>(null);
  const [href, setHref] = useState(`/go/${productId}`);

  useEffect(() => {
    setHref(buildTrackedAffiliateHref(productId, placement));
  }, [placement, productId]);

  useEffect(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          trackAffiliateImpression({
            productId,
            provider,
            category,
            placement,
          });
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.5,
      },
    );

    observer.observe(anchor);
    return () => observer.disconnect();
  }, [category, placement, productId, provider]);

  return (
    <TooltipProvider delay={150}>
      <Tooltip>
        <TooltipTrigger
          render={
            <a
              ref={anchorRef}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                sendGAEvent({
                  event: 'affiliate_link_clicked',
                  product: productId,
                  provider,
                  placement,
                });
              }}
              className={cn(
                buttonVariants(),
                'w-full min-w-[140px] rounded-[6px] border-none bg-brand-primary text-[14px] font-semibold text-white transition-colors hover:bg-brand-primaryDark md:w-auto',
                className,
              )}
            />
          }
        >
          {label} &rarr;
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[200px] rounded-md border-none bg-brand-textPrimary p-2 text-center text-white shadow-md">
          <p className="text-xs">
            {amount > 0
              ? "We earn a referral fee if you open this account — it doesn't change the rates we show. We compare all options equally."
              : "We don't earn a referral fee from this bank — we include them because the rate is worth knowing."}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
