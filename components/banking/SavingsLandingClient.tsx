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
  recommend,
} from '@/lib/savings-recommend';
import { computeGrossEarnings } from '@/utils/yieldEngine';

// ─── Constants ────────────────────────────────────────────────────────────────

const SAVED_KEY = 'truva:banking:saved-answers';
const SAVED_TTL_MS = 30 * 24 * 60 * 60 * 1000;

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
  return Math.round(n);
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
        Best for you
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
          <p className="text-xs text-brand-textSecondary dark:text-white/50">per year</p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-brand-primary/15 bg-white/60 p-3 dark:border-white/10 dark:bg-white/5">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-textSecondary dark:text-white/50">
          Estimated earnings
        </p>
        <p className="mt-1 text-xl font-bold tabular-nums text-brand-textPrimary dark:text-white">
          {formatPeso(earnings)}
        </p>
        <p className="mt-0.5 text-xs text-brand-textSecondary dark:text-white/50">
          on {formatPeso(amount)} over {HORIZON_LABEL[horizon]}
        </p>
      </div>

      {reasonLine && (
        <p className="mt-3 text-sm text-brand-textSecondary dark:text-white/60">{reasonLine}</p>
      )}

      <div className="mt-4 flex items-center justify-between gap-3">
        <ApplyButton product={product} placement="banking_landing_recommendation_top" size="md" />
      </div>
    </article>
  );
}

