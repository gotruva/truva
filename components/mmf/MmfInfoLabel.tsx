'use client';

import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

type Props = {
  label: string;
  description: string;
  align?: 'left' | 'right';
  className?: string;
};

export const MMF_HELP_TEXT = {
  netYield:
    "UITF formula: Net yield = ROI-YOY x 80% - annual trust fee. Mutual fund formula: Net yield = published 1-year NAV return, which already reflects fund-level expenses.",
  cashAccess:
    'How quickly your cash is usually available after you redeem: same day, next day, or T+n banking days.',
  vsTbill:
    'Net yield minus the 91-day Treasury Bill rate after 20% Final Withholding Tax. Positive means the fund is ahead of the after-tax T-Bill benchmark.',
  trustFee:
    "The annual fee charged by the fund provider. Published NAV-based mutual-fund returns already reflect fund fees.",
  grossYield:
    "The fund's 1-year return before the 20% Final Withholding Tax and trust fees are deducted. Net yield is what you actually keep.",
  estimatedEarnings:
    "Annual estimate only — uses the latest net yield and your entered amount. Actual daily returns will vary and are not guaranteed.",
} as const;

export function MmfInfoLabel({
  label,
  description,
  align = 'left',
  className,
}: Props) {
  return (
    <TooltipProvider delay={150}>
      <Tooltip>
        <TooltipTrigger
          render={(
            <button
              type="button"
              aria-label={`${label}: ${description}`}
              className={cn(
                'inline-flex items-center gap-1.5 transition-colors hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40',
                align === 'right' && 'ml-auto',
                className,
              )}
            />
          )}
        >
          <span>{label}</span>
          <Info className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        </TooltipTrigger>
        <TooltipContent
          side="top"
          align={align === 'right' ? 'end' : 'start'}
          className="max-w-[280px] border border-gray-200 bg-white p-3 text-left text-xs font-normal leading-relaxed text-gray-900 shadow-lg dark:border-white/10 dark:bg-slate-800 dark:text-gray-100"
        >
          <p>{description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
