import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CreditCardVisual } from '../CreditCardVisual';
import { AffiliateDisclosure } from '../shared/AffiliateDisclosure';
import { ApplyOnBankSiteButton } from '../shared/ApplyOnBankSiteButton';
import { TrackedLink } from '../shared/TrackedLink';
import { RESULTS, CONFIDENCE_LABELS } from '@/lib/creditCardFinder/copy';
import type { ScoredCard, ResultRole } from '@/lib/creditCardFinder/rank';

type FitTone = 'positive' | 'good' | 'neutral';

interface Props {
  scored: ScoredCard;
  why: string;
  watchOut: string;
  fitLabel: string;
  fitTone: FitTone;
  highlight?: boolean;
  fromQuery: string;
  rank: number;
  role: ResultRole;
}

function confidenceDotClass(label: string): string {
  if (label === CONFIDENCE_LABELS.sourceChecked) return 'bg-emerald-500';
  if (
    label === CONFIDENCE_LABELS.notPublished ||
    label === CONFIDENCE_LABELS.needsChecking
  ) {
    return 'bg-amber-500';
  }
  return 'bg-brand-textSecondary/50';
}

const FIT_TONE: Record<FitTone, string> = {
  positive:
    'bg-emerald-50 text-emerald-700 ring-emerald-600/15 dark:bg-emerald-900/20 dark:text-emerald-300',
  good: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15 dark:bg-emerald-900/20 dark:text-emerald-300',
  neutral:
    'bg-brand-surface text-brand-textSecondary ring-brand-border dark:bg-white/5 dark:text-gray-300',
};

export function ResultCard({
  scored,
  why,
  watchOut,
  fitLabel,
  fitTone,
  highlight = false,
  fromQuery,
  rank,
  role,
}: Props) {
  const { card } = scored;
  const detailsHref = `/credit-cards/reviews/${encodeURIComponent(
    card.normalized_card_key,
  )}?from=finder${fromQuery ? `&${fromQuery}` : ''}`;

  return (
    <div
      className={cn(
        'rounded-2xl border bg-white p-4 dark:bg-white/[0.04]',
        highlight
          ? 'border-brand-primary/25 shadow-[0_8px_24px_-16px_rgba(0,82,255,0.4)] dark:border-brand-primary/30'
          : 'border-brand-border shadow-sm dark:border-white/10',
      )}
    >
      <div className="flex gap-4">
        <div className="w-28 shrink-0 sm:w-32">
          <CreditCardVisual card={card} compact />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-brand-textSecondary dark:text-gray-400">
            {card.bank}
          </p>
          <h3 className="text-base font-bold leading-tight tracking-tight text-brand-textPrimary dark:text-white">
            {card.card_name}
          </h3>
          <span
            className={cn(
              'mt-1.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset',
              FIT_TONE[fitTone],
            )}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {fitLabel}
          </span>
        </div>
      </div>

      {/* Why this may fit you */}
      <div className="mt-3 rounded-xl bg-brand-primaryLight/70 p-3 dark:bg-brand-primary/10">
        <p className="text-[11px] font-bold uppercase tracking-[0.05em] text-brand-primary">
          {RESULTS.blockLabels.why}
        </p>
        <p className="mt-1 text-[13px] leading-relaxed text-brand-textSecondary dark:text-gray-300">
          {why}
        </p>
      </div>

      {/* Facts */}
      <dl className="my-3 grid grid-cols-2 gap-y-2.5 border-y border-dashed border-brand-border py-3 dark:border-white/10">
        <Fact label={RESULTS.blockLabels.yearlyFee} value={scored.annualFeeLabel} />
        <Fact label={RESULTS.blockLabels.minIncome} value={scored.minIncomeLabel} />
        <Fact
          label={RESULTS.blockLabels.bestFor}
          value={scored.bestForLabel}
          span
        />
      </dl>

      {/* Watch out */}
      <div className="flex items-start gap-2 rounded-xl bg-amber-50/70 p-3 dark:bg-amber-900/15">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.04em] text-amber-700 dark:text-amber-300">
            {RESULTS.blockLabels.watchOut}
          </p>
          <p className="mt-0.5 text-[13px] leading-relaxed text-brand-textSecondary dark:text-gray-300">
            {watchOut}
          </p>
        </div>
      </div>

      {/* Disclosure precedes the Apply CTA in DOM order (a11y §9) */}
      <AffiliateDisclosure size="compact" className="mt-3" />

      <div className="mt-2 flex gap-2">
        <TrackedLink
          href={detailsHref}
          event="cc_result_detail_clicked"
          detail={{
            cardKey: card.normalized_card_key,
            bank: card.bank,
            rank,
            resultRole: role,
          }}
          className="inline-flex flex-1 items-center justify-center rounded-xl bg-brand-primaryLight px-4 py-2.5 text-sm font-semibold text-brand-primary transition-colors hover:bg-brand-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 dark:bg-brand-primary/15 dark:focus-visible:ring-offset-slate-950"
        >
          {RESULTS.ctaDetails}
        </TrackedLink>
        <ApplyOnBankSiteButton
          href={card.source_url}
          bank={card.bank}
          cardKey={card.normalized_card_key}
          sourcePage="credit-card-results"
          rank={rank}
          resultRole={role}
          label={RESULTS.ctaApply}
          className="h-auto flex-1 py-2.5"
        />
      </div>

      <div className="mt-3 flex items-center gap-2 text-[11px] text-brand-textSecondary dark:text-gray-400">
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full',
            confidenceDotClass(scored.confidence),
          )}
          aria-hidden="true"
        />
        <span className="sr-only">Data confidence: </span>
        {scored.confidence}
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
