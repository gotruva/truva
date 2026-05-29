'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  Info,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  X,
} from 'lucide-react';
import { MiniCreditCardVisual } from '@/components/credit-cards/CreditCardVisual';
import { ApplyOnBankSiteButton } from '@/components/credit-cards/shared/ApplyOnBankSiteButton';
import { AffiliateDisclosure } from '@/components/credit-cards/shared/AffiliateDisclosure';
import { getEditorialFor } from '@/lib/creditCardEditorial';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { CreditCard as CreditCardType } from '@/types';

// ─── Filters & sort config ──────────────────────────────────────────────────

type FilterState = {
  issuer: string;
  reward: string;
  fee: string;
  fx: string;
};

type QuickPill = {
  id: string;
  label: string;
  filter: Partial<FilterState>;
  getCount: (cards: CreditCardType[]) => number;
};

type UrlState = {
  activePill: string;
  filters: FilterState;
  query: string;
  sortMode: SortMode;
};

const DEFAULT_FILTERS: FilterState = {
  issuer: 'all',
  reward: 'all',
  fee: 'all',
  fx: 'all',
};

// Field-specific null copy (per data contract).
const NULL_REWARDS = 'Not yet listed';
const NULL_NO_DATA = 'No public data';
const NULL_NOT_DISCLOSED = 'Not disclosed';

// Plain-English help copy for the five tooltip targets.
const HELP = {
  rewards: 'Money, points, or miles you can earn when you use the card.',
  yearlyFee: 'A yearly charge just for having the card.',
  income: 'The minimum salary or income you need to qualify for this card.',
  foreignFee: 'A fee when you spend abroad or pay online in another currency.',
  interest: 'What the bank may charge if you do not pay your bill in full.',
  bestFor: 'A short tag showing who this card fits, based on its strongest verified feature.',
} as const;

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
    label: 'No Yearly Fee',
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

type SortMode = 'best' | 'fee' | 'income' | 'fx' | 'interest' | 'newest' | 'bank';

const SORT_OPTIONS: Array<{ value: SortMode; label: string }> = [
  { value: 'best', label: 'Best data first' },
  { value: 'fee', label: 'Lowest yearly fee' },
  { value: 'income', label: 'Lowest income' },
  { value: 'fx', label: 'Lowest foreign card fee' },
  { value: 'interest', label: 'Lowest interest per month' },
  { value: 'newest', label: 'Newest source check' },
  { value: 'bank', label: 'Bank A–Z' },
];

const QUICK_PILL_IDS = new Set(QUICK_PILLS.map((pill) => pill.id));
const SORT_VALUES = new Set<SortMode>(SORT_OPTIONS.map((option) => option.value));
const REWARD_FILTER_VALUES = new Set(['all', 'cashback', 'points', 'miles']);
const FEE_FILTER_VALUES = new Set(['all', 'free', 'free-or-low', 'paid', 'not-disclosed']);
const FX_FILTER_VALUES = new Set(['all', 'disclosed', 'low', 'not-disclosed']);

const URL_PARAMS = {
  query: 'q',
  sort: 'sort',
  quickFilter: 'filter',
  issuer: 'bank',
  reward: 'reward',
  fee: 'fee',
  fx: 'fx',
} as const;

const CATALOG_URL_PARAMS = Object.values(URL_PARAMS);

// ─── Data-completeness + sort comparators (nulls always sort last) ────────────

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

function nameTie(a: CreditCardType, b: CreditCardType): number {
  return a.card_name.localeCompare(b.card_name);
}

function sortByCompleteness(a: CreditCardType, b: CreditCardType): number {
  const sa = dataCompletenessScore(a);
  const sb = dataCompletenessScore(b);
  if (sb !== sa) return sb - sa;
  const da = a.last_scraped_at ? new Date(a.last_scraped_at).getTime() : 0;
  const db = b.last_scraped_at ? new Date(b.last_scraped_at).getTime() : 0;
  if (db !== da) return db - da;
  return nameTie(a, b);
}

function feeValue(card: CreditCardType): number | null {
  if (card.naffl || card.annual_fee_recurring === 0) return 0;
  return card.annual_fee_recurring;
}
function incomeValue(card: CreditCardType): number | null {
  if (card.min_income_monthly !== null) return card.min_income_monthly;
  if (card.min_income_annual !== null) return Math.round(card.min_income_annual / 12);
  return null;
}
function dateValue(card: CreditCardType): number | null {
  if (!card.last_scraped_at) return null;
  const t = new Date(card.last_scraped_at).getTime();
  return Number.isFinite(t) ? t : null;
}

/** Ascending compare with nulls forced to the bottom. */
function ascNullsLast(a: number | null, b: number | null): number {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return a - b;
}
/** Descending compare with nulls forced to the bottom. */
function descNullsLast(a: number | null, b: number | null): number {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return b - a;
}

function comparatorFor(mode: SortMode): (a: CreditCardType, b: CreditCardType) => number {
  switch (mode) {
    case 'fee':
      return (a, b) => ascNullsLast(feeValue(a), feeValue(b)) || nameTie(a, b);
    case 'income':
      return (a, b) => ascNullsLast(incomeValue(a), incomeValue(b)) || nameTie(a, b);
    case 'fx':
      return (a, b) =>
        ascNullsLast(a.foreign_transaction_fee_pct, b.foreign_transaction_fee_pct) ||
        nameTie(a, b);
    case 'interest':
      return (a, b) => ascNullsLast(a.interest_rate_pct, b.interest_rate_pct) || nameTie(a, b);
    case 'newest':
      return (a, b) => descNullsLast(dateValue(a), dateValue(b)) || nameTie(a, b);
    case 'bank':
      return (a, b) => a.bank.localeCompare(b.bank) || nameTie(a, b);
    case 'best':
    default:
      return sortByCompleteness;
  }
}

type UrlParamsReader = {
  get(name: string): string | null;
};

