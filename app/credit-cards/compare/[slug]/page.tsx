import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { CheckCircle2, ChevronLeft, ExternalLink, Info, Minus } from 'lucide-react';
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
  const slugs = parseCompareSlug(params?.slug ?? '');
  if (!slugs) return {};

  const results = await Promise.all(slugs.map((s) => getCreditCardBySlug(s)));
  if (results.some((c) => !c)) return {};
  const cards = results as CreditCard[];

  return {
    title: cards.map((c) => c.card_name).join(' vs '),
    description: `Side-by-side comparison of the ${cards.map((c) => c.card_name).join(', ')}: fees, rewards, income notes, foreign fees, and source status.`,
    alternates: { canonical: `/credit-cards/compare/${params?.slug ?? ''}` },
  };
}

export default async function CreditCardComparePage(
  props: { params: Promise<{ slug: string }> | { slug: string } },
) {
  const params = await props.params;
  const slugs = parseCompareSlug(params?.slug ?? '');
  if (!slugs) notFound();

  const results = await Promise.all(slugs.map((s) => getCreditCardBySlug(s)));
  if (results.some((c) => !c)) notFound();
  const cards = results as CreditCard[];

  const isAnyPartner = cards.some((c) => c.badge_inputs?.partner_card === true);
  const headerGridClass =
    cards.length === 3
      ? 'grid-cols-1 lg:grid-cols-3 lg:divide-x lg:divide-y-0'
      : 'grid-cols-1 md:grid-cols-2 md:divide-x md:divide-y-0';

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
              Put {cards.length === 3 ? 'three cards' : 'two cards'} next to each other. We show fees, rewards, interest, income notes, and missing data without choosing for you.
            </p>
          </div>
        </header>

        <main className="relative z-20 mx-auto max-w-6xl space-y-6 px-4 pt-6 sm:-mt-8">
          {/* Card header: visuals + best-for labels */}
          <section className="overflow-hidden rounded-[1.4rem] border border-brand-border bg-white shadow-xl shadow-black/5 dark:border-white/10 dark:bg-[#111827]">
            <div
              className={`grid divide-y divide-brand-border bg-slate-50 dark:divide-white/10 dark:bg-slate-900/70 ${headerGridClass}`}
            >
              {cards.map((card) => {
                const bestFor = computeBestFor(card);
                return (
                  <div key={card.id} className="p-6 md:p-8">
                    <div className="grid gap-5 sm:grid-cols-[13rem_minmax(0,1fr)]">
                      <CreditCardVisual card={card} />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary">
                          {formatCardMeta(card)}
                        </p>
                        <h2 className="mt-2 text-2xl font-bold leading-tight text-brand-textPrimary dark:text-white">
                          {card.card_name}
                        </h2>
                        <p className="mt-1 text-sm text-brand-textSecondary dark:text-gray-300">
                          {card.bank}
                        </p>
                        {bestFor && (
                          <span
                            className={`mt-3 inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${bestFor.color}`}
                          >
                            Best for: {bestFor.label}
                          </span>
                        )}
                        <CreditCardTrustBadges card={card} limit={3} className="mt-4" />
                      </div>
                    </div>
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                      <Link
                        href={`/credit-cards/reviews/${card.normalized_card_key}`}
                        className="inline-flex flex-1 items-center justify-center rounded-full border border-brand-border bg-white px-4 py-3 text-sm font-semibold text-brand-textPrimary transition-colors hover:border-brand-primary/25 hover:text-brand-primary dark:border-white/10 dark:bg-white/[0.05] dark:text-gray-100"
                      >
                        View card details
                      </Link>
                      <a
                        href={card.source_url}
                        target="_blank"
                        rel="nofollow noopener noreferrer"
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-brand-primary px-4 py-3 text-sm font-semibold text-white shadow-md shadow-brand-primary/20 transition-colors hover:bg-brand-primary/90"
                      >
                        Visit bank site
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                );
              })}
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

          {/* Key Differences summary block */}
          <KeyDiffsBlock cards={cards} />

          <section className="overflow-hidden rounded-[1.4rem] border border-brand-border bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
            <CompareSectionTitle title="Basic details" n={cards.length} />
            <CompareRow label="Bank" values={cards.map((c) => c.bank)} n={cards.length} />
            <CompareRow label="Network / tier" values={cards.map((c) => formatCardMeta(c))} n={cards.length} />
            <CompareRow label="Yearly fee" values={cards.map((c) => formatAnnualFee(c))} n={cards.length} />
            <CompareRow
              label="Waiver condition"
              values={cards.map((c) => c.annual_fee_waiver_condition ?? 'No public data')}
              muted={cards.map((c) => c.annual_fee_waiver_condition === null)}
              n={cards.length}
            />
            <CompareRow
              label="Waiver threshold"
              values={cards.map((c) => formatPhpNullable(c.annual_fee_waiver_threshold))}
              muted={cards.map((c) => c.annual_fee_waiver_threshold === null)}
              n={cards.length}
            />

            <CompareSectionTitle title="Rewards and requirements" n={cards.length} />
            <CompareRow label="Reward type" values={cards.map((c) => formatRewardType(c.rewards_type))} n={cards.length} />
            <CompareRow label="Reward formula" values={cards.map((c) => formatRewardFormula(c.rewards_formula))} n={cards.length} />
            <CompareRow
              label="Peso value"
              values={cards.map(() => 'Not yet verified')}
              muted={cards.map(() => true)}
              n={cards.length}
            />
            <CompareRow
              label="Minimum income"
              values={cards.map((c) => formatIncome(c))}
              muted={cards.map((c) => c.min_income_monthly === null && c.min_income_annual === null)}
              n={cards.length}
            />
            <CompareRow
              label="Income filter"
              values={cards.map((c) => (c.income_filter_ready ? 'Ready' : 'Off for now'))}
              muted={cards.map((c) => !c.income_filter_ready)}
              n={cards.length}
            />
            <CompareRow label="Things to check" values={cards.map((c) => formatCheckSummary(c))} n={cards.length} />

            <CompareSectionTitle title="Fees and source" n={cards.length} />
            <CompareRow
              label="Interest rate"
              values={cards.map((c) => formatMonthlyRate(c.interest_rate_pct))}
              muted={cards.map((c) => c.interest_rate_pct === null)}
              n={cards.length}
            />
            <CompareRow
              label="Foreign card fee"
              values={cards.map((c) => formatPercent(c.foreign_transaction_fee_pct))}
              muted={cards.map((c) => c.foreign_transaction_fee_pct === null)}
              n={cards.length}
            />
            <CompareRow
              label="Cash advance fee"
              values={cards.map((c) => formatCashAdvance(c))}
              muted={cards.map((c) => c.cash_advance_fee_amount === null && c.cash_advance_fee_pct === null)}
              n={cards.length}
            />
            <CompareRow
              label="Late payment fee"
              values={cards.map((c) => formatPhpNullable(c.late_payment_fee_amount))}
              muted={cards.map((c) => c.late_payment_fee_amount === null)}
              n={cards.length}
            />
            <CompareRow
              label="Overlimit fee"
              values={cards.map((c) => formatPhpNullable(c.overlimit_fee_amount))}
              muted={cards.map((c) => c.overlimit_fee_amount === null)}
              n={cards.length}
            />
            <CompareRow
              label="Active linked promos"
              values={cards.map((c) => formatPromoCount(c.active_promo_count))}
              n={cards.length}
            />
            <CompareRow label="Source updated" values={cards.map((c) => formatDate(c.last_scraped_at))} n={cards.length} />
          </section>

          <section className="rounded-[1.4rem] border border-brand-border bg-white p-5 text-sm leading-relaxed text-brand-textSecondary shadow-sm dark:border-white/10 dark:bg-white/[0.04] dark:text-gray-300">
            Truva is an independent comparison platform. Bank-site buttons open public source pages directly.
            {isAnyPartner
              ? ' One or more products above may be partner placements; inspect the card detail page for row-level disclosure.'
              : ' No partner badge is active on these rows.'}
          </section>
        </main>
      </div>
    </>
  );
}

