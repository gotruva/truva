import { RateProduct, RateTier } from '@/types';
import { calcAfterTaxPhp, calcTaxExempt } from '@/lib/tax';

export interface CalculationBreakdownLine {
  amount: number;
  label: string;
  grossRate: number;
  afterTaxRate: number;
}

export interface CalculationScenario {
  label: string;
  taxLabel: string;
  effectiveRate: number;
  projectedReturn: number;
  lines: CalculationBreakdownLine[];
}

export interface CalculationBreakdown {
  amount: number;
  months: number;
  primary: CalculationScenario;
  base?: CalculationScenario;
}

function findThresholdTier(amount: number, tiers: RateTier[]): RateTier | null {
  return tiers.find((tier) => (
    amount >= tier.minBalance
    && (tier.maxBalance === null || amount <= tier.maxBalance)
  )) ?? null;
}

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

export function computeThresholdReturn(
  amount: number,
  tiers: RateTier[],
  months: number,
  taxExempt: boolean = false
): number {
  if (amount <= 0 || tiers.length === 0) return 0;

  const applicableTier = findThresholdTier(amount, tiers);
  if (!applicableTier) return 0;

  const afterTaxRate = taxExempt
    ? calcTaxExempt(applicableTier.grossRate)
    : calcAfterTaxPhp(applicableTier.grossRate);

  return (amount * afterTaxRate / 12) * months;
}

export function computeThresholdEffectiveRate(
  amount: number,
  tiers: RateTier[],
  taxExempt: boolean = false
): number {
  if (amount <= 0 || tiers.length === 0) return 0;

  const applicableTier = findThresholdTier(amount, tiers);
  if (!applicableTier) return 0;

  return taxExempt
    ? calcTaxExempt(applicableTier.grossRate)
    : calcAfterTaxPhp(applicableTier.grossRate);
}

export function computeReturn(
  amount: number,
  product: RateProduct,
  months: number
): number {
  if (product.tierType === 'flat') {
    const grossRate = product.tiers[0]?.grossRate ?? product.baseRate.grossRate;
    const afterTaxRate = product.taxExempt
      ? calcTaxExempt(grossRate)
      : calcAfterTaxPhp(grossRate);
    return (amount * afterTaxRate / 12) * months;
  }

  if (product.tierType === 'threshold') {
    return computeThresholdReturn(amount, product.tiers, months, product.taxExempt);
  }

  return computeBlendedReturn(amount, product.tiers, months, product.taxExempt);
}

export function computeEffectiveRate(
  amount: number,
  product: RateProduct
): number {
  if (amount <= 0 || product.tiers.length === 0) return 0;

  if (product.tierType === 'flat') {
    const grossRate = product.tiers[0]?.grossRate ?? product.baseRate.grossRate;
    return product.taxExempt
      ? calcTaxExempt(grossRate)
      : calcAfterTaxPhp(grossRate);
  }

  if (product.tierType === 'threshold') {
    return computeThresholdEffectiveRate(amount, product.tiers, product.taxExempt);
  }

  const yearlyReturn = computeBlendedReturn(amount, product.tiers, 12, product.taxExempt);
  return yearlyReturn / amount;
}

export function computeEffectiveGrossRate(
  amount: number,
  product: RateProduct
): number {
  if (amount <= 0 || product.tiers.length === 0) return 0;

  if (product.tierType === 'flat') {
    return product.tiers[0]?.grossRate ?? product.baseRate.grossRate;
  }

  if (product.tierType === 'threshold') {
    const applicableTier = findThresholdTier(amount, product.tiers);
    return applicableTier?.grossRate ?? 0;
  }

  // Blended case: compute total gross yearly return then divide by amount
  let remaining = amount;
  let totalGrossYearly = 0;

  for (const tier of product.tiers) {
    if (remaining <= 0) break;

    const tierCapacity = tier.maxBalance !== null
      ? tier.maxBalance - tier.minBalance
      : Infinity;
    const tierAmount = Math.min(remaining, tierCapacity);

    totalGrossYearly += tierAmount * tier.grossRate;
    remaining -= tierAmount;
  }

  return totalGrossYearly / amount;
}

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
    product.conditions.some((condition) => condition.type !== 'none' && condition.type !== 'time_limited');

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

