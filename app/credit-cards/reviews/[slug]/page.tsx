import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  AlertTriangle,
  CheckCircle,
  ChevronLeft,
  Gift,
  Info,
  ReceiptText,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { CreditCardVisual } from '@/components/credit-cards/CreditCardVisual';
import { DetailAnalytics } from '@/components/credit-cards/results/DetailAnalytics';
import { AffiliateDisclosure } from '@/components/credit-cards/shared/AffiliateDisclosure';
import { ApplyOnBankSiteButton } from '@/components/credit-cards/shared/ApplyOnBankSiteButton';
import { getCreditCardBySlug } from '@/lib/credit-cards';
import { answersToQuery, deriveAnnualFeeLabel, deriveMinIncomeLabel, parseFinderAnswers } from '@/lib/creditCardFinder/rank';
import {
  assessApproval,
  deriveCardSummary,
  deriveCatchList,
  deriveCostRows,
  deriveFitLists,
  deriveMainBenefit,
  deriveQuickTakeChips,
  type ApprovalAssessment,
  type CostRow,
} from '@/lib/creditCardFinder/detail';
import { cn } from '@/lib/utils';
import type { CreditCard } from '@/types';

// Detail hero accent — stable per bank, never Truva blue or pure black.
const ACCENT_GRADIENTS = [
  'bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-600',
  'bg-gradient-to-br from-violet-800 via-violet-700 to-fuchsia-600',
  'bg-gradient-to-br from-rose-800 via-rose-700 to-orange-600',
  'bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-700',
  'bg-gradient-to-br from-indigo-900 via-violet-800 to-rose-700',
];

function accentFor(bank: string): string {
  let hash = 0;
  for (let i = 0; i < bank.length; i += 1) {
    hash = (hash * 31 + bank.charCodeAt(i)) >>> 0;
  }
  return ACCENT_GRADIENTS[hash % ACCENT_GRADIENTS.length];
}

const SHORT_BANK: Record<string, string> = {
  'Bank of the Philippine Islands': 'BPI',
  'BDO Unibank, Inc.': 'BDO',
  'HSBC Philippines': 'HSBC',
  'Asia United Bank': 'AUB',
  'China Banking Corporation': 'Chinabank',
};

function shortBankName(bank: string): string {
  return SHORT_BANK[bank] ?? bank.split(',')[0].trim();
}

function rewardTypeLabel(rewardType: string | null): string | null {
  switch (rewardType) {
    case 'cashback':
      return 'Cashback';
    case 'points':
      return 'Rewards';
    case 'miles':
      return 'Miles';
    default:
      return null;
  }
}

/** Compare → the browse catalog pre-filtered to cards of the same kind. */
function compareHrefFor(card: CreditCard): string {
  const pill =
    card.rewards_type === 'cashback'
      ? 'cashback'
      : card.rewards_type === 'points'
        ? 'points'
        : card.rewards_type === 'miles'
          ? 'travel'
          : null;
  return pill ? `/credit-cards/all?filter=${pill}` : '/credit-cards/all';
}

function formatDate(value: string | null): string {
  if (!value) return 'recently';
  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value));
}

export const dynamic = 'force-dynamic';

export async function generateMetadata(
  props: { params: Promise<{ slug: string }> | { slug: string } },
): Promise<Metadata> {
  const params = await props.params;
  const slug = decodeCardSlug(params?.slug ?? '');
  const card = await getCreditCardBySlug(slug);
  if (!card) return {};

  const summary = deriveCardSummary(card);
  return {
    title: `${card.card_name} — is it the right card for you? | Truva`,
    description: `${summary.whatItIs} See the rewards, the fees, the catch, and what to check before you apply.`,
    alternates: { canonical: `/credit-cards/reviews/${card.normalized_card_key}` },
  };
}

