import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  ChevronLeft,
  ExternalLink,
  Info,
  Sparkles,
} from 'lucide-react';
import { CreditCardTrustBadges, ScorePendingNotice, TheCatchPanel } from '@/components/credit-cards/CreditCardTrustBadges';
import { CreditCardVisual } from '@/components/credit-cards/CreditCardVisual';
import { TrueValueScoreBadge } from '@/components/product/TrueValueScoreBadge';
import { getCreditCardBySlug, getEditorialFor } from '@/lib/credit-cards';
import { estimateAnnualValue, BROWSE_DEFAULT_INCOME, BROWSE_DEFAULT_CATEGORY } from '@/lib/creditCardValue';
import type { BadgeInputs, CreditCard } from '@/types';

export const dynamic = 'force-dynamic';

export async function generateMetadata(
  props: { params: Promise<{ slug: string }> | { slug: string } },
): Promise<Metadata> {
  const params = await props.params;
  const slug = decodeCardSlug(params?.slug ?? '');
  const card = await getCreditCardBySlug(slug);
  if (!card) return {};

  return {
    title: `${card.card_name} Details`,
    description: `Plain-English details for the ${card.card_name} by ${card.bank}: fees, rewards, income notes, source links, and missing data.`,
    alternates: { canonical: `/credit-cards/reviews/${card.normalized_card_key}` },
  };
}