// ─── Parse slug ──────────────────────────────────────────────────────────────

function parseCompareSlug(slug: string): string[] | null {
  const parts: string[] = [];
  let remaining = slug;
  let idx: number;
  while ((idx = remaining.indexOf('-vs-')) !== -1) {
    parts.push(decodeURIComponent(remaining.slice(0, idx)));
    remaining = remaining.slice(idx + 4);
  }
  parts.push(decodeURIComponent(remaining));
  if (parts.length < 2 || parts.length > 3) return null;
  if (parts.some((p) => !p.trim())) return null;
  return parts;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function computeBestFor(card: CreditCard): { label: string; color: string } | null {
  if (card.naffl || card.annual_fee_recurring === 0)
    return { label: 'No Annual Fee', color: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-500/20' };
  if (card.min_income_monthly !== null && card.min_income_monthly <= 21000)
    return { label: 'First Card', color: 'bg-brand-primaryLight text-brand-primary border-brand-primary/15 dark:bg-brand-primary/10 dark:border-brand-primary/25' };
  if (card.rewards_type === 'miles' || card.card_tier === 'signature' || card.card_tier === 'infinite')
    return { label: 'Travel', color: 'bg-sky-50 text-sky-700 border-sky-100 dark:bg-sky-900/20 dark:text-sky-300 dark:border-sky-500/20' };
  if (card.rewards_type === 'cashback')
    return { label: 'Cashback', color: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-500/20' };
  if (card.rewards_type === 'points')
    return { label: 'Points Rewards', color: 'bg-violet-50 text-violet-700 border-violet-100 dark:bg-violet-900/20 dark:text-violet-300 dark:border-violet-500/20' };
  return null;
}

function KeyDiffsBlock({ cards }: { cards: CreditCard[] }) {
  function findWinnerIdx(vals: (number | null)[]): number | null {
    const valid = vals
      .map((v, i) => (v !== null ? ([v, i] as [number, number]) : null))
      .filter(Boolean) as [number, number][];
    if (valid.length === 0) return null;
    const best = valid.reduce((a, b) => (b[0] < a[0] ? b : a));
    const ties = valid.filter(([v]) => v === best[0]);
    return ties.length === 1 ? best[1] : null;
  }

  const annualFees = cards.map((c) => (c.naffl ? 0 : c.annual_fee_recurring));
  const incomes = cards.map((c) =>
    c.min_income_monthly ?? (c.min_income_annual ? Math.round(c.min_income_annual / 12) : null),
  );
  const fxFees = cards.map((c) => c.foreign_transaction_fee_pct);
  const ewalletFlags = cards.map((c) => (c.badge_inputs?.no_ewallet_earn ? 1 : 0));

  type DiffRow = { label: string; values: string[]; winnerIdx: number | null; note?: string };

  const rows: DiffRow[] = [
    { label: 'Annual fee', values: cards.map((c) => formatAnnualFee(c)), winnerIdx: findWinnerIdx(annualFees), note: 'Lower is better' },
    { label: 'Min. income / mo', values: cards.map((c) => formatIncome(c)), winnerIdx: findWinnerIdx(incomes), note: 'Lower = more accessible' },
    { label: 'Rewards', values: cards.map((c) => `${formatRewardType(c.rewards_type)} — ${formatRewardFormula(c.rewards_formula)}`), winnerIdx: null },
    { label: 'Foreign fee', values: cards.map((c) => formatPercent(c.foreign_transaction_fee_pct)), winnerIdx: findWinnerIdx(fxFees), note: 'Lower is better for overseas use' },
    { label: 'GCash / Maya earn', values: cards.map((c) => (c.badge_inputs?.no_ewallet_earn ? 'No earn on e-wallets' : 'No restriction noted')), winnerIdx: findWinnerIdx(ewalletFlags) },
  ];

  const gridClass =
    cards.length === 3
      ? 'md:grid-cols-[13rem_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]'
      : 'md:grid-cols-[13rem_minmax(0,1fr)_minmax(0,1fr)]';

  return (
    <section className="overflow-hidden rounded-[1.4rem] border border-brand-border bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
      <div className="border-b border-brand-border bg-brand-surface px-5 py-4 dark:border-white/10 dark:bg-white/[0.03]">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-primary">Key Differences</p>
        <p className="mt-1 text-sm text-brand-textSecondary dark:text-gray-400">
          The five fields that matter most for a Philippine card comparison.{' '}
          <CheckCircle2 className="inline h-3.5 w-3.5 text-emerald-500" /> marks a clear advantage
          where public data allows.
        </p>
      </div>

      {rows.map((row) => (
        <div
          key={row.label}
          className={`grid border-b border-brand-border last:border-b-0 dark:border-white/10 ${gridClass}`}
        >
          <div className="border-b border-brand-border bg-slate-50/70 px-4 py-3 dark:border-white/10 dark:bg-slate-900/40 md:border-b-0 md:border-r">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-textSecondary dark:text-gray-400">
              {row.label}
            </p>
            {row.note && (
              <p className="mt-0.5 text-[10px] text-brand-textSecondary/70 dark:text-gray-500">
                {row.note}
              </p>
            )}
          </div>
          {row.values.map((val, idx) => (
            <KeyDiffCell key={idx} value={val} winner={row.winnerIdx === idx} last={idx === row.values.length - 1} />
          ))}
        </div>
      ))}
    </section>
  );
}

function KeyDiffCell({ value, winner, last = false }: { value: string; winner: boolean; last?: boolean }) {
  return (
    <div
      className={`flex min-h-[3.5rem] items-start gap-2 border-b border-brand-border px-4 py-3 dark:border-white/10 md:border-b-0 ${last ? '' : 'md:border-r'}`}
    >
      {winner ? (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
      ) : (
        <Minus className="mt-0.5 h-4 w-4 shrink-0 text-brand-border dark:text-white/20" />
      )}
      <p className={winner ? 'text-sm font-semibold text-emerald-700 dark:text-emerald-300' : 'text-sm font-medium text-brand-textSecondary dark:text-gray-400'}>
        {value}
      </p>
    </div>
  );
}

function CompareSectionTitle({ title, n }: { title: string; n: number }) {
  const gridClass =
    n === 3
      ? 'md:grid-cols-[13rem_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]'
      : 'md:grid-cols-[13rem_minmax(0,1fr)_minmax(0,1fr)]';
  return (
    <div className={`grid border-b border-brand-border dark:border-white/10 ${gridClass}`}>
      <div className="col-span-full border-b border-brand-border bg-brand-surface px-4 py-3 dark:border-white/10 dark:bg-white/[0.03] md:col-span-1 md:border-b-0">
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-brand-primary">{title}</h2>
      </div>
    </div>
  );
}

function CompareRow({
  label,
  values,
  muted = [],
  n,
}: {
  label: string;
  values: ReactNode[];
  muted?: boolean[];
  n: number;
}) {
  const gridClass =
    n === 3
      ? 'md:grid-cols-[13rem_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]'
      : 'md:grid-cols-[13rem_minmax(0,1fr)_minmax(0,1fr)]';
  return (
    <div className={`grid border-b border-brand-border last:border-b-0 dark:border-white/10 ${gridClass}`}>
      <div className="border-b border-brand-border bg-slate-50/70 px-4 py-3 dark:border-white/10 dark:bg-slate-900/40 md:border-b-0 md:border-r">
        <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-textSecondary dark:text-gray-400">
          {label}
        </h3>
      </div>
      {values.map((val, idx) => (
        <CompareCell key={idx} muted={muted[idx] ?? false} last={idx === values.length - 1}>
          {val}
        </CompareCell>
      ))}
    </div>
  );
}

function CompareCell({ children, muted, last = false }: { children: ReactNode; muted?: boolean; last?: boolean }) {
  return (
    <div
      className={`min-h-[3.5rem] border-b border-brand-border px-4 py-3 dark:border-white/10 md:border-b-0 ${last ? '' : 'md:border-r'}`}
    >
      <p className={muted ? 'text-sm font-medium text-brand-textSecondary dark:text-gray-400' : 'text-sm font-semibold text-brand-textPrimary dark:text-gray-100'}>
        {children}
      </p>
    </div>
  );
}

// ─── Format helpers ───────────────────────────────────────────────────────────

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
    case 'cashback': return 'Cashback';
    case 'miles': return 'Miles';
    case 'points': return 'Points';
    default: return 'None captured';
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
  return new Intl.DateTimeFormat('en-PH', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(value));
}

function formatPhpAmount(amount: number) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 })
    .format(amount)
    .replace('PHP', 'PHP ');
}
