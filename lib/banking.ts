import type { RateProduct } from '@/types';
import { calcAfterTaxPhp, calcTaxExempt } from '@/lib/tax';
import { computeEffectiveRate, computeReturn } from '@/utils/yieldEngine';

export interface BankPick {
  provider: string;
  logo: string;
  insurer: string;
  lastVerified: string;
  bestProduct: RateProduct;
  effectiveRate: number;
  projectedReturn: number;
  baseAfterTaxRate: number;
  hasRequirements: boolean;
  requirementSummary: string | null;
}

function getBaseAfterTaxRate(product: RateProduct): number {
  return product.taxExempt
    ? calcTaxExempt(product.baseRate.grossRate)
    : calcAfterTaxPhp(product.baseRate.grossRate);
}

function summarizeRequirements(product: RateProduct): string | null {
  const requirements = product.conditions.filter((condition) => condition.type !== 'none');
  if (!requirements.length) return null;
  return requirements.map((condition) => condition.description).join(' ');
}

export function getBankPicksFromRates(
  rates: RateProduct[],
  amount: number,
  months: number,
  limit = 6
): BankPick[] {
  const bankRates = rates.filter((rate) => rate.category === 'banks');

  const groups = new Map<string, RateProduct[]>();
  for (const product of bankRates) {
    const existing = groups.get(product.provider) ?? [];
    existing.push(product);
    groups.set(product.provider, existing);
  }

  const picks: BankPick[] = [];
  for (const [provider, products] of groups) {
    const enriched = products
      .map((product) => ({
        product,
        effectiveRate: computeEffectiveRate(amount, product),
        projectedReturn: computeReturn(amount, product, months),
      }))
      .sort((left, right) => right.effectiveRate - left.effectiveRate);

    const best = enriched[0];
    if (!best) continue;

    const lastVerified = products.reduce(
      (latest, product) => (product.lastVerified > latest ? product.lastVerified : latest),
      ''
    );

    picks.push({
      provider,
      logo: best.product.logo,
      insurer: best.product.insurer,
      lastVerified,
      bestProduct: best.product,
      effectiveRate: best.effectiveRate,
      projectedReturn: best.projectedReturn,
      baseAfterTaxRate: getBaseAfterTaxRate(best.product),
      hasRequirements: Boolean(summarizeRequirements(best.product)),
      requirementSummary: summarizeRequirements(best.product),
    });
  }

  return picks.sort((left, right) => right.effectiveRate - left.effectiveRate).slice(0, limit);
}