export default async function CreditCardReviewPage(
  props: { params: Promise<{ slug: string }> | { slug: string } },
) {
  const params = await props.params;
  const slug = decodeCardSlug(params?.slug ?? '');
  const card = await getCreditCardBySlug(slug);

  if (!card) notFound();

  const isPartnerCard = card.badge_inputs?.partner_card === true;
  const coverage = getFieldCoverage(card);
  const annualEst = estimateAnnualValue(card, BROWSE_DEFAULT_INCOME, BROWSE_DEFAULT_CATEGORY);
  const editorial = getEditorialFor(card);

  return (
    <>
      <div className="min-h-screen bg-brand-surface pb-32 dark:bg-slate-950 sm:pb-24">
        <header className="relative overflow-hidden bg-brand-primary px-4 py-10 text-white">
          <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent" />
          <div className="relative z-10 mx-auto max-w-5xl">
            <Link
              href="/credit-cards"
              className="mb-6 inline-flex items-center text-sm text-white/80 transition-colors hover:text-white"
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to card desk
            </Link>

            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="flex flex-wrap gap-2">
                  {isPartnerCard ? (
                    <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/60 bg-amber-400/20 px-3 py-1.5 text-xs font-bold text-white">
                      <Sparkles className="h-3.5 w-3.5" />
                      Partner disclosure applies
                    </span>
                  ) : null}
                  <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90">
                    {formatCardMeta(card)}
                  </span>
                </div>

                <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
                  {card.card_name}
                </h1>
                <p className="mt-2 text-lg text-white/80">{card.bank}</p>
              </div>

              <div className="space-y-3">
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/70">
                    You could keep / year
                  </p>
                  <p className="mt-1 text-3xl font-black tabular-nums text-white">
                    {'₱' + Math.round(annualEst.netAnnual).toLocaleString('en-PH')}
                  </p>
                  <p className="mt-1 text-[11px] text-white/60">
                    Based on ₱25,000/mo income · grocery spending
                  </p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <TrueValueScoreBadge showReason className="text-white" />
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="relative z-20 mx-auto max-w-5xl space-y-6 px-4 pt-6 sm:-mt-8">
          <section className="rounded-[1.4rem] border border-brand-border bg-white p-5 shadow-xl shadow-black/5 dark:border-white/10 dark:bg-[#111827] sm:p-6">
            <div className="grid gap-5 lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-start">
              <CreditCardVisual card={card} />
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">
                    Card facts
                  </p>
                  <h2 className="mt-2 text-2xl font-bold tracking-tight text-brand-textPrimary dark:text-white">
                    Fees, rewards, and missing fields in one place
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
                    This page shows what Truva has captured and marks what still needs checking with the bank.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <FactTile label="Yearly fee" value={formatAnnualFee(card)} detail={card.annual_fee_waiver_condition ?? 'Waiver data incomplete'} />
                  <FactTile label="Rewards" value={formatRewardType(card.rewards_type)} detail={formatRewardFormula(card.rewards_formula)} />
                  <FactTile label="Interest" value={formatMonthlyRate(card.interest_rate_pct)} detail="Monthly rate when disclosed" />
                  <FactTile label="Foreign card fee" value={formatPercent(card.foreign_transaction_fee_pct)} detail="Fee for non-PHP or overseas transactions" />
                </div>
                <CreditCardTrustBadges card={card} limit={6} />
              </div>
            </div>
          </section>

          <section className="rounded-[1.4rem] border border-brand-border bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04] sm:p-6">
            <div className="flex items-start gap-3">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-brand-primary" />
              <div>
                <h2 className="text-xl font-bold tracking-tight text-brand-textPrimary dark:text-white">
                  Scores are coming later for this card
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
                  Truva can show the card details below, but this row is not ready for scoring yet.
                </p>
                {card.score_suppressed_reason ? (
                  <p className="mt-3 rounded-xl border border-brand-border bg-brand-surface p-3 text-xs leading-relaxed text-brand-textSecondary dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-400">
                    {card.score_suppressed_reason}
                  </p>
                ) : null}
                <div className="mt-3">
                  <ScorePendingNotice />
                </div>
              </div>
            </div>
          </section>

          {/* Editorial: why / pros / cons */}
          <section className="rounded-[1.4rem] border border-brand-border bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04] sm:p-6">
            <div className="mb-4 flex items-center gap-2 text-sm font-bold text-brand-primary">
              <Sparkles className="h-4 w-4" />
              What you should know about this card
            </div>
            <p className="mb-4 text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
              {editorial.why}
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h4 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="h-3.5 w-3.5" /> What&apos;s good
                </h4>
                <ul className="space-y-1.5">
                  {editorial.pros.map((p, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-brand-textSecondary dark:text-gray-300">
                      <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />{p}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="h-3.5 w-3.5" /> Things to know
                </h4>
                <ul className="space-y-1.5">
                  {editorial.cons.map((p, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-brand-textSecondary dark:text-gray-300">
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />{p}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
            <div className="space-y-6">
              <FactSection title="Fees to check" description="Known public fields stay visible. Missing fields are preserved instead of collapsed.">
                <DetailRow label="Annual fee" value={formatAnnualFee(card)} />
                <DetailRow label="Waiver condition" value={card.annual_fee_waiver_condition ?? 'No public data'} muted={card.annual_fee_waiver_condition === null} />
                <DetailRow label="Waiver threshold" value={formatWaiverThreshold(card.annual_fee_waiver_threshold)} muted={card.annual_fee_waiver_threshold === null} />
                <DetailRow label="Interest rate" value={formatMonthlyRate(card.interest_rate_pct)} muted={card.interest_rate_pct === null} />
                <DetailRow label="Effective annual rate" value={formatPercent(card.interest_rate_effective_annual)} muted={card.interest_rate_effective_annual === null} />
                <DetailRow label="Foreign fee" value={formatPercent(card.foreign_transaction_fee_pct)} muted={card.foreign_transaction_fee_pct === null} />
                <DetailRow label="Cash advance fee" value={formatCashAdvance(card)} muted={card.cash_advance_fee_amount === null && card.cash_advance_fee_pct === null} />
                <DetailRow label="Late payment fee" value={formatPhpNullable(card.late_payment_fee_amount)} muted={card.late_payment_fee_amount === null} />
                <DetailRow label="Overlimit fee" value={formatPhpNullable(card.overlimit_fee_amount)} muted={card.overlimit_fee_amount === null} />
                <DetailRow label="Minimum amount due" value={card.minimum_amount_due_formula ?? 'Not disclosed'} muted={card.minimum_amount_due_formula === null} />
              </FactSection>

              <FactSection title="Rewards and benefits" description="Rewards are shown in the bank's own terms. Peso value is not ready yet.">
                <DetailRow label="Reward type" value={formatRewardType(card.rewards_type)} />
                <DetailRow label="Formula summary" value={formatRewardFormula(card.rewards_formula)} />
                <DetailRow label="Peso value" value="Not yet verified" muted />
              </FactSection>

              <FactSection title="Requirements" description="Income filters wait until minimum income details are complete.">
                <DetailRow label="Minimum monthly income" value={formatIncome(card)} muted={card.min_income_monthly === null && card.min_income_annual === null} />
                <DetailRow label="Income source text" value={card.min_income_source_text ?? 'No public data'} muted={card.min_income_source_text === null} />
                <DetailRow label="Income filter" value={card.income_filter_ready ? 'Ready' : 'Not yet verified'} muted={!card.income_filter_ready} />
              </FactSection>
            </div>

            <aside className="space-y-6">
              <TheCatchPanel card={card} />

              <FactSection title="Fine-print badges" description="Badges are computed upstream and only shown when active.">
                <BadgeGrid badges={card.badge_inputs} />
              </FactSection>

              <FactSection title="Promos" description="Promos are helpful context, but check the regular fees and rewards too.">
                <div className="rounded-xl border border-brand-border bg-brand-surface/70 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                  <p className="text-sm font-bold text-brand-textPrimary dark:text-white">
                    {card.active_promo_count > 0
                      ? `${card.active_promo_count} active linked promo`
                      : 'No active linked promo in Truva data'}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-brand-textSecondary dark:text-gray-400">
                    Promos can change. Use them as extra context, not the only reason to choose a card.
                  </p>
                </div>
              </FactSection>

              <FactSection title="Source and freshness" description="Bank site links leave Truva and open the public source.">
                <div className="space-y-3">
                  <DetailPill label="Source checked" value="Bank source linked" />
                  <DetailPill label="Source updated" value={formatDate(card.last_scraped_at)} />
                  <DetailPill label="Fields visible" value={`${coverage.known}/${coverage.total}`} />
                  <DetailPill label="Fields missing" value={`${coverage.missing}/${coverage.total}`} />
                  <DetailPill label="Partner status" value={isPartnerCard ? 'Partner disclosure applies' : 'No partner badge on this row'} />
                  <a
                    href={card.source_url}
                    target="_blank"
                    rel="nofollow noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-primary px-4 py-3 text-sm font-bold text-white shadow-lg shadow-brand-primary/20 transition-colors hover:bg-brand-primary/90"
                  >
                    Visit bank site
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </FactSection>
            </aside>
          </section>
        </main>

        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-brand-border bg-white/95 px-4 py-3 shadow-[0_-18px_60px_-40px_rgba(15,23,42,0.55)] backdrop-blur dark:border-white/10 dark:bg-slate-950/95 sm:hidden">
          <div className="flex gap-2">
            <Link
              href="/credit-cards"
              className="inline-flex flex-1 items-center justify-center rounded-xl border border-brand-border bg-brand-surface px-4 py-3 text-sm font-bold text-brand-textPrimary dark:border-white/10 dark:bg-white/[0.05] dark:text-gray-100"
            >
              Card desk
            </Link>
            <a
              href={card.source_url}
              target="_blank"
              rel="nofollow noopener noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-primary px-4 py-3 text-sm font-bold text-white"
            >
              Visit bank site
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

function decodeCardSlug(slug: string) {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

function getFieldCoverage(card: CreditCard) {
  const fields = [
    card.annual_fee_recurring,
    card.annual_fee_waiver_condition,
    card.annual_fee_waiver_threshold,
    card.rewards_type,
    card.rewards_formula,
    card.interest_rate_pct,
    card.foreign_transaction_fee_pct,
    card.min_income_monthly ?? card.min_income_annual,
    card.min_income_source_text,
    card.last_scraped_at,
  ];
  const known = fields.filter((field) => field !== null && field !== undefined && field !== '').length;

  return {
    total: fields.length,
    known,
    missing: fields.length - known,
  };
}

function FactSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[1.4rem] border border-brand-border bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
      <div className="mb-4">
        <h2 className="text-xl font-bold tracking-tight text-brand-textPrimary dark:text-white">{title}</h2>
        <p className="mt-1 text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">{description}</p>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function FactTile({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="min-h-[6.5rem] rounded-xl border border-brand-border bg-brand-surface/80 p-4 dark:border-white/10 dark:bg-slate-950/40">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-textSecondary dark:text-gray-400">
        {label}
      </p>
      <p className="mt-2 text-lg font-bold tabular-nums text-brand-textPrimary dark:text-white">{value}</p>
      <p className="mt-1 text-xs leading-relaxed text-brand-textSecondary dark:text-gray-400">{detail}</p>
    </div>
  );
}

function DetailRow({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="grid gap-1 rounded-xl border border-brand-border bg-brand-surface/70 p-3 dark:border-white/10 dark:bg-white/[0.03] sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-textSecondary dark:text-gray-400">
        {label}
      </p>
      <p className={muted ? 'text-sm font-medium text-brand-textSecondary dark:text-gray-400' : 'text-sm font-semibold text-brand-textPrimary dark:text-gray-100'}>
        {value}
      </p>
    </div>
  );
}

function DetailPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-brand-border bg-brand-surface/70 p-3 dark:border-white/10 dark:bg-white/[0.03]">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-textSecondary dark:text-gray-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-brand-textPrimary dark:text-gray-100">{value}</p>
    </div>
  );
}

type BadgeEntry = {
  key: keyof BadgeInputs;
  label: string;
  type: 'positive' | 'catch' | 'info';
  detail: string;
};

const BADGE_GRID: BadgeEntry[] = [
  { key: 'true_naffl', label: 'True NAFFL', type: 'positive', detail: 'No annual fee for life with no spend threshold captured.' },
  { key: 'low_fx_fee', label: 'Low foreign fee', type: 'positive', detail: 'Fee for non-PHP or overseas transactions is 1.85% or lower.' },
  { key: 'full_medical_coverage', label: 'Full medical coverage', type: 'positive', detail: 'Travel insurance covers medical expenses abroad.' },
  { key: 'high_fx_fee', label: 'High foreign fee', type: 'catch', detail: 'Fee for non-PHP or overseas transactions is 2.75% or higher.' },
  { key: 'earn_cap', label: 'Earn cap', type: 'catch', detail: 'Rewards have a monthly or annual earn cap.' },
  { key: 'narrow_mcc', label: 'Narrow earn categories', type: 'catch', detail: 'Bonus earn is restricted to narrow merchant categories.' },
  { key: 'rewards_devalued', label: 'Rewards devalued', type: 'catch', detail: 'Rewards program was devalued in the past 12 months.' },
  { key: 'accident_only_insurance', label: 'Accident-only insurance', type: 'catch', detail: 'Travel insurance covers accidents only, not medical emergencies abroad.' },
  { key: 'no_ewallet_earn', label: 'No e-wallet earn', type: 'info', detail: 'GCash and Maya loads earn no rewards in the current interpretation.' },
  { key: 'partner_card', label: 'Partner card', type: 'info', detail: 'Truva has an affiliate relationship with this bank.' },
];

function BadgeGrid({ badges }: { badges: BadgeInputs | null }) {
  const active = badges ? BADGE_GRID.filter((badge) => badges[badge.key]) : [];

  if (active.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-brand-border bg-brand-surface/70 p-4 dark:border-white/10 dark:bg-white/[0.03]">
        <p className="text-sm font-semibold text-brand-textPrimary dark:text-white">No fine-print badges yet</p>
        <p className="mt-1 text-xs leading-relaxed text-brand-textSecondary dark:text-gray-400">
          This does not mean the card has no catches. It means no badge input is active in the current public row.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {active.map((badge) => {
        const Icon = badge.type === 'positive' ? CheckCircle : badge.type === 'catch' ? AlertTriangle : Info;
        const classes =
          badge.type === 'positive'
            ? 'border-emerald-100 bg-emerald-50/60 text-emerald-700 dark:border-emerald-800/30 dark:bg-emerald-900/10 dark:text-emerald-300'
            : badge.type === 'catch'
              ? 'border-amber-100 bg-amber-50/60 text-amber-700 dark:border-amber-800/30 dark:bg-amber-900/10 dark:text-amber-300'
              : 'border-brand-border bg-brand-surface text-brand-textSecondary dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-300';

        return (
          <div key={badge.key} className={`rounded-xl border p-4 ${classes}`}>
            <div className="flex items-start gap-3">
              <Icon className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="text-sm font-bold">{badge.label}</p>
                <p className="mt-1 text-xs leading-relaxed">{badge.detail}</p>
              </div>
            </div>
          </div>
        );
      })}
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

function formatWaiverThreshold(value: number | null) {
  if (value === null) return 'No public data';
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
