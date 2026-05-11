'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Lock, ShieldCheck, ShieldOff } from 'lucide-react';

import type { RateCondition, RateProduct } from '@/types';
import { buildTrackedAffiliateHref, trackAffiliateImpression } from '@/lib/affiliate-analytics';
import { trackBankingEvent } from '@/lib/banking-analytics';
import {
  type Horizon,
  type Liquidity,
  HORIZON_MONTHS,
  monthsToLockInDays,
  recommend,
} from '@/lib/savings-recommend';
import { computeGrossEarnings } from '@/utils/yieldEngine';
import { RateDisclosureNote } from '@/components/banking/RateDisclosureNote';

// ─── Constants ────────────────────────────────────────────────────────────────

const SAVED_KEY = 'truva:banking:saved-answers';
const SAVED_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const DEFAULT_AMOUNT = 50_000;

const HORIZON_OPTIONS: { value: Horizon; label: string }[] = [
  { value: 'anytime', label: 'Anytime — I might need it soon' },
  { value: 'short', label: 'In a few months' },
  { value: 'year', label: 'In about a year' },
  { value: 'long', label: 'I can leave it for a year or more' },
];

const HORIZON_LABEL: Record<Horizon, string> = {
  anytime: '1 month',
  short: '6 months',
  year: '12 months',
  long: '24 months',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const TAX_PATTERN = /withholding|after[-\s]?tax|\bFWT\b|net of tax|tax[-\s]?exempt/i;

function sanitizeConditions(conditions: RateCondition[]): string {
  const meaningful = conditions.filter(
    (c) => c.type !== 'none' && c.type !== 'time_limited',
  );
  if (meaningful.length === 0) return '';

  const first = meaningful[0]!;
  const sentences = first.description.split(/(?<=[.!?])\s+/);
  const clean = sentences.filter((s) => !TAX_PATTERN.test(s)).join(' ').trim();

  if (clean) return clean;

  switch (first.type) {
    case 'spending': return 'Requires monthly spending conditions.';
    case 'promo': return 'Promotional rate — conditions apply.';
    case 'balance_growth': return 'Requires maintaining or growing your balance.';
    case 'new_user': return 'For new account holders only.';
    default: return 'Conditions apply.';
  }
}

function formatPeso(value: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPct(rate: number): string {
  return `${(rate * 100).toFixed(2)}%`;
}

function formatLockIn(days: number): string {
  if (days === 0) return 'Anytime';
  const months = Math.round(days / 30);
  return `${months} month${months !== 1 ? 's' : ''}`;
}

function isExpiredPromo(product: RateProduct): boolean {
  const today = new Date().toISOString().split('T')[0]!;
  return product.conditions.some(
    (c) => c.type === 'promo' && c.expiresAt != null && c.expiresAt < today,
  );
}

function isThresholdOutOfRange(product: RateProduct, amount: number): boolean {
  if (product.tierType !== 'threshold') return false;
  return !product.tiers.some(
    (t) => amount >= t.minBalance && (t.maxBalance === null || amount <= t.maxBalance),
  );
}

function clampAmount(n: number): number {
  if (!Number.isFinite(n) || n < 1000) return 1000;
  return Math.min(Math.round(n), 10_000_000);
}


function formatMonthsLabel(months: number): string {
  return months === 1 ? '1 month' : `${months} months`;
}

function formatPayoutFreq(f: RateProduct['payoutFrequency']): string {
  switch (f) {
    case 'daily': return 'Every day';
    case 'monthly': return 'Every month';
    case 'quarterly': return 'Every 3 months';
    case 'annually': return 'Once a year';
    case 'at_maturity': return 'At the end of the lock';
    default: return 'Every month';
  }
}

function deriveMinOpen(product: RateProduct): number {
  return product.tiers[0]?.minBalance ?? 0;
}

function derivePros(product: RateProduct): string[] {
  const out: string[] = [];
  if (product.pdic) out.push('Protected by PDIC up to ₱1 million.');
  if (product.taxExempt) out.push('Interest is not taxed.');
  if (product.lockInDays === 0) out.push('You can take your money out anytime.');
  if (deriveMinOpen(product) === 0) out.push('No minimum balance to start.');
  if (product.payoutFrequency === 'daily') out.push('Interest is added every day.');
  else if (product.payoutFrequency === 'monthly') out.push('Interest is added every month.');
  if (product.tierType === 'flat' && product.conditions.every((c) => c.type === 'none')) {
    out.push('Flat rate — no monthly missions or spending to keep it.');
  }
  return out.slice(0, 4);
}

function deriveCons(product: RateProduct): string[] {
  const out: string[] = [];
  if (product.tierType === 'threshold' || product.tierType === 'blended') {
    const topTier = product.tiers[product.tiers.length - 1];
    const cap = topTier?.minBalance ?? null;
    if (cap && cap > 0 && product.headlineRate > product.baseRate.grossRate) {
      out.push(
        `The top rate only covers part of your balance. Above ₱${cap.toLocaleString('en-PH')}, the rate drops to ${(product.baseRate.grossRate * 100).toFixed(1)}%.`,
      );
    }
  }
  if (product.lockInDays > 0) {
    out.push(
      `Money is locked for ${formatLockIn(product.lockInDays)}. Taking it out early lowers your interest.`,
    );
  }
  const minOpen = deriveMinOpen(product);
  if (minOpen > 0) out.push(`You need at least ₱${minOpen.toLocaleString('en-PH')} to open this.`);
  product.conditions.forEach((c) => {
    if (c.type === 'none' || c.type === 'time_limited') return;
    const sentences = c.description.split(/(?<=[.!?])\s+/);
    const clean = sentences.filter((s) => !TAX_PATTERN.test(s)).join(' ').trim();
    if (clean && out.length < 4 && !out.some((o) => o === clean)) out.push(clean);
  });
  return out.slice(0, 4);
}

function isHorizon(v: string | null): v is Horizon {
  return v === 'anytime' || v === 'short' || v === 'year' || v === 'long';
}

function isLiquidity(v: string | null): v is Liquidity {
  return v === 'flexible' || v === 'lockable';
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const DISCLOSURE_ID = 'affiliate-disclosure-savings';

function DisclosureSpan() {
  return (
    <span id={DISCLOSURE_ID} className="sr-only">
      Truva earns a fee if you apply through this link. This does not change
      what you are offered.
    </span>
  );
}

function ApplyButton({
  product,
  placement,
  size = 'sm',
}: {
  product: RateProduct;
  placement: 'banking_landing_recommendation_top' | 'banking_landing_recommendation_alt' | 'banking_landing_list';
  size?: 'sm' | 'md';
}) {
  if (!product.affiliateUrl) return null;

  const href = buildTrackedAffiliateHref(product.id, placement);

  function handleClick() {
    trackBankingEvent({
      event_type: placement === 'banking_landing_list' ? 'list_apply_click' : 'recommendation_apply_click',
      placement,
    });
  }

  const baseClass = size === 'md'
    ? 'inline-flex items-center justify-center gap-1.5 rounded-full bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand-primary/20 transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2'
    : 'inline-flex items-center justify-center gap-1.5 rounded-full bg-brand-primary px-3.5 py-2 text-xs font-semibold text-white shadow-sm shadow-brand-primary/20 transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2';

  return (
    <div className="flex flex-col items-end gap-1">
      <a
        href={href}
        target="_blank"
        rel="sponsored noopener noreferrer"
        aria-describedby={DISCLOSURE_ID}
        onClick={handleClick}
        className={baseClass}
      >
        Apply
      </a>
      <span className="text-[10px] text-brand-textSecondary/60 dark:text-white/30">
        Affiliate link
      </span>
    </div>
  );
}

function ProviderLogo({ product, priority = false }: { product: RateProduct; priority?: boolean }) {
  return (
    <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-black/5">
      <Image
        src={product.logo}
        alt={product.provider}
        fill
        sizes="36px"
        unoptimized
        className="object-contain p-0.5"
        priority={priority}
      />
    </div>
  );
}

function InsuranceBadge({ product }: { product: RateProduct }) {
  if (product.pdic) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
        <ShieldCheck className="h-3 w-3" aria-hidden="true" />
        PDIC
      </span>
    );
  }
  if (product.insurer && product.insurer !== 'Not Insured') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
        <ShieldCheck className="h-3 w-3" aria-hidden="true" />
        {product.insurer}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500 dark:bg-white/10 dark:text-white/40">
      <ShieldOff className="h-3 w-3" aria-hidden="true" />
      Not insured
    </span>
  );
}

