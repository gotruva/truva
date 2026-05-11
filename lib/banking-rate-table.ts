import type { RateProduct } from '@/types';
import { computeEffectiveGrossRate, computeGrossEarnings } from '@/utils/yieldEngine';

const RATE_EPSILON = 0.0000001;
const PESO_EPSILON = 0.005;

export interface BankingRateTableMetrics {
  grossInterest: number;
  amountFitGrossRate: number;
  headlineGrossRate: number;
  hasHigherHeadlineRate: boolean;
}

export function getBankingRateTableMetrics(
  product: RateProduct,
  amount: number,
  months: number,
): BankingRateTableMetrics {
  const amountFitGrossRate = computeEffectiveGrossRate(amount, product);
  const grossInterest = computeGrossEarnings(amount, product, months);

  return {
    grossInterest,
    amountFitGrossRate,
    headlineGrossRate: product.headlineRate,
    hasHigherHeadlineRate: product.headlineRate - amountFitGrossRate > RATE_EPSILON,
  };
}

export function compareBankingRateTableProducts(amount: number, months: number) {
  return (a: RateProduct, b: RateProduct): number => {
    const aMetrics = getBankingRateTableMetrics(a, amount, months);
    const bMetrics = getBankingRateTableMetrics(b, amount, months);

    const earningsDiff = bMetrics.grossInterest - aMetrics.grossInterest;
    if (Math.abs(earningsDiff) > PESO_EPSILON) return earningsDiff;

    const rateDiff = bMetrics.amountFitGrossRate - aMetrics.amountFitGrossRate;
    if (Math.abs(rateDiff) > RATE_EPSILON) return rateDiff;

    return b.lastVerified.localeCompare(a.lastVerified);
  };
}
