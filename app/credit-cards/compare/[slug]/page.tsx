import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { CheckCircle2, ChevronLeft, ExternalLink, Minus } from 'lucide-react';
import { CreditCardVisual } from '@/components/credit-cards/CreditCardVisual';
import { getCreditCardBySlug, getEditorialFor } from '@/lib/credit-cards';
import { getPromoTCUrlFor } from '@/lib/creditCardEditorial';
import { formatCashAdvanceFeeLabel, formatFeeWaiverCondition } from '@/lib/creditCardFinder/detail';
import { AffiliateDisclosure } from '@/components/credit-cards/shared/AffiliateDisclosure';
import type { CreditCard } from '@/types';

export const dynamic = 'force-dynamic';

const DEPOSIT_HOLDOUT_CARD_KEYS = new Set(['bdo_secured_credit_card']);
const INVITATION_ONLY_CARD_KEYS = new Set(['bdo_world_elite_mastercard']);

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

  const editorials = cards.map((c) => getEditorialFor(c));

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
              Compare your card matches side by side
            </h1>
            <div className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/90 space-y-1">
              <p>We compare fees, rewards, interest rates, and required incomes next to each other.</p>
              <p className="text-sm text-white/70">We show you the facts without selecting for you.</p>
            </div>
          </div>
        </header>

        <main className="relative z-20 mx-auto max-w-6xl space-y-6 px-4 pt-6 sm:-mt-8">
          {/* Sticky Compact Header for Desktop (md+) */}
          <div className="sticky top-0 z-40 hidden md:block bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border border-brand-border dark:border-white/10 py-3 shadow-md md:rounded-2xl">
            <div className={`grid ${
              cards.length === 3
                ? 'grid-cols-[13rem_1fr_1fr_1fr]'
                : 'grid-cols-[13rem_1fr_1fr]'
            } items-center`}>
              <div className="flex items-center px-6">
                <span className="text-xs font-bold uppercase tracking-widest text-brand-primary dark:text-blue-400">Comparing</span>
              </div>
              {cards.map((card) => (
                <div key={card.id} className="flex items-center gap-3 px-6 border-l border-brand-border dark:border-white/10">
                  <div className="h-6 w-9 shrink-0 overflow-hidden rounded border border-black/10 dark:border-white/10">
                    <CreditCardVisual card={card} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-brand-textPrimary dark:text-white">{card.card_name}</p>
                    <p className="truncate text-[10px] text-brand-textSecondary dark:text-gray-400">{card.bank}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card header: visuals + info */}
          <section className="overflow-hidden rounded-[1.4rem] border border-brand-border bg-white shadow-xl shadow-black/5 dark:border-white/10 dark:bg-[#111827]">
            <div
              className={`grid divide-y divide-brand-border bg-slate-50 dark:divide-white/10 dark:bg-slate-900/70 ${headerGridClass}`}
            >
              {cards.map((card) => {
                return (
                  <div key={card.id} className="flex flex-col items-center p-6 text-center md:p-8">
                    <div className="mx-auto w-full max-w-[14rem]">
                      <CreditCardVisual card={card} />
                    </div>
                    <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary">
                      {formatCardMeta(card)}
                    </p>
                    <h2 className="mt-1.5 text-lg font-bold leading-tight text-brand-textPrimary dark:text-white">
                      {card.card_name}
                    </h2>
                    <p className="mt-1 text-sm text-brand-textSecondary dark:text-gray-300">
                      {card.bank}
                    </p>
                    <div className="mt-6 space-y-2.5">
                      <div className="flex flex-col gap-3 sm:flex-row">
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
                      <AffiliateDisclosure size="compact" className="justify-center" />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Key Differences summary block */}
          <KeyDiffsBlock cards={cards} />

          <div className="w-full overflow-x-auto scrollbar-thin border border-brand-border rounded-[1.4rem] dark:border-white/10 shadow-sm bg-white dark:bg-[#111827]">
            <section className="min-w-max md:min-w-0">
              <CompareSectionTitle title="Truva Notes" n={cards.length} cards={cards} />
              <CompareRow
                label="Plain-English note"
                values={editorials.map((e) => e.why)}
                n={cards.length}
                cards={cards}
              />
              <CompareRow
                label="Bank-listed promo"
                values={editorials.map((e, idx) => {
                  const promoText = e.welcomePromo ?? 'No current welcome promo tracked by Truva.';
                  return (
                    <span key={cards[idx].id}>
                      {promoText}
                      {e.welcomePromo && (
                        <>
                          {' '}
                          <a
                            href={getPromoTCUrlFor(cards[idx].bank, cards[idx].normalized_card_key)}
                            target="_blank"
                            rel="nofollow noopener noreferrer"
                            className="inline text-[11px] font-semibold text-brand-textSecondary underline decoration-brand-textSecondary/40 underline-offset-2 transition-colors hover:text-brand-primary hover:decoration-brand-primary/40 dark:text-gray-400 dark:hover:text-blue-400"
                          >
                            Terms &amp; Conditions
                          </a>
                        </>
                      )}
                    </span>
                  );
                })}
                n={cards.length}
                cards={cards}
              />
              <CompareRow
                label="Who it is for"
                values={editorials.map((e) => e.targetUser ?? 'Daily savers looking for transparent bank deals')}
                n={cards.length}
                cards={cards}
              />
              <CompareRow
                label="Unique advantage"
                values={editorials.map((e) => e.valueAdd ?? 'No fee waived details specified')}
                n={cards.length}
                cards={cards}
              />

              <CompareSectionTitle title="Basic details" n={cards.length} cards={cards} />
              <CompareRow label="Yearly fee" values={cards.map((c) => formatAnnualFee(c))} n={cards.length} cards={cards} />
              <CompareRow
                label="Waiver condition"
                values={cards.map((c) => formatFeeWaiverCondition(c) ?? 'No public data')}
                muted={cards.map((c) => !formatFeeWaiverCondition(c))}
                n={cards.length}
                cards={cards}
              />
              <CompareRow
                label="Waiver threshold"
                values={cards.map((c) => formatPhpNullable(c.annual_fee_waiver_threshold))}
                muted={cards.map((c) => c.annual_fee_waiver_threshold === null)}
                n={cards.length}
                cards={cards}
              />

              <CompareSectionTitle title="Rewards and requirements" n={cards.length} cards={cards} />
              <CompareRow label="Reward type" values={cards.map((c) => formatRewardType(c.rewards_type))} n={cards.length} cards={cards} />
              <CompareRow label="Reward formula" values={cards.map((c) => formatRewardFormula(c.rewards_formula))} n={cards.length} cards={cards} />
              <CompareRow
                label="Minimum income"
                values={cards.map((c) => formatIncome(c))}
                muted={cards.map(
                  (c) =>
                    !isDepositHoldoutCard(c) &&
                    !isInvitationOnlyCard(c) &&
                    c.min_income_monthly === null &&
                    c.min_income_annual === null,
                )}
                n={cards.length}
                cards={cards}
              />

              <CompareSectionTitle title="Fees and source" n={cards.length} cards={cards} />
              <CompareRow
                label="Interest rate"
                values={cards.map((c) => formatMonthlyRate(c.interest_rate_pct))}
                muted={cards.map((c) => c.interest_rate_pct === null)}
                n={cards.length}
                cards={cards}
              />
              <CompareRow
                label="Foreign card fee"
                values={cards.map((c) => formatPercent(c.foreign_transaction_fee_pct))}
                muted={cards.map((c) => c.foreign_transaction_fee_pct === null)}
                n={cards.length}
                cards={cards}
              />
              <CompareRow
                label="Cash advance fee"
                values={cards.map((c) => formatCashAdvance(c))}
                muted={cards.map((c) => !formatCashAdvanceFeeLabel(c))}
                n={cards.length}
                cards={cards}
              />
              <CompareRow
                label="Late payment fee"
                values={cards.map((c) => formatPhpNullable(c.late_payment_fee_amount))}
                muted={cards.map((c) => c.late_payment_fee_amount === null)}
                n={cards.length}
                cards={cards}
              />
              <CompareRow
                label="Overlimit fee"
                values={cards.map((c) => formatPhpNullable(c.overlimit_fee_amount))}
                muted={cards.map((c) => c.overlimit_fee_amount === null)}
                n={cards.length}
                cards={cards}
              />
              <CompareRow label="Source updated" values={cards.map((c) => formatDate(c.last_scraped_at))} n={cards.length} cards={cards} />

              {/* Doubled CTAs at the bottom of the table columns */}
              <CompareRow
                label="Apply"
                values={cards.map((card) => (
                  <div key={card.id} className="space-y-2.5">
                    <a
                      href={card.source_url}
                      target="_blank"
                      rel="nofollow noopener noreferrer"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-primary px-4 py-3 text-sm font-semibold text-white shadow-md shadow-brand-primary/20 transition-colors hover:bg-brand-primary/90"
                    >
                      Visit bank site
                      <ExternalLink className="h-4 w-4" />
                    </a>
                    <AffiliateDisclosure size="compact" className="justify-center" />
                  </div>
                ))}
                n={cards.length}
                cards={cards}
              />
            </section>
          </div>

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

function computeFitLabel(card: CreditCard): { label: string; color: string } | null {
  if (card.naffl || card.annual_fee_recurring === 0)
    return { label: 'No yearly fee', color: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-500/20' };
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
  function findHighlightIdx(vals: (number | null)[]): number | null {
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

  type DiffRow = { label: string; values: string[]; highlightIdx: number | null; note?: string };

  const rows: DiffRow[] = [
    { label: 'Annual fee', values: cards.map((c) => formatAnnualFee(c)), highlightIdx: findHighlightIdx(annualFees), note: 'Lower is better' },
    { label: 'Min. income / mo', values: cards.map((c) => formatIncome(c)), highlightIdx: findHighlightIdx(incomes), note: 'Lower = more accessible' },
    { label: 'Rewards', values: cards.map((c) => `${formatRewardType(c.rewards_type)} — ${formatRewardFormula(c.rewards_formula)}`), highlightIdx: null },
    { label: 'Foreign fee', values: cards.map((c) => formatPercent(c.foreign_transaction_fee_pct)), highlightIdx: findHighlightIdx(fxFees), note: 'Lower is better for overseas use' },
  ];

  const gridClass =
    cards.length === 3
      ? 'grid-cols-[100px_120px_120px_120px] md:grid-cols-[13rem_1fr_1fr_1fr]'
      : 'grid-cols-[100px_1fr_1fr] md:grid-cols-[13rem_1fr_1fr]';

  return (
    <div className="w-full overflow-x-auto scrollbar-thin border border-brand-border rounded-[1.4rem] dark:border-white/10 shadow-sm bg-white dark:bg-[#111827]">
      <section className="min-w-max md:min-w-0">
        <div className={`grid border-b border-brand-border dark:border-white/10 ${gridClass}`}>
          <div className="sticky left-0 z-20 border-r border-brand-border bg-brand-surface px-4 py-4 dark:border-white/10 dark:bg-slate-900 md:border-b-0">
            <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.12em] md:tracking-[0.2em] text-brand-primary dark:text-blue-400">Key Differences</p>
            <p className="mt-1 text-[9px] md:text-xs text-brand-textSecondary dark:text-gray-400 leading-normal">
              The four fields that matter most.
            </p>
          </div>
          {/* Column card name headers */}
          {cards.map((card, idx) => (
            <div
              key={card.id}
              className={`flex items-center bg-brand-surface px-4 py-2.5 ${
                idx < cards.length - 1 ? 'border-r' : ''
              } border-brand-border dark:border-white/10 dark:bg-white/[0.03]`}
            >
              <p className="line-clamp-2 text-[10px] md:text-[11px] font-bold text-brand-textPrimary dark:text-white">
                {card.card_name}
              </p>
            </div>
          ))}
        </div>

        {rows.map((row) => (
          <div
            key={row.label}
            className={`grid border-b border-brand-border last:border-b-0 dark:border-white/10 ${gridClass}`}
          >
            <div className="sticky left-0 z-20 border-r border-brand-border bg-slate-50 dark:border-white/10 dark:bg-slate-900 px-4 py-3 md:border-b-0">
              <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.12em] md:tracking-[0.18em] text-brand-textSecondary dark:text-gray-400">
                {row.label}
              </p>
              {row.note && (
                <p className="mt-0.5 text-[8px] md:text-[10px] text-brand-textSecondary/70 dark:text-gray-500 leading-tight">
                  {row.note}
                </p>
              )}
            </div>
            {row.values.map((val, idx) => (
              <KeyDiffCell key={idx} value={val} highlighted={row.highlightIdx === idx} last={idx === row.values.length - 1} />
            ))}
          </div>
        ))}
      </section>
    </div>
  );
}

function KeyDiffCell({ value, highlighted, last = false }: { value: string; highlighted: boolean; last?: boolean }) {
  return (
    <div
      className={`flex min-h-[3.5rem] flex-col justify-center border-b border-brand-border px-4 py-3 dark:border-white/10 md:border-b-0 ${last ? '' : 'border-r'}`}
    >
      <div className="flex items-start gap-1.5">
        {highlighted ? (
          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
        ) : (
          <Minus className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-border dark:text-white/20" />
        )}
        <p className={highlighted ? 'text-[12px] md:text-sm font-semibold text-emerald-700 dark:text-emerald-300' : 'text-[12px] md:text-sm font-medium text-brand-textSecondary dark:text-gray-400'}>
          {value}
        </p>
      </div>
    </div>
  );
}

function CompareSectionTitle({ title, n, cards }: { title: string; n: number; cards: CreditCard[] }) {
  const gridClass =
    n === 3
      ? 'grid-cols-[100px_120px_120px_120px] md:grid-cols-[13rem_1fr_1fr_1fr]'
      : 'grid-cols-[100px_1fr_1fr] md:grid-cols-[13rem_1fr_1fr]';
  return (
    <div className={`grid border-b border-brand-border dark:border-white/10 ${gridClass}`}>
      <div className="sticky left-0 z-20 border-r border-brand-border bg-brand-surface px-4 py-3 dark:border-white/10 dark:bg-slate-900 md:border-b-0">
        <h2 className="text-[10px] md:text-xs font-bold uppercase tracking-[0.12em] md:tracking-[0.2em] text-brand-primary dark:text-blue-400">{title}</h2>
      </div>
      {/* Column card name headers */}
      {cards.map((card, idx) => (
        <div
          key={card.id}
          className={`flex items-center bg-brand-surface px-4 py-2 ${
            idx < cards.length - 1 ? 'border-r' : ''
          } border-brand-border dark:border-white/10 dark:bg-white/[0.03]`}
        >
          <p className="line-clamp-2 text-[10px] md:text-[11px] font-bold text-brand-textPrimary dark:text-white">
            {card.card_name}
          </p>
        </div>
      ))}
    </div>
  );
}

function CompareRow({
  label,
  values,
  muted = [],
  n,
  cards,
}: {
  label: string;
  values: ReactNode[];
  muted?: boolean[];
  n: number;
  cards: CreditCard[];
}) {
  const gridClass =
    n === 3
      ? 'grid-cols-[100px_120px_120px_120px] md:grid-cols-[13rem_1fr_1fr_1fr]'
      : 'grid-cols-[100px_1fr_1fr] md:grid-cols-[13rem_1fr_1fr]';
  return (
    <div className={`grid border-b border-brand-border last:border-b-0 dark:border-white/10 ${gridClass}`}>
      <div className="sticky left-0 z-20 border-r border-brand-border bg-slate-50 dark:border-white/10 dark:bg-slate-900 px-4 py-3 md:border-b-0">
        <h3 className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.12em] md:tracking-[0.18em] text-brand-textSecondary dark:text-gray-400">
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
      className={`min-h-[3.5rem] flex flex-col justify-center border-b border-brand-border px-4 py-3 dark:border-white/10 md:border-b-0 ${last ? '' : 'border-r'}`}
    >
      <div className={muted ? 'text-[12px] md:text-sm font-medium text-brand-textSecondary dark:text-gray-400' : 'text-[12px] md:text-sm font-semibold text-brand-textPrimary dark:text-gray-100'}>
        {children}
      </div>
    </div>
  );
}

// ─── Format helpers ───────────────────────────────────────────────────────────

function formatCardMeta(card: CreditCard) {
  return [card.card_network, card.card_tier].filter(Boolean).join(' / ') || 'Card details';
}

function formatAnnualFee(card: CreditCard): string {
  if (card.naffl) return 'PHP 0 yearly fee';
  if (card.annual_fee_recurring === 0) return 'PHP 0';

  const isUsd = card.normalized_card_key === 'chinabank_destinations_world_dollar_mastercard';
  const formatAmt = (amt: number) => (isUsd ? `$${amt.toLocaleString()}` : formatPhpAmount(amt));

  if (card.annual_fee_recurring !== null) return formatAmt(card.annual_fee_recurring);
  if (card.annual_fee_first_year !== null) return `${formatAmt(card.annual_fee_first_year)} first year`;
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
  const hasNoYearlyFee =
    card.naffl === true ||
    card.annual_fee_recurring === 0;
  const needsFeeWaiverCheck =
    !hasNoYearlyFee &&
    (card.annual_fee_waiver_condition === null || card.annual_fee_waiver_threshold === null);
  const items = [
    !isDepositHoldoutCard(card) &&
    !isInvitationOnlyCard(card) &&
    card.min_income_monthly === null &&
    card.min_income_annual === null
      ? 'income requirement'
      : null,
    needsFeeWaiverCheck ? 'fee-waiver details' : null,
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
  return formatCashAdvanceFeeLabel(card) ?? 'Not disclosed';
}

function isDepositHoldoutCard(card: CreditCard) {
  return DEPOSIT_HOLDOUT_CARD_KEYS.has(card.normalized_card_key);
}

function isInvitationOnlyCard(card: CreditCard) {
  return INVITATION_ONLY_CARD_KEYS.has(card.normalized_card_key);
}

function formatIncome(card: CreditCard) {
  if (isDepositHoldoutCard(card)) return 'Deposit holdout from PHP 10,000';
  if (isInvitationOnlyCard(card)) return 'By invitation only';
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
