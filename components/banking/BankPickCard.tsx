/* eslint-disable @next/next/no-img-element -- local logo tiles are fixed-size decorative assets */
import Link from 'next/link';
import { ArrowRight, Calendar, Lock, ShieldCheck, AlertTriangle } from 'lucide-react';
import { TrueValueScoreBadge } from '@/components/product/TrueValueScoreBadge';
import { AffiliateButton } from '@/components/AffiliateButton';
import { Badge } from '@/components/ui/badge';
import type { BankPick } from '@/lib/banking';
import { cn } from '@/lib/utils';
import { resolveLogoSrc } from '@/lib/logo';
import { formatPHP, formatRate } from '@/utils/yieldEngine';

function formatLockIn(days: number): string {
  if (days === 0) return 'Withdraw anytime';
  const months = Math.round(days / 30.4375);
  if (months < 12) return `Locked ${months} month${months !== 1 ? 's' : ''}`;
  const years = months / 12;
  if (years % 1 === 0) return `Locked ${years} year${years !== 1 ? 's' : ''}`;
  return `Locked ${years.toFixed(1)} years`;
}

function formatPayoutFrequency(freq: string): string {
  switch (freq) {
    case 'daily':
      return 'Daily interest';
    case 'monthly':
      return 'Monthly interest';
    case 'quarterly':
      return 'Quarterly interest';
    case 'annually':
      return 'Annual interest';
    case 'at_maturity':
      return 'Paid at maturity';
    default:
      return freq;
  }
}

function clampText(text: string, maxChars = 120): string {
  if (text.length <= maxChars) return text;
  const trimmed = text.slice(0, maxChars);
  const lastSpace = trimmed.lastIndexOf(' ');
  return `${trimmed.slice(0, Math.max(0, lastSpace))}...`;
}

