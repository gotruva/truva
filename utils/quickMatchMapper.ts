import { QuickMatchAnswers, QuickMatchCoreAnswers, LiquidityFilter, PayoutFilter, RateProduct } from '@/types';
import { computeDualScenario, computeEffectiveRate, computeReturn } from '@/utils/yieldEngine';

export interface CalculatorPrefill {
  amount: number;
  months: number;
  liquidityFilter: LiquidityFilter;
  payoutFilter: PayoutFilter;
  includePdicOnly: boolean;
}

export interface QuickMatchRecommendation extends RateProduct {
  effectiveRate: number;
  projectedReturn: number;
  dual: ReturnType<typeof computeDualScenario>;
}

export function deriveQuickMatchAnswers(core: QuickMatchCoreAnswers): QuickMatchAnswers {
  const defaultByPurpose: Record<QuickMatchCoreAnswers['purpose'], Pick<QuickMatchAnswers, 'lockFlexibility' | 'payoutPreference' | 'insurancePreference'>> = {
    emergency: {
      lockFlexibility: 'no-lock',
      payoutPreference: 'no-preference',
      insurancePreference: 'insured-only',
    },
    'short-term': {
      lockFlexibility: 'maybe',
      payoutPreference: 'at-maturity',
      insurancePreference: 'insured-only',
    },
    'idle-cash': {
      lockFlexibility: 'maybe',
      payoutPreference: 'no-preference',
      insurancePreference: 'all-banks',
    },
    'long-term': {
      lockFlexibility: 'yes-lock',
      payoutPreference: 'at-maturity',
      insurancePreference: 'all-banks',
    },
    'monthly-income': {
      lockFlexibility: 'maybe',
      payoutPreference: 'monthly',
      insurancePreference: 'insured-only',
    },
  };

  const timelineOverrides: Partial<Record<QuickMatchCoreAnswers['timeline'], Partial<Pick<QuickMatchAnswers, 'lockFlexibility' | 'payoutPreference'>>>> = {
    anytime: {
      lockFlexibility: 'no-lock',
    },
    '3mo': {
      lockFlexibility: 'no-lock',
    },
    '3-6mo': {
      lockFlexibility: core.purpose === 'long-term' ? 'maybe' : undefined,
    },
    '6-12mo': {
      lockFlexibility: core.purpose === 'emergency' ? 'maybe' : undefined,
    },
    '1yr+': {
      lockFlexibility: core.purpose === 'emergency' ? 'maybe' : 'yes-lock',
      payoutPreference: core.purpose === 'monthly-income' ? 'monthly' : 'at-maturity',
    },
  };

  const base = defaultByPurpose[core.purpose];
  const overrides = timelineOverrides[core.timeline] ?? {};

  return {
    ...core,
    lockFlexibility: overrides.lockFlexibility ?? base.lockFlexibility,
    payoutPreference: overrides.payoutPreference ?? base.payoutPreference,
    insurancePreference: base.insurancePreference,
  };
}

export function mapAnswersToFilters(a: QuickMatchAnswers): CalculatorPrefill {
  const monthsMap: Record<QuickMatchAnswers['timeline'], number> = {
    anytime: 3,
    '3mo': 3,
    '3-6mo': 6,
    '6-12mo': 12,
    '1yr+': 24,
  };

  const liquidityMap: Record<QuickMatchAnswers['lockFlexibility'], LiquidityFilter> = {
    'no-lock': 'liquid',
    maybe: 'all',
    'yes-lock': 'locked',
  };

  const payoutMap: Record<QuickMatchAnswers['payoutPreference'], PayoutFilter> = {
    'no-preference': 'all',
    monthly: 'monthly',
    'at-maturity': 'at_maturity',
  };

  return {
    amount: a.amount,
    months: monthsMap[a.timeline],
    liquidityFilter: liquidityMap[a.lockFlexibility],
    payoutFilter: payoutMap[a.payoutPreference],
    includePdicOnly: a.insurancePreference === 'insured-only',
  };
}

export function getQuickMatchRecommendations(
  rates: RateProduct[],
  answers: QuickMatchAnswers,
  limit: number = 3
): QuickMatchRecommendation[] {
  const filters = mapAnswersToFilters(answers);

  let filtered = rates.filter((rate) => {
    if (rate.category !== 'banks') return false;
    if (filters.includePdicOnly && !rate.pdic) return false;

    const horizonMap: Record<number, number> = {
      3: 91,
      6: 182,
      12: 365,
      24: 730,
    };
    const horizonDays = horizonMap[filters.months] ?? filters.months * 30;

    if (rate.lockInDays > 0 && rate.lockInDays > horizonDays) return false;
    if (filters.liquidityFilter === 'liquid' && rate.lockInDays > 0) return false;
    if (filters.liquidityFilter === 'locked' && rate.lockInDays === 0) return false;
    if (filters.payoutFilter === 'monthly' && !['daily', 'monthly', 'quarterly'].includes(rate.payoutFrequency)) return false;
    if (filters.payoutFilter === 'at_maturity' && !['at_maturity', 'annually'].includes(rate.payoutFrequency)) return false;

    return true;
  });

  if (filtered.length < limit) {
    filtered = rates.filter((rate) => {
      if (rate.category !== 'banks') return false;
      if (filters.includePdicOnly && !rate.pdic) return false;
      return true;
    });
  }

  return filtered
    .map((rate) => ({
      ...rate,
      effectiveRate: computeEffectiveRate(filters.amount, rate),
      projectedReturn: computeReturn(filters.amount, rate, filters.months),
      dual: computeDualScenario(filters.amount, rate, filters.months),
    }))
    .sort((a, b) => b.projectedReturn - a.projectedReturn)
    .slice(0, limit);
}

export function summarizeAnswers(a: QuickMatchAnswers): string {
  const amountStr = `PHP ${a.amount.toLocaleString('en-PH')}`;
  const purposeLabels: Record<QuickMatchAnswers['purpose'], string> = {
    emergency: 'Easy access',
    'short-term': 'Planned goal',
    'idle-cash': 'Best earnings',
    'long-term': 'Long-term growth',
    'monthly-income': 'Regular payouts',
  };

  const timelineLabels: Record<QuickMatchAnswers['timeline'], string> = {
    anytime: 'anytime',
    '3mo': 'soon',
    '3-6mo': 'few months',
    '6-12mo': 'within a year',
    '1yr+': '1 year+',
  };

  const insuranceLabels: Record<QuickMatchAnswers['insurancePreference'], string> = {
    'insured-only': 'PDIC only',
    'all-banks': 'All banks',
  };

  return [
    amountStr,
    purposeLabels[a.purpose],
    timelineLabels[a.timeline],
    insuranceLabels[a.insurancePreference],
  ].join(' | ');
}
