import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { ChevronLeft, ExternalLink, Info } from 'lucide-react';
import { CreditCardTrustBadges } from '@/components/credit-cards/CreditCardTrustBadges';
import { CreditCardVisual } from '@/components/credit-cards/CreditCardVisual';
import { TrueValueScoreBadge } from '@/components/product/TrueValueScoreBadge';
import { getCreditCardBySlug } from '@/lib/credit-cards';
import type { CreditCard } from '@/types';

export const dynamic = 'force-dynamic';

export async function generateMetadata(
  props: { params: Promise<{ slug: string }> | { slug: string } },
): Promise<Metadata> {
  const params = await props.params;
  const parsed = parseCompareSlug(params?.slug ?? '');

  if (!parsed) return {};

  const [card1, card2] = await Promise.all([
    getCreditCardBySlug(parsed.left),
    getCreditCardBySlug(parsed.right),
  ]);
  if (!card1 || !card2) return {};

  return {
    title: `${card1.card_name} vs ${card2.card_name} | Truva`,
    description: `Side-by-side comparison of the ${card1.card_name} and ${card2.card_name}: fees, rewards, income notes, foreign fees, and source status.`,
    alternates: { canonical: `/credit-cards/compare/${params?.slug ?? ''}` },
  };
}

export default async function CreditCardComparePage(
  props: { params: Promise<{ slug: string }> | { slug: string } },
) {
  const params = await props.params;
  const parsed = parseCompareSlug(params?.slug ?? '');

  if (!parsed) notFound();

  const [card1, card2] = await Promise.all([
    getCreditCardBySlug(parsed.left),
    getCreditCardBySlug(parsed.right),
  ]);
  if (!card1 || !card2) notFound();

  const isEitherPartner =
    card1.badge_inputs?.partner_card === true || card2.badge_inputs?.partner_card === true;

  return (
    <>
      <div className="min-h-screen bg-brand-surface pb-24 dark:bg-slate-950">
        <header className="relative overflow-hidden bg-brand-primary px-4 py-10 text-white">
          <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent" />
          <div className="relative z-10 mx-auto max-w-6xl text-center">
            <Link
              href="/credit-cards"
              className="mx-auto mb-6 inline-flex items-center text-sm text-white/80 transition-colors hover:text-white"
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to card desk
            </Link>

            <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
              Compare card details side by side
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-white/80">
              Put two cards next to each other. We show fees, rewards, interest, income notes, and missing data without choosing for you.
            </p>
          </div>
        </header>

        <main className="relative z-20 mx-auto max-w-6xl space-y-6 px-4 pt-6 sm:-mt-8">
          <section className="overflow-hidden rounded-[1.4rem] border border-brand-border bg-white shadow-xl shadow-black/5 dark:border-white/10 dark:bg-[#111827]">
            <div className="grid grid-cols-1 divide-y divide-brand-border bg-slate-50 dark:divide-white/10 dark:bg-slate-900/70 md:grid-cols-2 md:divide-x md:divide-y-0">
              {[card1, card2].map((card) => (
                <div key={card.id} className="p-5 md:p-7">
                  <div className="grid gap-4 sm:grid-cols-[12rem_minmax(0,1fr)]">
                    <CreditCardVisual card={card} compact />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary">
                        {formatCardMeta(card)}
                      </p>
                      <h2 className="mt-2 text-2xl font-bold leading-tight text-brand-textPrimary dark:text-white">
                        {card.card_name}
                      </h2>
                      <p className="mt-1 text-sm text-brand-textSecondary dark:text-gray-300">{card.bank}</p>
                      <CreditCardTrustBadges card={card} limit={3} className="mt-4" />
                    </div>
                  </div>
                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <Link
                      href={`/credit-cards/reviews/${card.normalized_card_key}`}
                      className="inline-flex flex-1 items-center justify-center rounded-xl border border-brand-border bg-white px-4 py-3 text-sm font-semibold text-brand-textPrimary transition-colors hover:border-brand-primary/25 hover:text-brand-primary dark:border-white/10 dark:bg-white/[0.05] dark:text-gray-100"
                    >
                      View card details
                    </Link>
                    <a
                      href={card.source_url}
                      target="_blank"
                      rel="nofollow noopener noreferrer"
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-primary px-4 py-3 text-sm font-semibold text-white shadow-md shadow-brand-primary/20 transition-colors hover:bg-brand-primary/90"
                    >
                      Visit bank site
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-brand-border p-5 dark:border-white/10 md:p-7">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-3">
                  <Info className="mt-0.5 h-5 w-5 shrink-0 text-brand-primary" />
                  <div>
                    <h2 className="text-lg font-bold text-brand-textPrimary dark:text-white">
                      Scores are coming later
                    </h2>
                    <p className="mt-1 text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
                      Truva keeps missing fields visible until the score inputs are complete.
                    </p>
                  </div>
                </div>
                <TrueValueScoreBadge showReason />
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-[1.4rem] border border-brand-border bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
            <CompareSectionTitle title="Basic details" />
            <CompareRow label="Bank" left={card1.bank} right={card2.bank} />
            <CompareRow label="Network / tier" left={formatCardMeta(card1)} right={formatCardMeta(card2)} />
            <CompareRow label="Annual fee" left={formatAnnualFee(card1)} right={formatAnnualFee(card2)} />
            <CompareRow
              label="Waiver condition"
              left={card1.annual_fee_waiver_condition ?? 'No public data'}
              right={card2.annual_fee_waiver_condition ?? 'No public data'}
              mutedLeft={card1.annual_fee_waiver_condition === null}
              mutedRight={card2.annual_fee_waiver_condition === null}
            />
            <CompareRow
              label="Waiver threshold"
              left={formatPhpNullable(card1.annual_fee_waiver_threshold)}
              right={formatPhpNullable(card2.annual_fee_waiver_threshold)}
              mutedLeft={card1.annual_fee_waiver_threshold === null}
              mutedRight={card2.annual_fee_waiver_threshold === null}
            />

            <CompareSectionTitle title="Rewards and requirements" />
            <CompareRow label="Reward type" left={formatRewardType(card1.rewards_type)} right={formatRewardType(card2.rewards_type)} />
            <CompareRow label="Reward formula" left={formatRewardFormula(card1.rewards_formula)} right={formatRewardFormula(card2.rewards_formula)} />
            <CompareRow label="Peso value" left="Not yet verified" right="Not yet verified" mutedLeft mutedRight />
            <CompareRow
              label="Minimum income"
              left={formatIncome(card1)}
              right={formatIncome(card2)}
              mutedLeft={card1.min_income_monthly === null && card1.min_income_annual === null}
              mutedRight={card2.min_income_monthly === null && card2.min_income_annual === null}
            />
            <CompareRow
              label="Income filter"
              left={card1.income_filter_ready ? 'Ready' : 'Off for now'}
              right={card2.income_filter_ready ? 'Ready' : 'Off for now'}
              mutedLeft={!card1.income_filter_ready}
              mutedRight={!card2.income_filter_ready}
            />
            <CompareRow label="Things to check" left={formatCheckSummary(card1)} right={formatCheckSummary(card2)} />

            <CompareSectionTitle title="Fees and source" />
            <CompareRow
              label="Interest rate"
              left={formatMonthlyRate(card1.interest_rate_pct)}
              right={formatMonthlyRate(card2.interest_rate_pct)}
              mutedLeft={card1.interest_rate_pct === null}
              mutedRight={card2.interest_rate_pct === null}
            />
            <CompareRow
              label="Foreign fee"
              left={formatPercent(card1.foreign_transaction_fee_pct)}
              right={formatPercent(card2.foreign_transaction_fee_pct)}
              mutedLeft={card1.foreign_transaction_fee_pct === null}
              mutedRight={card2.foreign_transaction_fee_pct === null}
            />
            <CompareRow
              label="Cash advance fee"
              left={formatCashAdvance(card1)}
              right={formatCashAdvance(card2)}
              mutedLeft={card1.cash_advance_fee_amount === null && card1.cash_advance_fee_pct === null}
              mutedRight={card2.cash_advance_fee_amount === null && card2.cash_advance_fee_pct === null}
            />
            <CompareRow
              label="Late payment fee"
              left={formatPhpNullable(card1.late_payment_fee_amount)}
              right={formatPhpNullable(card2.late_payment_fee_amount)}
              mutedLeft={card1.late_payment_fee_amount === null}
              mutedRight={card2.late_payment_fee_amount === null}
            />
            <CompareRow
              label="Overlimit fee"
              left={formatPhpNullable(card1.overlimit_fee_amount)}
              right={formatPhpNullable(card2.overlimit_fee_amount)}
              mutedLeft={card1.overlimit_fee_amount === null}
              mutedRight={card2.overlimit_fee_amount === null}
            />
            <CompareRow
              label="Active linked promos"
              left={formatPromoCount(card1.active_promo_count)}
              right={formatPromoCount(card2.active_promo_count)}
            />
            <CompareRow label="Source updated" left={formatDate(card1.last_scraped_at)} right={formatDate(card2.last_scraped_at)} />
          </section>

          <section className="rounded-[1.4rem] border border-brand-border bg-white p-5 text-sm leading-relaxed text-brand-textSecondary shadow-sm dark:border-white/10 dark:bg-white/[0.04] dark:text-gray-300">
            Truva is an independent comparison platform. Bank-site buttons open public source pages directly.
            {isEitherPartner
              ? ' One or more products above may be partner placements; inspect the card detail page for row-level disclosure.'
              : ' No partner badge is active on these rows.'}
          </section>
        </main>
      </div>
    </>
  );
}

function parseCompareSlug(slug: string) {
  if (!slug.includes('-vs-')) return null;
  const mid = slug.indexOf('-vs-');
  return {
    left: decodeURIComponent(slug.slice(0, mid)),
    right: decodeURIComponent(slug.slice(mid + 4)),
  };
}

function CompareSectionTitle({ title }: { title: string }) {
  return (
    <div className="border-b border-brand-border bg-brand-surface px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]">
      <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-brand-primary">{title}</h2>
    </div>
  );
}

function CompareRow({
  label,
  left,
  right,
  mutedLeft = false,
  mutedRight = false,
}: {
  label: string;
  left: ReactNode;
  right: ReactNode;
  mutedLeft?: boolean;
  mutedRight?: boolean;
}) {
  return (
    <div className="grid border-b border-brand-border last:border-b-0 dark:border-white/10 md:grid-cols-[13rem_minmax(0,1fr)_minmax(0,1fr)]">
      <div className="border-b border-brand-border bg-slate-50/70 px-4 py-3 dark:border-white/10 dark:bg-slate-900/40 md:border-b-0 md:border-r">
        <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-textSecondary dark:text-gray-400">
          {label}
        </h3>
      </div>
      <CompareCell muted={mutedLeft}>{left}</CompareCell>
      <CompareCell muted={mutedRight} last>{right}</CompareCell>
    </div>
  );
}

function CompareCell({
  children,
  muted,
  last = false,
}: {
  children: ReactNode;
  muted?: boolean;
  last?: boolean;
}) {
  return (
    <div
      className={`min-h-[3.5rem] border-b border-brand-border px-4 py-3 dark:border-white/10 md:border-b-0 ${
        last ? '' : 'md:border-r'
      }`}
    >
      <p className={muted ? 'text-sm font-medium text-brand-textSecondary dark:text-gray-400' : 'text-sm font-semibold text-brand-textPrimary dark:text-gray-100'}>
        {children}
      </p>
    </div>
  );
}

function formatCardMeta(card: CreditCard) {
  return [card.card_network, card.card_tier].filter(Boolean).join(' / ') || 'Card details';
}

function formatAnnualFee(card: CreditCard): string {
  if (card.naffl) return 'PHP 0 NAFFL';
  if (card.annual_fee_recurring === 0) return 'PHP 0';
  if (card.annual_fee_recurring !== null) return formatPhpAmount(card.annual_fee_recurring);
  if (card.annual_fee_first_year !== null) return `${formatPhpAmount(card.annual_fee_first_year)} first year`;
  return 'Not disclosed';
}

function formatRewardType(rewardType: CreditCard['rewards_type']) {
  switch (rewardType) {
    case 'cashback':
      return 'Cashback';
    case 'miles':
      return 'Miles';
    case 'points':
      return 'Points';
    default:
      return 'None captured';
  }
}

function formatRewardFormula(formula: CreditCard['rewards_formula']) {
  if (!formula) return 'No public data';
  const earnUnit = typeof formula.earn_unit === 'string' ? formula.earn_unit : '';
  if (earnUnit.trim()) return earnUnit;
  return 'Formula captured; peso value not ready';
}

function formatCheckSummary(card: CreditCard) {
  const items = [
    card.min_income_monthly === null && card.min_income_annual === null ? 'income requirement' : null,
    card.annual_fee_waiver_condition === null || card.annual_fee_waiver_threshold === null ? 'fee-waiver details' : null,
    card.foreign_transaction_fee_pct === null ? 'foreign fee' : null,
    !card.rewards_formula ? 'reward rules' : null,
  ].filter(Boolean);

  if (items.length === 0) return 'No major missing field flagged';
  return `Check ${items.join(', ')}`;
}

function formatMonthlyRate(rate: number | null) {
  if (rate === null) return 'Not disclosed';
  return `${rate.toFixed(2)}% / mo`;
}

function formatPercent(value: number | null) {
  if (value === null) return 'Not disclosed';
  return `${value.toFixed(2)}%`;
}

function formatPhpNullable(value: number | null) {
  if (value === null) return 'Not disclosed';
  return formatPhpAmount(value);
}

function formatCashAdvance(card: CreditCard) {
  const pieces = [
    card.cash_advance_fee_pct !== null ? `${card.cash_advance_fee_pct.toFixed(2)}%` : null,
    card.cash_advance_fee_amount !== null ? formatPhpAmount(card.cash_advance_fee_amount) : null,
  ].filter(Boolean);
  return pieces.length > 0 ? pieces.join(' or ') : 'Not disclosed';
}

function formatIncome(card: CreditCard) {
  if (card.min_income_monthly !== null) return `${formatPhpAmount(card.min_income_monthly)} / mo`;
  if (card.min_income_annual !== null) return `${formatPhpAmount(card.min_income_annual)} / yr`;
  return 'No public data';
}

function formatPromoCount(count: number) {
  return count > 0 ? `${count} active linked promo` : 'No active linked promo';
}

function formatDate(value: string | null) {
  if (!value) return 'No public data';
  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value));
}

function formatPhpAmount(amount: number) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
  }).format(amount).replace('PHP', 'PHP ');
}
