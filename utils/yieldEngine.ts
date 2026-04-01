import { RateProduct, RateTier } from '@/types';

/**
 * Compute the projected return using blended tiered rates.
 * Walks through each tier in order, allocating balance to each tier's range.
 */
export function computeBlendedReturn(
  amount: number,
  tiers: RateTier[],
  months: number
): number {
  if (amount <= 0 || tiers.length === 0) return 0;

  let remaining = amount;
  let totalReturn = 0;

  for (const tier of tiers) {
    if (remaining <= 0) break;

    const tierCapacity = tier.maxBalance !== null
      ? tier.maxBalance - tier.minBalance
      : Infinity;
    const tierAmount = Math.min(remaining, tierCapacity);

    // Simple interest for the period
    const yearlyReturn = tierAmount * tier.afterTaxRate;
    totalReturn += (yearlyReturn / 12) * months;

    remaining -= tierAmount;
  }

  return totalReturn;
}

/**
 * Compute the blended effective annual rate across tiers for a given amount.
 * This is the "real" rate the user earns — accounting for tier boundaries.
 */
export function computeEffectiveRate(
  amount: number,
  tiers: RateTier[]
): number {
  if (amount <= 0 || tiers.length === 0) return 0;

  // Use 12-month return to derive annual effective rate
  const yearlyReturn = computeBlendedReturn(amount, tiers, 12);
  return yearlyReturn / amount;
}

/**
 * Compute return using only the base rate (conditions NOT met).
 * Falls back to lowest tier rate if no base rate is defined.
 */
export function computeBaseReturn(
  amount: number,
  product: RateProduct,
  months: number
): number {
  if (amount <= 0) return 0;
  const yearlyReturn = amount * product.baseRate.afterTaxRate;
  return (yearlyReturn / 12) * months;
}

/**
 * Compare headline rate vs the effective blended rate for a given amount.
 * Returns the gap — positive means headline overstates the real yield.
 */
export function compareHeadlineVsEffective(
  amount: number,
  product: RateProduct
): {
  headlineAfterTax: number;
  effectiveRate: number;
  gapPercentagePoints: number;
  isOverstated: boolean;
} {
  const headlineAfterTax = product.taxExempt
    ? product.headlineRate
    : product.headlineRate * 0.8;
  const effectiveRate = computeEffectiveRate(amount, product.tiers);
  const gapPercentagePoints = (headlineAfterTax - effectiveRate) * 100;

  return {
    headlineAfterTax,
    effectiveRate,
    gapPercentagePoints,
    isOverstated: gapPercentagePoints > 0.5, // flag if gap > 0.5pp
  };
}

/**
 * Option C dual-scenario computation:
 * Returns both "conditions met" (full tiers) and "conditions not met" (base rate) projections.
 */
export function computeDualScenario(
  amount: number,
  product: RateProduct,
  months: number
): {
  withConditions: { return: number; effectiveRate: number };
  withoutConditions: { return: number; effectiveRate: number };
  hasConditions: boolean;
  conditionBoost: number; // how much more you earn by meeting conditions
} {
  const hasConditions = product.conditions.length > 0 &&
    product.conditions.some(c => c.type !== 'none');

  const withConditionsReturn = computeBlendedReturn(amount, product.tiers, months);
  const withConditionsRate = computeEffectiveRate(amount, product.tiers);

  const withoutConditionsReturn = computeBaseReturn(amount, product, months);
  const withoutConditionsRate = amount > 0 ? product.baseRate.afterTaxRate : 0;

  return {
    withConditions: {
      return: withConditionsReturn,
      effectiveRate: withConditionsRate,
    },
    withoutConditions: {
      return: withoutConditionsReturn,
      effectiveRate: withoutConditionsRate,
    },
    hasConditions,
    conditionBoost: withConditionsReturn - withoutConditionsReturn,
  };
}

/**
 * Format a rate as a percentage string (e.g. 0.12 → "12.00%")
 */
export function formatRate(rate: number): string {
  return `${(rate * 100).toFixed(2)}%`;
}

/**
 * Format PHP currency
 */
export function formatPHP(value: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
