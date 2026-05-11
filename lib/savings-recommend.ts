import type { RateProduct } from '@/types';
import { computeGrossEarnings } from '@/utils/yieldEngine';

export type Horizon = 'anytime' | 'short' | 'year' | 'long';
export type Liquidity = 'flexible' | 'lockable';

export interface RecommendAnswers {
  amount: number;
  horizon: Horizon;
  liquidity: Liquidity;
}

export interface RecommendResult {
  top: RateProduct | null;
  alternates: RateProduct[];
  reasonLine: string;
}

export const HORIZON_MONTHS: Record<Horizon, number> = {
  anytime: 1,
  short: 6,
  year: 12,
  long: 24,
};

const LOCK_IN_DAYS_BY_MONTHS: Record<number, number> = {
  1: 30,
  3: 91,
  6: 182,
  12: 365,
  24: 730,
  36: 1095,
};

export function monthsToLockInDays(months: number): number {
  return LOCK_IN_DAYS_BY_MONTHS[months] ?? Math.round((365 / 12) * months);
}

function horizonDays(horizon: Horizon): number {
  return monthsToLockInDays(HORIZON_MONTHS[horizon]);
}

function isExpiredPromo(product: RateProduct): boolean {
  const today = new Date().toISOString().split('T')[0]!;
  return product.conditions.some(
    (c) => c.type === 'promo' && c.expiresAt != null && c.expiresAt < today,
  );
}

function isOutsideAllTiers(amount: number, product: RateProduct): boolean {
  if (product.tierType !== 'threshold') return false;
  return !product.tiers.some(
    (t) => amount >= t.minBalance && (t.maxBalance === null || amount <= t.maxBalance),
  );
}

function conditionPenalty(product: RateProduct, amount: number): number {
  const nonNoneCount = product.conditions.filter(
    (c) => c.type !== 'none' && c.type !== 'time_limited',
  ).length;
  return nonNoneCount * amount * 0.001;
}

function promoPenalty(product: RateProduct, amount: number): number {
  const hasExpiring = product.conditions.some((c) => c.expiresAt != null);
  return hasExpiring ? amount * 0.0005 : 0;
}

function lockInPenaltyFn(product: RateProduct, amount: number, horizon: Horizon): number {
  const hDays = horizonDays(horizon);
  const excess = Math.max(0, product.lockInDays - hDays);
  return excess * amount * 0.0001;
}

function buildReasonLine(
  product: RateProduct,
  answers: RecommendAnswers,
): string {
  const hasConditions = product.conditions.some(
    (c) => c.type !== 'none' && c.type !== 'time_limited',
  );
  const isMP2 = product.id === 'pagibig-mp2';
  const isLocked = product.lockInDays > 0;
  const hasPdic = product.pdic;

  if (isMP2) {
    return 'Best return for leaving money untouched — government-backed and tax-exempt.';
  }

  if (answers.liquidity === 'flexible' && answers.horizon === 'anytime') {
    if (hasPdic && !hasConditions) {
      return 'Highest rate that lets you withdraw anytime, with PDIC protection and no spending requirements.';
    }
    if (hasPdic) {
      return 'Highest rate that lets you withdraw anytime, with PDIC protection.';
    }
    return 'Highest rate that lets you withdraw anytime.';
  }

  if (isLocked) {
    const months = HORIZON_MONTHS[answers.horizon];
    return `Best return for locking your money for ${months} month${months !== 1 ? 's' : ''}.`;
  }

  if (!hasConditions && hasPdic) {
    return 'Strong rate with no missions or spending requirements, and PDIC protection.';
  }

  if (!hasConditions) {
    return 'Strong rate with no missions or spending requirements.';
  }

  return 'Best overall match for your amount and timeline.';
}

export function recommend(
  rates: RateProduct[],
  answers: RecommendAnswers,
): RecommendResult {
  const { amount, horizon, liquidity } = answers;
  const months = HORIZON_MONTHS[horizon];

  const filtered = rates.filter((p) => {
    if (isExpiredPromo(p)) return false;
    if (liquidity === 'flexible' && p.lockInDays > 0) return false;
    if (isOutsideAllTiers(amount, p)) return false;
    return true;
  });

  if (filtered.length === 0) {
    return {
      top: null,
      alternates: [],
      reasonLine: "We don't have a perfect match right now. Browse all options below.",
    };
  }

  const scored = filtered.map((p) => ({
    product: p,
    score:
      computeGrossEarnings(amount, p, months)
      - lockInPenaltyFn(p, amount, horizon)
      - conditionPenalty(p, amount)
      - promoPenalty(p, amount),
  }));

  scored.sort((a, b) => b.score - a.score);

  const top = scored[0]!.product;
  const alternates: RateProduct[] = [];

  for (let i = 1; i < scored.length && alternates.length < 2; i++) {
    if (scored[i]!.product.provider !== top.provider) {
      alternates.push(scored[i]!.product);
    }
  }

  return {
    top,
    alternates,
    reasonLine: buildReasonLine(top, answers),
  };
}
