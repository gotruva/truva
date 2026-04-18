import type { CreditCardProduct, RateProduct } from '@/types';

type LegacyRateProduct = Omit<RateProduct, 'trueValueScore'> & {
  trueValueScore?: number;
  palagoScore?: number;
};

type LegacyCreditCardProduct = Omit<CreditCardProduct, 'trueValueScore'> & {
  trueValueScore?: number;
  palagoScore?: number;
};

export function normalizeRateProduct(raw: LegacyRateProduct): RateProduct {
  return {
    ...raw,
    trueValueScore: raw.trueValueScore ?? raw.palagoScore ?? 0,
  };
}

export function normalizeCreditCardProduct(raw: LegacyCreditCardProduct): CreditCardProduct {
  return {
    ...raw,
    trueValueScore: raw.trueValueScore ?? raw.palagoScore ?? 0,
  };
}
