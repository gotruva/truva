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
    "The return you actually keep after the 20% tax and fund management fees are deducted. This is the number that matters most.",
  cashAccess:
    'How quickly you can get your money back after requesting a withdrawal: same day, next day, or a few business days.',
  vsTbill:
    'How this fund compares to government Treasury Bills (after tax). Positive = the fund is beating the T-Bill benchmark.',
  trustFee:
    "The yearly fee charged by the fund manager. For mutual funds, this is already reflected in the net yield shown.",
  grossYield:
    "The fund's 1-year return before taxes and fees. Net yield (what you keep) is the more useful number.",
  estimatedEarnings:
    "A rough annual estimate based on your entered amount and the fund's latest net yield. Actual daily returns will vary.",
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