function getAfterTaxRate(grossRate: number, taxExempt: boolean): number {
  return taxExempt ? calcTaxExempt(grossRate) : calcAfterTaxPhp(grossRate);
}

function getTierRangeLabel(tier: RateTier): string {
  if (tier.maxBalance === null) {
    return `PHP ${tier.minBalance.toLocaleString()}+ tier`;
  }

  return `PHP ${tier.minBalance.toLocaleString()} to PHP ${tier.maxBalance.toLocaleString()} tier`;
}

function buildPrimaryScenario(
  amount: number,
  product: RateProduct,
  months: number
): CalculationScenario {
  const taxLabel = product.taxExempt
    ? 'Tax-exempt product: no withholding tax applied'
    : '20% final withholding tax applied';
  const hasConditions = product.conditions.some((condition) => condition.type !== 'none' && condition.type !== 'time_limited');

  if (product.tierType === 'flat' || product.tierType === 'threshold') {
    const applicableTier = product.tierType === 'threshold'
      ? findThresholdTier(amount, product.tiers)
      : product.tiers[0] ?? null;
    const grossRate = applicableTier?.grossRate ?? 0;

    return {
      label: hasConditions ? 'If conditions are met' : 'Current calculation',
      taxLabel,
      effectiveRate: computeEffectiveRate(amount, product),
      projectedReturn: computeReturn(amount, product, months),
      lines: [
        {
          amount,
          label: product.tierType === 'flat'
            ? 'Flat rate applied to the full deposit'
            : applicableTier
              ? `Entire deposit qualifies for ${getTierRangeLabel(applicableTier)}`
              : 'Deposit does not meet this product tier minimum',
          grossRate,
          afterTaxRate: getAfterTaxRate(grossRate, product.taxExempt),
        },
      ],
    };
  }

  const lines: CalculationBreakdownLine[] = [];
  let remaining = amount;

  for (const tier of product.tiers) {
    if (remaining <= 0) break;

    const tierCapacity = tier.maxBalance !== null
      ? tier.maxBalance - tier.minBalance
      : Infinity;
    const appliedAmount = Math.min(remaining, tierCapacity);

    if (appliedAmount <= 0) continue;

    lines.push({
      amount: appliedAmount,
      label: `${getTierRangeLabel(tier)} portion`,
      grossRate: tier.grossRate,
      afterTaxRate: getAfterTaxRate(tier.grossRate, product.taxExempt),
    });

    remaining -= appliedAmount;
  }

  return {
    label: hasConditions ? 'If conditions are met' : 'Current calculation',
    taxLabel,
    effectiveRate: computeEffectiveRate(amount, product),
    projectedReturn: computeReturn(amount, product, months),
    lines,
  };
}

function buildBaseScenario(
  amount: number,
  product: RateProduct,
  months: number
): CalculationScenario {
  return {
    label: 'If conditions are not met',
    taxLabel: product.taxExempt
      ? 'Tax-exempt product: no withholding tax applied'
      : '20% final withholding tax applied',
    effectiveRate: getAfterTaxRate(product.baseRate.grossRate, product.taxExempt),
    projectedReturn: computeBaseReturn(amount, product, months),
    lines: [
      {
        amount,
        label: 'Base rate applied to the full deposit',
        grossRate: product.baseRate.grossRate,
        afterTaxRate: getAfterTaxRate(product.baseRate.grossRate, product.taxExempt),
      },
    ],
  };
}

export function getCalculationBreakdown(
  amount: number,
  product: RateProduct,
  months: number
): CalculationBreakdown {
  const hasConditions = product.conditions.some((condition) => condition.type !== 'none' && condition.type !== 'time_limited');

  return {
    amount,
    months,
    primary: buildPrimaryScenario(amount, product, months),
    base: hasConditions ? buildBaseScenario(amount, product, months) : undefined,
  };
}

export function formatRate(rate: number): string {
  return `${(rate * 100).toFixed(2)}%`;
}

export function formatPHP(value: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