function AlternateCard({
  product,
  amount,
  months,
}: {
  product: RateProduct;
  amount: number;
  months: number;
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

  return (
    <article className="rounded-2xl border border-brand-border bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
      <div className="flex min-w-0 items-center gap-2.5">
        <ProviderLogo product={product} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-brand-textPrimary dark:text-white">
            {product.name}
          </h3>
          <p className="mt-0.5 text-xs font-bold text-brand-primary">
            {formatPct(product.headlineRate)} p.a.
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-sm font-bold tabular-nums text-brand-textPrimary dark:text-white">
            {formatPeso(earnings)}
          </p>
          <p className="text-[10px] text-brand-textSecondary dark:text-white/50">earnings</p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <InsuranceBadge product={product} />
        <ApplyButton product={product} placement="banking_landing_recommendation_alt" size="sm" />
      </div>
    </article>
  );
}

// ─── Partner list row / card ──────────────────────────────────────────────────

function PartnerRow({
  product,
  amount,
  months,
  muted,
  dimmed,
}: {
  product: RateProduct;
  amount: number;
  months: number;
  muted?: boolean;
  dimmed?: boolean;
}) {
  const earnings = computeGrossEarnings(amount, product, months);
  const conditions = sanitizeConditions(product.conditions);
  const expiresAt = product.conditions.find((c) => c.expiresAt)?.expiresAt;
  const rowClass = muted || dimmed ? 'opacity-50' : '';

  useEffect(() => {
    trackAffiliateImpression({
      productId: product.id,
      provider: product.provider,
      category: product.category,
      placement: 'banking_landing_list',
    });
  }, [product.id, product.provider, product.category]);

  return (
    <>
      {/* Desktop table row */}
      <tr className={`hidden md:table-row border-b border-brand-border dark:border-white/10 ${rowClass}`}>
        <td className="py-3.5 pr-4">
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
          {conditions || '—'}
          {expiresAt && (
            <span className="ml-1 text-amber-600 dark:text-amber-400">
              (until {expiresAt})
            </span>
          )}
        </td>
        <td className="py-3.5">
          <ApplyButton product={product} placement="banking_landing_list" size="sm" />
        </td>
      </tr>

      {/* Mobile card */}
      <div className={`md:hidden rounded-2xl border border-brand-border bg-white p-4 dark:border-white/10 dark:bg-white/[0.04] ${rowClass}`}>
        <div className="flex items-center justify-between gap-3">
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
            <p className="text-[10px] text-brand-textSecondary dark:text-white/50">per year</p>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div>
            <p className="text-brand-textSecondary/60 dark:text-white/40">Earnings</p>
            <p className="mt-0.5 font-semibold text-brand-textPrimary dark:text-white">
              {muted ? '—' : formatPeso(earnings)}
            </p>
          </div>
          <div>
            <p className="text-brand-textSecondary/60 dark:text-white/40">Lock-in</p>
            <p className={`mt-0.5 font-semibold ${dimmed ? 'text-amber-600 dark:text-amber-400' : 'text-brand-textPrimary dark:text-white'}`}>
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
        <div className="mt-3 flex justify-end">
          <ApplyButton product={product} placement="banking_landing_list" size="sm" />
        </div>
      </div>
    </>
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

  const amount = clampAmount(rawAmount ? Number(rawAmount) : 100_000);
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

  // Full list: sort by gross earnings desc, ties broken by headlineRate desc then lastVerified desc
  const horizonDays = months * 30;
  const sortedAll = [...activeRates].sort((a, b) => {
    const diff = computeGrossEarnings(amount, b, months) - computeGrossEarnings(amount, a, months);
    if (diff !== 0) return diff;
    const rateDiff = b.headlineRate - a.headlineRate;
    if (rateDiff !== 0) return rateDiff;
    return b.lastVerified.localeCompare(a.lastVerified);
  });

  const flexProducts = sortedAll.filter((p) => p.lockInDays === 0);
  const lockedProducts = sortedAll.filter((p) => p.lockInDays > 0);

  // When flexible: show only liquid products; toggle reveals locked ones.
  // When lockable: show everything, dimming products that lock longer than the horizon.
  const primaryList = liquidity === 'flexible' ? flexProducts : sortedAll;

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
  const [showLockedRows, setShowLockedRows] = useState(false);
  const [amountInput, setAmountInput] = useState(String(amount));

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
    params.set('amount', '100000');
    params.set('horizon', 'year');
    params.set('liquidity', 'flexible');
    router.replace(`?${params.toString()}`, { scroll: false });
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-10 sm:px-6">
      <DisclosureSpan />

      {/* Section 1: Routing form */}
      <section aria-labelledby="form-heading">
        <div className="rounded-2xl border border-brand-border bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03] space-y-6">
          <div>
            <h1
              id="form-heading"
              className="text-2xl font-bold tracking-tight text-brand-textPrimary dark:text-white sm:text-3xl"
            >
              Find your best savings home in 30 seconds.
            </h1>
            <p className="mt-2 text-sm text-brand-textSecondary dark:text-white/60">
              Three questions. We match you to the highest-paying option that fits.
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
                  const clamped = clampAmount(Number.isFinite(n) ? n : 100_000);
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
            Best for you
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
              <p className="mt-5 mb-3 text-sm font-semibold text-brand-textSecondary dark:text-white/50">
                Also worth considering
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {alternates.map((alt) => (
                  <AlternateCard key={alt.id} product={alt} amount={amount} months={months} />
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
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2
            id="all-products-heading"
            className="text-lg font-bold text-brand-textPrimary dark:text-white"
          >
            All listed partner products
          </h2>
          <p className="text-xs text-brand-textSecondary dark:text-white/40">
            Sorted by earnings on {formatPeso(amount)} over {HORIZON_LABEL[horizon]}
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
            {/* Desktop: table header */}
            <div className="hidden md:block rounded-2xl border border-brand-border bg-white dark:border-white/10 dark:bg-white/[0.03] overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-brand-border dark:border-white/10">
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-brand-textSecondary dark:text-white/40">
                      Provider
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-brand-textSecondary dark:text-white/40">
                      Rate (p.a.)
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-brand-textSecondary dark:text-white/40">
                      Earnings for {formatPeso(amount)} / {HORIZON_LABEL[horizon]}
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
                <tbody className="px-4">
                  {primaryList.map((p) => (
                    <PartnerRow
                      key={p.id}
                      product={p}
                      amount={amount}
                      months={months}
                      muted={isThresholdOutOfRange(p, amount)}
                      dimmed={liquidity === 'lockable' && p.lockInDays > horizonDays}
                    />
                  ))}
                  {liquidity === 'flexible' && showLockedRows &&
                    lockedProducts.map((p) => (
                      <PartnerRow
                        key={p.id}
                        product={p}
                        amount={amount}
                        months={months}
                        muted={isThresholdOutOfRange(p, amount)}
                        dimmed={p.lockInDays > horizonDays}
                      />
                    ))}
                </tbody>
              </table>
            </div>

            {/* Mobile: stacked cards */}
            <div className="md:hidden space-y-3">
              {primaryList.map((p) => (
                <PartnerRow
                  key={p.id}
                  product={p}
                  amount={amount}
                  months={months}
                  muted={isThresholdOutOfRange(p, amount)}
                  dimmed={liquidity === 'lockable' && p.lockInDays > horizonDays}
                />
              ))}
              {liquidity === 'flexible' && showLockedRows &&
                lockedProducts.map((p) => (
                  <PartnerRow
                    key={p.id}
                    product={p}
                    amount={amount}
                    months={months}
                    muted={isThresholdOutOfRange(p, amount)}
                    dimmed={p.lockInDays > horizonDays}
                  />
                ))}
            </div>

            {/* Show locked options toggle */}
            {liquidity === 'flexible' && lockedProducts.length > 0 && (
              <button
                type="button"
                onClick={() => setShowLockedRows((v) => !v)}
                className="w-full rounded-2xl border border-dashed border-brand-border py-3 text-sm font-semibold text-brand-textSecondary transition-colors hover:border-brand-primary/40 hover:text-brand-primary dark:border-white/10 dark:text-white/50"
              >
                {showLockedRows
                  ? `Hide ${lockedProducts.length} locked-rate option${lockedProducts.length !== 1 ? 's' : ''}`
                  : `Show ${lockedProducts.length} locked-rate option${lockedProducts.length !== 1 ? 's' : ''}`}
              </button>
            )}

            {/* Last verified */}
            {lastVerified && (
              <p className="pt-1 text-right text-xs text-brand-textSecondary/60 dark:text-white/30">
                Last verified: {lastVerified}
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