export default async function CreditCardReviewPage(
  props: {
    params: Promise<{ slug: string }> | { slug: string };
    searchParams?: Promise<Record<string, string>> | Record<string, string>;
  },
) {
  const params = await props.params;
  const sp = props.searchParams ? await props.searchParams : {};
  const fromFinder = sp.from === 'finder';
  const answers = parseFinderAnswers(sp);
  const slug = decodeCardSlug(params?.slug ?? '');
  const card = await getCreditCardBySlug(slug);

  if (!card) notFound();

  const isPartnerCard = card.badge_inputs?.partner_card === true;
  const heroAccent = accentFor(card.bank);
  const shortBank = shortBankName(card.bank);
  const applyLabel = `Apply on ${shortBank}`;
  const compareHref = compareHrefFor(card);

  const finderQuery = answersToQuery(answers);
  const backHref = fromFinder && finderQuery
    ? `/credit-cards/results?${finderQuery}`
    : '/credit-cards';
  const backLabel = fromFinder && finderQuery ? 'Back to my matches' : 'Back to credit cards';

  // ── Derived decision content ──
  const benefit = deriveMainBenefit(card);
  const catches = deriveCatchList(card);
  const mainCatch = catches[0];
  const approval = assessApproval(card, answers.income);
  const chips = fromFinder ? deriveQuickTakeChips(answers, approval) : [];
  const fitLists = deriveFitLists(card, answers, fromFinder);
  const costs = deriveCostRows(card);

  const rewardLabel = rewardTypeLabel(card.rewards_type);
  const tierLine = ['Credit card', card.card_network, rewardLabel].filter(Boolean).join(' · ');
  const annualFeeLabel = deriveAnnualFeeLabel(card);
  const feeReturnsAfterYearOne =
    card.annual_fee_first_year === 0 && (card.annual_fee_recurring ?? 0) > 0;

  return (
    <div className="min-h-screen bg-white pb-32 dark:bg-slate-950 sm:pb-0">
      <DetailAnalytics
        cardKey={card.normalized_card_key}
        bank={card.bank}
        sourcePage={typeof sp.from === 'string' ? sp.from : 'direct'}
      />

      {/* ===== Stage: hero + Quick Take ===== */}
      <div className="bg-brand-surface dark:bg-slate-950/40">
        <div className="mx-auto max-w-[1080px] md:grid md:grid-cols-[1.05fr_1fr] md:items-start md:gap-6 md:px-8 md:py-9 lg:px-12">
          {/* Hero */}
          <header
            className={cn(
              'relative overflow-hidden px-4 pb-9 pt-5 text-white md:rounded-2xl md:px-6 md:py-7',
              heroAccent,
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-black/30 to-transparent" />
            <div className="relative z-10">
              <Link
                href={backHref}
                className="-ml-1.5 inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[13px] font-semibold text-white/85 transition-colors hover:bg-white/10 hover:text-white"
              >
                <ChevronLeft className="h-4 w-4" />
                {backLabel}
              </Link>

              <div className="mt-4 md:grid md:grid-cols-[1fr_auto] md:items-center md:gap-5">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/75">
                    {tierLine}
                  </p>
                  <h1 className="mt-1.5 text-[28px] font-bold leading-[1.1] tracking-tight md:text-[34px]">
                    {card.card_name}
                  </h1>
                  <p className="mt-1 text-[15px] text-white/85">by {card.bank}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {isPartnerCard && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-slate-900">
                        <Sparkles className="h-3 w-3" />
                        Truva partner
                      </span>
                    )}
                    {card.card_network && (
                      <span className="inline-flex items-center rounded-full border border-white/25 bg-white/15 px-2.5 py-1 text-[11px] font-semibold text-white">
                        {card.card_network} network
                      </span>
                    )}
                    {rewardLabel && (
                      <span className="inline-flex items-center rounded-full border border-white/25 bg-white/15 px-2.5 py-1 text-[11px] font-semibold text-white">
                        {rewardLabel} card
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-5 w-40 md:mt-0 md:w-44">
                  <CreditCardVisual card={card} />
                </div>
              </div>
            </div>
          </header>

          {/* Quick Take */}
          <div className="relative z-10 -mt-6 px-4 md:mt-0 md:px-0">
            <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-[0_16px_40px_-16px_rgba(15,23,42,0.18)] dark:border-white/10 dark:bg-[#111827] md:p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-[13px] font-bold uppercase tracking-[0.12em] text-brand-textSecondary dark:text-gray-400">
                  Quick take
                </p>
                {fromFinder && (
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-brand-textSecondary dark:text-gray-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-primary" />
                    Matched to your finder answers
                  </span>
                )}
              </div>

              {fromFinder && chips.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {chips.map((chip) => (
                    <span
                      key={chip}
                      className="rounded-full bg-brand-primaryLight px-2.5 py-1 text-[11px] font-medium text-brand-primary dark:bg-brand-primary/20 dark:text-blue-200"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-4 space-y-3">
                <QuickTakeRow icon={Gift} tone="info" label="Main benefit" lead={benefit.lead} body={benefit.body} />
                <QuickTakeRow icon={AlertTriangle} tone="warn" label="Main catch" body={mainCatch} />
                {fromFinder ? (
                  <QuickTakeRow
                    icon={APPROVAL_ICON[approval.verdict]}
                    tone={APPROVAL_TONE[approval.verdict]}
                    label="Can you qualify?"
                    lead={approval.headline}
                    body={approval.detail}
                  />
                ) : (
                  <QuickTakeRow
                    icon={Info}
                    tone="info"
                    label="Income needed"
                    lead={deriveMinIncomeLabel(card)}
                    body="The bank does the final check."
                  />
                )}
                <QuickTakeRow
                  icon={ReceiptText}
                  tone="neutral"
                  label="Annual fee"
                  lead={annualFeeLabel}
                  body={feeReturnsAfterYearOne ? 'Waived for the first year.' : undefined}
                />
              </div>

              <div className="mt-4 flex gap-2">
                <ApplyOnBankSiteButton
                  href={card.source_url}
                  bank={card.bank}
                  cardKey={card.normalized_card_key}
                  sourcePage="credit-card-detail"
                  placement="credit-card-detail-quicktake"
                  label={applyLabel}
                  className="flex-1 py-3"
                />
                <Link
                  href={compareHref}
                  className="inline-flex flex-1 items-center justify-center rounded-xl border border-brand-border bg-white px-4 py-3 text-sm font-bold text-brand-textPrimary transition-colors hover:bg-brand-surface dark:border-white/15 dark:bg-white/[0.04] dark:text-gray-100 dark:hover:bg-white/10"
                >
                  Compare
                </Link>
              </div>
              <AffiliateDisclosure size="compact" className="mt-2.5" />
            </div>
          </div>
        </div>
      </div>

      {/* ===== Decision sections ===== */}
      <div className="mx-auto max-w-[1080px]">
        <Section title="Is this card for you?">
          <div className="grid gap-4 md:grid-cols-2">
            <FitColumn tone="good" title="Good fit if" items={fitLists.goodFit} />
            <FitColumn tone="bad" title="Look elsewhere if" items={fitLists.lookElsewhere} />
          </div>
        </Section>

        <Section title="The numbers">
          <div className="overflow-hidden rounded-xl border border-brand-border dark:border-white/10">
            {costs.primary.map((row) => (
              <CostRowEl key={row.label} row={row} />
            ))}
          </div>
          {costs.more.length > 0 && (
            <details className="group mt-3">
              <summary className="flex cursor-pointer list-none items-center gap-1.5 py-1 text-[13px] font-semibold text-brand-textSecondary [&::-webkit-details-marker]:hidden dark:text-gray-400">
                <span className="text-base leading-none transition-transform group-open:rotate-90">›</span>
                More fees and details
              </summary>
              <div className="mt-2 overflow-hidden rounded-xl border border-brand-border dark:border-white/10">
                {costs.more.map((row) => (
                  <CostRowEl key={row.label} row={row} />
                ))}
              </div>
            </details>
          )}
        </Section>

        <Section title="The catch">
          <ul className="space-y-2.5">
            {catches.slice(0, 3).map((text) => (
              <CatchItem key={text} text={text} />
            ))}
          </ul>
          {catches.length > 3 && (
            <>
              {/* Desktop: show the rest inline */}
              <ul className="mt-2.5 hidden space-y-2.5 md:block">
                {catches.slice(3).map((text) => (
                  <CatchItem key={text} text={text} />
                ))}
              </ul>
              {/* Mobile: tuck the rest behind an accordion */}
              <details className="group mt-2 md:hidden">
                <summary className="flex cursor-pointer list-none items-center gap-1.5 py-1 text-[13px] font-semibold text-brand-textSecondary [&::-webkit-details-marker]:hidden dark:text-gray-400">
                  <span className="text-base leading-none transition-transform group-open:rotate-90">›</span>
                  {catches.length - 3} more to know
                </summary>
                <ul className="mt-2.5 space-y-2.5">
                  {catches.slice(3).map((text) => (
                    <CatchItem key={text} text={text} />
                  ))}
                </ul>
              </details>
            </>
          )}
        </Section>
      </div>

      {/* ===== Ready to decide ===== */}
      <section className="border-t border-brand-border bg-brand-surface dark:border-white/10 dark:bg-slate-950/40">
        <div className="mx-auto max-w-[1080px] px-4 py-7 md:px-8 md:py-9 lg:px-12">
          <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04] md:p-6">
            <h2 className="text-lg font-bold tracking-tight text-brand-textPrimary dark:text-white">
              Ready to decide?
            </h2>
            <div className="mt-3.5 flex flex-col gap-2.5 sm:flex-row">
              <ApplyOnBankSiteButton
                href={card.source_url}
                bank={card.bank}
                cardKey={card.normalized_card_key}
                sourcePage="credit-card-detail"
                placement="credit-card-detail-final"
                label={applyLabel}
                className="flex-1 py-3.5"
              />
              <Link
                href={compareHref}
                className="inline-flex flex-1 items-center justify-center rounded-xl border border-brand-border bg-white px-4 py-3.5 text-sm font-bold text-brand-textPrimary transition-colors hover:bg-brand-surface dark:border-white/15 dark:bg-white/[0.04] dark:text-gray-100 dark:hover:bg-white/10"
              >
                Compare similar cards
              </Link>
            </div>
            <AffiliateDisclosure size="compact" className="mt-3" />

            <div className="mt-3 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-[12.5px] leading-relaxed text-brand-textSecondary dark:border-emerald-800/40 dark:bg-emerald-900/15 dark:text-gray-300">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>
                <strong className="font-semibold text-brand-textPrimary dark:text-white">
                  You&apos;ll finish on {shortBank}&apos;s official site.
                </strong>{' '}
                Truva doesn&apos;t collect your application or see your details.
              </span>
            </div>

            <details className="group mt-3.5 border-t border-brand-border pt-3.5 dark:border-white/10">
              <summary className="flex cursor-pointer list-none items-center gap-1.5 py-1 text-[13px] font-semibold text-brand-textSecondary [&::-webkit-details-marker]:hidden dark:text-gray-400">
                <span className="text-base leading-none transition-transform group-open:rotate-90">›</span>
                What you&apos;ll need before you start
              </summary>
              <ul className="mt-2.5 space-y-1.5 text-[13.5px] leading-relaxed text-brand-textSecondary dark:text-gray-300">
                <PrepItem>
                  <b>One valid government ID</b> — passport, driver&apos;s license, UMID, or PhilSys.
                </PrepItem>
                <PrepItem>
                  <b>Proof of income</b> — a recent payslip, your latest ITR, or a COE with salary.
                </PrepItem>
                <PrepItem>
                  <b>Proof of billing address</b> — a utility bill or a bank statement.
                </PrepItem>
                <PrepItem>
                  <b>10&ndash;15 minutes</b> to fill out {shortBank}&apos;s application form.
                </PrepItem>
              </ul>
            </details>
          </div>
        </div>
      </section>

      {/* ===== Source ===== */}
      <div className="mx-auto flex max-w-[1080px] flex-wrap items-center gap-x-2 gap-y-1 px-4 py-5 text-xs text-brand-textSecondary dark:text-gray-500 md:px-8 lg:px-12">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
        <span>
          From{' '}
          <a
            href={card.source_url}
            target="_blank"
            rel="nofollow noopener noreferrer"
            className="font-medium text-brand-textSecondary underline underline-offset-2 hover:text-brand-primary dark:text-gray-400"
          >
            {shortBank}&apos;s official page
          </a>{' '}
          · Checked {formatDate(card.last_scraped_at)}
        </span>
      </div>

      {/* ===== Mobile sticky action bar ===== */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-brand-border bg-white/95 px-4 py-2.5 shadow-[0_-18px_60px_-40px_rgba(15,23,42,0.55)] backdrop-blur dark:border-white/10 dark:bg-slate-950/95 sm:hidden">
        <AffiliateDisclosure size="compact" className="mb-2" />
        <div className="flex items-center gap-3">
          <ApplyOnBankSiteButton
            href={card.source_url}
            bank={card.bank}
            cardKey={card.normalized_card_key}
            sourcePage="credit-card-detail"
            placement="credit-card-detail-sticky"
            label={applyLabel}
            className="h-auto flex-1 py-3"
          />
          <Link
            href={compareHref}
            className="shrink-0 px-2 py-2 text-sm font-bold text-brand-primary"
          >
            Compare
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────

function decodeCardSlug(slug: string) {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

type RowTone = 'info' | 'warn' | 'positive' | 'neutral';

const ROW_TONE: Record<RowTone, string> = {
  info: 'bg-brand-primaryLight text-brand-primary dark:bg-brand-primary/20 dark:text-blue-200',
  warn: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  positive: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  neutral: 'bg-brand-surface text-brand-textSecondary dark:bg-white/10 dark:text-gray-300',
};

const APPROVAL_TONE: Record<ApprovalAssessment['verdict'], RowTone> = {
  'likely-meet': 'positive',
  'may-need-higher': 'warn',
  'cannot-confirm': 'neutral',
};

const APPROVAL_ICON: Record<ApprovalAssessment['verdict'], typeof Info> = {
  'likely-meet': CheckCircle,
  'may-need-higher': AlertTriangle,
  'cannot-confirm': Info,
};

function QuickTakeRow({
  icon: Icon,
  tone,
  label,
  lead,
  body,
}: {
  icon: typeof Info;
  tone: RowTone;
  label: string;
  lead?: string;
  body?: string;
}) {
  return (
    <div className="grid grid-cols-[1.75rem_1fr] gap-2.5">
      <span className={cn('flex h-7 w-7 items-center justify-center rounded-lg', ROW_TONE[tone])}>
        <Icon className="h-3.5 w-3.5" />
      </span>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-brand-textSecondary dark:text-gray-400">
          {label}
        </p>
        <p className="mt-0.5 text-[14px] leading-snug text-brand-textPrimary dark:text-gray-100">
          {lead && <strong className="font-bold">{lead}</strong>}
          {lead && body ? ' ' : ''}
          {body}
        </p>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-brand-border px-4 py-7 dark:border-white/10 md:px-8 md:py-9 lg:px-12">
      <h2 className="mb-3.5 text-lg font-bold tracking-tight text-brand-textPrimary dark:text-white md:mb-4 md:text-xl">
        {title}
      </h2>
      {children}
    </section>
  );
}

function FitColumn({
  tone,
  title,
  items,
}: {
  tone: 'good' | 'bad';
  title: string;
  items: string[];
}) {
  const isGood = tone === 'good';
  const Icon = isGood ? CheckCircle : AlertTriangle;
  return (
    <div
      className={cn(
        'rounded-xl border p-4 md:p-5',
        isGood
          ? 'border-emerald-200 bg-emerald-50/60 dark:border-emerald-800/40 dark:bg-emerald-900/10'
          : 'border-amber-200 bg-amber-50/60 dark:border-amber-800/40 dark:bg-amber-900/10',
      )}
    >
      <div
        className={cn(
          'mb-3 flex items-center gap-2 text-sm font-bold',
          isGood ? 'text-emerald-800 dark:text-emerald-300' : 'text-amber-800 dark:text-amber-300',
        )}
      >
        <Icon className="h-4 w-4" />
        <span>{title}</span>
      </div>
      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item}
            className="grid grid-cols-[0.5rem_1fr] gap-2.5 text-[13.5px] leading-relaxed text-brand-textSecondary dark:text-gray-300"
          >
            <span
              className={cn(
                'mt-[7px] h-1.5 w-1.5 rounded-full',
                isGood ? 'bg-emerald-500' : 'bg-amber-500',
              )}
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CostRowEl({ row }: { row: CostRow }) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-baseline gap-4 border-t border-brand-border px-4 py-3 first:border-t-0 dark:border-white/10">
      <span className="text-sm text-brand-textPrimary dark:text-gray-200">{row.label}</span>
      <span
        className={cn(
          'text-sm tabular-nums',
          row.pending
            ? 'max-w-[11rem] text-right text-[13px] italic text-brand-textSecondary dark:text-gray-400'
            : 'font-semibold text-brand-textPrimary dark:text-white',
        )}
      >
        {row.value}
      </span>
    </div>
  );
}

function CatchItem({ text }: { text: string }) {
  return (
    <li className="grid grid-cols-[1.25rem_1fr] gap-3 text-[14px] leading-relaxed text-brand-textSecondary dark:text-gray-300">
      <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800/40 dark:bg-amber-900/20 dark:text-amber-300">
        <AlertTriangle className="h-2.5 w-2.5" />
      </span>
      <span>{text}</span>
    </li>
  );
}

function PrepItem({ children }: { children: ReactNode }) {
  return (
    <li className="grid grid-cols-[0.5rem_1fr] gap-2.5">
      <span className="mt-[7px] h-1 w-1 rounded-full bg-brand-textSecondary/60" />
      <span>{children}</span>
    </li>
  );
}
