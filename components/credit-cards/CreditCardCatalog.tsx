'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Info,
  Landmark,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from 'lucide-react';
import { CreditCardTrustBadges } from '@/components/credit-cards/CreditCardTrustBadges';
import { CreditCardVisual } from '@/components/credit-cards/CreditCardVisual';
import { ApplyOnBankSiteButton } from '@/components/credit-cards/shared/ApplyOnBankSiteButton';
import editorial from '@/lib/creditCardEditorial';
import { cn } from '@/lib/utils';
import type { BadgeInputs, CreditCard as CreditCardType } from '@/types';

type FilterState = {
  issuer: string;
  reward: string;
  fee: string;
  fx: string;
  promo: string;
};

type QuickPill = {
  id: string;
  label: string;
  filter: Partial<FilterState>;
  getCount: (cards: CreditCardType[]) => number;
};

const DEFAULT_FILTERS: FilterState = {
  issuer: 'all',
  reward: 'all',
  fee: 'all',
  fx: 'all',
  promo: 'all',
};

const NOT_SHOWN = 'Not shown yet';

const BADGE_DEFINITIONS: Array<{
  key: keyof BadgeInputs;
  label: string;
  type: 'positive' | 'catch' | 'info' | 'neutral';
}> = [
  { key: 'true_naffl', label: 'True NAFFL', type: 'positive' },
  { key: 'low_fx_fee', label: 'Low foreign fee', type: 'positive' },
  { key: 'full_medical_coverage', label: 'Full medical cover', type: 'positive' },
  { key: 'partner_card', label: 'Partner card', type: 'neutral' },
  { key: 'high_fx_fee', label: 'High foreign fee', type: 'catch' },
  { key: 'earn_cap', label: 'Earn cap', type: 'catch' },
  { key: 'narrow_mcc', label: 'Narrow earn categories', type: 'catch' },
  { key: 'rewards_devalued', label: 'Rewards devalued', type: 'catch' },
  { key: 'accident_only_insurance', label: 'Accident-only insurance', type: 'catch' },
  { key: 'no_ewallet_earn', label: 'No e-wallet earn', type: 'info' },
];

const QUICK_PILLS: QuickPill[] = [
  {
    id: 'all',
    label: 'All Cards',
    filter: {},
    getCount: (cards) => cards.length,
  },
  {
    id: 'first-card',
    label: 'First Card',
    filter: { fee: 'free-or-low' },
    getCount: (cards) =>
      cards.filter(
        (c) =>
          c.naffl ||
          c.annual_fee_recurring === 0 ||
          (c.annual_fee_recurring !== null && c.annual_fee_recurring <= 2000),
      ).length,
  },
  {
    id: 'naffl',
    label: 'No Annual Fee',
    filter: { fee: 'free' },
    getCount: (cards) => cards.filter((c) => c.naffl || c.annual_fee_recurring === 0).length,
  },
  {
    id: 'cashback',
    label: 'Cashback',
    filter: { reward: 'cashback' },
    getCount: (cards) => cards.filter((c) => c.rewards_type === 'cashback').length,
  },
  {
    id: 'travel',
    label: 'Travel & FX',
    filter: { fx: 'low' },
    getCount: (cards) => cards.filter((c) => c.badge_inputs?.low_fx_fee === true).length,
  },
  {
    id: 'points',
    label: 'Points',
    filter: { reward: 'points' },
    getCount: (cards) => cards.filter((c) => c.rewards_type === 'points').length,
  },
];

// ─── Sort & data-completeness ─────────────────────────────────────────────────

function hasAnnualFee(card: CreditCardType): boolean {
  return card.naffl === true || card.annual_fee_recurring !== null;
}
function hasIncome(card: CreditCardType): boolean {
  return card.min_income_monthly !== null || card.min_income_annual !== null;
}
function hasRewards(card: CreditCardType): boolean {
  return card.rewards_type !== null;
}
function hasFx(card: CreditCardType): boolean {
  return card.foreign_transaction_fee_pct !== null;
}
function hasSourceDate(card: CreditCardType): boolean {
  return Boolean(card.last_scraped_at);
}

function dataCompletenessScore(card: CreditCardType): number {
  let score = 0;
  if (hasAnnualFee(card)) score += 1;
  if (hasIncome(card)) score += 1;
  if (hasRewards(card)) score += 1;
  if (hasFx(card)) score += 1;
  if (hasSourceDate(card)) score += 1;
  return score;
}