function normalizeQuickPillId(value: string | null | undefined, fallback = 'all'): string {
  if (value === 'beginner') return 'first-card';
  if (value && QUICK_PILL_IDS.has(value)) return value;
  return QUICK_PILL_IDS.has(fallback) ? fallback : 'all';
}

function filtersForQuickPill(pillId: string): FilterState {
  const pill = QUICK_PILLS.find((p) => p.id === pillId);
  return pill ? { ...DEFAULT_FILTERS, ...pill.filter } : DEFAULT_FILTERS;
}

function normalizeSortMode(value: string | null | undefined): SortMode {
  return value && SORT_VALUES.has(value as SortMode) ? (value as SortMode) : 'best';
}

function applyUrlFilterValue(
  filters: FilterState,
  key: keyof FilterState,
  value: string | null | undefined,
  validValues: Set<string>,
) {
  if (value && validValues.has(value)) filters[key] = value;
}

function buildInitialUrlState({
  cards,
  initialPill,
  searchParams,
}: {
  cards: CreditCardType[];
  initialPill: string;
  searchParams: UrlParamsReader;
}): UrlState {
  const activePill = normalizeQuickPillId(searchParams.get(URL_PARAMS.quickFilter), initialPill);
  const issuerParam = searchParams.get(URL_PARAMS.issuer);
  const issuerValues = new Set(cards.map((card) => card.bank));
  const filters: FilterState = { ...filtersForQuickPill(activePill) };

  if (issuerParam && issuerValues.has(issuerParam)) filters.issuer = issuerParam;
  applyUrlFilterValue(filters, 'reward', searchParams.get(URL_PARAMS.reward), REWARD_FILTER_VALUES);
  applyUrlFilterValue(filters, 'fee', searchParams.get(URL_PARAMS.fee), FEE_FILTER_VALUES);
  applyUrlFilterValue(filters, 'fx', searchParams.get(URL_PARAMS.fx), FX_FILTER_VALUES);

  return {
    activePill,
    filters,
    query: searchParams.get(URL_PARAMS.query)?.trim() ?? '',
    sortMode: normalizeSortMode(searchParams.get(URL_PARAMS.sort)),
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CreditCardCatalog({
  cards,
  initialPill = 'all',
}: {
  cards: CreditCardType[];
  initialPill?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [initialUrlState] = useState<UrlState>(() =>
    buildInitialUrlState({ cards, initialPill, searchParams }),
  );
  const [filters, setFilters] = useState<FilterState>(initialUrlState.filters);
  const [activePill, setActivePill] = useState<string>(initialUrlState.activePill);
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState<string>(initialUrlState.query);
  const [sortMode, setSortMode] = useState<SortMode>(initialUrlState.sortMode);

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
      return true;
    });
    return filtered.sort(comparatorFor(sortMode));
  }, [cards, filters, query, sortMode]);

  const activeFilterCount = useMemo(
    () => Object.values(filters).filter((v) => v !== 'all').length,
    [filters],
  );

  const hasFilters = activeFilterCount > 0 || activePill !== 'all';
  const hasQuery = query.trim().length > 0;

  const filterChips = useMemo(() => {
    const chips: Array<{ key: keyof FilterState | 'query'; label: string; value: string }> = [];
    if (filters.issuer !== 'all') chips.push({ key: 'issuer', label: 'Bank', value: filters.issuer });
    if (filters.reward !== 'all')
      chips.push({ key: 'reward', label: 'Reward', value: rewardFilterLabel(filters.reward) });
    if (filters.fee !== 'all')
      chips.push({ key: 'fee', label: 'Yearly fee', value: feeFilterLabel(filters.fee) });
    if (filters.fx !== 'all')
      chips.push({ key: 'fx', label: 'Foreign card fee', value: fxFilterLabel(filters.fx) });
    if (hasQuery) chips.push({ key: 'query', label: 'Search', value: query.trim() });
    return chips;
  }, [filters, hasQuery, query]);

  const selectedCards = selected
    .map((key) => cards.find((card) => card.normalized_card_key === key))
    .filter((card): card is CreditCardType => Boolean(card));

  const compareHref =
    selectedCards.length >= 2
      ? `/credit-cards/compare/${selectedCards.map((c) => encodeURIComponent(c.normalized_card_key)).join('-vs-')}`
      : '#';

  const sortLabel = SORT_OPTIONS.find((o) => o.value === sortMode)?.label ?? '';

  function syncUrl(nextState: UrlState) {
    const params = new URLSearchParams(searchParams.toString());
    for (const key of CATALOG_URL_PARAMS) params.delete(key);

    const trimmedQuery = nextState.query.trim();
    if (trimmedQuery) params.set(URL_PARAMS.query, trimmedQuery);
    if (nextState.sortMode !== 'best') params.set(URL_PARAMS.sort, nextState.sortMode);

    if (nextState.activePill !== 'all') {
      params.set(URL_PARAMS.quickFilter, nextState.activePill);
    } else {
      if (nextState.filters.issuer !== 'all') params.set(URL_PARAMS.issuer, nextState.filters.issuer);
      if (nextState.filters.reward !== 'all') params.set(URL_PARAMS.reward, nextState.filters.reward);
      if (nextState.filters.fee !== 'all') params.set(URL_PARAMS.fee, nextState.filters.fee);
      if (nextState.filters.fx !== 'all') params.set(URL_PARAMS.fx, nextState.filters.fx);
    }

    const nextQuery = params.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
  }

  function selectPill(pill: QuickPill) {
    const nextFilters = pill.id === 'all' ? DEFAULT_FILTERS : { ...DEFAULT_FILTERS, ...pill.filter };
    setActivePill(pill.id);
    setFilters(nextFilters);
    syncUrl({ activePill: pill.id, filters: nextFilters, query, sortMode });
  }

  function patchFilters(patch: Partial<FilterState>) {
    const nextFilters = { ...filters, ...patch };
    setFilters(nextFilters);
    setActivePill('all');
    syncUrl({ activePill: 'all', filters: nextFilters, query, sortMode });
  }

  function removeChip(key: keyof FilterState | 'query') {
    if (key === 'query') {
      setQuery('');
      syncUrl({ activePill, filters, query: '', sortMode });
      return;
    }
    const nextFilters = { ...filters, [key]: 'all' };
    setFilters(nextFilters);
    setActivePill('all');
    syncUrl({ activePill: 'all', filters: nextFilters, query, sortMode });
  }

  function resetFilters() {
    setFilters(DEFAULT_FILTERS);
    setActivePill('all');
    syncUrl({ activePill: 'all', filters: DEFAULT_FILTERS, query, sortMode });
  }

  function clearAll() {
    setFilters(DEFAULT_FILTERS);
    setActivePill('all');
    setQuery('');
    setSortMode('best');
    syncUrl({ activePill: 'all', filters: DEFAULT_FILTERS, query: '', sortMode: 'best' });
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
    <TooltipProvider delay={150}>
      <section id="cards" className="scroll-mt-32 space-y-5 pb-28 sm:pb-24">
        {/* Search + sort */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-textSecondary dark:text-gray-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => {
                const nextQuery = event.target.value;
                setQuery(nextQuery);
                syncUrl({ activePill, filters, query: nextQuery, sortMode });
              }}
              placeholder="Search card or bank…"
              className="h-12 w-full rounded-2xl border border-brand-border bg-white pl-11 pr-11 text-sm text-brand-textPrimary outline-none transition-colors placeholder:text-brand-textSecondary focus:border-brand-primary dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-gray-500"
              aria-label="Search credit cards"
            />
            {hasQuery && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  syncUrl({ activePill, filters, query: '', sortMode });
                }}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-brand-textSecondary transition-colors hover:bg-brand-surface hover:text-brand-primary dark:hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <label className="flex items-center gap-2 text-sm text-brand-textSecondary dark:text-gray-300 sm:shrink-0">
            <span className="sr-only sm:not-sr-only">Sort</span>
            <select
              value={sortMode}
              onChange={(event) => {
                const nextSortMode = event.target.value as SortMode;
                setSortMode(nextSortMode);
                syncUrl({ activePill, filters, query, sortMode: nextSortMode });
              }}
              aria-label="Sort cards"
              className="h-12 rounded-2xl border border-brand-border bg-white px-3 text-sm font-semibold text-brand-textPrimary outline-none transition-colors focus:border-brand-primary dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
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
                {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="border-t border-brand-border px-5 pb-5 pt-4 dark:border-white/10">
              <p className="mb-4 text-xs leading-relaxed text-brand-textSecondary dark:text-gray-400">
                Use filters to narrow the list. They do not indicate a bank will approve you.
              </p>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
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
                  label="Yearly fee"
                  value={filters.fee}
                  onChange={(value) => patchFilters({ fee: value })}
                  options={[
                    { value: 'all', label: 'All fee states' },
                    { value: 'free', label: 'Free or no yearly fee' },
                    { value: 'free-or-low', label: 'Low or no fee' },
                    { value: 'paid', label: 'Disclosed paid fee' },
                    { value: 'not-disclosed', label: 'Not disclosed' },
                  ]}
                />
                <FilterSelect
                  label="Foreign card fee"
                  value={filters.fx}
                  onChange={(value) => patchFilters({ fx: value })}
                  options={[
                    { value: 'all', label: 'All FX states' },
                    { value: 'disclosed', label: 'Fee disclosed' },
                    { value: 'low', label: 'Low foreign card fee' },
                    { value: 'not-disclosed', label: 'Fee not disclosed' },
                  ]}
                />
              </div>
            </div>
          )}
        </div>

        {/* Active filter chips */}
        {filterChips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-brand-textSecondary dark:text-gray-400">
              Filtered by
            </span>
            {filterChips.map((chip) => (
              <span
                key={chip.key}
                className="inline-flex items-center gap-1.5 rounded-full border border-brand-primary/20 bg-brand-primaryLight px-3 py-1 text-xs font-semibold text-brand-primary dark:bg-brand-primary/10"
              >
                <span>
                  {chip.label}: {chip.value}
                </span>
                <button
                  type="button"
                  onClick={() => removeChip(chip.key)}
                  aria-label={`Remove ${chip.label} filter`}
                  className="rounded-full p-0.5 transition-colors hover:bg-brand-primary/15"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            <button
              type="button"
              onClick={clearAll}
              className="text-xs font-semibold text-brand-textSecondary underline underline-offset-2 hover:text-brand-primary dark:text-gray-400"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Results summary */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-brand-textSecondary dark:text-gray-300">
          <p>
            Showing{' '}
            <span className="font-semibold text-brand-textPrimary dark:text-white">
              {filteredCards.length}
            </span>{' '}
            of {cards.length} cards · sorted by {sortLabel.toLowerCase()}
          </p>
        </div>

        {/* Results */}
        {filteredCards.length > 0 ? (
          <div className="space-y-3">
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
              Try removing a filter or your search term.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={clearAll}
                className="inline-flex items-center gap-2 rounded-full bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white"
              >
                Clear filters
              </button>
              <Link
                href="/credit-cards"
                className="inline-flex items-center gap-2 rounded-full border border-brand-primary px-5 py-2.5 text-sm font-semibold text-brand-primary hover:bg-brand-primaryLight dark:hover:bg-brand-primary/10"
              >
                Take the finder
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}

        <CompareTray
          selectedCards={selectedCards}
          compareHref={compareHref}
          onRemove={(key) => setSelected((current) => current.filter((item) => item !== key))}
          onClear={() => setSelected([])}
        />
      </section>
    </TooltipProvider>
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

// ─── Per-card data shaping ──────────────────────────────────────────────────

type Fact = { value: string; sub?: string; missing: boolean };

function feeFact(card: CreditCardType): Fact {
  if (card.naffl) return { value: 'PHP 0', sub: 'for life', missing: false };
  if (card.annual_fee_recurring === 0) return { value: 'PHP 0', missing: false };
  if (card.annual_fee_recurring !== null)
    return { value: formatPhpAmount(card.annual_fee_recurring), sub: '/ year', missing: false };
  if (card.annual_fee_first_year !== null)
    return { value: formatPhpAmount(card.annual_fee_first_year), sub: 'first year', missing: false };
  return { value: NULL_NO_DATA, missing: true };
}

function incomeFact(card: CreditCardType): Fact {
  if (card.min_income_monthly !== null)
    return { value: formatPhpAmount(card.min_income_monthly), sub: '/ month', missing: false };
  if (card.min_income_annual !== null)
    return { value: formatPhpAmount(card.min_income_annual), sub: '/ year', missing: false };
  return { value: NULL_NO_DATA, missing: true };
}

function rewardFact(card: CreditCardType): Fact {
  const rate = earnRateString(card);
  if (rate) return { value: rate, missing: false };
  const type = rewardTypeLabel(card.rewards_type);
  if (type) return { value: type, missing: false };
  return { value: NULL_REWARDS, missing: true };
}

function fxFact(card: CreditCardType): Fact {
  if (card.foreign_transaction_fee_pct === null) return { value: NULL_NOT_DISCLOSED, missing: true };
  return { value: `${card.foreign_transaction_fee_pct.toFixed(2)}%`, missing: false };
}

function interestFact(card: CreditCardType): Fact {
  if (card.interest_rate_pct === null) return { value: NULL_NOT_DISCLOSED, missing: true };
  return { value: `${card.interest_rate_pct.toFixed(2)}%`, sub: '/ month', missing: false };
}

// ─── Card (renders one of three responsive layouts) ──────────────────────────

type SharedCardProps = {
  card: CreditCardType;
  rank: number;
  selected: boolean;
  compareDisabled: boolean;
  onToggleCompare: () => void;
  expanded: boolean;
  setExpanded: (value: boolean) => void;
  fitLabel: { label: string; color: string } | null;
  facts: { reward: Fact; fee: Fact; income: Fact; fx: Fact; interest: Fact };
  editorial: ReturnType<typeof getEditorialFor>;
  pros: string[];
  cons: string[];
  goodLine: string | null;
  watchLine: string | null;
  hasPromo: boolean;
  sourceHost: string | null;
};

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
  const fitLabel = computeFitLabel(card);
  const editorial = getEditorialFor(card);
  const pros = editorial.pros.slice(0, 3);
  const cons = editorial.cons.slice(0, 2);

  const shared: SharedCardProps = {
    card,
    rank,
    selected,
    compareDisabled,
    onToggleCompare,
    expanded,
    setExpanded,
    fitLabel,
    facts: {
      reward: rewardFact(card),
      fee: feeFact(card),
      income: incomeFact(card),
      fx: fxFact(card),
      interest: interestFact(card),
    },
    editorial,
    pros,
    cons,
    goodLine: pros[0] ?? null,
    watchLine: cons[0] ?? null,
    hasPromo: card.active_promo_count > 0,
    sourceHost: extractHost(card.source_url),
  };

  return (
    <article className="scroll-mt-32">
      {/* 1280px+ : dense comparison row */}
      <div className="hidden xl:block">
        <DenseRow {...shared} />
      </div>
      {/* 768–1279px : tablet card (max-width 880px) */}
      <div className="hidden md:block xl:hidden">
        <TabletCard {...shared} />
      </div>
      {/* <768px : mobile card */}
      <div className="md:hidden">
        <MobileCard {...shared} />
      </div>
    </article>
  );
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function ColumnHelp({ label, text }: { label: string; text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={(
          <button
            type="button"
            aria-label={`${label}: ${text}`}
            className="inline-flex min-h-[24px] items-center gap-1 rounded uppercase tracking-[0.08em] text-brand-textSecondary transition-colors hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40 dark:text-gray-400"
          />
        )}
      >
        <span>{label}</span>
        <Info className="h-3 w-3 shrink-0" aria-hidden="true" />
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="max-w-[220px] border border-gray-200 bg-white p-3 text-left text-xs font-normal leading-relaxed text-gray-900 shadow-lg dark:border-white/10 dark:bg-slate-800 dark:text-gray-100"
      >
        <p>{text}</p>
      </TooltipContent>
    </Tooltip>
  );
}

function BestForBadge({
  fitLabel,
  className,
}: {
  fitLabel: { label: string; color: string } | null;
  className?: string;
}) {
  if (!fitLabel) return null;
  return (
    <Tooltip>
      <TooltipTrigger
        render={(
          <button
            type="button"
            aria-label={`Best for ${fitLabel.label}. ${HELP.bestFor}`}
            className={cn(
              'inline-flex min-h-[24px] items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40',
              fitLabel.color,
              className,
            )}
          />
        )}
      >
        Best for: {fitLabel.label}
        <Info className="h-3 w-3 shrink-0 opacity-70" aria-hidden="true" />
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="max-w-[220px] border border-gray-200 bg-white p-3 text-left text-xs font-normal leading-relaxed text-gray-900 shadow-lg dark:border-white/10 dark:bg-slate-800 dark:text-gray-100"
      >
        <p>{HELP.bestFor}</p>
      </TooltipContent>
    </Tooltip>
  );
}

function PromoBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden="true" />
      Promo available
    </span>
  );
}

function CompareCheckbox({
  card,
  selected,
  compareDisabled,
  onToggle,
}: {
  card: CreditCardType;
  selected: boolean;
  compareDisabled: boolean;
  onToggle: () => void;
}) {
  return (
    <label
      title={compareDisabled ? 'Compare limit reached' : undefined}
      className={cn(
        'inline-flex cursor-pointer select-none items-center gap-2 text-sm font-semibold text-brand-textSecondary dark:text-gray-300',
        compareDisabled && 'cursor-not-allowed opacity-50',
      )}
    >
      <input
        type="checkbox"
        checked={selected}
        disabled={compareDisabled}
        onChange={onToggle}
        aria-label={
          compareDisabled ? 'Compare limit reached' : `Add ${card.card_name} to comparison`
        }
        className="h-4 w-4 rounded border-brand-border text-brand-primary focus:ring-brand-primary"
      />
      Compare
    </label>
  );
}

function TrustLine({ card, sourceHost }: { card: CreditCardType; sourceHost: string | null }) {
  return (
    <p className="flex items-center gap-1.5 truncate text-[11px] text-brand-textSecondary dark:text-gray-400">
      <ShieldCheck className="h-3 w-3 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
      <span className="truncate">
        Checked from bank page · {formatDate(card.last_scraped_at)}
        {sourceHost ? ` · ${sourceHost}` : ''}
      </span>
    </p>
  );
}

function ApplyBlock({
  card,
  rank,
  placement,
  className,
  centeredDisclosure,
}: {
  card: CreditCardType;
  rank: number;
  placement: string;
  className?: string;
  centeredDisclosure?: boolean;
}) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <ApplyOnBankSiteButton
        href={card.source_url}
        bank={card.bank}
        cardKey={card.normalized_card_key}
        sourcePage="credit-cards-all"
        placement={placement}
        rank={rank}
        label="Apply on bank site"
        className="h-10 w-full"
      />
      <AffiliateDisclosure
        size="compact"
        className={cn('text-[10px] leading-snug', centeredDisclosure && 'justify-center text-center')}
      />
    </div>
  );
}

function GoodWatchLines({
  goodLine,
  watchLine,
  className,
}: {
  goodLine: string | null;
  watchLine: string | null;
  className?: string;
}) {
  if (!goodLine && !watchLine) return null;
  return (
    <div className={cn('flex flex-col gap-1 text-[12.5px]', className)}>
      {goodLine && (
        <span className="flex items-start gap-1.5 text-emerald-700 dark:text-emerald-300">
          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          <span className="min-w-0">{goodLine}</span>
        </span>
      )}
      {watchLine && (
        <span className="flex items-start gap-1.5 text-amber-700 dark:text-amber-300">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
          <span className="min-w-0">{watchLine}</span>
        </span>
      )}
    </div>
  );
}

function ExpandToggle({
  expanded,
  onToggle,
  cardName,
  children,
  className,
}: {
  expanded: boolean;
  onToggle: () => void;
  cardName: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={expanded}
      aria-label={expanded ? `Hide details for ${cardName}` : `Show details for ${cardName}`}
      className={cn(
        'flex w-full items-center justify-between gap-3 border-t border-brand-border bg-brand-surface/60 px-4 py-2.5 text-left text-xs font-semibold text-brand-textSecondary transition-colors hover:bg-brand-surface dark:border-white/10 dark:bg-white/[0.02] dark:text-gray-300',
        className,
      )}
    >
      <span className="min-w-0 flex-1">{children}</span>
      <span className="inline-flex shrink-0 items-center gap-1 text-brand-primary">
        {expanded ? 'Hide details' : 'More details'}
        {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </span>
    </button>
  );
}

function ExpandedDetails({
  card,
  editorial,
  pros,
  cons,
  facts,
  sourceHost,
}: {
  card: CreditCardType;
  editorial: ReturnType<typeof getEditorialFor>;
  pros: string[];
  cons: string[];
  facts: SharedCardProps['facts'];
  sourceHost: string | null;
}) {
  return (
    <div className="space-y-4 border-t border-brand-border bg-white px-4 py-4 dark:border-white/10 dark:bg-white/[0.02]">
      {/* Truva Advisor Verdict Bento Box */}
      {(editorial.why || editorial.targetUser || editorial.valueAdd || editorial.welcomePromo) && (
        <div className="rounded-2xl border border-brand-primary/20 bg-brand-primary-light/40 p-4 dark:border-blue-500/20 dark:bg-blue-950/10">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-2 w-2 rounded-full bg-brand-primary animate-pulse" />
            <p className="font-header text-xs font-bold uppercase tracking-[0.16em] text-brand-primary dark:text-blue-400">
              TRUVA ADVISOR VERDICT
            </p>
          </div>
          <div className="mt-3 space-y-2">
            {editorial.why && (
              <p className="text-[13.5px] leading-relaxed text-brand-textPrimary font-semibold dark:text-white">
                {editorial.why}
              </p>
            )}
            {(editorial.targetUser || editorial.valueAdd || editorial.welcomePromo) && (
              <div className="text-[12.5px] leading-relaxed text-brand-textSecondary space-y-1 dark:text-gray-300">
                {editorial.welcomePromo && (
                  <p>
                    <span className="font-semibold text-brand-textPrimary dark:text-white">Welcome offer: </span>
                    <span className="text-brand-primary dark:text-blue-400 font-medium">{editorial.welcomePromo}</span>
                    {' '}
                    <a
                      href={card.source_url}
                      target="_blank"
                      rel="nofollow noopener noreferrer"
                      className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-brand-textSecondary underline decoration-brand-textSecondary/40 underline-offset-2 transition-colors hover:text-brand-primary hover:decoration-brand-primary/40 dark:text-gray-400 dark:hover:text-blue-400"
                    >
                      Terms &amp; Conditions
                    </a>
                  </p>
                )}
                {editorial.targetUser && (
                  <p>
                    <span className="font-semibold text-brand-textPrimary dark:text-white">Who it is for: </span>
                    {editorial.targetUser}
                  </p>
                )}
                {editorial.valueAdd && (
                  <p>
                    <span className="font-semibold text-brand-textPrimary dark:text-white">What makes it unique: </span>
                    {editorial.valueAdd}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {(pros.length > 0 || cons.length > 0) && (
        <div className="grid gap-3 sm:grid-cols-2">
          {pros.length > 0 && (
            <div>
              <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-300">
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                Good
              </p>
              <ul className="mt-2 space-y-1.5">
                {pros.map((item) => (
                  <li key={item} className="flex gap-1.5 text-[12.5px] leading-snug text-brand-textPrimary dark:text-gray-200">
                    <Check className="mt-[3px] h-3 w-3 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                    <span className="min-w-0">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {cons.length > 0 && (
            <div>
              <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-amber-700 dark:text-amber-300">
                <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                Watch out for
              </p>
              <ul className="mt-2 space-y-1.5">
                {cons.map((item) => (
                  <li key={item} className="flex gap-1.5 text-[12.5px] leading-snug text-brand-textPrimary dark:text-gray-200">
                    <AlertTriangle className="mt-[3px] h-3 w-3 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                    <span className="min-w-0">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        <DetailTile label="Fee waiver" value={card.annual_fee_waiver_condition ?? NULL_NO_DATA} />
        <DetailTile label="Cash advance" value={formatCashAdvanceFee(card)} />
        <DetailTile
          label="Late payment"
          value={
            card.late_payment_fee_amount !== null
              ? formatPhpAmount(card.late_payment_fee_amount)
              : NULL_NOT_DISCLOSED
          }
        />
        <DetailTile label="Foreign card fee" value={facts.fx.value} missing={facts.fx.missing} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-brand-border pt-3 text-xs text-brand-textSecondary dark:border-white/10 dark:text-gray-400">
        <span>
          From{' '}
          {sourceHost ? (
            <a href={card.source_url} target="_blank" rel="nofollow noopener noreferrer" className="font-semibold text-brand-primary hover:underline">
              {sourceHost}
            </a>
          ) : (
            'the bank page'
          )}{' '}
          · checked {formatDate(card.last_scraped_at)}
        </span>
        <Link href="/methodology/credit-cards" className="inline-flex items-center gap-1 font-semibold text-brand-primary hover:underline">
          How we check this card
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}

function DetailTile({ label, value, missing }: { label: string; value: string; missing?: boolean }) {
  return (
    <div className="rounded-xl border border-brand-border/90 bg-white/75 p-3 dark:border-white/10 dark:bg-slate-950/40">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-textSecondary dark:text-gray-400">
        {label}
      </p>
      <p
        className={cn(
          'mt-1 break-words text-sm font-bold text-brand-textPrimary dark:text-white',
          missing && 'font-medium italic text-brand-textSecondary dark:text-gray-400',
        )}
      >
        {value}
      </p>
    </div>
  );
}

// ─── Dense desktop row (1280px+) ─────────────────────────────────────────────

function DenseCell({
  label,
  fact,
  help,
  wrap,
}: {
  label: string;
  fact: Fact;
  help?: string;
  wrap?: boolean;
}) {
  return (
    <div className="min-w-0">
      <div className="flex items-center text-[10px] font-semibold uppercase tracking-[0.08em] text-brand-textSecondary dark:text-gray-400">
        {help ? (
          <ColumnHelp label={label} text={help} />
        ) : (
          <span className="inline-flex min-h-[24px] items-center uppercase tracking-[0.08em] text-brand-textSecondary dark:text-gray-400">
            {label}
          </span>
        )}
      </div>
      <p
        className={cn(
          'mt-1 text-[14.5px] font-bold text-brand-textPrimary dark:text-white',
          !wrap && 'truncate tabular-nums',
          fact.missing && 'font-medium italic text-brand-textSecondary dark:text-gray-400',
        )}
      >
        {fact.value}
      </p>
      {fact.sub && !fact.missing ? (
        <p className="mt-0.5 text-[11px] font-medium text-brand-textSecondary dark:text-gray-400">{fact.sub}</p>
      ) : (
        <p className="mt-0.5 text-[11px] select-none opacity-0" aria-hidden="true">&nbsp;</p>
      )}
    </div>
  );
}

function DenseRow(props: SharedCardProps) {
  const { card, rank, selected, compareDisabled, onToggleCompare, expanded, setExpanded, fitLabel, facts, goodLine, watchLine, hasPromo, sourceHost } = props;
  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05)] transition-colors dark:bg-white/[0.04]',
        selected ? 'border-brand-primary ring-2 ring-brand-primaryLight dark:ring-brand-primary/30' : 'border-brand-border dark:border-white/10',
      )}
    >
      <div className="grid grid-cols-[minmax(280px,1.4fr)_minmax(120px,1.1fr)_minmax(100px,0.9fr)_minmax(100px,0.9fr)_minmax(100px,0.9fr)_minmax(100px,0.9fr)_208px] items-center gap-4 px-4 py-4">
        {/* Identity */}
        <div className="flex min-w-0 items-start gap-3">
          <MiniCreditCardVisual card={card} className="h-10 w-16" />
          <div className="min-w-0">
            <h3 className="truncate text-[15px] font-bold leading-tight text-brand-textPrimary dark:text-white">
              <Link href={`/credit-cards/reviews/${card.normalized_card_key}`} className="hover:text-brand-primary hover:underline">
                {card.card_name}
              </Link>
            </h3>
            <p className="truncate text-xs text-brand-textSecondary dark:text-gray-300">{card.bank}</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <BestForBadge fitLabel={fitLabel} />
              {hasPromo && <PromoBadge />}
            </div>
            <div className="mt-1.5">
              <TrustLine card={card} sourceHost={sourceHost} />
            </div>
          </div>
        </div>

        <DenseCell label="Rewards" fact={facts.reward} help={HELP.rewards} wrap />
        <DenseCell label="Yearly fee" fact={facts.fee} help={HELP.yearlyFee} />
        <DenseCell label="Income" fact={facts.income} help={HELP.income} />
        <DenseCell label="Foreign fee" fact={facts.fx} help={HELP.foreignFee} />
        <DenseCell label="Interest" fact={facts.interest} help={HELP.interest} />

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <ApplyBlock card={card} rank={rank} placement="browse_dense_row" />
          <div className="flex items-center justify-between gap-2">
            <Link
              href={`/credit-cards/reviews/${card.normalized_card_key}`}
              className="inline-flex items-center gap-0.5 text-xs font-semibold text-brand-primary hover:underline"
            >
              View details
              <ArrowRight className="h-3 w-3" />
            </Link>
            <CompareCheckbox card={card} selected={selected} compareDisabled={compareDisabled} onToggle={onToggleCompare} />
          </div>
        </div>
      </div>

      <ExpandToggle expanded={expanded} onToggle={() => setExpanded(!expanded)} cardName={card.card_name}>
        <GoodWatchLines goodLine={goodLine} watchLine={watchLine} className="flex-row flex-wrap gap-x-4 gap-y-1" />
      </ExpandToggle>

      {expanded && <ExpandedDetails card={card} editorial={props.editorial} pros={props.pros} cons={props.cons} facts={facts} sourceHost={sourceHost} />}
    </div>
  );
}

// ─── Tablet card (768–1279px, max-width 880px) ───────────────────────────────

function TabletCard(props: SharedCardProps) {
  const { card, rank, selected, compareDisabled, onToggleCompare, expanded, setExpanded, fitLabel, facts, goodLine, watchLine, hasPromo, sourceHost } = props;
  return (
    <div
      className={cn(
        'mx-auto max-w-[880px] overflow-hidden rounded-2xl border bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05)] dark:bg-white/[0.04]',
        selected ? 'border-brand-primary ring-2 ring-brand-primaryLight dark:ring-brand-primary/30' : 'border-brand-border dark:border-white/10',
      )}
    >
      <div className="grid grid-cols-[88px_minmax(0,1fr)_220px] gap-5 p-5">
        <MiniCreditCardVisual card={card} className="h-14 w-[88px]" />
        <div className="min-w-0">
          <h3 className="text-lg font-bold leading-tight text-brand-textPrimary dark:text-white">
            <Link href={`/credit-cards/reviews/${card.normalized_card_key}`} className="hover:text-brand-primary hover:underline">
              {card.card_name}
            </Link>
          </h3>
          <p className="mt-0.5 text-sm text-brand-textSecondary dark:text-gray-300">{card.bank}</p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <BestForBadge fitLabel={fitLabel} />
            {hasPromo && <PromoBadge />}
          </div>
          <div className="mt-2">
            <TrustLine card={card} sourceHost={sourceHost} />
          </div>
        </div>
        <ApplyBlock card={card} rank={rank} placement="browse_tablet_card" centeredDisclosure />
      </div>

      <div className="grid grid-cols-5 gap-4 border-t border-brand-border bg-brand-surface/60 px-5 py-4 dark:border-white/10 dark:bg-white/[0.02]">
        <DenseCell label="Rewards" fact={facts.reward} help={HELP.rewards} wrap />
        <DenseCell label="Yearly fee" fact={facts.fee} help={HELP.yearlyFee} />
        <DenseCell label="Income" fact={facts.income} help={HELP.income} />
        <DenseCell label="Foreign fee" fact={facts.fx} help={HELP.foreignFee} />
        <DenseCell label="Interest" fact={facts.interest} help={HELP.interest} />
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-brand-border px-5 py-2.5 dark:border-white/10">
        <Link
          href={`/credit-cards/reviews/${card.normalized_card_key}`}
          className="inline-flex items-center gap-0.5 text-xs font-semibold text-brand-primary hover:underline"
        >
          View details
          <ArrowRight className="h-3 w-3" />
        </Link>
        <CompareCheckbox card={card} selected={selected} compareDisabled={compareDisabled} onToggle={onToggleCompare} />
      </div>

      <ExpandToggle expanded={expanded} onToggle={() => setExpanded(!expanded)} cardName={card.card_name}>
        <GoodWatchLines goodLine={goodLine} watchLine={watchLine} className="flex-row flex-wrap gap-x-4 gap-y-1" />
      </ExpandToggle>

      {expanded && <ExpandedDetails card={card} editorial={props.editorial} pros={props.pros} cons={props.cons} facts={facts} sourceHost={sourceHost} />}
    </div>
  );
}

// ─── Mobile card (<768px) ────────────────────────────────────────────────────

function MobileFact({ label, fact }: { label: string; fact: Fact }) {
  return (
    <div className="border-b border-r border-brand-border p-3 [&:nth-child(2n)]:border-r-0 [&:nth-last-child(-n+2)]:border-b-0 dark:border-white/10">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-textSecondary dark:text-gray-400">
        {label}
      </p>
      <p
        className={cn(
          'mt-1 text-sm font-bold tabular-nums text-brand-textPrimary dark:text-white',
          fact.missing && 'font-medium italic text-brand-textSecondary dark:text-gray-400',
        )}
      >
        {fact.value}
      </p>
      {fact.sub && !fact.missing && (
        <p className="text-[10px] text-brand-textSecondary dark:text-gray-400">{fact.sub}</p>
      )}
    </div>
  );
}

function MobileCard(props: SharedCardProps) {
  const { card, rank, selected, compareDisabled, onToggleCompare, expanded, setExpanded, fitLabel, facts, goodLine, watchLine, hasPromo, sourceHost } = props;
  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border bg-white dark:bg-white/[0.04]',
        selected ? 'border-brand-primary ring-2 ring-brand-primaryLight dark:ring-brand-primary/30' : 'border-brand-border dark:border-white/10',
      )}
    >
      <div className="flex items-start gap-3 p-4">
        <MiniCreditCardVisual card={card} className="h-12 w-20" />
        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-bold leading-tight text-brand-textPrimary dark:text-white">
            <Link href={`/credit-cards/reviews/${card.normalized_card_key}`} className="hover:text-brand-primary hover:underline">
              {card.card_name}
            </Link>
          </h3>
          <p className="mt-0.5 text-xs text-brand-textSecondary dark:text-gray-300">{card.bank}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <BestForBadge fitLabel={fitLabel} />
            {hasPromo && <PromoBadge />}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 border-t border-brand-border dark:border-white/10">
        <MobileFact label="Rewards" fact={facts.reward} />
        <MobileFact label="Yearly fee" fact={facts.fee} />
        <MobileFact label="Min. income" fact={facts.income} />
        <MobileFact label="Interest / month" fact={facts.interest} />
      </div>

      {(goodLine || watchLine) && (
        <div className="border-t border-brand-border bg-brand-surface/60 px-4 py-3 dark:border-white/10 dark:bg-white/[0.02]">
          <GoodWatchLines goodLine={goodLine} watchLine={watchLine} />
        </div>
      )}

      <div className="space-y-3 border-t border-brand-border p-4 dark:border-white/10">
        <ApplyBlock card={card} rank={rank} placement="browse_mobile_card" centeredDisclosure />
        <div className="flex items-center justify-between gap-3">
          <Link
            href={`/credit-cards/reviews/${card.normalized_card_key}`}
            className="inline-flex items-center gap-0.5 text-sm font-semibold text-brand-primary hover:underline"
          >
            View details
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <CompareCheckbox card={card} selected={selected} compareDisabled={compareDisabled} onToggle={onToggleCompare} />
        </div>
      </div>

      <ExpandToggle expanded={expanded} onToggle={() => setExpanded(!expanded)} cardName={card.card_name}>
        <span className="text-brand-textSecondary dark:text-gray-400">More about this card</span>
      </ExpandToggle>

      {expanded && <ExpandedDetails card={card} editorial={props.editorial} pros={props.pros} cons={props.cons} facts={facts} sourceHost={sourceHost} />}
    </div>
  );
}

// ─── Compare tray ─────────────────────────────────────────────────────────────

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

  const helper =
    selectedCards.length >= 3
      ? 'You can compare up to 3 cards at a time. Remove one to add another.'
      : selectedCards.length === 2
        ? 'Add a 3rd card (optional), or compare now.'
        : 'Pick at least one more card to compare.';

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-brand-border bg-white/95 px-4 py-3 shadow-[0_-18px_60px_-40px_rgba(15,23,42,0.55)] backdrop-blur dark:border-white/10 dark:bg-slate-950/95">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary">
            Compare · {selectedCards.length} of 3
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
          </div>
          <p className="mt-1.5 text-[11px] text-brand-textSecondary dark:text-gray-400">{helper}</p>
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

// ─── Best-for badge logic (v1: computeFitLabel output only) ───────────────────

function computeFitLabel(card: CreditCardType): { label: string; color: string } | null {
  if (card.naffl || card.annual_fee_recurring === 0)
    return {
      label: 'No Yearly Fee',
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

// ─── Filter chip label helpers ────────────────────────────────────────────────

function rewardFilterLabel(value: string): string {
  switch (value) {
    case 'cashback':
      return 'Cashback';
    case 'points':
      return 'Points';
    case 'miles':
      return 'Miles/other';
    default:
      return value;
  }
}

function feeFilterLabel(value: string): string {
  switch (value) {
    case 'free':
      return 'Free or no yearly fee';
    case 'free-or-low':
      return 'Low or no fee';
    case 'paid':
      return 'Disclosed paid fee';
    case 'not-disclosed':
      return 'Not disclosed';
    default:
      return value;
  }
}

function fxFilterLabel(value: string): string {
  switch (value) {
    case 'disclosed':
      return 'Fee disclosed';
    case 'low':
      return 'Low foreign card fee';
    case 'not-disclosed':
      return 'Fee not disclosed';
    default:
      return value;
  }
}

// ─── Format helpers ────────────────────────────────────────────────────────────

function rewardTypeLabel(rewardType: CreditCardType['rewards_type']): string | null {
  switch (rewardType) {
    case 'cashback':
      return 'Cashback';
    case 'miles':
      return 'Miles';
    case 'points':
      return 'Points';
    default:
      return null;
  }
}

/**
 * Short, scannable earn rate — shows the real advertised rate when we have it
 * (e.g. "8% on dining", "2 pts / ₱30", "₱4 / ₱1,000"). Returns null when there
 * is no documented rate, so callers can fall back to the reward type label.
 * Never fabricates a number.
 */
function earnRateString(card: CreditCardType): string | null {
  const formula = card.rewards_formula as
    | { earn_rate?: number | null; earn_unit?: string | null }
    | null;
  const rate = formula && typeof formula.earn_rate === 'number' ? formula.earn_rate : null;
  const unitRaw = formula && typeof formula.earn_unit === 'string' ? formula.earn_unit.trim() : '';

  if (rate !== null && rate > 0) {
    const unit = unitRaw.toLowerCase();
    const perMatch = unitRaw.match(/per\s*php\s*([\d,]+)/i);
    const per = perMatch ? perMatch[1].replace(/,/g, '') : null;

    if (unit.includes('percent') || unit.includes('%')) {
      const tail = unitRaw.replace(/percent/i, '').replace(/%/g, '').trim();
      return tail ? `${rate}% ${tail}` : `${rate}%`;
    }
    if (unit.includes('point')) {
      const noun = rate === 1 ? 'pt' : 'pts';
      return per ? `${rate} ${noun} / ₱${per}` : `${rate} ${noun}`;
    }
    if (unit.includes('mile')) {
      return per ? `${rate} mi / ₱${per}` : `${rate} miles`;
    }
    if (per) return `₱${rate} / ₱${perMatch![1]}`;
  }

  return null;
}

function formatPhpAmount(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace('PHP', 'PHP ');
}

function formatDate(value: string | null): string {
  if (!value) return NULL_NO_DATA;
  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value));
}

function formatCashAdvanceFee(card: CreditCardType): string {
  const pieces = [
    card.cash_advance_fee_pct !== null ? `${card.cash_advance_fee_pct.toFixed(2)}%` : null,
    card.cash_advance_fee_amount !== null ? formatPhpAmount(card.cash_advance_fee_amount) : null,
  ].filter(Boolean);
  return pieces.length > 0 ? pieces.join(' or ') : NULL_NOT_DISCLOSED;
}

function extractHost(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).host.replace(/^www\./, '');
  } catch {
    return null;
  }
}
