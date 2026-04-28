'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Info,
  Mail,
  Plus,
  ShieldCheck,
  Sparkles,
  Trophy,
  X,
} from 'lucide-react';
import { CreditCardVisual } from '@/components/credit-cards/CreditCardVisual';
import { ScorePendingNotice } from '@/components/credit-cards/CreditCardTrustBadges';
import { cn } from '@/lib/utils';
import type { CardEditorial } from '@/lib/creditCardEditorial';
import type { CardMatchAnswers, CardValueEstimate } from '@/lib/creditCardValue';
import type { CreditCard } from '@/types';

// ── Types ─────────────────────────────────────────────────────────────────────

interface RankedEntry {
  card: CreditCard;
  matchPct: number;
  value: CardValueEstimate;
  eligible: boolean;
  editorial: CardEditorial;
}

interface Props {
  answers: CardMatchAnswers;
  ranked: RankedEntry[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatPhp(n: number): string {
  return '₱' + Math.round(n).toLocaleString('en-PH');
}

function formatYearlyFee(card: CreditCard): string {
  if (card.naffl === true) return 'No yearly fee';
  if (card.annual_fee_recurring === 0) return 'No yearly fee';
  if (card.annual_fee_recurring !== null) return `₱${card.annual_fee_recurring.toLocaleString('en-PH')}/year`;
  return 'Confirm with bank';
}

function formatMinIncome(card: CreditCard): string {
  if (card.min_income_monthly !== null) return `₱${card.min_income_monthly.toLocaleString('en-PH')}/mo`;
  if (card.min_income_annual !== null) return `₱${Math.round(card.min_income_annual / 12).toLocaleString('en-PH')}/mo`;
  return 'No public data';
}

function formatRewardLine(card: CreditCard): string {
  const formula = card.rewards_formula;
  if (formula && typeof formula.earn_unit === 'string') {
    const unit = (formula.earn_unit as string).trim();
    // Only use earn_unit if it's a descriptive phrase (not just a currency symbol like "PHP")
    if (unit.length > 5) return unit;
  }
  switch (card.rewards_type) {
    case 'cashback': return 'Cashback on purchases';
    case 'points':   return 'Points on purchases';
    case 'miles':    return 'Miles on purchases';
    default:         return 'Rewards on purchases';
  }
}

const GOAL_LABELS: Record<string, string> = {
  'no-annual-fee': 'No Annual Fee',
  cashback:        'Cashback',
  travel:          'Travel & Miles',
  'first-card':    'First Card',
  'low-fee':       'Low Fee',
};

const INCOME_LABELS: Record<string, string> = {
  '15k':  '₱15,000+/mo',
  '21k':  '₱21,000+/mo',
  '30k':  '₱30,000+/mo',
  '31k':  '₱31,000+/mo',
  '50k':  '₱50,000+/mo',
  '51k':  '₱51,000+/mo',
  '100k': '₱100,000+/mo',
};

const SPENDING_LABELS: Record<string, string> = {
  groceries: 'Groceries',
  dining:    'Dining & Food',
  online:    'Online Shopping',
  fuel:      'Fuel',
  bills:     'Bills',
  travel:    'Travel',
};

// ── Fit % badge + tooltip ─────────────────────────────────────────────────────

function FitBadge({ pct, eligible }: { pct: number; eligible: boolean }) {
  const tone = pct >= 80 ? 'great' : pct >= 65 ? 'good' : 'ok';
  const toneClass =
    tone === 'great'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-500/20'
      : tone === 'good'
        ? 'bg-brand-primary/10 text-brand-primary border-brand-primary/15 dark:bg-brand-primary/15 dark:border-brand-primary/25'
        : 'bg-slate-100 text-slate-600 border-brand-border dark:bg-white/10 dark:text-gray-400 dark:border-white/10';

  return (
    <div className="group relative inline-flex items-center gap-1">
      <span className={cn('inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-sm font-bold', toneClass)}>
        {pct}% fit
        <Info className="h-3 w-3 opacity-60" />
      </span>
      {/* Tooltip */}
      <div className="pointer-events-none absolute bottom-full left-0 z-10 mb-2 w-64 rounded-[1rem] border border-brand-border bg-white p-3 text-xs leading-relaxed text-brand-textSecondary opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:border-white/10 dark:bg-slate-950 dark:text-gray-300">
        <p className="mb-1.5 font-bold text-brand-textPrimary dark:text-white">How we calculate Fit %</p>
        <ul className="space-y-1">
          <li className="flex gap-1.5"><Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" />Income eligibility — can you apply?</li>
          <li className="flex gap-1.5"><Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" />Goal match — does this card do what you want?</li>
          <li className="flex gap-1.5"><Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" />Spend-category match — does it reward where you spend?</li>
        </ul>
        <p className="mt-2 text-[10px] text-brand-textSecondary/70 dark:text-gray-400">
          Fit % is different from the Truva True Value Score, which comes later when all fee and reward data is complete.
        </p>
        {!eligible && (
          <p className="mt-1.5 font-semibold text-amber-600 dark:text-amber-400">
            Heads up — income requirement may be above your bracket.
          </p>
        )}
      </div>
    </div>
  );
}

// ── Top card (rank 1–3) ───────────────────────────────────────────────────────

function TopCard({
  entry,
  rank,
  onCompareToggle,
  comparing,
}: {
  entry: RankedEntry;
  rank: number;
  onCompareToggle: () => void;
  comparing: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const { card, matchPct, value, eligible, editorial } = entry;
  const monthlyBack = Math.round(value.netAnnual / 12);

  return (
    <article
      className={cn(
        'relative overflow-hidden rounded-[1.5rem] border bg-white transition-all dark:bg-white/[0.04]',
        rank === 1
          ? 'border-brand-primary/30 shadow-[0_0_0_1px_theme(colors.brand.primary/0.12),0_12px_48px_-16px_theme(colors.brand.primary/0.18)] dark:border-brand-primary/30'
          : 'border-brand-border shadow-sm dark:border-white/10',
      )}
    >
      {rank === 1 && (
        <div className="flex items-center gap-2 bg-brand-primary px-5 py-2.5 text-sm font-bold text-white">
          <Trophy className="h-4 w-4" />
          Best match for you right now
        </div>
      )}

      <div className="p-5 md:p-6">
        <div className="flex flex-col gap-5 md:flex-row md:gap-6">
          {/* Left: card visual */}
          <div className="shrink-0">
            <CreditCardVisual card={card} className="w-full md:w-48" />
            <div className="mt-2 flex flex-wrap gap-1">
              {card.card_network && (
                <span className="rounded-full border border-brand-border bg-brand-surface px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-textSecondary dark:border-white/10 dark:bg-white/5 dark:text-gray-400">
                  {card.card_network}
                </span>
              )}
              {card.card_tier && (
                <span className="rounded-full border border-brand-border bg-brand-surface px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-textSecondary dark:border-white/10 dark:bg-white/5 dark:text-gray-400">
                  {card.card_tier}
                </span>
              )}
            </div>
          </div>

          {/* Right: content */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-textSecondary dark:text-gray-400">
                  {card.bank}
                </p>
                <h3 className="mt-0.5 text-xl font-bold text-brand-textPrimary dark:text-white">
                  {card.card_name}
                </h3>
              </div>
              <FitBadge pct={matchPct} eligible={eligible} />
            </div>

            {/* Hero ₱/year */}
            <div className="mt-4">
              <div className="flex items-end gap-2">
                <span className="text-3xl font-black tabular-nums text-brand-textPrimary dark:text-white">
                  {formatPhp(value.netAnnual)}
                </span>
                <span className="mb-1 text-sm text-brand-textSecondary dark:text-gray-400">
                  you could keep per year
                  <button
                    className="ml-1 inline-flex"
                    title="Estimated from your spending profile — rewards earned minus yearly fee"
                    aria-label="How is this calculated?"
                  >
                    <Info className="h-3.5 w-3.5 text-brand-textSecondary/60 dark:text-gray-500" />
                  </button>
                </span>
              </div>
              <p className="mt-1 text-sm text-brand-textSecondary dark:text-gray-400">
                That&apos;s around{' '}
                <strong className="text-brand-textPrimary dark:text-white">
                  {formatPhp(monthlyBack)} every month
                </strong>{' '}
                back in your pocket
              </p>
            </div>

            {/* Fact row */}
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <FactCell
                label="Yearly fee"
                value={formatYearlyFee(card)}
                good={card.naffl === true || card.annual_fee_recurring === 0}
              />
              <FactCell label="You earn" value={formatRewardLine(card)} />
              <FactCell
                label="You need to make"
                value={formatMinIncome(card)}
                warn={!eligible}
                warnNote={!eligible ? 'Above your income bracket' : undefined}
              />
            </div>

            {/* Why this fits */}
            <div className="mt-4 rounded-[1rem] border border-brand-border bg-brand-surface/50 p-3.5 dark:border-white/10 dark:bg-white/[0.03]">
              <div className="flex items-center gap-2 text-xs font-bold text-brand-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Why this card fits you
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
                {editorial.why}
              </p>
            </div>

            {/* Expanded: pros/cons + breakdown */}
            {expanded && (
              <div className="mt-4 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <h5 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <Check className="h-3.5 w-3.5" /> What&apos;s good
                    </h5>
                    <ul className="space-y-1.5">
                      {editorial.pros.map((p, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-brand-textSecondary dark:text-gray-300">
                          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                      <Info className="h-3.5 w-3.5" /> Things to know
                    </h5>
                    <ul className="space-y-1.5">
                      {editorial.cons.map((p, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-brand-textSecondary dark:text-gray-300">
                          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <ValueBreakdown value={value} />

                <ScorePendingNotice />
              </div>
            )}

            {/* Actions */}
            <div className="mt-5 flex flex-wrap items-center gap-2.5">
              <a
                href={card.source_url}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
              >
                Apply on {card.bank} site <ArrowRight className="h-4 w-4" />
              </a>
              <button
                onClick={() => setExpanded(!expanded)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-brand-border px-4 py-2.5 text-sm font-semibold text-brand-textSecondary transition-colors hover:border-brand-primary/30 hover:text-brand-textPrimary dark:border-white/10 dark:hover:border-brand-primary/40"
              >
                {expanded ? 'Show less' : 'See full details'}
                <ChevronDown className={cn('h-4 w-4 transition-transform', expanded && 'rotate-180')} />
              </button>
              <button
                onClick={onCompareToggle}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors',
                  comparing
                    ? 'border-brand-primary/30 bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/15'
                    : 'border-brand-border text-brand-textSecondary hover:border-brand-primary/30 hover:text-brand-textPrimary dark:border-white/10',
                )}
              >
                {comparing ? (
                  <><Check className="h-4 w-4" /> Comparing</>
                ) : (
                  <><Plus className="h-4 w-4" /> Compare</>
                )}
              </button>
            </div>

            <p className="mt-3 text-[11px] text-brand-textSecondary/60 dark:text-gray-500">
              We earn a small commission if you apply through our link. This never changes how we rank cards.
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

// ── Fact cell ─────────────────────────────────────────────────────────────────

function FactCell({
  label,
  value,
  good,
  warn,
  warnNote,
}: {
  label: string;
  value: string;
  good?: boolean;
  warn?: boolean;
  warnNote?: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-textSecondary dark:text-gray-400">
        {label}
      </p>
      <p
        className={cn(
          'mt-1 text-sm font-bold',
          good  && 'text-emerald-600 dark:text-emerald-400',
          warn  && 'text-amber-600 dark:text-amber-400',
          !good && !warn && 'text-brand-textPrimary dark:text-white',
        )}
      >
        {value}
      </p>
      {warnNote && <p className="mt-0.5 text-[10px] font-semibold text-amber-500">{warnNote}</p>}
    </div>
  );
}

// ── Value breakdown ───────────────────────────────────────────────────────────

function ValueBreakdown({ value }: { value: CardValueEstimate }) {
  return (
    <div className="rounded-[1rem] border border-brand-border bg-brand-surface/50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
      <h5 className="mb-3 text-xs font-bold text-brand-textPrimary dark:text-white">
        How we got {formatPhp(value.netAnnual)}/year
      </h5>
      <div className="space-y-1.5 text-sm">
        <BreakdownRow label={`Your spending (~${formatPhp(value.monthlySpend)}/mo × 12)`} value={formatPhp(value.yearlySpend)} />
        <BreakdownRow label="Rewards earned" value={'+ ' + formatPhp(value.grossRewards)} positive />
        <BreakdownRow
          label="Yearly fee"
          value={value.fee > 0 ? '− ' + formatPhp(value.fee) : '₱0'}
          negative={value.fee > 0}
        />
        <div className="mt-2 flex items-center justify-between border-t border-brand-border pt-2 font-bold dark:border-white/10">
          <span className="text-brand-textPrimary dark:text-white">Money you keep</span>
          <span className="text-brand-textPrimary dark:text-white">{formatPhp(value.netAnnual)}</span>
        </div>
      </div>
      <p className="mt-3 text-[10px] leading-relaxed text-brand-textSecondary/70 dark:text-gray-500">
        Estimated based on ~30% of your monthly income flowing through the card. Actual results depend on your real spending.
      </p>
    </div>
  );
}

function BreakdownRow({ label, value, positive, negative }: { label: string; value: string; positive?: boolean; negative?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-brand-textSecondary dark:text-gray-400">{label}</span>
      <span className={cn(
        'shrink-0 font-semibold tabular-nums',
        positive && 'text-emerald-600 dark:text-emerald-400',
        negative && 'text-red-500 dark:text-red-400',
        !positive && !negative && 'text-brand-textPrimary dark:text-white',
      )}>
        {value}
      </span>
    </div>
  );
}

// ── Alternate card (compact, rank 4+) ─────────────────────────────────────────

function AlternateCard({
  entry,
  onCompareToggle,
  comparing,
}: {
  entry: RankedEntry;
  onCompareToggle: () => void;
  comparing: boolean;
}) {
  const { card, matchPct, value } = entry;

  return (
    <div className="rounded-[1.25rem] border border-brand-border bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
      <div className="flex items-start gap-3">
        <CreditCardVisual card={card} className="w-20 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-textSecondary dark:text-gray-400">
            {card.bank}
          </p>
          <p className="text-sm font-bold text-brand-textPrimary dark:text-white">{card.card_name}</p>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-sm font-black tabular-nums text-brand-textPrimary dark:text-white">
              {formatPhp(value.netAnnual)}
            </span>
            <span className="text-[10px] text-brand-textSecondary dark:text-gray-400">/year you keep</span>
          </div>
          <p className="mt-1 text-[11px] font-semibold text-brand-textSecondary dark:text-gray-400">
            {formatYearlyFee(card)} · {formatRewardLine(card)}
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-brand-surface px-2 py-0.5 text-[11px] font-bold text-brand-textSecondary dark:bg-white/10 dark:text-gray-400">
          {matchPct}% fit
        </span>
      </div>

      <div className="mt-3 flex gap-2">
        <a
          href={card.source_url}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand-primary px-3 py-2 text-xs font-bold text-white hover:opacity-90"
        >
          Apply
        </a>
        <button
          onClick={onCompareToggle}
          className={cn(
            'inline-flex items-center gap-1 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors',
            comparing
              ? 'border-brand-primary/30 bg-brand-primary/10 text-brand-primary'
              : 'border-brand-border text-brand-textSecondary hover:border-brand-primary/30 dark:border-white/10',
          )}
        >
          {comparing ? <><Check className="h-3 w-3" /> Added</> : <><Plus className="h-3 w-3" /> Compare</>}
        </button>
      </div>
    </div>
  );
}

// ── Compare tray ──────────────────────────────────────────────────────────────

function CompareTray({
  entries,
  onRemove,
  onClear,
  onOpen,
}: {
  entries: RankedEntry[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onOpen: () => void;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-brand-border bg-white/95 shadow-[0_-8px_32px_-8px_rgba(0,0,0,0.12)] backdrop-blur dark:border-white/10 dark:bg-slate-950/95">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <span className="text-sm font-bold text-brand-textPrimary dark:text-white">
            Comparing {entries.length} card{entries.length !== 1 ? 's' : ''}
          </span>
          {entries.map(e => (
            <span
              key={e.card.id}
              className="inline-flex items-center gap-1.5 rounded-full border border-brand-border bg-brand-surface px-2.5 py-1 text-[11px] font-semibold text-brand-textPrimary dark:border-white/10 dark:bg-white/10 dark:text-white"
            >
              {e.card.card_name.split(' ').slice(-2).join(' ')}
              <button onClick={() => onRemove(e.card.id)} aria-label={`Remove ${e.card.card_name}`}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onClear}
            className="text-sm text-brand-textSecondary hover:text-brand-textPrimary dark:text-gray-400"
          >
            Clear
          </button>
          <button
            onClick={onOpen}
            disabled={entries.length < 2}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2 text-sm font-bold text-white disabled:opacity-40"
          >
            Compare side-by-side <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Compare modal ─────────────────────────────────────────────────────────────

function CompareModal({ entries, onClose }: { entries: RankedEntry[]; onClose: () => void }) {
  const rows: Array<{ label: string; get: (e: RankedEntry) => React.ReactNode }> = [
    { label: 'Yearly fee',         get: e => formatYearlyFee(e.card) },
    { label: 'Min. income',        get: e => formatMinIncome(e.card) },
    { label: 'You earn',           get: e => formatRewardLine(e.card) },
    { label: 'Foreign card fee',   get: e => e.card.foreign_transaction_fee_pct != null ? `${e.card.foreign_transaction_fee_pct}%` : 'Confirm with bank' },
    { label: 'Interest (monthly)', get: e => e.card.interest_rate_pct != null ? `${e.card.interest_rate_pct}%` : 'Confirm with bank' },
    { label: 'Money you keep/year',get: e => <strong className="font-black tabular-nums">{formatPhp(e.value.netAnnual)}</strong> },
    { label: 'Fit %',              get: e => <strong>{e.matchPct}%</strong> },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl rounded-t-[2rem] border border-brand-border bg-white shadow-xl dark:border-white/10 dark:bg-slate-950 sm:rounded-[2rem]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-brand-border px-5 py-4 dark:border-white/10">
          <h3 className="text-lg font-bold text-brand-textPrimary dark:text-white">Side-by-side compare</h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-brand-border text-brand-textSecondary hover:text-brand-textPrimary dark:border-white/10"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[400px]">
            <thead>
              <tr>
                <th className="w-36 p-4 text-left text-xs font-semibold uppercase tracking-[0.14em] text-brand-textSecondary dark:text-gray-400" />
                {entries.map(e => (
                  <th key={e.card.id} className="p-4 text-left">
                    <CreditCardVisual card={e.card} className="w-28" />
                    <p className="mt-2 text-xs font-bold text-brand-textPrimary dark:text-white">
                      {e.card.card_name.split(' ').slice(-3).join(' ')}
                    </p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.label} className="border-t border-brand-border/50 dark:border-white/5">
                  <td className="p-4 text-xs font-semibold text-brand-textSecondary dark:text-gray-400">{row.label}</td>
                  {entries.map(e => (
                    <td key={e.card.id} className="p-4 text-sm text-brand-textPrimary dark:text-white">
                      {row.get(e)}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="border-t border-brand-border dark:border-white/10">
                <td className="p-4" />
                {entries.map(e => (
                  <td key={e.card.id} className="p-4">
                    <a
                      href={e.card.source_url}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-brand-primary px-3 py-2 text-xs font-bold text-white hover:opacity-90"
                    >
                      Apply <ArrowRight className="h-3.5 w-3.5" />
                    </a>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Email capture ─────────────────────────────────────────────────────────────

function EmailCapture() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = (e.currentTarget.elements.namedItem('email') as HTMLInputElement).value;
    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json() as { success?: boolean; error?: string };
      if (!res.ok) {
        setErrorMsg(data.error ?? 'Something went wrong — please try again.');
        setStatus('error');
      } else {
        setStatus('done');
      }
    } catch {
      setErrorMsg('Could not connect — please try again.');
      setStatus('error');
    }
  };

  return (
    <div className="rounded-[1.5rem] border border-brand-border bg-white p-5 dark:border-white/10 dark:bg-white/[0.04] md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-base font-bold text-brand-textPrimary dark:text-white">
            Want to think about it first?
          </h3>
          <p className="mt-1 text-sm text-brand-textSecondary dark:text-gray-400">
            We&apos;ll send these results to your email so you can come back any time. No spam, promise.
          </p>
        </div>
        {status === 'done' ? (
          <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-900/20 dark:text-emerald-300">
            <Check className="h-4 w-4" /> Sent — check your inbox
          </div>
        ) : (
          <div className="flex shrink-0 flex-col gap-1.5">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="email"
                name="email"
                placeholder="you@email.com"
                required
                disabled={status === 'loading'}
                className="rounded-xl border border-brand-border bg-brand-surface px-4 py-2.5 text-sm text-brand-textPrimary placeholder:text-brand-textSecondary/60 focus:border-brand-primary focus:outline-none disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-gray-500"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-60"
              >
                <Mail className="h-4 w-4" />
                {status === 'loading' ? 'Sending…' : 'Email my matches'}
              </button>
            </form>
            {status === 'error' && (
              <p className="text-xs text-red-500 dark:text-red-400">{errorMsg}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export function CreditCardResults({ answers, ranked }: Props) {
  const [comparing, setComparing] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);

  const top3    = ranked.slice(0, 3);
  const others  = ranked.slice(3);

  const toggleCompare = (id: string) => {
    setComparing(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 2)  return prev; // Phase 1: max 2; Phase 2 bumps to 3
      return [...prev, id];
    });
  };

  const compareEntries = ranked.filter(e => comparing.includes(e.card.id));

  const retakeHref = '/credit-cards#quiz';

  return (
    <div className="min-h-screen bg-brand-surface dark:bg-slate-950">
      {/* Hero */}
      <div className="border-b border-brand-border bg-white dark:border-white/10 dark:bg-white/[0.03]">
        <div className="mx-auto max-w-5xl px-4 py-8 md:py-10">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">
            <Check className="h-3.5 w-3.5" />
            Based on your answers
          </div>
          <h1 className="text-2xl font-black text-brand-textPrimary dark:text-white md:text-3xl">
            Great news — we found cards that fit you
          </h1>
          <p className="mt-2 text-base text-brand-textSecondary dark:text-gray-300">
            We went through {ranked.length} cards. These three are the best match for how you live and spend.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <SummaryPill label="Goal" value={GOAL_LABELS[answers.goal] ?? answers.goal} />
            <SummaryPill label="Income" value={INCOME_LABELS[answers.income] ?? answers.income} />
            <SummaryPill label="Spends most on" value={SPENDING_LABELS[answers.spending] ?? answers.spending} />
            <Link
              href={retakeHref}
              className="inline-flex items-center gap-1.5 rounded-full border border-brand-border bg-white px-3 py-1.5 text-xs font-semibold text-brand-textSecondary transition-colors hover:border-brand-primary/30 hover:text-brand-primary dark:border-white/10 dark:bg-white/5 dark:hover:border-brand-primary/30"
            >
              <ArrowLeft className="h-3 w-3" /> Change my answers
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        {/* Top 3 */}
        <div>
          <h2 className="text-xl font-bold text-brand-textPrimary dark:text-white">Your top 3 picks</h2>
          <p className="mt-1 text-sm text-brand-textSecondary dark:text-gray-400">
            Sorted by how much money stays in your pocket each year — rewards earned minus yearly fee.
          </p>
        </div>

        <div className="space-y-4">
          {top3.map((entry, idx) => (
            <TopCard
              key={entry.card.id}
              entry={entry}
              rank={idx + 1}
              onCompareToggle={() => toggleCompare(entry.card.id)}
              comparing={comparing.includes(entry.card.id)}
            />
          ))}
        </div>

        {/* Methodology callout */}
        <div className="flex gap-4 rounded-[1.25rem] border border-brand-border bg-white p-5 dark:border-white/10 dark:bg-white/[0.04]">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-brand-textPrimary dark:text-white">How did we choose these?</h4>
            <p className="mt-1 text-sm leading-relaxed text-brand-textSecondary dark:text-gray-400">
              We never accept money to push a card higher. We score every card on three things:{' '}
              <strong>1.</strong> can you actually qualify based on your income,{' '}
              <strong>2.</strong> how much money you get to keep after the yearly fee is taken out, and{' '}
              <strong>3.</strong> how good the rewards are for how you spend.
            </p>
            <Link href="/credit-cards#methodology" className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-brand-primary hover:underline">
              Read our full methodology <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Email capture */}
        <EmailCapture />

        {/* Alternates */}
        {others.length > 0 && (
          <>
            <div className="pt-2">
              <h2 className="text-xl font-bold text-brand-textPrimary dark:text-white">More cards worth looking at</h2>
              <p className="mt-1 text-sm text-brand-textSecondary dark:text-gray-400">
                Lower match score, but still a solid option depending on your situation.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {others.map(entry => (
                <AlternateCard
                  key={entry.card.id}
                  entry={entry}
                  onCompareToggle={() => toggleCompare(entry.card.id)}
                  comparing={comparing.includes(entry.card.id)}
                />
              ))}
            </div>
          </>
        )}

        {/* Bottom padding for tray */}
        {comparing.length > 0 && <div className="h-20" />}
      </div>

      {comparing.length > 0 && (
        <CompareTray
          entries={compareEntries}
          onRemove={id => setComparing(prev => prev.filter(x => x !== id))}
          onClear={() => setComparing([])}
          onOpen={() => setShowCompare(true)}
        />
      )}

      {showCompare && (
        <CompareModal
          entries={compareEntries}
          onClose={() => setShowCompare(false)}
        />
      )}
    </div>
  );
}

// ── Summary pill ──────────────────────────────────────────────────────────────

function SummaryPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-brand-border bg-white px-3 py-1.5 text-xs dark:border-white/10 dark:bg-white/5">
      <span className="font-semibold text-brand-textSecondary dark:text-gray-400">{label}</span>
      <span className="font-bold text-brand-textPrimary dark:text-white">{value}</span>
    </div>
  );
}