// ─── Recommendation cards ─────────────────────────────────────────────────────

function TopRecommendationCard({
  product,
  amount,
  horizon,
  months,
  reasonLine,
}: {
  product: RateProduct;
  amount: number;
  horizon: Horizon;
  months: number;
  reasonLine: string;
}) {
  const earnings = computeGrossEarnings(amount, product, months);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    trackAffiliateImpression({
      productId: product.id,
      provider: product.provider,
      category: product.category,
      placement: 'banking_landing_recommendation_top',
    });
  }, [product.id, product.provider, product.category]);

  return (
    <article className="rounded-2xl border-2 border-brand-primary/30 bg-brand-primaryLight/30 p-5 dark:border-brand-primary/40 dark:bg-brand-primary/10">
      <p className="mb-3 text-xs font-bold uppercase tracking-widest text-brand-primary">
        Top match for your answers
      </p>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <ProviderLogo product={product} priority />
          <div className="min-w-0">
            <h3 className="truncate text-base font-bold text-brand-textPrimary dark:text-white">
              {product.name}
            </h3>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <InsuranceBadge product={product} />
              {product.lockInDays > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                  <Lock className="h-3 w-3" aria-hidden="true" />
                  {formatLockIn(product.lockInDays)}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold tabular-nums text-brand-textPrimary dark:text-white">
            {formatPct(product.headlineRate)}
          </p>
          <p className="text-xs text-brand-textSecondary dark:text-white/50">advertised p.a.</p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-brand-primary/15 bg-white/60 p-3 dark:border-white/10 dark:bg-white/5">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-textSecondary dark:text-white/50">
          Estimated gross interest
        </p>
        <p className="mt-1 text-xl font-bold tabular-nums text-brand-textPrimary dark:text-white">
          {formatPeso(earnings)}
        </p>
        <p className="mt-0.5 text-xs text-brand-textSecondary dark:text-white/50">
          before tax on {formatPeso(amount)} over {HORIZON_LABEL[horizon]}
        </p>
      </div>

      {reasonLine && (
        <p className="mt-3 text-sm text-brand-textSecondary dark:text-white/60">{reasonLine}</p>
      )}

      <div className="mt-4 flex items-center justify-between gap-3">
        <ApplyButton product={product} placement="banking_landing_recommendation_top" size="md" />
        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          aria-expanded={isOpen}
          className="text-xs font-semibold text-brand-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
        >
          {isOpen ? 'Hide details ▴' : 'See details ▾'}
        </button>
      </div>

      {isOpen && <ProductFactGrid product={product} amount={amount} months={months} />}
    </article>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-textSecondary dark:text-white/40">
        {label}
      </p>
      <p className="mt-0.5 text-xs font-semibold text-brand-textPrimary dark:text-white">{value}</p>
    </div>
  );
}

