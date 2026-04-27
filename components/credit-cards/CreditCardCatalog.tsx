'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  ArrowRight,
  BadgeDollarSign,
  CheckCircle,
  Filter,
  Info,
  Landmark,
  Plane,
  ShieldCheck,
  Sparkles,
  X,
  type LucideIcon,
} from 'lucide-react';
import { CreditCardTrustBadges } from '@/components/credit-cards/CreditCardTrustBadges';
import { CreditCardVisual } from '@/components/credit-cards/CreditCardVisual';
import { TrueValueScoreBadge } from '@/components/product/TrueValueScoreBadge';
import { cn } from '@/lib/utils';
import type { BadgeInputs, CreditCard as CreditCardType } from '@/types';

type FilterState = {
  issuer: string;
  reward: string;
  fee: string;
  fx: string;
  promo: string;
};

type BrowseModule = {
  title: string;
  description: string;
  icon: LucideIcon;
  count: number;
  filter: Partial<FilterState>;
  status?: string;
};

const DEFAULT_FILTERS: FilterState = {
  issuer: 'all',
  reward: 'all',
  fee: 'all',
  fx: 'all',
  promo: 'all',
};

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

export function CreditCardCatalog({ cards }: { cards: CreditCardType[] }) {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [selected, setSelected] = useState<string[]>([]);

  const issuers = useMemo(
    () => Array.from(new Set(cards.map((card) => card.bank))).sort(),
    [cards],
  );

  const browseModules = useMemo<BrowseModule[]>(
    () => [
      {
        title: 'Cashback cards',
        description: 'Cards that may return part of your spending as cash value.',
        icon: BadgeDollarSign,
        count: cards.filter((card) => card.rewards_type === 'cashback').length,
        filter: { reward: 'cashback' },
      },
      {
        title: 'Points rewards cards',
        description: 'Cards that earn points you may redeem through the bank program.',
        icon: Sparkles,
        count: cards.filter((card) => card.rewards_type === 'points').length,
        filter: { reward: 'points' },
      },
      {
        title: 'Low or no annual fee',
        description: 'Cards with no fee or a lower disclosed annual fee in the current data.',
        icon: ShieldCheck,
        count: cards.filter((card) => card.naffl || card.annual_fee_recurring === 0 || (card.annual_fee_recurring !== null && card.annual_fee_recurring <= 2000)).length,
        filter: { fee: 'free-or-low' },
      },
      {
        title: 'Travel cards to inspect',
        description: 'Cards where travel benefits, insurance, and foreign fees need careful checking.',
        icon: Plane,
        count: cards.filter((card) => card.card_tier === 'signature' || card.card_tier === 'infinite' || card.card_tier === 'platinum').length,
        filter: { fx: 'low' },
        status: 'Check details',
      },
    ],
    [cards],
  );

  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      if (filters.issuer !== 'all' && card.bank !== filters.issuer) return false;
      if (filters.reward !== 'all' && (card.rewards_type ?? 'none') !== filters.reward) return false;
      if (filters.fee === 'free' && !(card.naffl || card.annual_fee_recurring === 0)) return false;
      if (filters.fee === 'paid' && !(card.annual_fee_recurring !== null && card.annual_fee_recurring > 0 && !card.naffl)) return false;
      if (filters.fee === 'not-disclosed' && card.annual_fee_recurring !== null) return false;
      if (filters.fee === 'free-or-low' && !(card.naffl || card.annual_fee_recurring === 0 || (card.annual_fee_recurring !== null && card.annual_fee_recurring <= 2000))) return false;
      if (filters.fx === 'disclosed' && card.foreign_transaction_fee_pct === null) return false;
      if (filters.fx === 'not-disclosed' && card.foreign_transaction_fee_pct !== null) return false;
      if (filters.fx === 'low' && card.badge_inputs?.low_fx_fee !== true) return false;
      if (filters.promo === 'linked' && card.active_promo_count <= 0) return false;
      if (filters.promo === 'none' && card.active_promo_count > 0) return false;
      return true;
    });
  }, [cards, filters]);

  const selectedCards = selected
    .map((key) => cards.find((card) => card.normalized_card_key === key))
    .filter((card): card is CreditCardType => Boolean(card));

  const compareHref =
    selectedCards.length === 2
      ? `/credit-cards/compare/${encodeURIComponent(selectedCards[0].normalized_card_key)}-vs-${encodeURIComponent(selectedCards[1].normalized_card_key)}`
      : '#';

  function patchFilters(patch: Partial<FilterState>) {
    setFilters((current) => ({ ...current, ...patch }));
  }

  function toggleCompare(card: CreditCardType) {
    setSelected((current) => {
      if (current.includes(card.normalized_card_key)) {
        return current.filter((key) => key !== card.normalized_card_key);
      }
      if (current.length >= 2) return current;
      return [...current, card.normalized_card_key];
    });
  }

  return (
    <section id="cards" className="space-y-6 scroll-mt-32">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-primary">
          Browse current data
        </p>
        <h2 className="text-2xl font-bold tracking-tight text-brand-textPrimary dark:text-white sm:text-3xl">
          Compare cards without the hard sell
        </h2>
        <p className="max-w-3xl text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
          Truva currently shows {cards.length} card records from {issuers.length} banks. Start with fees, rewards, interest, and the details that still need checking.
        </p>
      </div>

      <div id="browse" className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 scroll-mt-32">
        {browseModules.map((module) => {
          const Icon = module.icon;
          return (
            <button
              key={module.title}
              type="button"
              onClick={() => patchFilters({ ...DEFAULT_FILTERS, ...module.filter })}
              className="group rounded-[1.4rem] border border-brand-border bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-primary/25 dark:border-white/10 dark:bg-white/[0.04]"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/15">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="rounded-full bg-brand-surface px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-brand-textSecondary dark:bg-white/[0.08] dark:text-gray-300">
                  {module.status ?? `${module.count} cards`}
                </span>
              </div>
              <h3 className="mt-4 text-lg font-bold tracking-tight text-brand-textPrimary group-hover:text-brand-primary dark:text-white">
                {module.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
                {module.description}
              </p>
            </button>
          );
        })}
      </div>

      <div className="rounded-[1.4rem] border border-brand-border bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-primary">
              <Filter className="h-4 w-4" />
              Safe filters
            </div>
            <p className="text-sm leading-relaxed text-brand-textSecondary dark:text-gray-300">
              Use filters to narrow the list, not as financial advice. Income and score controls stay off until the fields are complete enough to use.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setFilters(DEFAULT_FILTERS)}
            className="inline-flex items-center justify-center rounded-full border border-brand-border bg-brand-surface px-4 py-2 text-sm font-semibold text-brand-textPrimary transition-colors hover:border-brand-primary/25 hover:text-brand-primary dark:border-white/10 dark:bg-white/[0.05] dark:text-gray-100"
          >
            Reset filters
          </button>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
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

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <LockedControl title="Income filter off for now" description="We need clearer bank income requirements before using this filter." />
          <LockedControl title="Scores come later" description="Scores wait until enough card details are complete and fair to compare." />
          <LockedControl title="Peso value off for now" description="Reward value and fee-waiver details still need more checking." />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-brand-textSecondary dark:text-gray-300">
          Showing <span className="font-semibold text-brand-textPrimary dark:text-white">{filteredCards.length}</span> of {cards.length} public card records.
        </p>
        <TrueValueScoreBadge compact />
      </div>

      {filteredCards.length > 0 ? (
        <div className="grid gap-5 xl:grid-cols-2">
          {filteredCards.map((card) => (
            <CatalogCard
              key={card.id}
              card={card}
              selected={selected.includes(card.normalized_card_key)}
              compareDisabled={!selected.includes(card.normalized_card_key) && selected.length >= 2}
              onToggleCompare={() => toggleCompare(card)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-[1.4rem] border border-dashed border-brand-border bg-white p-8 text-center dark:border-white/10 dark:bg-white/[0.04]">
          <p className="text-lg font-bold text-brand-textPrimary dark:text-white">No cards match these filters yet</p>
          <p className="mt-2 text-sm text-brand-textSecondary dark:text-gray-300">
            Try removing a filter or compare all available card listings.
          </p>
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

function LockedControl({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border border-dashed border-brand-border bg-brand-surface/70 p-3 dark:border-white/10 dark:bg-white/[0.03]">
      <p className="text-sm font-bold text-brand-textPrimary dark:text-white">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-brand-textSecondary dark:text-gray-400">{description}</p>
    </div>
  );
}

function CatalogCard({
  card,
  selected,
  compareDisabled,
  onToggleCompare,
}: {
  card: CreditCardType;
  selected: boolean;
  compareDisabled: boolean;
  onToggleCompare: () => void;
}) {
  const isPartnerCard = card.badge_inputs?.partner_card === true;

  return (
    <article
      className={cn(
        'overflow-hidden rounded-[1.4rem] border bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:bg-white/[0.04]',
        isPartnerCard ? 'border-amber-400 dark:border-amber-500/50' : 'border-brand-border dark:border-white/10',
      )}
    >
      {isPartnerCard ? (
        <div className="flex items-center gap-2 border-b border-amber-400/20 bg-amber-400/10 px-5 py-2 text-xs font-semibold text-amber-700 dark:text-amber-300">
          <Sparkles className="h-3.5 w-3.5" />
          Partner disclosure applies before you visit the bank site.
        </div>
      ) : null}

      <div className="grid gap-5 p-5 sm:grid-cols-[11rem_minmax(0,1fr)]">
        <div className="space-y-3">
          <CreditCardVisual card={card} />
          <TrueValueScoreBadge compact className="justify-center" />
        </div>

        <div className="flex min-w-0 flex-col">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary">
                {formatCardMeta(card)}
              </p>
              <h3 className="mt-1 text-xl font-bold tracking-tight text-brand-textPrimary dark:text-white">
                {card.card_name}
              </h3>
              <p className="mt-1 text-sm text-brand-textSecondary dark:text-gray-300">{card.bank}</p>
            </div>
            {card.active_promo_count > 0 ? (
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-brand-primary/10 px-3 py-1.5 text-xs font-semibold text-brand-primary">
                <Sparkles className="h-3.5 w-3.5" />
                {card.active_promo_count} linked promo
              </span>
            ) : null}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <FactTile label="Annual fee" value={formatAnnualFee(card)} detail={card.annual_fee_waiver_condition ?? 'Waiver data incomplete'} />
            <FactTile label="Rewards" value={formatRewardType(card.rewards_type)} detail={formatRewardFormula(card.rewards_formula)} />
            <FactTile label="Interest" value={formatMonthlyRate(card.interest_rate_pct)} detail="Monthly card rate when disclosed" />
            <FactTile label="Foreign fee" value={formatPercent(card.foreign_transaction_fee_pct)} detail={card.foreign_transaction_fee_pct === null ? 'Not disclosed in current row' : 'Fee for non-PHP or overseas transactions'} />
          </div>

          <div className="mt-4 space-y-2 text-xs text-brand-textSecondary dark:text-gray-400">
            <p>
              Income requirement: <span className="font-semibold text-brand-textPrimary dark:text-gray-200">{formatIncome(card)}</span>
            </p>
            <p>
              Source updated: <span className="font-semibold text-brand-textPrimary dark:text-gray-200">{formatDate(card.last_scraped_at)}</span>
            </p>
          </div>

          <CreditCardTrustBadges card={card} limit={4} className="mt-4" />

          <div className="mt-4 flex flex-wrap gap-1.5">
            <BadgeChips badges={card.badge_inputs} limit={5} />
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/credit-cards/reviews/${card.normalized_card_key}`}
              className="inline-flex flex-1 items-center justify-center rounded-xl bg-brand-primary/10 px-4 py-3 text-sm font-semibold text-brand-primary transition-colors hover:bg-brand-primary/20"
            >
              View card details
            </Link>
            <button
              type="button"
              onClick={onToggleCompare}
              disabled={compareDisabled}
              className={cn(
                'inline-flex flex-1 items-center justify-center rounded-xl border px-4 py-3 text-sm font-semibold transition-colors',
                selected
                  ? 'border-brand-primary bg-brand-primary text-white'
                  : 'border-brand-border bg-brand-surface text-brand-textPrimary hover:border-brand-primary/25 hover:text-brand-primary dark:border-white/10 dark:bg-white/[0.05] dark:text-gray-100',
                compareDisabled ? 'cursor-not-allowed opacity-50' : '',
              )}
            >
              {selected ? 'Selected to compare' : 'Compare'}
            </button>
            <a
              href={card.source_url}
              target="_blank"
              rel="nofollow noopener noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-primary px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-brand-primary/20 transition-colors hover:bg-brand-primary/90"
            >
              Visit bank site
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}

function FactTile({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="min-h-[6.5rem] rounded-xl border border-brand-border bg-brand-surface/80 p-3 dark:border-white/10 dark:bg-slate-950/40">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-textSecondary dark:text-gray-400">
        {label}
      </p>
      <p className="mt-1 text-base font-bold tabular-nums text-brand-textPrimary dark:text-white">{value}</p>
      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-brand-textSecondary dark:text-gray-400">{detail}</p>
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
            {selectedCards.length === 1 ? (
              <span className="inline-flex items-center rounded-full border border-dashed border-brand-border px-3 py-1.5 text-xs text-brand-textSecondary dark:border-white/10">
                Select one more card
              </span>
            ) : null}
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
            aria-disabled={selectedCards.length !== 2}
            className={cn(
              'inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold',
              selectedCards.length === 2
                ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20'
                : 'pointer-events-none bg-brand-primary/30 text-white',
            )}
          >
            Compare two cards
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
        const Icon = def.type === 'positive' ? CheckCircle : def.type === 'catch' ? Info : Landmark;

        return (
          <span
            key={def.key}
            className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium', classes)}
          >
            <Icon className={iconClass} />
            {def.label}
          </span>
        );
      })}
    </>
  );
}

function formatCardMeta(card: CreditCardType) {
  return [card.card_network, card.card_tier].filter(Boolean).join(' / ') || 'Card details';
}

function formatAnnualFee(card: CreditCardType): string {
  if (card.naffl) return 'PHP 0 NAFFL';
  if (card.annual_fee_recurring === 0) return 'PHP 0';
  if (card.annual_fee_recurring !== null) return formatPhpAmount(card.annual_fee_recurring);
  if (card.annual_fee_first_year !== null) return `${formatPhpAmount(card.annual_fee_first_year)} first year`;
  return 'Not disclosed';
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
      return 'None captured';
  }
}

function formatRewardFormula(formula: CreditCardType['rewards_formula']) {
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

function formatIncome(card: CreditCardType) {
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