function sortByCompleteness(a: CreditCardType, b: CreditCardType): number {
  const sa = dataCompletenessScore(a);
  const sb = dataCompletenessScore(b);
  if (sb !== sa) return sb - sa;
  const da = a.last_scraped_at ? new Date(a.last_scraped_at).getTime() : 0;
  const db = b.last_scraped_at ? new Date(b.last_scraped_at).getTime() : 0;
  if (db !== da) return db - da;
  return a.card_name.localeCompare(b.card_name);
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CreditCardCatalog({
  cards,
  initialPill = 'all',
}: {
  cards: CreditCardType[];
  initialPill?: string;
}) {
  const [filters, setFilters] = useState<FilterState>(() => {
    if (initialPill === 'all') return DEFAULT_FILTERS;
    const pill = QUICK_PILLS.find((p) => p.id === initialPill);
    return pill ? { ...DEFAULT_FILTERS, ...pill.filter } : DEFAULT_FILTERS;
  });
  const [activePill, setActivePill] = useState<string>(initialPill);
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState<string>('');

  const issuers = useMemo(
    () => Array.from(new Set(cards.map((card) => card.bank))).sort(),
    [cards],
  );

  const filteredCards = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = cards.filter((card) => {
      if (q) {
        const hay = `${card.card_name} ${card.bank}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (filters.issuer !== 'all' && card.bank !== filters.issuer) return false;
      if (filters.reward !== 'all' && (card.rewards_type ?? 'none') !== filters.reward)
        return false;
      if (filters.fee === 'free' && !(card.naffl || card.annual_fee_recurring === 0)) return false;
      if (
        filters.fee === 'paid' &&
        !(card.annual_fee_recurring !== null && card.annual_fee_recurring > 0 && !card.naffl)
      )
        return false;
      if (filters.fee === 'not-disclosed' && card.annual_fee_recurring !== null) return false;
      if (
        filters.fee === 'free-or-low' &&
        !(
          card.naffl ||
          card.annual_fee_recurring === 0 ||
          (card.annual_fee_recurring !== null && card.annual_fee_recurring <= 2000)
        )
      )
        return false;
      if (filters.fx === 'disclosed' && card.foreign_transaction_fee_pct === null) return false;
      if (filters.fx === 'not-disclosed' && card.foreign_transaction_fee_pct !== null) return false;
      if (filters.fx === 'low' && card.badge_inputs?.low_fx_fee !== true) return false;
      if (filters.promo === 'linked' && card.active_promo_count <= 0) return false;
      if (filters.promo === 'none' && card.active_promo_count > 0) return false;
      return true;
    });
    return filtered.sort(sortByCompleteness);
  }, [cards, filters, query]);

  const activeFilterCount = useMemo(
    () => Object.values(filters).filter((v) => v !== 'all').length,
    [filters],
  );

  const hasFilters = activeFilterCount > 0 || activePill !== 'all';
  const hasQuery = query.trim().length > 0;

  const selectedCards = selected
    .map((key) => cards.find((card) => card.normalized_card_key === key))
    .filter((card): card is CreditCardType => Boolean(card));

  const compareHref =
    selectedCards.length >= 2
      ? `/credit-cards/compare/${selectedCards.map((c) => encodeURIComponent(c.normalized_card_key)).join('-vs-')}`
      : '#';

  function selectPill(pill: QuickPill) {
    setActivePill(pill.id);
    if (pill.id === 'all') {
      setFilters(DEFAULT_FILTERS);
    } else {
      setFilters({ ...DEFAULT_FILTERS, ...pill.filter });
    }
  }

  function patchFilters(patch: Partial<FilterState>) {
    setFilters((current) => ({ ...current, ...patch }));
    setActivePill('all');
  }

  function resetFilters() {
    setFilters(DEFAULT_FILTERS);
    setActivePill('all');
  }

  function clearAll() {
    resetFilters();
    setQuery('');
  }

  function toggleCompare(card: CreditCardType) {
    setSelected((current) => {
      if (current.includes(card.normalized_card_key)) {
        return current.filter((key) => key !== card.normalized_card_key);
      }
      if (current.length >= 3) return current;
      return [...current, card.normalized_card_key];
    });
  }

  return (
    <section id="cards" className="scroll-mt-32 space-y-6 pb-28 sm:pb-24">
      {/* Search */}
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-textSecondary dark:text-gray-400"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search card or bank…"
          className="h-12 w-full rounded-2xl border border-brand-border bg-white pl-11 pr-11 text-sm text-brand-textPrimary outline-none transition-colors placeholder:text-brand-textSecondary focus:border-brand-primary dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-gray-500"
          aria-label="Search credit cards"
        />
        {hasQuery && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-brand-textSecondary transition-colors hover:bg-brand-surface hover:text-brand-primary dark:hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Quick-filter pills */}
      <div id="browse" className="scroll-mt-32">
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {QUICK_PILLS.map((pill) => {
            const count = pill.getCount(cards);
            const isActive = activePill === pill.id;
            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => selectPill(pill)}
                className={cn(
                  'inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap transition-all',
                  isActive
                    ? 'bg-brand-primary text-white shadow-sm shadow-brand-primary/25'
                    : 'border border-brand-border bg-white text-brand-textSecondary hover:border-brand-primary/30 hover:text-brand-primary dark:border-white/10 dark:bg-white/[0.04] dark:text-gray-300',
                )}
              >
                {pill.id === 'first-card' && (
                  <Sparkles className={cn('h-3.5 w-3.5', isActive ? 'text-white' : 'text-brand-primary')} />
                )}
                {pill.label}
                <span
                  className={cn(
                    'rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums',
                    isActive ? 'bg-white/20 text-white' : 'bg-brand-surface text-brand-textSecondary dark:bg-white/10 dark:text-gray-400',
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Collapsible advanced filters */}
      <div className="rounded-[1.4rem] border border-brand-border bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
        <div className="flex w-full items-center justify-between gap-3 px-5 py-4">
          <button
            type="button"
            onClick={() => setShowFilters((prev) => !prev)}
            className="flex flex-1 items-center gap-2 text-left text-sm font-semibold text-brand-textPrimary dark:text-white"
          >
            <SlidersHorizontal className="h-4 w-4 text-brand-primary" />
            More filters
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center rounded-full bg-brand-primary px-2 py-0.5 text-[10px] font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
          <div className="flex items-center gap-3">
            {hasFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs font-semibold text-brand-primary hover:underline"
              >
                Reset filters
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowFilters((prev) => !prev)}
              className="text-brand-textSecondary"
              aria-label={showFilters ? 'Collapse filters' : 'Expand filters'}
            >
              {showFilters ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="border-t border-brand-border px-5 pb-5 pt-4 dark:border-white/10">
            <p className="mb-4 text-xs leading-relaxed text-brand-textSecondary dark:text-gray-400">
              Use filters to narrow the list. They do not indicate a bank will approve you.
            </p>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              <FilterSelect
                label="Bank"
                value={filters.issuer}
                onChange={(value) => patchFilters({ issuer: value })}
                options={[
                  { value: 'all', label: 'All banks' },
                  ...issuers.map((issuer) => ({ value: issuer, label: issuer })),
                ]}
              />
              <FilterSelect
                label="Reward type"
                value={filters.reward}
                onChange={(value) => patchFilters({ reward: value })}
                options={[
                  { value: 'all', label: 'All rewards' },
                  { value: 'cashback', label: 'Cashback' },
                  { value: 'points', label: 'Points' },
                  { value: 'miles', label: 'Miles/other' },
                ]}
              />
              <FilterSelect
                label="Annual fee"
                value={filters.fee}
                onChange={(value) => patchFilters({ fee: value })}
                options={[
                  { value: 'all', label: 'All fee states' },
                  { value: 'free', label: 'Free or NAFFL' },
                  { value: 'free-or-low', label: 'Low or no fee' },
                  { value: 'paid', label: 'Disclosed paid fee' },
                  { value: 'not-disclosed', label: 'Not disclosed' },
                ]}
              />
              <FilterSelect
                label="Foreign fee"
                value={filters.fx}
                onChange={(value) => patchFilters({ fx: value })}
                options={[
                  { value: 'all', label: 'All FX states' },
                  { value: 'disclosed', label: 'Fee disclosed' },
                  { value: 'low', label: 'Low foreign fee' },
                  { value: 'not-disclosed', label: 'Fee not disclosed' },
                ]}
              />
              <FilterSelect
                label="Promo link"
                value={filters.promo}
                onChange={(value) => patchFilters({ promo: value })}
                options={[
                  { value: 'all', label: 'All promo states' },
                  { value: 'linked', label: 'Active linked promo' },
                  { value: 'none', label: 'No active linked promo' },
                ]}
              />
            </div>

            <p className="mt-4 text-[11px] leading-relaxed text-brand-textSecondary dark:text-gray-400">
              Income filtering is off until bank requirements are more complete.
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-brand-textSecondary dark:text-gray-300">
        <p>
          Showing{' '}
          <span className="font-semibold text-brand-textPrimary dark:text-white">
            {filteredCards.length}
          </span>{' '}
          of {cards.length} cards · sorted by most complete data
        </p>
        {hasQuery && hasFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="text-xs font-semibold text-brand-primary hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      {filteredCards.length > 0 ? (
        <div className="grid gap-6 xl:grid-cols-2">
          {filteredCards.map((card, index) => (
            <CatalogCard
              key={card.id}
              card={card}
              rank={index + 1}
              selected={selected.includes(card.normalized_card_key)}
              compareDisabled={
                !selected.includes(card.normalized_card_key) && selected.length >= 3
              }
              onToggleCompare={() => toggleCompare(card)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-[1.4rem] border border-dashed border-brand-border bg-white p-8 text-center dark:border-white/10 dark:bg-white/[0.04]">
          <p className="text-lg font-bold text-brand-textPrimary dark:text-white">
            No cards match these filters yet
          </p>
          <p className="mt-2 text-sm text-brand-textSecondary dark:text-gray-300">
            Try clearing a filter or your search.
          </p>
          <button
            type="button"
            onClick={clearAll}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white"
          >
            Clear all
          </button>
        </div>
      )}

      <CompareTray
        selectedCards={selectedCards}
        compareHref={compareHref}
        onRemove={(key) => setSelected((current) => current.filter((item) => item !== key))}
        onClear={() => setSelected([])}
      />
    </section>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-1.5">
      <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-textSecondary dark:text-gray-400">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-xl border border-brand-border bg-brand-surface px-3 text-sm font-semibold text-brand-textPrimary outline-none transition-colors focus:border-brand-primary dark:border-white/10 dark:bg-slate-950 dark:text-gray-100"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function CatalogCard({
  card,
  rank,
  selected,
  compareDisabled,
  onToggleCompare,
}: {
  card: CreditCardType;
  rank: number;
  selected: boolean;
  compareDisabled: boolean;
  onToggleCompare: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isPartnerCard = card.badge_inputs?.partner_card === true;
  const fitLabel = computeFitLabel(card);

  const checks = computeChecks(card);

  const annualFeeStr = formatAnnualFee(card);
  const incomeStr = formatIncome(card);
  const rewardStr = formatRewardType(card.rewards_type);
  const fxStr = formatFxFee(card.foreign_transaction_fee_pct);
  const sourceHost = extractHost(card.source_url);

  return (
    <article
      className={cn(
        'overflow-hidden rounded-[1.25rem] border bg-white shadow-[0_18px_52px_-42px_rgba(15,23,42,0.62)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_64px_-40px_rgba(15,23,42,0.70)] dark:bg-white/[0.04]',
        isPartnerCard
          ? 'border-amber-400 dark:border-amber-500/50'
          : 'border-brand-border dark:border-white/10',
      )}
    >
      {isPartnerCard ? (
        <div className="flex items-center gap-2 border-b border-amber-400/20 bg-amber-400/10 px-5 py-2 text-xs font-semibold text-amber-700 dark:text-amber-300">
          <Sparkles className="h-3.5 w-3.5" />
          Partner disclosure applies before you visit the bank site.
        </div>
      ) : null}

      <div className="p-5 sm:p-6">
        {/* Top: visual + header */}
        <div className="grid gap-5 sm:grid-cols-[12rem_minmax(0,1fr)] lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-6">
          <CreditCardVisual card={card} className="sm:mt-1" />

          <div className="flex min-w-0 flex-col">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h3 className="text-lg font-bold leading-snug tracking-tight text-brand-textPrimary dark:text-white sm:text-xl">
                  {card.card_name}
                </h3>
                <p className="mt-0.5 text-sm text-brand-textSecondary dark:text-gray-300">
                  {card.bank}
                </p>
              </div>
              {fitLabel && (
                <span
                  className={cn(
                    'inline-flex shrink-0 items-center self-start rounded-full border px-3 py-1.5 text-[11px] font-semibold',
                    fitLabel.color,
                  )}
                >
                  Good for: {fitLabel.label}
                </span>
              )}
            </div>

            {/* 4-fact grid: 2x2 on mobile, 4-up on sm+ */}
            <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              <FactTile label="Annual fee" value={annualFeeStr} />
              <FactTile label="Min. income" value={incomeStr} />
              <FactTile label="Rewards" value={rewardStr} />
              <FactTile label="FX fee" value={fxStr} />
            </div>

            {/* Things to check */}
            {checks.length > 0 && (
              <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2.5 text-[12px] leading-relaxed text-amber-800 dark:border-amber-500/20 dark:bg-amber-900/15 dark:text-amber-200">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <p className="min-w-0">
                  <span className="font-semibold">Worth checking on the bank site:</span>{' '}
                  {checks.join(', ')}.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Trust badges + fine-print badges */}
        <CreditCardTrustBadges card={card} limit={4} className="mt-4" />
        <div className="mt-2 flex flex-wrap gap-1.5">
          <BadgeChips badges={card.badge_inputs} limit={4} />
        </div>

        {/* Inline expand toggle */}
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="mt-4 flex items-center gap-1 text-xs font-semibold text-brand-primary hover:underline"
        >
          {expanded ? (
            <>Hide details <ChevronUp className="h-3.5 w-3.5" /></>
          ) : (
            <>More details <ChevronDown className="h-3.5 w-3.5" /></>
          )}
        </button>

        {expanded && (
          <div className="mt-3 space-y-3 border-t border-brand-border pt-3 dark:border-white/10">
            {editorial[card.normalized_card_key]?.why && (
              <p className="text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
                {editorial[card.normalized_card_key].why}
              </p>
            )}
            <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
              <DetailTile
                label="Interest"
                value={formatMonthlyRate(card.interest_rate_pct)}
                detail="Per month"
              />
              <DetailTile
                label="Waiver condition"
                value={card.annual_fee_waiver_condition ?? 'No public data'}
                detail={
                  card.annual_fee_waiver_threshold
                    ? `Spend PHP ${card.annual_fee_waiver_threshold.toLocaleString('en-PH')}+`
                    : ''
                }
              />
              <DetailTile
                label="Cash advance"
                value={formatCashAdvanceFee(card)}
                detail="Per transaction"
              />
              <DetailTile
                label="Late payment"
                value={
                  card.late_payment_fee_amount !== null
                    ? formatPhpAmount(card.late_payment_fee_amount)
                    : 'Not disclosed'
                }
                detail="Per missed payment"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              <BadgeChips badges={card.badge_inputs} />
            </div>
          </div>
        )}

        {/* Source line */}
        <p className="mt-4 text-xs text-brand-textSecondary dark:text-gray-400">
          Source updated:{' '}
          <span className="font-semibold text-brand-textPrimary dark:text-gray-200">
            {formatDate(card.last_scraped_at)}
          </span>
          {sourceHost && (
            <>
              {' '}·{' '}
              <span className="font-medium text-brand-textSecondary dark:text-gray-400">
                {sourceHost}
              </span>
            </>
          )}
        </p>

        {/* CTA row: Apply (primary blue) + View details + Compare checkbox */}
        <div className="mt-5 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <ApplyOnBankSiteButton
            href={card.source_url}
            bank={card.bank}
            cardKey={card.normalized_card_key}
            sourcePage="credit-cards-all"
            placement="browse_catalog_card"
            rank={rank}
            label="Apply on bank site"
            className="h-12 w-full sm:w-auto sm:flex-1"
          />
          <div className="flex items-center justify-between gap-4 sm:justify-end">
            <Link
              href={`/credit-cards/reviews/${card.normalized_card_key}`}
              className="inline-flex items-center gap-1 text-sm font-semibold text-brand-primary hover:underline"
            >
              View details
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <label
              className={cn(
                'inline-flex cursor-pointer select-none items-center gap-2 text-sm font-semibold text-brand-textSecondary dark:text-gray-300',
                compareDisabled && 'cursor-not-allowed opacity-50',
              )}
            >
              <input
                type="checkbox"
                checked={selected}
                disabled={compareDisabled}
                onChange={onToggleCompare}
                className="h-4 w-4 rounded border-brand-border text-brand-primary focus:ring-brand-primary"
              />
              Compare
            </label>
          </div>
        </div>
      </div>
    </article>
  );
}

function FactTile({ label, value }: { label: string; value: string }) {
  const missing = value === NOT_SHOWN;
  return (
    <div className="min-h-[4.5rem] rounded-xl border border-brand-border/90 bg-white/75 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] dark:border-white/10 dark:bg-slate-950/40">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-textSecondary dark:text-gray-400">
        {label}
      </p>
      <p
        className={cn(
          'mt-1 break-words text-sm font-bold tabular-nums',
          missing
            ? 'text-brand-textSecondary dark:text-gray-400'
            : 'text-brand-textPrimary dark:text-white',
        )}
      >
        {value}
      </p>
    </div>
  );
}

function DetailTile({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="min-h-[5.5rem] rounded-xl border border-brand-border/90 bg-white/75 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] dark:border-white/10 dark:bg-slate-950/40">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-textSecondary dark:text-gray-400">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-bold text-brand-textPrimary dark:text-white">
        {value}
      </p>
      {detail && (
        <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-brand-textSecondary dark:text-gray-400">
          {detail}
        </p>
      )}
    </div>
  );
}

function CompareTray({
  selectedCards,
  compareHref,
  onRemove,
  onClear,
}: {
  selectedCards: CreditCardType[];
  compareHref: string;
  onRemove: (key: string) => void;
  onClear: () => void;
}) {
  if (selectedCards.length === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-brand-border bg-white/95 px-4 py-3 shadow-[0_-18px_60px_-40px_rgba(15,23,42,0.55)] backdrop-blur dark:border-white/10 dark:bg-slate-950/95">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary">
            Compare tray
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {selectedCards.map((card) => (
              <span
                key={card.id}
                className="inline-flex max-w-full items-center gap-2 rounded-full border border-brand-border bg-brand-surface px-3 py-1.5 text-xs font-semibold text-brand-textPrimary dark:border-white/10 dark:bg-white/[0.05] dark:text-gray-100"
              >
                <span className="max-w-[14rem] truncate">{card.card_name}</span>
                <button
                  type="button"
                  onClick={() => onRemove(card.normalized_card_key)}
                  className="rounded-full text-brand-textSecondary transition-colors hover:text-brand-primary"
                  aria-label={`Remove ${card.card_name} from comparison`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
            {selectedCards.length === 1 && (
              <span className="inline-flex items-center rounded-full border border-dashed border-brand-border px-3 py-1.5 text-xs text-brand-textSecondary dark:border-white/10">
                Select 1 or 2 more cards
              </span>
            )}
            {selectedCards.length === 2 && (
              <span className="inline-flex items-center rounded-full border border-dashed border-brand-border px-3 py-1.5 text-xs text-brand-textSecondary dark:border-white/10">
                Add a 3rd card (optional)
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center justify-center rounded-full border border-brand-border bg-brand-surface px-4 py-3 text-sm font-semibold text-brand-textPrimary dark:border-white/10 dark:bg-white/[0.05] dark:text-gray-100"
          >
            Clear
          </button>
          <Link
            href={compareHref}
            aria-disabled={selectedCards.length < 2}
            className={cn(
              'inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold',
              selectedCards.length >= 2
                ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20'
                : 'pointer-events-none bg-brand-primary/30 text-white',
            )}
          >
            Compare {selectedCards.length >= 2 ? selectedCards.length : ''} cards
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function BadgeChips({ badges, limit }: { badges: BadgeInputs | null; limit?: number }) {
  const active = badges ? BADGE_DEFINITIONS.filter((def) => badges[def.key]) : [];
  const shown = limit ? active.slice(0, limit) : active;

  if (shown.length === 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:bg-white/10 dark:text-gray-400">
        <Info className="h-3 w-3" />
        No fine-print badges yet
      </span>
    );
  }

  return (
    <>
      {shown.map((def) => {
        const iconClass = 'h-3 w-3 shrink-0';
        const classes =
          def.type === 'positive'
            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300'
            : def.type === 'catch'
              ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300'
              : 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-gray-400';
        const Icon =
          def.type === 'positive' ? CheckCircle : def.type === 'catch' ? Info : Landmark;

        return (
          <span
            key={def.key}
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium',
              classes,
            )}
          >
            <Icon className={iconClass} />
            {def.label}
          </span>
        );
      })}
    </>
  );
}

function computeFitLabel(card: CreditCardType): { label: string; color: string } | null {
  if (card.naffl || card.annual_fee_recurring === 0)
    return {
      label: 'No Annual Fee',
      color:
        'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-500/20',
    };
  if (card.min_income_monthly !== null && card.min_income_monthly <= 21000)
    return {
      label: 'First Card',
      color:
        'bg-brand-primaryLight text-brand-primary border-brand-primary/15 dark:bg-brand-primary/10 dark:border-brand-primary/25',
    };
  if (
    card.rewards_type === 'miles' ||
    card.card_tier === 'signature' ||
    card.card_tier === 'infinite'
  )
    return {
      label: 'Travel',
      color:
        'bg-sky-50 text-sky-700 border-sky-100 dark:bg-sky-900/20 dark:text-sky-300 dark:border-sky-500/20',
    };
  if (card.rewards_type === 'cashback')
    return {
      label: 'Cashback',
      color:
        'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-500/20',
    };
  if (card.rewards_type === 'points')
    return {
      label: 'Points Rewards',
      color:
        'bg-violet-50 text-violet-700 border-violet-100 dark:bg-violet-900/20 dark:text-violet-300 dark:border-violet-500/20',
    };
  return null;
}

function computeChecks(card: CreditCardType): string[] {
  const checks: string[] = [];
  if (!hasAnnualFee(card)) checks.push('annual fee');
  if (!hasIncome(card)) checks.push('min. income');
  if (!hasRewards(card)) checks.push('rewards details');
  if (!hasFx(card)) checks.push('FX fee');
  // Waiver missing only counts when there's a fee to waive
  const hasPaidFee =
    !card.naffl &&
    card.annual_fee_recurring !== null &&
    card.annual_fee_recurring > 0;
  if (hasPaidFee && !card.annual_fee_waiver_condition) {
    checks.push('fee waiver condition');
  }
  return checks;
}

// ─── Format helpers ───────────────────────────────────────────────────────────

function formatAnnualFee(card: CreditCardType): string {
  if (card.naffl) return 'PHP 0 NAFFL';
  if (card.annual_fee_recurring === 0) return 'PHP 0';
  if (card.annual_fee_recurring !== null) return formatPhpAmount(card.annual_fee_recurring);
  if (card.annual_fee_first_year !== null)
    return `${formatPhpAmount(card.annual_fee_first_year)} first year`;
  return NOT_SHOWN;
}

function formatRewardType(rewardType: CreditCardType['rewards_type']) {
  switch (rewardType) {
    case 'cashback':
      return 'Cashback';
    case 'miles':
      return 'Miles';
    case 'points':
      return 'Points';
    default:
      return NOT_SHOWN;
  }
}

function formatMonthlyRate(rate: number | null) {
  if (rate === null) return 'Not disclosed';
  return `${rate.toFixed(2)}% / mo`;
}

function formatFxFee(value: number | null) {
  if (value === null) return NOT_SHOWN;
  return `${value.toFixed(2)}%`;
}

function formatIncome(card: CreditCardType) {
  if (card.min_income_monthly !== null) return `${formatPhpAmount(card.min_income_monthly)} / mo`;
  if (card.min_income_annual !== null)
    return `${formatPhpAmount(Math.round(card.min_income_annual / 12))} / mo`;
  return NOT_SHOWN;
}

function formatDate(value: string | null) {
  if (!value) return NOT_SHOWN;
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
  })
    .format(amount)
    .replace('PHP', 'PHP ');
}

function formatCashAdvanceFee(card: CreditCardType) {
  const pieces = [
    card.cash_advance_fee_pct !== null ? `${card.cash_advance_fee_pct.toFixed(2)}%` : null,
    card.cash_advance_fee_amount !== null ? formatPhpAmount(card.cash_advance_fee_amount) : null,
  ].filter(Boolean);
  return pieces.length > 0 ? pieces.join(' or ') : 'Not disclosed';
}

function extractHost(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).host.replace(/^www\./, '');
  } catch {
    return null;
  }
}