function ProductFactGrid({
  product,
  amount,
  months,
}: {
  product: RateProduct;
  amount: number;
  months: number;
}) {
  const earnings = computeGrossEarnings(amount, product, months);
  const pros = derivePros(product);
  const cons = deriveCons(product);
  const minOpen = deriveMinOpen(product);
  const rateTypeLabel =
    product.tierType === 'flat'
      ? 'Flat (one rate)'
      : product.tierType === 'threshold'
        ? 'Tiered (depends on balance)'
        : 'Blended (per band)';

  return (
    <div className="mt-3 space-y-4 rounded-xl border border-brand-border bg-brand-surface/60 p-4 dark:border-white/10 dark:bg-white/[0.02]">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Fact label="Minimum to open" value={minOpen > 0 ? formatPeso(minOpen) : 'No minimum'} />
        <Fact
          label="Access to your money"
          value={product.lockInDays === 0 ? 'Take out anytime' : `Locked for ${formatLockIn(product.lockInDays)}`}
        />
        <Fact label="When interest is paid" value={formatPayoutFreq(product.payoutFrequency)} />
        <Fact label="Protected by" value={product.pdic ? 'PDIC up to ₱1 million' : product.insurer} />
        <Fact label="Rate type" value={rateTypeLabel} />
        <Fact label="Last verified" value={product.lastVerified} />
      </div>
      {pros.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-textSecondary dark:text-white/50">
            What&apos;s good about this
          </p>
          <ul className="mt-1.5 space-y-1 text-xs text-brand-textPrimary dark:text-white/80">
            {pros.map((p, i) => (
              <li key={i} className="flex gap-2">
                <span aria-hidden className="text-emerald-600 dark:text-emerald-400">●</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {cons.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-textSecondary dark:text-white/50">
            Things to watch for
          </p>
          <ul className="mt-1.5 space-y-1 text-xs text-brand-textPrimary dark:text-white/80">
            {cons.map((c, i) => (
              <li key={i} className="flex gap-2">
                <span aria-hidden className="text-amber-600 dark:text-amber-400">⚠</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="rounded-lg bg-brand-primaryLight/40 px-3 py-2 text-xs dark:bg-brand-primary/15">
        <span className="text-brand-textSecondary dark:text-white/60">
          Quick math for {formatPeso(amount)} over {formatMonthsLabel(months)}:{' '}
        </span>
        <span className="font-bold text-brand-textPrimary dark:text-white">
          about {formatPeso(earnings)} in gross interest.
        </span>
      </div>
    </div>
  );
}

function AlternateCard({
  product,
  amount,
  months,
  isOpen,
  onToggle,
}: {
  product: RateProduct;
  amount: number;
  months: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const earnings = computeGrossEarnings(amount, product, months);

  useEffect(() => {
    trackAffiliateImpression({
      productId: product.id,
      provider: product.provider,
      category: product.category,
      placement: 'banking_landing_recommendation_alt',
    });
  }, [product.id, product.provider, product.category]);

  const lockLabel = product.lockInDays === 0 ? 'Take out anytime' : `Locked for ${formatLockIn(product.lockInDays)}`;

  return (
    <article className="overflow-hidden rounded-2xl border border-brand-border bg-white dark:border-white/10 dark:bg-white/[0.04]">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center gap-2.5 p-4 text-left transition-colors hover:bg-brand-surface/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 dark:hover:bg-white/[0.06]"
      >
        <ProviderLogo product={product} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-brand-textPrimary dark:text-white">
            {product.name}
          </h3>
          <p className="mt-0.5 text-xs font-bold text-brand-primary">
            {formatPct(product.headlineRate)} per year
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-sm font-bold tabular-nums text-brand-textPrimary dark:text-white">
            {formatPeso(earnings)}
          </p>
          <p className="text-[10px] text-brand-textSecondary dark:text-white/50">gross interest</p>
        </div>
        <span
          aria-hidden
          className={`shrink-0 text-brand-textSecondary transition-transform dark:text-white/40 ${isOpen ? 'rotate-180' : ''}`}
        >
          ▾
        </span>
      </button>
      {!isOpen && (
        <div className="flex items-center justify-between gap-2 px-4 pb-4">
          <InsuranceBadge product={product} />
          <span className="text-[11px] text-brand-textSecondary dark:text-white/50">{lockLabel}</span>
        </div>
      )}
      {isOpen && (
        <div className="space-y-3 border-t border-brand-border px-4 pb-4 pt-3 dark:border-white/10">
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <InsuranceBadge product={product} />
            <span className="rounded-full bg-brand-surface px-2 py-0.5 font-semibold text-brand-textSecondary dark:bg-white/10 dark:text-white/60">
              {lockLabel}
            </span>
          </div>
          <ProductFactGrid product={product} amount={amount} months={months} />
          <div className="flex justify-end pt-1">
            <ApplyButton product={product} placement="banking_landing_recommendation_alt" size="sm" />
          </div>
        </div>
      )}
    </article>
  );
}

// ─── Partner list row / card ──────────────────────────────────────────────────

function usePartnerImpression(product: RateProduct) {
  useEffect(() => {
    trackAffiliateImpression({
      productId: product.id,
      provider: product.provider,
      category: product.category,
      placement: 'banking_landing_list',
    });
  }, [product.id, product.provider, product.category]);
}

type PartnerRowProps = {
  product: RateProduct;
  amount: number;
  months: number;
  isOpen: boolean;
  onToggle: () => void;
  muted?: boolean;
  dimmed?: boolean;
};

function PartnerRowDesktop({
  product,
  amount,
  months,
  isOpen,
  onToggle,
  muted,
  dimmed,
}: PartnerRowProps) {
  usePartnerImpression(product);
  const earnings = computeGrossEarnings(amount, product, months);
  const conditions = sanitizeConditions(product.conditions);
  const expiresAt = product.conditions.find((c) => c.expiresAt)?.expiresAt;
  const rowClass = muted || dimmed ? 'opacity-60' : '';
  const headerKey = `partner-row-${product.id}`;

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle();
    }
  }

  return (
    <>
      <tr
        id={headerKey}
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        aria-controls={`${headerKey}-detail`}
        onClick={onToggle}
        onKeyDown={onKeyDown}
        className={`cursor-pointer border-b border-brand-border transition-colors hover:bg-brand-surface/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-inset dark:border-white/10 dark:hover:bg-white/[0.04] ${isOpen ? 'bg-brand-surface/60 dark:bg-white/[0.04]' : ''} ${rowClass}`}
      >
        <td className="py-3.5 pl-4 pr-4">
          <div className="flex items-center gap-2.5">
            <ProviderLogo product={product} />
            <div>
              <p className="text-sm font-semibold text-brand-textPrimary dark:text-white">
                {product.name}
              </p>
              <InsuranceBadge product={product} />
            </div>
          </div>
        </td>
        <td className="py-3.5 pr-4 text-sm font-bold tabular-nums text-brand-textPrimary dark:text-white">
          {formatPct(product.headlineRate)}
          {muted && (
            <p className="mt-0.5 text-[10px] font-normal text-brand-textSecondary dark:text-white/40">
              Outside your balance range
            </p>
          )}
        </td>
        <td className="py-3.5 pr-4 text-sm tabular-nums text-brand-textPrimary dark:text-white">
          {muted ? '—' : formatPeso(earnings)}
        </td>
        <td className={`py-3.5 pr-4 text-sm ${dimmed ? 'font-semibold text-amber-600 dark:text-amber-400' : 'text-brand-textSecondary dark:text-white/60'}`}>
          {formatLockIn(product.lockInDays)}
        </td>
        <td className="py-3.5 pr-4 text-xs text-brand-textSecondary dark:text-white/60 max-w-[200px]">
          <div className="space-y-1">
            <div>
              {conditions || '—'}
              {expiresAt && (
                <span className="ml-1 text-amber-600 dark:text-amber-400">
                  (until {expiresAt})
                </span>
              )}
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-primary">
              {isOpen ? 'Hide details ▴' : 'See details ▾'}
            </span>
          </div>
        </td>
        <td className="py-3.5 pr-4" onClick={(e) => e.stopPropagation()}>
          <ApplyButton product={product} placement="banking_landing_list" size="sm" />
        </td>
      </tr>
      {isOpen && (
        <tr
          id={`${headerKey}-detail`}
          className="border-b border-brand-border bg-brand-surface/30 dark:border-white/10 dark:bg-white/[0.02]"
        >
          <td colSpan={6} className="px-4 pb-4 pt-1">
            <ProductFactGrid product={product} amount={amount} months={months} />
          </td>
        </tr>
      )}
    </>
  );
}

function PartnerCardMobile({
  product,
  amount,
  months,
  isOpen,
  onToggle,
  muted,
  dimmed,
}: PartnerRowProps) {
  usePartnerImpression(product);
  const earnings = computeGrossEarnings(amount, product, months);
  const conditions = sanitizeConditions(product.conditions);
  const rowClass = muted || dimmed ? 'opacity-60' : '';

  return (
    <div
      className={`rounded-2xl border bg-white dark:bg-white/[0.04] ${isOpen ? 'border-brand-primary/40' : 'border-brand-border dark:border-white/10'} ${rowClass}`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-3 p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <ProviderLogo product={product} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-brand-textPrimary dark:text-white">
              {product.name}
            </p>
            <InsuranceBadge product={product} />
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-base font-bold tabular-nums text-brand-primary">
            {formatPct(product.headlineRate)}
          </p>
          <p className="text-[10px] text-brand-textSecondary dark:text-white/50">
            advertised per year
          </p>
        </div>
      </button>
      <div className="grid grid-cols-2 gap-2 px-4 pb-3 text-xs">
        <div>
          <p className="text-brand-textSecondary/60 dark:text-white/40">Gross interest</p>
          <p className="mt-0.5 font-semibold text-brand-textPrimary dark:text-white">
            {muted ? '—' : formatPeso(earnings)}
          </p>
        </div>
        <div>
          <p className="text-brand-textSecondary/60 dark:text-white/40">Lock-in</p>
          <p
            className={`mt-0.5 font-semibold ${dimmed ? 'text-amber-600 dark:text-amber-400' : 'text-brand-textPrimary dark:text-white'}`}
          >
            {formatLockIn(product.lockInDays)}
          </p>
        </div>
        {conditions && (
          <div className="col-span-2">
            <p className="text-brand-textSecondary/60 dark:text-white/40">Conditions</p>
            <p className="mt-0.5 text-brand-textSecondary dark:text-white/60">{conditions}</p>
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="block w-full border-t border-brand-border px-4 py-2 text-left text-xs font-semibold text-brand-primary hover:bg-brand-surface/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-inset dark:border-white/10 dark:hover:bg-white/[0.04]"
      >
        {isOpen ? 'Hide details ▴' : 'See details ▾'}
      </button>
      {isOpen && (
        <div className="px-4 pb-4">
          <ProductFactGrid product={product} amount={amount} months={months} />
        </div>
      )}
      <div className="flex justify-end border-t border-brand-border px-4 py-3 dark:border-white/10">
        <ApplyButton product={product} placement="banking_landing_list" size="sm" />
      </div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export function SavingsLandingClient({
  rates,
  lastVerified,
}: {
  rates: RateProduct[];
  lastVerified: string;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // ── URL state ──────────────────────────────────────────────────────────────
  const rawAmount = searchParams.get('amount');
  const rawHorizon = searchParams.get('horizon');
  const rawLiquidity = searchParams.get('liquidity');

  const amount = clampAmount(rawAmount ? Number(rawAmount) : DEFAULT_AMOUNT);
  const horizon: Horizon = isHorizon(rawHorizon) ? rawHorizon : 'year';
  const liquidity: Liquidity = isLiquidity(rawLiquidity) ? rawLiquidity : 'flexible';
  const months = HORIZON_MONTHS[horizon];

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.replace(`?${params.toString()}`, { scroll: false });
  }

  function setAmount(n: number) {
    setParam('amount', String(clampAmount(n)));
  }

  function setHorizon(h: Horizon) {
    trackFormStarted();
    const params = new URLSearchParams(searchParams.toString());
    params.set('horizon', h);
    if (h === 'anytime') params.set('liquidity', 'flexible');
    router.replace(`?${params.toString()}`, { scroll: false });
  }

  function setLiquidity(l: Liquidity) {
    trackFormStarted();
    setParam('liquidity', l);
  }

  // ── Data ───────────────────────────────────────────────────────────────────
  const activeRates = rates.filter((p) => !isExpiredPromo(p));

  const { top, alternates, reasonLine } = recommend(activeRates, {
    amount,
    horizon,
    liquidity,
  });

  // ── PMF tracking ──────────────────────────────────────────────────────────
  const landingViewFiredRef = useRef(false);
  const formStartedFiredRef = useRef(false);
  const formCompletedFiredRef = useRef(false);
  const recommendationViewFiredRef = useRef(false);
  const listScrolledFiredRef = useRef(false);
  const recommendationSectionRef = useRef<HTMLElement>(null);
  const allProductsSectionRef = useRef<HTMLElement>(null);

  function trackFormStarted() {
    if (formStartedFiredRef.current) return;
    formStartedFiredRef.current = true;
    trackBankingEvent({ event_type: 'form_started', horizon, liquidity, amount });
  }

  // ── localStorage ───────────────────────────────────────────────────────────
  const [showSavedBanner, setShowSavedBanner] = useState(false);
  const [isPillSaved, setIsPillSaved] = useState(false);
  const [amountInput, setAmountInput] = useState(String(amount));

  // ── Inline table calculator state (seeded from form; free to diverge) ─────
  const [tableAmt, setTableAmt] = useState(amount);
  const [tableMonths, setTableMonths] = useState(months);
  const [tableAmtInput, setTableAmtInput] = useState(amount.toLocaleString('en-PH'));
  const [openProductId, setOpenProductId] = useState<string | null>(null);
  const [showLongerLockProducts, setShowLongerLockProducts] = useState(false);

  // ── Alternates accordion ───────────────────────────────────────────────────
  const [openAltId, setOpenAltId] = useState<string | null>(null);

  // ── Product list filter ────────────────────────────────────────────────────
  type ProductFilter = 'all' | 'flexible' | 'time-deposit';
  const [productFilter, setProductFilter] = useState<ProductFilter>(
    liquidity === 'lockable' ? 'time-deposit' : 'all',
  );
  // Re-sync filter when Q3 changes (user edits the form)
  useEffect(() => {
    setProductFilter(liquidity === 'lockable' ? 'time-deposit' : 'all');
  }, [liquidity]);

  // Re-seed when the form changes (until the user touches the table calc — keep simple: always follow)
  useEffect(() => {
    setTableAmt(amount);
    setTableAmtInput(amount.toLocaleString('en-PH'));
  }, [amount]);
  useEffect(() => {
    setTableMonths(months);
  }, [months]);
  useEffect(() => {
    setShowLongerLockProducts(false);
  }, [productFilter, tableMonths]);

  // Derived for the partner table — using calculator state
  const tableHorizonDays = monthsToLockInDays(tableMonths);
  const sortedAll = [...activeRates].sort((a, b) => {
    const diff =
      computeGrossEarnings(tableAmt, b, tableMonths) - computeGrossEarnings(tableAmt, a, tableMonths);
    if (diff !== 0) return diff;
    const rateDiff = b.headlineRate - a.headlineRate;
    if (rateDiff !== 0) return rateDiff;
    return b.lastVerified.localeCompare(a.lastVerified);
  });
  const flexProducts = sortedAll.filter((p) => p.lockInDays === 0);
  const lockedProducts = sortedAll.filter((p) => p.lockInDays > 0);
  const baseFilteredList =
    productFilter === 'flexible'
      ? flexProducts
      : productFilter === 'time-deposit'
        ? lockedProducts
        : sortedAll;
  const longerLockProducts = baseFilteredList.filter((p) => (
    p.lockInDays > 0 && p.lockInDays > tableHorizonDays
  ));
  const hiddenLongerLockCount = longerLockProducts.length;
  const filteredList = showLongerLockProducts
    ? baseFilteredList
    : baseFilteredList.filter((p) => (
      p.lockInDays === 0 || p.lockInDays <= tableHorizonDays
    ));
  const visibleProductIds = filteredList.map((p) => p.id).join('|');

  useEffect(() => {
    if (!openProductId) return;
    if (!visibleProductIds.split('|').includes(openProductId)) {
      setOpenProductId(null);
    }
  }, [openProductId, visibleProductIds]);

  // On mount: sync amountInput with URL and check localStorage
  useEffect(() => {
    setAmountInput(String(amount));

    try {
      const raw = localStorage.getItem(SAVED_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as {
          amount?: number;
          horizon?: Horizon;
          liquidity?: Liquidity;
          savedAt?: number;
        };
        const isExpired = !parsed.savedAt || Date.now() - parsed.savedAt > SAVED_TTL_MS;
        if (isExpired) {
          localStorage.removeItem(SAVED_KEY);
        } else {
          setIsPillSaved(true);
          // Only pre-fill if URL has no params set (fresh visit)
          if (!rawAmount && !rawHorizon && !rawLiquidity) {
            const params = new URLSearchParams();
            if (parsed.amount) params.set('amount', String(parsed.amount));
            if (parsed.horizon && isHorizon(parsed.horizon)) params.set('horizon', parsed.horizon);
            if (parsed.liquidity && isLiquidity(parsed.liquidity)) params.set('liquidity', parsed.liquidity);
            if (params.toString()) {
              router.replace(`?${params.toString()}`, { scroll: false });
              setShowSavedBanner(true);
            }
          }
        }
      }
    } catch {
      // ignore storage errors
    }
    // intentionally run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // landing_view — once per page-view
  useEffect(() => {
    if (landingViewFiredRef.current) return;
    landingViewFiredRef.current = true;
    trackBankingEvent({ event_type: 'landing_view' });
  }, []);

  // form_completed — once all 3 URL params are explicitly set
  useEffect(() => {
    if (formCompletedFiredRef.current) return;
    if (rawAmount !== null && rawHorizon !== null && rawLiquidity !== null) {
      formCompletedFiredRef.current = true;
      trackBankingEvent({ event_type: 'form_completed', horizon, liquidity, amount });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawAmount, rawHorizon, rawLiquidity]);

  // recommendation_view — IntersectionObserver on the recommendation section
  useEffect(() => {
    const el = recommendationSectionRef.current;
    if (!el || recommendationViewFiredRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !recommendationViewFiredRef.current) {
          recommendationViewFiredRef.current = true;
          trackBankingEvent({ event_type: 'recommendation_view', horizon, liquidity, amount });
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [top]);

  // list_scrolled — IntersectionObserver on the all-products section
  useEffect(() => {
    const el = allProductsSectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !listScrolledFiredRef.current) {
          listScrolledFiredRef.current = true;
          trackBankingEvent({ event_type: 'list_scrolled', horizon, liquidity, amount });
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function savePill() {
    if (isPillSaved) {
      localStorage.removeItem(SAVED_KEY);
      setIsPillSaved(false);
    } else {
      try {
        localStorage.setItem(
          SAVED_KEY,
          JSON.stringify({ amount, horizon, liquidity, savedAt: Date.now() }),
        );
        setIsPillSaved(true);
      } catch {
        // ignore storage quota errors
      }
    }
  }

  function clearSaved() {
    localStorage.removeItem(SAVED_KEY);
    setIsPillSaved(false);
    setShowSavedBanner(false);
    const params = new URLSearchParams();
    params.set('amount', String(DEFAULT_AMOUNT));
    params.set('horizon', 'year');
    params.set('liquidity', 'flexible');
    router.replace(`?${params.toString()}`, { scroll: false });
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-4xl px-4 py-5 space-y-7 sm:px-6 sm:py-8 sm:space-y-10">
      <DisclosureSpan />

      {/* Section 1: Routing form */}
      <section aria-labelledby="form-heading">
        <div className="rounded-2xl border border-brand-border bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.03] space-y-4 sm:p-6 sm:space-y-6">
          <div>
            <h1
              id="form-heading"
              className="text-2xl font-bold tracking-tight text-brand-textPrimary dark:text-white sm:text-3xl"
            >
              Find your savings match in 30 seconds.
            </h1>
            <p className="mt-2 text-sm text-brand-textSecondary dark:text-white/60">
              Three questions. We match your amount and timeline to the listed options.
            </p>
          </div>

          {/* Q1: Amount */}
          <div className="space-y-1.5">
            <label
              htmlFor="savings-amount"
              className="block text-sm font-semibold text-brand-textPrimary dark:text-white"
            >
              How much will you save?
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3.5 flex items-center text-sm font-semibold text-brand-textSecondary dark:text-white/50">
                ₱
              </span>
              <input
                id="savings-amount"
                type="number"
                inputMode="numeric"
                min={1000}
                step={1000}
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                onBlur={() => {
                  trackFormStarted();
                  const n = Number(amountInput);
                  const clamped = clampAmount(Number.isFinite(n) ? n : DEFAULT_AMOUNT);
                  setAmountInput(String(clamped));
                  setAmount(clamped);
                }}
                className="w-full rounded-xl border border-brand-border bg-white py-3 pl-8 pr-4 text-sm font-semibold text-brand-textPrimary shadow-sm focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
            </div>
            <p className="text-xs text-brand-textSecondary dark:text-white/40">
              {amount < 1000
                ? 'Minimum is ₱1,000.'
                : 'You can change this anytime.'}
            </p>
          </div>

          {/* Q2: Horizon */}
          <div className="space-y-1.5">
            <p className="text-sm font-semibold text-brand-textPrimary dark:text-white">
              When might you need this money?
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {HORIZON_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setHorizon(opt.value)}
                  className={`rounded-xl border px-3 py-2.5 text-xs font-semibold text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 ${
                    horizon === opt.value
                      ? 'border-brand-primary bg-brand-primaryLight text-brand-primary dark:bg-brand-primary/20 dark:text-white'
                      : 'border-brand-border bg-white text-brand-textSecondary hover:border-brand-primary/40 dark:border-white/10 dark:bg-white/5 dark:text-white/60'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Q3: Liquidity */}
          <div className="space-y-1.5">
            <p className="text-sm font-semibold text-brand-textPrimary dark:text-white">
              Is it OK to lock the money for a higher rate?
            </p>
            <div className="flex gap-2">
              {(['flexible', 'lockable'] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  disabled={horizon === 'anytime' && opt === 'lockable'}
                  onClick={() => setLiquidity(opt)}
                  className={`flex-1 rounded-xl border px-3 py-2.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 ${
                    liquidity === opt
                      ? 'border-brand-primary bg-brand-primaryLight text-brand-primary dark:bg-brand-primary/20 dark:text-white'
                      : 'border-brand-border bg-white text-brand-textSecondary hover:border-brand-primary/40 dark:border-white/10 dark:bg-white/5 dark:text-white/60'
                  }`}
                >
                  {opt === 'flexible' ? 'No, keep it flexible' : 'Yes, I can lock it'}
                </button>
              ))}
            </div>
            {horizon === 'anytime' && (
              <p className="text-xs text-brand-textSecondary dark:text-white/40">
                Set to flexible because you might need the money soon.
              </p>
            )}
          </div>

          {/* Disclosure + save pill */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-brand-border pt-4 dark:border-white/10">
            <p className="text-xs text-brand-textSecondary dark:text-white/40">
              We earn a fee if you apply through some links. This does not change what you are offered.
            </p>
            <button
              type="button"
              onClick={savePill}
              className="shrink-0 rounded-full border border-brand-border bg-white px-3 py-1 text-xs font-semibold text-brand-textSecondary transition-colors hover:border-brand-primary/40 hover:text-brand-primary dark:border-white/10 dark:bg-white/5 dark:text-white/50"
            >
              {isPillSaved ? 'Saved — clear' : 'Save my answers'}
            </button>
          </div>

          {showSavedBanner && (
            <p className="text-xs text-brand-textSecondary dark:text-white/50">
              Loaded your saved answers.{' '}
              <button
                type="button"
                onClick={clearSaved}
                className="font-semibold text-brand-primary underline-offset-2 hover:underline"
              >
                Start fresh
              </button>
            </p>
          )}
        </div>

        {/* Skip link */}
        <p className="mt-3 text-center text-xs text-brand-textSecondary dark:text-white/40">
          <a
            href="#all-products"
            onClick={() => trackBankingEvent({ event_type: 'skip_to_list_click' })}
            className="font-semibold text-brand-primary underline-offset-2 hover:underline"
          >
            Skip questions, just show me everything
          </a>
        </p>
      </section>

      {/* Section 2: Recommendation */}
      {top && (
        <section ref={recommendationSectionRef} aria-labelledby="recommendation-heading">
          <h2
            id="recommendation-heading"
            className="mb-4 text-lg font-bold text-brand-textPrimary dark:text-white"
          >
            Top match for your answers
          </h2>
          <TopRecommendationCard
            product={top}
            amount={amount}
            horizon={horizon}
            months={months}
            reasonLine={reasonLine}
          />

          {alternates.length > 0 && (
            <>
              <p className="mt-5 mb-1 text-sm font-semibold text-brand-textPrimary dark:text-white">
                Also worth a look
              </p>
              <p className="mb-3 text-xs text-brand-textSecondary dark:text-white/50">
                Tap any card to see the details.
              </p>
              <div className="space-y-3">
                {alternates.map((alt) => (
                  <AlternateCard
                    key={alt.id}
                    product={alt}
                    amount={amount}
                    months={months}
                    isOpen={openAltId === alt.id}
                    onToggle={() => setOpenAltId(openAltId === alt.id ? null : alt.id)}
                  />
                ))}
              </div>
            </>
          )}

          <p className="mt-4 text-right">
            <a
              href="#all-products"
              className="text-xs font-semibold text-brand-primary underline-offset-2 hover:underline"
            >
              See all options →
            </a>
          </p>
        </section>
      )}

      {/* Section 3: All partner products */}
      <section ref={allProductsSectionRef} id="all-products" aria-labelledby="all-products-heading" className="scroll-mt-24">
        <div className="mb-3">
          <h2
            id="all-products-heading"
            className="text-lg font-bold text-brand-textPrimary dark:text-white"
          >
            All listed products
          </h2>
          <p className="mt-1 text-xs text-brand-textSecondary dark:text-white/50">
            Sorted by gross interest on {formatPeso(tableAmt)} over {formatMonthsLabel(tableMonths)}. Change the amount below or pick a timeframe — numbers update live.
          </p>
        </div>

        {/* Filter tabs: All / Flexible / Time Deposits */}
        <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Filter products">
          {([
            { key: 'all', label: 'All', count: sortedAll.length },
            { key: 'flexible', label: 'Flexible', count: flexProducts.length },
            { key: 'time-deposit', label: 'Time Deposits', count: lockedProducts.length },
          ] as const).map(({ key, label, count }) => (
            <button
              key={key}
              type="button"
              onClick={() => setProductFilter(key)}
              className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 ${
                productFilter === key
                  ? 'border-brand-primary bg-brand-primary text-white'
                  : 'border-brand-border bg-white text-brand-textSecondary hover:border-brand-primary/40 hover:text-brand-primary dark:border-white/10 dark:bg-white/5 dark:text-white/60'
              }`}
            >
              {label}{' '}
              <span className={`text-xs ${productFilter === key ? 'opacity-80' : 'opacity-50'}`}>
                ({count})
              </span>
            </button>
          ))}
        </div>

        {/* Inline table calculator */}
        <div className="mb-4 rounded-2xl border border-brand-border bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[160px] flex-1">
              <label
                htmlFor="table-amount"
                className="mb-1 block text-xs font-semibold uppercase tracking-wide text-brand-textSecondary dark:text-white/50"
              >
                If I save
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3.5 flex items-center text-sm font-semibold text-brand-textSecondary dark:text-white/50">
                  ₱
                </span>
                <input
                  id="table-amount"
                  type="text"
                  inputMode="numeric"
                  value={tableAmtInput}
                  onChange={(e) => {
                    const raw = e.target.value;
                    setTableAmtInput(raw);
                    const n = parseInt(raw.replace(/[^\d]/g, ''), 10);
                    if (Number.isFinite(n) && n >= 1000) {
                      setTableAmt(Math.min(n, 10_000_000));
                    }
                  }}
                  onBlur={(e) => {
                    const raw = e.currentTarget.value;
                    const n = parseInt(raw.replace(/[^\d]/g, ''), 10);
                    const clamped = clampAmount(Number.isFinite(n) ? n : tableAmt);
                    setTableAmt(clamped);
                    setTableAmtInput(clamped.toLocaleString('en-PH'));
                  }}
                  className="w-full rounded-xl border border-brand-border bg-white py-2.5 pl-8 pr-3 text-sm font-semibold tabular-nums text-brand-textPrimary shadow-sm focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 pb-0.5">
              {[3, 6, 12, 24, 36].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setTableMonths(m)}
                  className={`rounded-full border px-3 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 ${
                    tableMonths === m
                      ? 'border-brand-primary bg-brand-primary text-white'
                      : 'border-brand-border bg-white text-brand-textSecondary hover:border-brand-primary/40 hover:text-brand-primary dark:border-white/10 dark:bg-white/5 dark:text-white/60'
                  }`}
                >
                  {formatMonthsLabel(m)}
                </button>
              ))}
            </div>
          </div>
          <p className="mt-2 text-[11px] text-brand-textSecondary dark:text-white/40">
            Try different amounts and timeframes to see how each option pays. Tap any row to learn more.
          </p>
        </div>

        {activeRates.length === 0 ? (
          <p className="rounded-2xl border border-brand-border bg-white p-6 text-sm text-brand-textSecondary dark:border-white/10 dark:bg-white/[0.03] dark:text-white/60">
            Rates are being refreshed. Try again in a few minutes.{' '}
            <a href="/banking/rates" className="font-semibold text-brand-primary hover:underline">
              View full rate desk
            </a>
          </p>
        ) : (
          <div className="space-y-3">
            {hiddenLongerLockCount > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800 dark:border-amber-500/25 dark:bg-amber-950/20 dark:text-amber-300">
                <span className="font-medium">
                  {hiddenLongerLockCount} longer lock-in option{hiddenLongerLockCount !== 1 ? 's' : ''} hidden for {formatMonthsLabel(tableMonths)}.
                </span>
                <button
                  type="button"
                  onClick={() => setShowLongerLockProducts((value) => !value)}
                  className="rounded-full border border-amber-300 bg-white px-3 py-1 text-xs font-semibold text-amber-800 transition-colors hover:border-amber-500 dark:border-amber-500/40 dark:bg-white/10 dark:text-amber-200"
                >
                  {showLongerLockProducts ? 'Hide longer lock-ins' : 'Show longer lock-ins'}
                </button>
              </div>
            )}

            {filteredList.length === 0 ? (
              <p className="rounded-2xl border border-brand-border bg-white p-6 text-sm text-brand-textSecondary dark:border-white/10 dark:bg-white/[0.03] dark:text-white/60">
                No listed products match this filter for {formatMonthsLabel(tableMonths)}.
                {hiddenLongerLockCount > 0 ? ' Longer lock-in options are available above.' : ' Try a different amount or timeframe.'}
              </p>
            ) : (
              <>
                {/* Desktop: table header */}
                <div className="hidden overflow-hidden rounded-2xl border border-brand-border bg-white dark:border-white/10 dark:bg-white/[0.03] md:block">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-brand-border dark:border-white/10">
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-brand-textSecondary dark:text-white/40">
                          Provider
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-brand-textSecondary dark:text-white/40">
                          Advertised rate
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-brand-textSecondary dark:text-white/40">
                          Gross interest for {formatPeso(tableAmt)} / {formatMonthsLabel(tableMonths)}
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-brand-textSecondary dark:text-white/40">
                          Lock-in
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-brand-textSecondary dark:text-white/40">
                          Conditions
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-brand-textSecondary dark:text-white/40">
                          Apply
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredList.map((p) => (
                        <PartnerRowDesktop
                          key={p.id}
                          product={p}
                          amount={tableAmt}
                          months={tableMonths}
                          isOpen={openProductId === p.id}
                          onToggle={() => setOpenProductId(openProductId === p.id ? null : p.id)}
                          muted={isThresholdOutOfRange(p, tableAmt)}
                          dimmed={p.lockInDays > 0 && p.lockInDays > tableHorizonDays}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile: stacked cards */}
                <div className="space-y-3 md:hidden">
                  {filteredList.map((p) => (
                    <PartnerCardMobile
                      key={p.id}
                      product={p}
                      amount={tableAmt}
                      months={tableMonths}
                      isOpen={openProductId === p.id}
                      onToggle={() => setOpenProductId(openProductId === p.id ? null : p.id)}
                      muted={isThresholdOutOfRange(p, tableAmt)}
                      dimmed={p.lockInDays > 0 && p.lockInDays > tableHorizonDays}
                    />
                  ))}
                </div>
              </>
            )}

            <div className="space-y-3 pt-1">
              {lastVerified && (
                <p className="text-right text-xs text-brand-textSecondary/60 dark:text-white/30">
                  Last verified: {lastVerified}
                </p>
              )}
              <RateDisclosureNote />
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