function InsurerBadge({ insurer }: { insurer: string }) {
  if (insurer === 'PDIC') {
    return (
      <Badge
        variant="outline"
        className="border-positive/20 bg-positive/5 text-[11px] font-bold uppercase tracking-wide text-positive dark:border-positive/25 dark:bg-positive/10"
      >
        <ShieldCheck className="h-3 w-3" /> PDIC insured
      </Badge>
    );
  }

  if (insurer === 'Bureau of Treasury' || insurer === 'Pag-IBIG Fund') {
    return (
      <Badge
        variant="outline"
        className="border-blue-500/20 bg-blue-500/5 text-[11px] font-bold uppercase tracking-wide text-blue-700 dark:border-blue-400/25 dark:bg-blue-400/10 dark:text-blue-300"
      >
        Government-backed
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="border-brand-border bg-brand-surface text-[11px] font-semibold uppercase tracking-wide text-brand-textSecondary dark:border-white/10 dark:bg-white/5 dark:text-gray-300"
    >
      Not insured
    </Badge>
  );
}

interface BankPickCardProps {
  pick: BankPick;
  amount: number;
  months: number;
  compareHref?: string;
  className?: string;
}

export function BankPickCard({
  pick,
  amount,
  months,
  compareHref = '/banking/rates#rate-desk',
  className,
}: BankPickCardProps) {
  const hasRequirements = pick.hasRequirements;

  return (
    <div
      className={cn(
        'group rounded-[1.75rem] border border-brand-border/80 bg-white p-4 shadow-[0_18px_48px_-36px_rgba(15,23,42,0.25)] transition-all hover:-translate-y-1 hover:border-brand-primary/25 hover:shadow-[0_26px_70px_-38px_rgba(0,82,255,0.3)] dark:border-white/10 dark:bg-white/[0.04] sm:p-5',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-brand-border bg-white shadow-sm dark:border-white/10 dark:bg-slate-900 sm:h-12 sm:w-12">
            <img
              src={resolveLogoSrc(pick.logo)}
              alt={pick.provider}
              className="h-7 w-7 object-contain sm:h-8 sm:w-8"
              loading="lazy"
            />
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-bold tracking-tight text-brand-textPrimary dark:text-white sm:text-lg">
              {pick.provider}
            </p>
            <p className="truncate text-xs font-medium text-brand-textSecondary dark:text-gray-300 sm:text-sm">
              Best for PHP {amount.toLocaleString()} - {pick.bestProduct.name}
            </p>
          </div>
        </div>
        <InsurerBadge insurer={pick.insurer} />
      </div>

      <div className="mt-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-primary">
            After-tax rate
          </p>
          <p className="mt-1 text-2xl font-extrabold tracking-tight text-brand-textPrimary dark:text-white sm:text-3xl">
            {formatRate(pick.effectiveRate)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-primary">
            Est. earnings
          </p>
          <p className="mt-1 text-base font-bold tabular-nums text-positive sm:text-lg">
            +{formatPHP(pick.projectedReturn)}
          </p>
          <p className="mt-0.5 text-xs font-medium text-brand-textSecondary dark:text-gray-400">
            over {months} month{months !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <TrueValueScoreBadge compact />
      </div>

      <div className="mt-5 space-y-2 text-sm text-brand-textSecondary dark:text-gray-300">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className="border-brand-border bg-brand-surface text-[11px] font-semibold dark:border-white/10 dark:bg-white/5"
          >
            <Lock className="h-3 w-3" /> {formatLockIn(pick.bestProduct.lockInDays)}
          </Badge>
          <Badge
            variant="outline"
            className="border-brand-border bg-brand-surface text-[11px] font-semibold dark:border-white/10 dark:bg-white/5"
          >
            <Calendar className="h-3 w-3" /> {formatPayoutFrequency(pick.bestProduct.payoutFrequency)}
          </Badge>
          {hasRequirements && (
            <Badge
              variant="outline"
              className="border-red-500/25 bg-red-500/5 text-[11px] font-semibold text-red-700 dark:border-red-400/25 dark:bg-red-400/10 dark:text-red-300"
            >
              <AlertTriangle className="h-3 w-3" /> Has requirements
            </Badge>
          )}
        </div>

        {hasRequirements && (
          <div className="rounded-xl border border-red-200/60 bg-red-50 px-3 py-2 text-[12px] font-semibold leading-relaxed text-red-700 dark:border-red-800/30 dark:bg-red-950/20 dark:text-red-300">
            <span className="block">
              Base rate (no conditions): {formatRate(pick.baseAfterTaxRate)} after tax
            </span>
            {pick.requirementSummary && (
              <details className="mt-1">
                <summary className="cursor-pointer select-none text-[12px] font-bold text-red-700 dark:text-red-300">
                  View requirements
                </summary>
                <div className="mt-1 text-[12px] font-semibold leading-relaxed text-red-700 dark:text-red-300">
                  {clampText(pick.requirementSummary)}
                </div>
              </details>
            )}
          </div>
        )}

        {!hasRequirements && (
          <p className="text-[12px] font-semibold text-positive">
            <ShieldCheck className="mr-1 inline h-4 w-4" />
            No requirements for the listed rate
          </p>
        )}
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:mt-6 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href={compareHref}
          className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-brand-primary sm:justify-start"
        >
          Compare details
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
        <AffiliateButton
          amount={pick.bestProduct.payoutAmount}
          productId={pick.bestProduct.id}
          provider={pick.bestProduct.provider}
          category={pick.bestProduct.category}
          placement="bank_pick_card"
          className="rounded-full border border-brand-border bg-brand-surface px-4 py-2 text-center text-sm font-semibold text-brand-textPrimary hover:border-brand-primary/25 hover:bg-brand-surface hover:text-brand-primary dark:border-white/10 dark:bg-white/5 dark:text-gray-100 dark:hover:bg-white/5 sm:w-auto"
        />
      </div>
    </div>
  );
}
