import { RateProduct, RateTier } from '@/types';
import { calcAfterTaxPhp, calcTaxExempt } from '@/lib/tax';

/**
 * Compute the projected return using blended tiered rates.
 * Each balance band earns its own rate independently (e.g. Maya Personal Goals).
 */
export function computeBlendedReturn(
  amount: number,
  tiers: RateTier[],
  months: number,
  taxExempt: boolean = false
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

    const afterTaxRate = taxExempt
      ? calcTaxExempt(tier.grossRate)
      : calcAfterTaxPhp(tier.grossRate);

    const yearlyReturn = tierAmount * afterTaxRate;
    totalReturn += (yearlyReturn / 12) * months;

    remaining -= tierAmount;
  }

  return totalReturn;
}

/**
 * Compute the projected return using threshold tiers.
 * The entire balance earns the rate of whichever bracket it falls into
 * (e.g. Salmon Bank: ₱1M+ gets 8% on the full amount).
 */
export function computeThresholdReturn(
  amount: number,
  tiers: RateTier[],
  months: number,
  taxExempt: boolean = false
): number {
  if (amount <= 0 || tiers.length === 0) return 0;

  // Find the highest tier the amount qualifies for
  let applicableTier = tiers[0];
  for (const tier of tiers) {
    if (amount >= tier.minBalance) {
      applicableTier = tier;
    }
  }

  const afterTaxRate = taxExempt
    ? calcTaxExempt(applicableTier.grossRate)
    : calcAfterTaxPhp(applicableTier.grossRate);

  return (amount * afterTaxRate / 12) * months;
}

/**
 * Compute the threshold effective rate — just returns the bracket rate
 * for the tier the amount falls into.
 */
export function computeThresholdEffectiveRate(
  amount: number,
  tiers: RateTier[],
  taxExempt: boolean = false
): number {
  if (amount <= 0 || tiers.length === 0) return 0;

  let applicableTier = tiers[0];
  for (const tier of tiers) {
    if (amount >= tier.minBalance) {
      applicableTier = tier;
    }
  }

  return taxExempt
    ? calcTaxExempt(applicableTier.grossRate)
    : calcAfterTaxPhp(applicableTier.grossRate);
}

/**
 * Unified return computation — dispatches to blended or threshold based on tierType.
 */
export function computeReturn(
  amount: number,
  product: RateProduct,
  months: number
): number {
  if (product.tierType === 'threshold') {
    return computeThresholdReturn(amount, product.tiers, months, product.taxExempt);
  }
  return computeBlendedReturn(amount, product.tiers, months, product.taxExempt);
}

/**
 * Unified effective rate — dispatches to blended or threshold based on tierType.
 * This is the "real" after-tax rate the user earns on their specific amount.
 */
export function computeEffectiveRate(
  amount: number,
  product: RateProduct
): number {
  if (amount <= 0 || product.tiers.length === 0) return 0;

  if (product.tierType === 'threshold') {
    return computeThresholdEffectiveRate(amount, product.tiers, product.taxExempt);
  }

  // Blended: derive from return
  const yearlyReturn = computeBlendedReturn(amount, product.tiers, 12, product.taxExempt);
  return yearlyReturn / amount;
}

/**
 * Compute return using only the base rate (conditions NOT met).
 */
export function computeBaseReturn(
  amount: number,
  product: RateProduct,
  months: number
): number {
  if (amount <= 0) return 0;
  const afterTaxRate = product.taxExempt
    ? calcTaxExempt(product.baseRate.grossRate)
    : calcAfterTaxPhp(product.baseRate.grossRate);
  const yearlyReturn = amount * afterTaxRate;
  return (yearlyReturn / 12) * months;
}

/**
 * Compare headline rate vs the effective rate for a given amount.
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
    ? calcTaxExempt(product.headlineRate)
    : calcAfterTaxPhp(product.headlineRate);
  const effectiveRate = computeEffectiveRate(amount, product);
  const gapPercentagePoints = (headlineAfterTax - effectiveRate) * 100;

  return {
    headlineAfterTax,
    effectiveRate,
    gapPercentagePoints,
    isOverstated: gapPercentagePoints > 0.5,
  };
}

/**
 * Dual-scenario computation:
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
  conditionBoost: number;
} {
  const hasConditions = product.conditions.length > 0 &&
    product.conditions.some(c => c.type !== 'none');

  const withConditionsReturn = computeReturn(amount, product, months);
  const withConditionsRate = computeEffectiveRate(amount, product);

  const withoutConditionsReturn = computeBaseReturn(amount, product, months);
  const withoutConditionsRate = amount > 0
    ? (product.taxExempt
        ? calcTaxExempt(product.baseRate.grossRate)
        : calcAfterTaxPhp(product.baseRate.grossRate))
    : 0;

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
